/**
 * GridItem component
 *
 * An individual item within a grid layout. Handles dragging and resizing.
 */

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactElement,
  type CSSProperties
} from "react";
import { DraggableCore, type DraggableEventHandler } from "react-draggable";
import { Resizable } from "react-resizable";
import clsx from "clsx";

import type {
  Position,
  DroppingPosition,
  ResizeHandleAxis,
  GridDragEvent,
  GridResizeEvent,
  LayoutConstraint,
  ConstraintContext,
  Layout,
  LayoutItem as LayoutItemType
} from "../../core/types.js";
import type { PositionParams } from "../../core/calculate.js";
import {
  calcGridItemPosition,
  calcGridItemWHPx,
  calcGridColWidth,
  calcXYRaw,
  calcWHRaw,
  clamp
} from "../../core/calculate.js";
import {
  applyPositionConstraints,
  applySizeConstraints,
  defaultConstraints
} from "../../core/constraints.js";
import {
  setTransform,
  setTopLeft,
  perc,
  resizeItemInDirection
} from "../../core/position.js";

// ============================================================================
// Types
// ============================================================================

type PartialPosition = { top: number; left: number };

export type GridItemCallback<Data extends GridDragEvent | GridResizeEvent> = (
  i: string,
  w: number,
  h: number,
  data: Data
) => void;

export type ResizeHandle =
  | ReactElement
  | ((
      resizeHandleAxis: ResizeHandleAxis,
      ref: React.Ref<HTMLElement>
    ) => ReactElement);

// Internal callback data type with typed handle
interface ResizeCallbackData {
  node: HTMLElement;
  size: { width: number; height: number };
  handle: ResizeHandleAxis;
}

// react-resizable callback type (handle is string)
type ReactResizableCallback = (
  e: React.SyntheticEvent,
  data: {
    node: HTMLElement;
    size: { width: number; height: number };
    handle: string;
  }
) => void;

export interface GridItemProps {
  /** Child element to render */
  children: ReactElement;
  /** Number of columns in the grid */
  cols: number;
  /** Width of the container in pixels */
  containerWidth: number;
  /** Margin between items [x, y] */
  margin: readonly [number, number];
  /** Padding inside the container [x, y] */
  containerPadding: readonly [number, number];
  /** Height of each row in pixels */
  rowHeight: number;
  /** Maximum number of rows */
  maxRows: number;
  /** Whether the item can be dragged */
  isDraggable: boolean;
  /** Whether the item can be resized */
  isResizable: boolean;
  /** Whether the item is bounded within the container */
  isBounded: boolean;
  /** Whether the item is static (can't be moved/resized) */
  static?: boolean;
  /** Use CSS transforms instead of top/left */
  useCSSTransforms?: boolean;
  /** Use percentage widths for server rendering */
  usePercentages?: boolean;
  /** Scale factor for transforms */
  transformScale?: number;
  /** Current position of a dropping element */
  droppingPosition?: DroppingPosition;

  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;

  /** CSS selector for draggable handle */
  handle?: string;
  /** CSS selector for cancel handle */
  cancel?: string;

  /** X position in grid units */
  x: number;
  /** Y position in grid units */
  y: number;
  /** Width in grid units */
  w: number;
  /** Height in grid units */
  h: number;

  /** Minimum width in grid units */
  minW?: number;
  /** Maximum width in grid units */
  maxW?: number;
  /** Minimum height in grid units */
  minH?: number;
  /** Maximum height in grid units */
  maxH?: number;

  /** Unique identifier */
  i: string;

  /** Which resize handles to show */
  resizeHandles?: ResizeHandleAxis[];
  /** Custom resize handle */
  resizeHandle?: ResizeHandle;

  /** Layout constraints for position/size limiting */
  constraints?: LayoutConstraint[];

  /** The layout item data (for per-item constraints) */
  layoutItem?: LayoutItemType;

  /** Current layout (for constraint context) */
  layout?: Layout;

  /** Called when drag starts */
  onDragStart?: GridItemCallback<GridDragEvent>;
  /** Called during drag */
  onDrag?: GridItemCallback<GridDragEvent>;
  /** Called when drag stops */
  onDragStop?: GridItemCallback<GridDragEvent>;
  /** Called when resize starts */
  onResizeStart?: GridItemCallback<GridResizeEvent>;
  /** Called during resize */
  onResize?: GridItemCallback<GridResizeEvent>;
  /** Called when resize stops */
  onResizeStop?: GridItemCallback<GridResizeEvent>;
}

// ============================================================================
// Component
// ============================================================================

/**
 * GridItem - An individual item within a grid layout.
 *
 * Wraps a child element with drag and resize functionality.
 */
export function GridItem(props: GridItemProps): ReactElement {
  const {
    children,
    cols,
    containerWidth,
    margin,
    containerPadding,
    rowHeight,
    maxRows,
    isDraggable,
    isResizable,
    isBounded,
    static: isStatic,
    useCSSTransforms = true,
    usePercentages = false,
    transformScale = 1,
    droppingPosition,
    className = "",
    style,
    handle = "",
    cancel = "",
    x,
    y,
    w,
    h,
    minW = 1,
    maxW = Infinity,
    minH = 1,
    maxH = Infinity,
    i,
    resizeHandles,
    resizeHandle,
    constraints = defaultConstraints,
    layoutItem,
    layout = [],
    onDragStart: onDragStartProp,
    onDrag: onDragProp,
    onDragStop: onDragStopProp,
    onResizeStart: onResizeStartProp,
    onResize: onResizeProp,
    onResizeStop: onResizeStopProp
  } = props;

  // State
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);

  // Refs for position tracking (avoid state for React 18 batching)
  const elementRef = useRef<HTMLDivElement>(null);
  const dragPositionRef = useRef<PartialPosition>({ left: 0, top: 0 });
  const resizePositionRef = useRef<Position>({
    top: 0,
    left: 0,
    width: 0,
    height: 0
  });

  // Previous dropping position for comparison
  const prevDroppingPositionRef = useRef<DroppingPosition | undefined>(
    undefined
  );

  // Position parameters
  const positionParams: PositionParams = useMemo(
    () => ({
      cols,
      containerPadding: containerPadding as [number, number],
      containerWidth,
      margin: margin as [number, number],
      maxRows,
      rowHeight
    }),
    [cols, containerPadding, containerWidth, margin, maxRows, rowHeight]
  );

  // Constraint context for applying constraints
  const constraintContext: ConstraintContext = useMemo(
    () => ({
      cols,
      maxRows,
      containerWidth,
      containerHeight: 0, // Auto-height grids don't have a fixed container height
      rowHeight,
      margin,
      layout
    }),
    [cols, maxRows, containerWidth, rowHeight, margin, layout]
  );

  // Effective layout item (use provided or create from props)
  const effectiveLayoutItem: LayoutItemType = useMemo(
    () =>
      layoutItem ?? {
        i,
        x,
        y,
        w,
        h,
        minW,
        maxW,
        minH,
        maxH
      },
    [layoutItem, i, x, y, w, h, minW, maxW, minH, maxH]
  );

  // ============================================================================
  // Style Creation
  // ============================================================================

  const createStyle = useCallback(
    (pos: Position): CSSProperties => {
      if (useCSSTransforms) {
        return setTransform(pos) as CSSProperties;
      }

      const styleObj = setTopLeft(pos) as CSSProperties;

      if (usePercentages) {
        return {
          ...styleObj,
          left: perc(pos.left / containerWidth),
          width: perc(pos.width / containerWidth)
        };
      }

      return styleObj;
    },
    [useCSSTransforms, usePercentages, containerWidth]
  );

  // ============================================================================
  // Drag Handlers
  // ============================================================================

  const onDragStart: DraggableEventHandler = useCallback(
    (e, { node }) => {
      if (!onDragStartProp) return;

      const { offsetParent } = node;
      if (!offsetParent) return;

      const parentRect = offsetParent.getBoundingClientRect();
      const clientRect = node.getBoundingClientRect();

      const cLeft = clientRect.left / transformScale;
      const pLeft = parentRect.left / transformScale;
      const cTop = clientRect.top / transformScale;
      const pTop = parentRect.top / transformScale;

      const newPosition: PartialPosition = {
        left: cLeft - pLeft + offsetParent.scrollLeft,
        top: cTop - pTop + offsetParent.scrollTop
      };

      dragPositionRef.current = newPosition;
      setDragging(true);

      // Calculate raw position and apply constraints
      const rawPos = calcXYRaw(
        positionParams,
        newPosition.top,
        newPosition.left
      );
      const { x: newX, y: newY } = applyPositionConstraints(
        constraints,
        effectiveLayoutItem,
        rawPos.x,
        rawPos.y,
        constraintContext
      );

      onDragStartProp(i, newX, newY, {
        e: e as unknown as Event,
        node,
        newPosition
      });
    },
    [
      onDragStartProp,
      transformScale,
      positionParams,
      constraints,
      effectiveLayoutItem,
      constraintContext,
      i
    ]
  );

  const onDrag: DraggableEventHandler = useCallback(
    (e, { node, deltaX, deltaY }) => {
      if (!onDragProp || !dragging) return;

      let top = dragPositionRef.current.top + deltaY;
      let left = dragPositionRef.current.left + deltaX;

      // Pixel-level boundary calculations (isBounded affects pixel position)
      if (isBounded) {
        const { offsetParent } = node;
        if (offsetParent) {
          const bottomBoundary =
            offsetParent.clientHeight -
            calcGridItemWHPx(h, rowHeight, margin[1]);
          top = clamp(top, 0, bottomBoundary);

          const colWidth = calcGridColWidth(positionParams);
          const rightBoundary =
            containerWidth - calcGridItemWHPx(w, colWidth, margin[0]);
          left = clamp(left, 0, rightBoundary);
        }
      }

      const newPosition: PartialPosition = { top, left };
      dragPositionRef.current = newPosition;

      // Calculate raw position and apply constraints
      const rawPos = calcXYRaw(positionParams, top, left);
      const { x: newX, y: newY } = applyPositionConstraints(
        constraints,
        effectiveLayoutItem,
        rawPos.x,
        rawPos.y,
        constraintContext
      );

      onDragProp(i, newX, newY, {
        e: e as unknown as Event,
        node,
        newPosition
      });
    },
    [
      onDragProp,
      dragging,
      isBounded,
      h,
      rowHeight,
      margin,
      positionParams,
      containerWidth,
      w,
      i,
      constraints,
      effectiveLayoutItem,
      constraintContext
    ]
  );

  const onDragStop: DraggableEventHandler = useCallback(
    (e, { node }) => {
      if (!onDragStopProp || !dragging) return;

      const { left, top } = dragPositionRef.current;
      const newPosition: PartialPosition = { top, left };

      setDragging(false);
      dragPositionRef.current = { left: 0, top: 0 };

      // Calculate raw position and apply constraints
      const rawPos = calcXYRaw(positionParams, top, left);
      const { x: newX, y: newY } = applyPositionConstraints(
        constraints,
        effectiveLayoutItem,
        rawPos.x,
        rawPos.y,
        constraintContext
      );

      onDragStopProp(i, newX, newY, {
        e: e as unknown as Event,
        node,
        newPosition
      });
    },
    [
      onDragStopProp,
      dragging,
      positionParams,
      constraints,
      effectiveLayoutItem,
      constraintContext,
      i
    ]
  );

  // ============================================================================
  // Resize Handlers
  // ============================================================================

  const onResizeHandler = useCallback(
    (
      e: React.SyntheticEvent,
      { node, size, handle: resizeHandle }: ResizeCallbackData,
      position: Position,
      handlerName: "onResizeStart" | "onResize" | "onResizeStop"
    ) => {
      const handler =
        handlerName === "onResizeStart"
          ? onResizeStartProp
          : handlerName === "onResize"
            ? onResizeProp
            : onResizeStopProp;

      if (!handler) return;

      // Sizing based on resize direction
      let updatedSize: Position;
      if (node) {
        updatedSize = resizeItemInDirection(
          resizeHandle,
          position,
          size as Position,
          containerWidth
        );
      } else {
        updatedSize = {
          ...size,
          top: position.top,
          left: position.left
        } as Position;
      }

      resizePositionRef.current = updatedSize;

      // Calculate raw grid dimensions and apply constraints
      const rawSize = calcWHRaw(
        positionParams,
        updatedSize.width,
        updatedSize.height
      );
      const { w: newW, h: newH } = applySizeConstraints(
        constraints,
        effectiveLayoutItem,
        rawSize.w,
        rawSize.h,
        resizeHandle,
        constraintContext
      );

      handler(i, newW, newH, {
        e: e.nativeEvent,
        node,
        size: updatedSize,
        handle: resizeHandle
      });
    },
    [
      onResizeStartProp,
      onResizeProp,
      onResizeStopProp,
      containerWidth,
      positionParams,
      x,
      y,
      i,
      constraints,
      effectiveLayoutItem,
      constraintContext
    ]
  );

  const handleResizeStart: ReactResizableCallback = useCallback(
    (e, data) => {
      setResizing(true);
      const pos = calcGridItemPosition(positionParams, x, y, w, h);
      const typedData: ResizeCallbackData = {
        ...data,
        handle: data.handle as ResizeHandleAxis
      };
      onResizeHandler(e, typedData, pos, "onResizeStart");
    },
    [onResizeHandler, positionParams, x, y, w, h]
  );

  const handleResize: ReactResizableCallback = useCallback(
    (e, data) => {
      const pos = calcGridItemPosition(positionParams, x, y, w, h);
      const typedData: ResizeCallbackData = {
        ...data,
        handle: data.handle as ResizeHandleAxis
      };
      onResizeHandler(e, typedData, pos, "onResize");
    },
    [onResizeHandler, positionParams, x, y, w, h]
  );

  const handleResizeStop: ReactResizableCallback = useCallback(
    (e, data) => {
      setResizing(false);
      resizePositionRef.current = { top: 0, left: 0, width: 0, height: 0 };
      const pos = calcGridItemPosition(positionParams, x, y, w, h);
      const typedData: ResizeCallbackData = {
        ...data,
        handle: data.handle as ResizeHandleAxis
      };
      onResizeHandler(e, typedData, pos, "onResizeStop");
    },
    [onResizeHandler, positionParams, x, y, w, h]
  );

  // ============================================================================
  // Dropping Item Support
  // ============================================================================

  useEffect(() => {
    if (!droppingPosition) return;

    const node = elementRef.current;
    if (!node) return;

    const prevDroppingPosition = prevDroppingPositionRef.current || {
      left: 0,
      top: 0
    };

    const shouldDrag =
      dragging &&
      (droppingPosition.left !== prevDroppingPosition.left ||
        droppingPosition.top !== prevDroppingPosition.top);

    if (!dragging) {
      // Start drag - simulate the draggable callback data
      const fakeData = {
        node,
        deltaX: droppingPosition.left,
        deltaY: droppingPosition.top,
        lastX: 0,
        lastY: 0,
        x: droppingPosition.left,
        y: droppingPosition.top
      };
      onDragStart(droppingPosition.e as unknown as MouseEvent, fakeData);
    } else if (shouldDrag) {
      // Continue drag
      const deltaX = droppingPosition.left - dragPositionRef.current.left;
      const deltaY = droppingPosition.top - dragPositionRef.current.top;

      const fakeData = {
        node,
        deltaX,
        deltaY,
        lastX: dragPositionRef.current.left,
        lastY: dragPositionRef.current.top,
        x: droppingPosition.left,
        y: droppingPosition.top
      };
      onDrag(droppingPosition.e as unknown as MouseEvent, fakeData);
    }

    prevDroppingPositionRef.current = droppingPosition;
  }, [droppingPosition, dragging, onDragStart, onDrag]);

  // ============================================================================
  // Render
  // ============================================================================

  const pos = calcGridItemPosition(
    positionParams,
    x,
    y,
    w,
    h,
    dragging ? dragPositionRef.current : null,
    resizing ? resizePositionRef.current : null
  );

  const child = React.Children.only(children);

  // Calculate constraints for resizing
  const maxWidth = calcGridItemPosition(positionParams, 0, 0, cols, 0).width;
  const mins = calcGridItemPosition(positionParams, 0, 0, minW, minH);
  const maxes = calcGridItemPosition(positionParams, 0, 0, maxW, maxH);
  const minConstraints: [number, number] = [mins.width, mins.height];
  const maxConstraints: [number, number] = [
    Math.min(maxes.width, maxWidth),
    Math.min(maxes.height, Infinity)
  ];

  // Get child props safely
  const childProps = (child as ReactElement<Record<string, unknown>>).props;
  const childClassName = childProps["className"] as string | undefined;
  const childStyle = childProps["style"] as CSSProperties | undefined;

  // Create the child element with updated props
  let newChild: ReactElement = React.cloneElement(child, {
    ref: elementRef,
    className: clsx("react-grid-item", childClassName, className, {
      static: isStatic,
      resizing,
      "react-draggable": isDraggable,
      "react-draggable-dragging": dragging,
      dropping: Boolean(droppingPosition),
      cssTransforms: useCSSTransforms
    }),
    style: {
      ...style,
      ...childStyle,
      ...createStyle(pos)
    }
  } as Record<string, unknown>);

  // Wrap with Resizable
  // Cast resizeHandle to match react-resizable's expected type (string instead of ResizeHandleAxis)
  const resizableHandle = resizeHandle as
    | ReactElement
    | ((axis: string, ref: React.Ref<HTMLElement>) => ReactElement)
    | undefined;

  newChild = (
    <Resizable
      draggableOpts={{ disabled: !isResizable }}
      className={isResizable ? undefined : "react-resizable-hide"}
      width={pos.width}
      height={pos.height}
      minConstraints={minConstraints}
      maxConstraints={maxConstraints}
      onResizeStart={handleResizeStart}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      transformScale={transformScale}
      resizeHandles={resizeHandles}
      handle={resizableHandle}
    >
      {newChild}
    </Resizable>
  );

  // Wrap with DraggableCore
  newChild = (
    <DraggableCore
      disabled={!isDraggable}
      onStart={onDragStart}
      onDrag={onDrag}
      onStop={onDragStop}
      handle={handle}
      cancel={".react-resizable-handle" + (cancel ? "," + cancel : "")}
      scale={transformScale}
      nodeRef={elementRef}
    >
      {newChild}
    </DraggableCore>
  );

  return newChild;
}

export default GridItem;
