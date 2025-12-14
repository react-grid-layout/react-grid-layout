/**
 * GridLayout component
 *
 * A reactive, fluid grid layout with draggable, resizable components.
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactElement,
  type CSSProperties,
  type DragEvent as ReactDragEvent
} from "react";
import { deepEqual } from "fast-equals";
import clsx from "clsx";

import type {
  Layout,
  LayoutItem,
  CompactType,
  DroppingPosition,
  GridDragEvent,
  GridResizeEvent,
  Mutable,
  GridConfig,
  DragConfig,
  ResizeConfig,
  DropConfig,
  PositionStrategy,
  Compactor
} from "../../core/types.js";
import {
  defaultGridConfig,
  defaultDragConfig,
  defaultResizeConfig,
  defaultDropConfig
} from "../../core/types.js";
import type { PositionParams } from "../../core/calculate.js";
import {
  bottom,
  cloneLayoutItem,
  getLayoutItem,
  moveElement,
  withLayoutItem,
  correctBounds
} from "../../core/layout.js";
import { getAllCollisions } from "../../core/collision.js";
import { compact } from "../../core/compact-compat.js";
import { getCompactor } from "../../core/compactors.js";
import {
  calcXY,
  calcGridColWidth,
  calcGridItemWHPx
} from "../../core/calculate.js";
import { defaultPositionStrategy } from "../../core/position.js";

import { GridItem, type ResizeHandle } from "./GridItem.js";

// ============================================================================
// Types
// ============================================================================

export type EventCallback = (
  layout: Layout,
  oldItem: LayoutItem | null,
  newItem: LayoutItem | null,
  placeholder: LayoutItem | null,
  event: Event,
  element?: HTMLElement
) => void;

export interface GridLayoutProps {
  // ===========================================================================
  // Required Props
  // ===========================================================================

  /** Child elements to render in the grid */
  children: React.ReactNode;

  /** Width of the container in pixels */
  width: number;

  // ===========================================================================
  // Composable Configuration Interfaces (v2 API)
  // ===========================================================================

  /**
   * Grid measurement configuration.
   * @see GridConfig
   */
  gridConfig?: Partial<GridConfig>;

  /**
   * Drag behavior configuration.
   * @see DragConfig
   */
  dragConfig?: Partial<DragConfig>;

  /**
   * Resize behavior configuration.
   * @see ResizeConfig
   */
  resizeConfig?: Partial<ResizeConfig>;

  /**
   * External drop configuration.
   * @see DropConfig
   */
  dropConfig?: Partial<DropConfig>;

  /**
   * CSS positioning strategy.
   * Use transformStrategy (default), absoluteStrategy, or createScaledStrategy(scale).
   * @see PositionStrategy
   */
  positionStrategy?: PositionStrategy;

  /**
   * Layout compaction strategy.
   * Use verticalCompactor (default), horizontalCompactor, or noCompactor.
   * @see Compactor
   */
  compactor?: Compactor;

  // ===========================================================================
  // Layout Data
  // ===========================================================================

  /** Layout definition */
  layout?: Layout;

  /** Item to use when dropping from outside */
  droppingItem?: LayoutItem;

  // ===========================================================================
  // Container Props
  // ===========================================================================

  /** Whether to auto-size the container height */
  autoSize?: boolean;

  /** Additional class name */
  className?: string;

  /** Additional styles */
  style?: CSSProperties;

  /** Ref to the container element */
  innerRef?: React.Ref<HTMLDivElement>;

  // ===========================================================================
  // Callbacks
  // ===========================================================================

  /** Called when layout changes */
  onLayoutChange?: (layout: Layout) => void;

  /** Called when drag starts */
  onDragStart?: EventCallback;

  /** Called during drag */
  onDrag?: EventCallback;

  /** Called when drag stops */
  onDragStop?: EventCallback;

  /** Called when resize starts */
  onResizeStart?: EventCallback;

  /** Called during resize */
  onResize?: EventCallback;

  /** Called when resize stops */
  onResizeStop?: EventCallback;

  /** Called when an item is dropped from outside */
  onDrop?: (layout: Layout, item: LayoutItem | undefined, e: Event) => void;

  /** Called when dragging over the grid */
  onDropDragOver?: (
    e: ReactDragEvent
  ) => { w?: number; h?: number; dragOffsetX?: number; dragOffsetY?: number } | false | void;
}

// ============================================================================
// Utility Functions
// ============================================================================

const noop = () => {};

const layoutClassName = "react-grid-layout";

// Check for Firefox
let isFirefox = false;
try {
  isFirefox = /firefox/i.test(navigator.userAgent);
} catch {
  /* Ignore */
}

/**
 * Compare children arrays for equality
 */
function childrenEqual(a: React.ReactNode, b: React.ReactNode): boolean {
  const aArr = React.Children.toArray(a);
  const bArr = React.Children.toArray(b);

  if (aArr.length !== bArr.length) return false;

  for (let i = 0; i < aArr.length; i++) {
    const aChild = aArr[i] as ReactElement;
    const bChild = bArr[i] as ReactElement;
    if (aChild?.key !== bChild?.key) return false;
  }

  return true;
}

/**
 * Synchronize layout with children
 */
function synchronizeLayoutWithChildren(
  initialLayout: Layout,
  children: React.ReactNode,
  cols: number,
  compactType: CompactType,
  allowOverlap: boolean
): Layout {
  const layout: LayoutItem[] = [];
  const childKeys = new Set<string>();

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child) || child.key === null) return;
    const key = String(child.key);
    childKeys.add(key);

    // Find existing layout item
    const existingItem = initialLayout.find(l => l.i === key);

    if (existingItem) {
      layout.push(cloneLayoutItem(existingItem));
    } else {
      // Create new layout item from child data-grid prop
      const childProps = child.props as { "data-grid"?: Partial<LayoutItem> };
      const dataGrid = childProps["data-grid"];

      if (dataGrid) {
        layout.push({
          i: key,
          x: dataGrid.x ?? 0,
          y: dataGrid.y ?? 0,
          w: dataGrid.w ?? 1,
          h: dataGrid.h ?? 1,
          minW: dataGrid.minW,
          maxW: dataGrid.maxW,
          minH: dataGrid.minH,
          maxH: dataGrid.maxH,
          static: dataGrid.static,
          isDraggable: dataGrid.isDraggable,
          isResizable: dataGrid.isResizable,
          resizeHandles: dataGrid.resizeHandles,
          isBounded: dataGrid.isBounded
        });
      } else {
        // Create default layout item
        layout.push({
          i: key,
          x: 0,
          y: bottom(layout),
          w: 1,
          h: 1
        });
      }
    }
  });

  // Correct bounds and compact
  const corrected = correctBounds(layout, { cols });
  return compact(corrected, compactType, cols, allowOverlap);
}

// ============================================================================
// Component
// ============================================================================

/**
 * GridLayout - A reactive, fluid grid layout with draggable, resizable components.
 */
export function GridLayout(props: GridLayoutProps): ReactElement {
  const {
    // Required
    children,
    width,

    // Composable config interfaces
    gridConfig: gridConfigProp,
    dragConfig: dragConfigProp,
    resizeConfig: resizeConfigProp,
    dropConfig: dropConfigProp,
    positionStrategy = defaultPositionStrategy,
    compactor: compactorProp,

    // Layout data
    layout: propsLayout = [],
    droppingItem: droppingItemProp,

    // Container props
    autoSize = true,
    className = "",
    style = {},
    innerRef,

    // Callbacks
    onLayoutChange = noop,
    onDragStart: onDragStartProp = noop,
    onDrag: onDragProp = noop,
    onDragStop: onDragStopProp = noop,
    onResizeStart: onResizeStartProp = noop,
    onResize: onResizeProp = noop,
    onResizeStop: onResizeStopProp = noop,
    onDrop: onDropProp = noop,
    onDropDragOver: onDropDragOverProp = noop
  } = props;

  // Resolve config interfaces with defaults
  const gridConfig: GridConfig = useMemo(
    () => ({ ...defaultGridConfig, ...gridConfigProp }),
    [gridConfigProp]
  );
  const dragConfig: DragConfig = useMemo(
    () => ({ ...defaultDragConfig, ...dragConfigProp }),
    [dragConfigProp]
  );
  const resizeConfig: ResizeConfig = useMemo(
    () => ({ ...defaultResizeConfig, ...resizeConfigProp }),
    [resizeConfigProp]
  );
  const dropConfig: DropConfig = useMemo(
    () => ({ ...defaultDropConfig, ...dropConfigProp }),
    [dropConfigProp]
  );

  // Destructure resolved configs for convenience
  const { cols, rowHeight, maxRows, margin, containerPadding } = gridConfig;
  const {
    enabled: isDraggable,
    bounded: isBounded,
    handle: draggableHandle,
    cancel: draggableCancel
  } = dragConfig;
  const {
    enabled: isResizable,
    handles: resizeHandles,
    handleComponent: resizeHandle
  } = resizeConfig;
  const { enabled: isDroppable, defaultItem: defaultDropItem } = dropConfig;

  // Get compactor (use provided or get from type)
  const compactor = compactorProp ?? getCompactor("vertical");
  const compactType = compactor.type;
  const allowOverlap = compactor.allowOverlap;
  const preventCollision = compactor.preventCollision ?? false;

  // Resolve dropping item - memoized to avoid unstable reference in useCallback dependencies
  const droppingItem = useMemo(
    () =>
      droppingItemProp ?? {
        i: "__dropping-elem__",
        ...defaultDropItem
      },
    [droppingItemProp, defaultDropItem]
  );

  // Position strategy values
  const useCSSTransforms = positionStrategy.type === "transform";
  const transformScale = positionStrategy.scale;

  const effectiveContainerPadding = containerPadding ?? margin;

  // State
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState<Layout>(() =>
    synchronizeLayoutWithChildren(
      propsLayout,
      children,
      cols,
      compactType,
      allowOverlap
    )
  );
  const [activeDrag, setActiveDrag] = useState<LayoutItem | null>(null);
  const [resizing, setResizing] = useState(false);
  const [droppingDOMNode, setDroppingDOMNode] = useState<ReactElement | null>(
    null
  );
  const [droppingPosition, setDroppingPosition] = useState<
    DroppingPosition | undefined
  >();

  // Refs for tracking previous state
  const oldDragItemRef = useRef<LayoutItem | null>(null);
  const oldResizeItemRef = useRef<LayoutItem | null>(null);
  const oldLayoutRef = useRef<Layout | null>(null);
  const dragEnterCounterRef = useRef(0);
  const prevLayoutRef = useRef<Layout>(layout);
  const prevPropsLayoutRef = useRef<Layout>(propsLayout);
  const prevChildrenRef = useRef<React.ReactNode>(children);
  const prevCompactTypeRef = useRef<CompactType>(compactType);

  // Mount effect - call onLayoutChange with initial layout if it differs from props
  useEffect(() => {
    setMounted(true);
    // Possibly call back with layout on mount. This should be done after correcting the layout width
    // to ensure we don't rerender with the wrong width.
    if (!deepEqual(layout, propsLayout)) {
      onLayoutChange(layout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Sync layout from props
  useEffect(() => {
    if (activeDrag) return; // Don't update during drag

    const layoutChanged = !deepEqual(propsLayout, prevPropsLayoutRef.current);
    const childrenChanged = !childrenEqual(children, prevChildrenRef.current);
    const compactTypeChanged = compactType !== prevCompactTypeRef.current;

    if (layoutChanged || childrenChanged || compactTypeChanged) {
      const baseLayout = layoutChanged ? propsLayout : layout;
      const newLayout = synchronizeLayoutWithChildren(
        baseLayout,
        children,
        cols,
        compactType,
        allowOverlap
      );
      setLayout(newLayout);
    }

    prevPropsLayoutRef.current = propsLayout;
    prevChildrenRef.current = children;
    prevCompactTypeRef.current = compactType;
  }, [
    propsLayout,
    children,
    cols,
    compactType,
    allowOverlap,
    activeDrag,
    layout
  ]);

  // Layout change callback
  useEffect(() => {
    if (!activeDrag && !deepEqual(layout, prevLayoutRef.current)) {
      prevLayoutRef.current = layout;
      onLayoutChange(layout);
    }
  }, [layout, activeDrag, onLayoutChange]);

  // ============================================================================
  // Container Height
  // ============================================================================

  const containerHeight = useMemo((): string | undefined => {
    if (!autoSize) return undefined;
    const nbRow = bottom(layout);
    const containerPaddingY = effectiveContainerPadding[1];
    return (
      nbRow * rowHeight + (nbRow - 1) * margin[1] + containerPaddingY * 2 + "px"
    );
  }, [autoSize, layout, rowHeight, margin, effectiveContainerPadding]);

  // ============================================================================
  // Drag Handlers
  // ============================================================================

  const onDragStart = useCallback(
    (i: string, _x: number, _y: number, data: GridDragEvent) => {
      const l = getLayoutItem(layout, i);
      if (!l) return;

      const placeholder: LayoutItem = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        i
      };

      oldDragItemRef.current = cloneLayoutItem(l);
      oldLayoutRef.current = layout;
      setActiveDrag(placeholder);

      onDragStartProp(layout, l, l, null, data.e, data.node);
    },
    [layout, onDragStartProp]
  );

  const onDrag = useCallback(
    (i: string, x: number, y: number, data: GridDragEvent) => {
      const oldDragItem = oldDragItemRef.current;
      const l = getLayoutItem(layout, i);
      if (!l) return;

      const placeholder: LayoutItem = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        i
      };

      // Move the element
      const newLayout = moveElement(
        layout,
        l,
        x,
        y,
        true,
        preventCollision,
        compactType,
        cols,
        allowOverlap
      );

      onDragProp(newLayout, oldDragItem, l, placeholder, data.e, data.node);

      setLayout(
        allowOverlap ? newLayout : compact(newLayout, compactType, cols)
      );
      setActiveDrag(placeholder);
    },
    [layout, preventCollision, compactType, cols, allowOverlap, onDragProp]
  );

  const onDragStop = useCallback(
    (i: string, x: number, y: number, data: GridDragEvent) => {
      if (!activeDrag) return;

      const oldDragItem = oldDragItemRef.current;
      const l = getLayoutItem(layout, i);
      if (!l) return;

      const newLayout = moveElement(
        layout,
        l,
        x,
        y,
        true,
        preventCollision,
        compactType,
        cols,
        allowOverlap
      );

      const finalLayout = allowOverlap
        ? newLayout
        : compact(newLayout, compactType, cols);

      onDragStopProp(finalLayout, oldDragItem, l, null, data.e, data.node);

      const oldLayout = oldLayoutRef.current;
      oldDragItemRef.current = null;
      oldLayoutRef.current = null;
      setActiveDrag(null);
      setLayout(finalLayout);

      if (oldLayout && !deepEqual(oldLayout, finalLayout)) {
        onLayoutChange(finalLayout);
      }
    },
    [
      activeDrag,
      layout,
      preventCollision,
      compactType,
      cols,
      allowOverlap,
      onDragStopProp,
      onLayoutChange
    ]
  );

  // ============================================================================
  // Resize Handlers
  // ============================================================================

  const onResizeStart = useCallback(
    (i: string, _w: number, _h: number, data: GridResizeEvent) => {
      const l = getLayoutItem(layout, i);
      if (!l) return;

      oldResizeItemRef.current = cloneLayoutItem(l);
      oldLayoutRef.current = layout;
      setResizing(true);

      onResizeStartProp(layout, l, l, null, data.e, data.node);
    },
    [layout, onResizeStartProp]
  );

  const onResize = useCallback(
    (i: string, w: number, h: number, data: GridResizeEvent) => {
      const oldResizeItem = oldResizeItemRef.current;
      const { handle } = data;

      let shouldMoveItem = false;
      let newX: number | undefined;
      let newY: number | undefined;

      const [newLayout, l] = withLayoutItem(layout, i, item => {
        newX = item.x;
        newY = item.y;

        // Handle corner/edge resizing that affects position
        if (["sw", "w", "nw", "n", "ne"].includes(handle)) {
          if (["sw", "nw", "w"].includes(handle)) {
            newX = item.x + (item.w - w);
            w = item.x !== newX && newX < 0 ? item.w : w;
            newX = newX < 0 ? 0 : newX;
          }

          if (["ne", "n", "nw"].includes(handle)) {
            newY = item.y + (item.h - h);
            h = item.y !== newY && newY < 0 ? item.h : h;
            newY = newY < 0 ? 0 : newY;
          }

          shouldMoveItem = true;
        }

        // Check for collisions if preventCollision is enabled
        if (preventCollision && !allowOverlap) {
          const collisions = getAllCollisions(layout, {
            ...item,
            w,
            h,
            x: newX ?? item.x,
            y: newY ?? item.y
          }).filter(layoutItem => layoutItem.i !== item.i);

          if (collisions.length > 0) {
            newY = item.y;
            h = item.h;
            newX = item.x;
            w = item.w;
            shouldMoveItem = false;
          }
        }

        (item as Mutable<LayoutItem>).w = w;
        (item as Mutable<LayoutItem>).h = h;

        return item;
      });

      if (!l) return;

      let finalLayout = newLayout;
      if (shouldMoveItem && newX !== undefined && newY !== undefined) {
        finalLayout = moveElement(
          newLayout,
          l,
          newX,
          newY,
          true,
          preventCollision,
          compactType,
          cols,
          allowOverlap
        );
      }

      const placeholder: LayoutItem = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        i,
        static: true
      };

      onResizeProp(
        finalLayout,
        oldResizeItem,
        l,
        placeholder,
        data.e,
        data.node
      );

      setLayout(
        allowOverlap ? finalLayout : compact(finalLayout, compactType, cols)
      );
      setActiveDrag(placeholder);
    },
    [layout, preventCollision, allowOverlap, compactType, cols, onResizeProp]
  );

  const onResizeStop = useCallback(
    (i: string, _w: number, _h: number, data: GridResizeEvent) => {
      const oldResizeItem = oldResizeItemRef.current;
      const l = getLayoutItem(layout, i);

      const finalLayout = allowOverlap
        ? layout
        : compact(layout, compactType, cols);

      onResizeStopProp(
        finalLayout,
        oldResizeItem,
        l ?? null,
        null,
        data.e,
        data.node
      );

      const oldLayout = oldLayoutRef.current;
      oldResizeItemRef.current = null;
      oldLayoutRef.current = null;
      setActiveDrag(null);
      setResizing(false);
      setLayout(finalLayout);

      if (oldLayout && !deepEqual(oldLayout, finalLayout)) {
        onLayoutChange(finalLayout);
      }
    },
    [layout, allowOverlap, compactType, cols, onResizeStopProp, onLayoutChange]
  );

  // ============================================================================
  // Drop Handlers
  // ============================================================================

  const removeDroppingPlaceholder = useCallback(() => {
    const newLayout = compact(
      layout.filter(l => l.i !== droppingItem.i),
      compactType,
      cols,
      allowOverlap
    );

    setLayout(newLayout);
    setDroppingDOMNode(null);
    setActiveDrag(null);
    setDroppingPosition(undefined);
  }, [layout, droppingItem.i, compactType, cols, allowOverlap]);

  const handleDragOver = useCallback(
    (e: ReactDragEvent): void | false => {
      e.preventDefault();
      e.stopPropagation();

      // Firefox hack
      if (
        isFirefox &&
        !(e.nativeEvent.target as HTMLElement)?.classList.contains(
          layoutClassName
        )
      ) {
        return false;
      }

      // Extract dragOffsetX from result, or use empty object if void/undefined
      const rawResult = onDropDragOverProp(e);
      if (rawResult === false) {
        if (droppingDOMNode) {
          removeDroppingPlaceholder();
        }
        return false;
      }
      const { dragOffsetX = 0, dragOffsetY = 0, ...onDragOverResult } = rawResult ?? {};

      const finalDroppingItem = { ...droppingItem, ...onDragOverResult };
      const gridRect = e.currentTarget.getBoundingClientRect();

      // Calculate position params for proper column width calculation
      const positionParams: PositionParams = {
        cols,
        margin: margin as [number, number],
        maxRows,
        rowHeight,
        containerWidth: width,
        containerPadding: effectiveContainerPadding as [number, number]
      };

      // Calculate actual column width accounting for margins and padding
      const actualColWidth = calcGridColWidth(positionParams);

      // Calculate item dimensions in pixels including margins between cells
      const itemPixelWidth = calcGridItemWHPx(
        finalDroppingItem.w,
        actualColWidth,
        (margin as [number, number])[0]
      );
      const itemPixelHeight = calcGridItemWHPx(
        finalDroppingItem.h,
        rowHeight,
        (margin as [number, number])[1]
      );

      // Center the dropping item by offsetting by half its size
      const itemCenterOffsetX = itemPixelWidth / 2;
      const itemCenterOffsetY = itemPixelHeight / 2;

      // Calculate mouse position relative to grid, accounting for drag offset and item centering
      const rawGridX = e.clientX - gridRect.left + dragOffsetX - itemCenterOffsetX;
      const rawGridY = e.clientY - gridRect.top + dragOffsetY - itemCenterOffsetY;

      // Clamp to prevent negative positions (calcXY handles upper bound clamping)
      const clampedGridX = Math.max(0, rawGridX);
      const clampedGridY = Math.max(0, rawGridY);

      const newDroppingPosition: DroppingPosition = {
        left: clampedGridX / transformScale,
        top: clampedGridY / transformScale,
        e: e.nativeEvent
      };

      if (!droppingDOMNode) {
        const calculatedPosition = calcXY(
          positionParams,
          clampedGridY,
          clampedGridX,
          finalDroppingItem.w,
          finalDroppingItem.h
        );

        setDroppingDOMNode(<div key={finalDroppingItem.i} />);
        setDroppingPosition(newDroppingPosition);
        setLayout([
          ...layout,
          {
            ...finalDroppingItem,
            x: calculatedPosition.x,
            y: calculatedPosition.y,
            static: false,
            isDraggable: true
          }
        ]);
      } else if (droppingPosition) {
        const shouldUpdate =
          droppingPosition.left !== clampedGridX ||
          droppingPosition.top !== clampedGridY;
        if (shouldUpdate) {
          setDroppingPosition(newDroppingPosition);
        }
      }
    },
    [
      droppingDOMNode,
      droppingPosition,
      droppingItem,
      onDropDragOverProp,
      removeDroppingPlaceholder,
      transformScale,
      cols,
      margin,
      maxRows,
      rowHeight,
      width,
      effectiveContainerPadding,
      layout
    ]
  );

  const handleDragLeave = useCallback(
    (e: ReactDragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragEnterCounterRef.current--;

      if (dragEnterCounterRef.current === 0) {
        removeDroppingPlaceholder();
      }
    },
    [removeDroppingPlaceholder]
  );

  const handleDragEnter = useCallback((e: ReactDragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragEnterCounterRef.current++;
  }, []);

  const handleDrop = useCallback(
    (e: ReactDragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const item = layout.find(l => l.i === droppingItem.i);
      dragEnterCounterRef.current = 0;
      removeDroppingPlaceholder();
      onDropProp(layout, item, e.nativeEvent);
    },
    [layout, droppingItem.i, removeDroppingPlaceholder, onDropProp]
  );

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const processGridItem = useCallback(
    (
      child: ReactElement,
      isDroppingItem?: boolean
    ): ReactElement | null | undefined => {
      if (!child || !child.key) return null;

      const l = getLayoutItem(layout, String(child.key));
      if (!l) return null;

      const draggable =
        typeof l.isDraggable === "boolean"
          ? l.isDraggable
          : !l.static && isDraggable;
      const resizable =
        typeof l.isResizable === "boolean"
          ? l.isResizable
          : !l.static && isResizable;
      const resizeHandlesOptions = l.resizeHandles || [...resizeHandles];
      const bounded = draggable && isBounded && l.isBounded !== false;

      // Cast resize handle to expected type (function signature is compatible)
      const resizeHandleElement = resizeHandle as ResizeHandle | undefined;

      return (
        <GridItem
          key={l.i}
          containerWidth={width}
          cols={cols}
          margin={margin}
          containerPadding={effectiveContainerPadding}
          maxRows={maxRows}
          rowHeight={rowHeight}
          cancel={draggableCancel}
          handle={draggableHandle}
          onDragStart={onDragStart}
          onDrag={onDrag}
          onDragStop={onDragStop}
          onResizeStart={onResizeStart}
          onResize={onResize}
          onResizeStop={onResizeStop}
          isDraggable={draggable}
          isResizable={resizable}
          isBounded={bounded}
          useCSSTransforms={useCSSTransforms && mounted}
          usePercentages={!mounted}
          transformScale={transformScale}
          w={l.w}
          h={l.h}
          x={l.x}
          y={l.y}
          i={l.i}
          minH={l.minH}
          minW={l.minW}
          maxH={l.maxH}
          maxW={l.maxW}
          static={l.static}
          droppingPosition={isDroppingItem ? droppingPosition : undefined}
          resizeHandles={resizeHandlesOptions}
          resizeHandle={resizeHandleElement}
        >
          {child}
        </GridItem>
      );
    },
    [
      layout,
      width,
      cols,
      margin,
      effectiveContainerPadding,
      maxRows,
      rowHeight,
      draggableCancel,
      draggableHandle,
      onDragStart,
      onDrag,
      onDragStop,
      onResizeStart,
      onResize,
      onResizeStop,
      isDraggable,
      isResizable,
      isBounded,
      useCSSTransforms,
      mounted,
      transformScale,
      droppingPosition,
      resizeHandles,
      resizeHandle
    ]
  );

  const renderPlaceholder = (): ReactElement | null => {
    if (!activeDrag) return null;

    return (
      <GridItem
        w={activeDrag.w}
        h={activeDrag.h}
        x={activeDrag.x}
        y={activeDrag.y}
        i={activeDrag.i}
        className={`react-grid-placeholder ${resizing ? "placeholder-resizing" : ""}`}
        containerWidth={width}
        cols={cols}
        margin={margin}
        containerPadding={effectiveContainerPadding}
        maxRows={maxRows}
        rowHeight={rowHeight}
        isDraggable={false}
        isResizable={false}
        isBounded={false}
        useCSSTransforms={useCSSTransforms}
        transformScale={transformScale}
      >
        <div />
      </GridItem>
    );
  };

  // ============================================================================
  // Render
  // ============================================================================

  const mergedClassName = clsx(layoutClassName, className);
  const mergedStyle: CSSProperties = {
    height: containerHeight,
    ...style
  };

  return (
    <div
      ref={innerRef}
      className={mergedClassName}
      style={mergedStyle}
      onDrop={isDroppable ? handleDrop : undefined}
      onDragLeave={isDroppable ? handleDragLeave : undefined}
      onDragEnter={isDroppable ? handleDragEnter : undefined}
      onDragOver={isDroppable ? handleDragOver : undefined}
    >
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null;
        return processGridItem(child);
      })}
      {isDroppable && droppingDOMNode && processGridItem(droppingDOMNode, true)}
      {renderPlaceholder()}
    </div>
  );
}

export default GridLayout;
