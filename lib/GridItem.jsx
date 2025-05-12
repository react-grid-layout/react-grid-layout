/* @flow */
import React, { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { DraggableCore } from "react-draggable";
import { Resizable } from "react-resizable";
import clsx from "clsx";

import {
  fastPositionEqual,
  perc,
  resizeItemInDirection,
  setTopLeft,
  setTransform
} from "./utils";
import {
  calcGridItemPosition,
  calcGridItemWHPx,
  calcGridColWidth,
  calcXY,
  calcWH,
  clamp
} from "./calculateUtils";
import {
  resizeHandleAxesType,
  resizeHandleType
} from "./ReactGridLayoutPropTypes";

import type { MixedElement as ReactElement, Node as ReactNode } from "react";

import type {
  ReactDraggableCallbackData,
  GridDragEvent,
  GridResizeEvent,
  DroppingPosition,
  Position,
  ResizeHandleAxis
} from "./utils";

import type { PositionParams } from "./calculateUtils";
import type { ResizeHandle, ReactRef } from "./ReactGridLayoutPropTypes";

// Flow types for component props and state
type PartialPosition = { top: number, left: number };
type GridItemCallback<Data: GridDragEvent | GridResizeEvent> = (
  i: string,
  w: number,
  h: number,
  Data: any
) => void;

type ResizeCallbackData = {
  node: HTMLElement,
  size: Position,
  handle: ResizeHandleAxis
};

type Props = {
  children: ReactElement,
  cols: number,
  containerWidth: number,
  margin: [number, number],
  containerPadding: [number, number],
  rowHeight: number,
  maxRows: number,
  isDraggable: boolean,
  isResizable: boolean,
  isBounded: boolean,
  static?: boolean,
  useCSSTransforms: boolean,
  usePercentages?: boolean,
  transformScale: number,
  droppingPosition?: DroppingPosition,

  className: string,
  style?: Object,
  cancel: string,
  handle: string,

  x: number,
  y: number,
  w: number,
  h: number,

  minW: number,
  maxW: number,
  minH: number,
  maxH: number,
  i: string,

  resizeHandles?: ResizeHandleAxis[],
  resizeHandle?: ResizeHandle,

  onDrag?: GridItemCallback<GridDragEvent>,
  onDragStart?: GridItemCallback<GridDragEvent>,
  onDragStop?: GridItemCallback<GridDragEvent>,
  onResize?: GridItemCallback<GridResizeEvent>,
  onResizeStart?: GridItemCallback<GridResizeEvent>,
  onResizeStop?: GridItemCallback<GridResizeEvent>
};

const defaultProps = {
  className: "",
  cancel: "",
  handle: "",
  minH: 1,
  minW: 1,
  maxH: Infinity,
  maxW: Infinity,
  transformScale: 1
};

function GridItem(props: Props): ReactNode {
  const {
    children,
    cols,
    containerWidth,
    rowHeight,
    margin,
    maxRows,
    containerPadding,
    x,
    y,
    w,
    h,
    isDraggable,
    isResizable,
    isBounded,
    static: staticItem,
    useCSSTransforms,
    usePercentages,
    transformScale,
    droppingPosition,
    className,
    style,
    cancel,
    handle,
    minW,
    maxW,
    minH,
    maxH,
    i,
    resizeHandles,
    resizeHandle,
    onDrag,
    onDragStart,
    onDragStop,
    onResize,
    onResizeStart,
    onResizeStop
  } = props;

  // Local state for dragging and resizing
  const [dragging, setDragging] = useState<?PartialPosition>(null);
  const [resizing, setResizing] =
    useState<?{ top: number, left: number, width: number, height: number }>(
      null
    );

  // Ref for the component DOM node
  const elementRef = useRef<?HTMLDivElement>(null);

  // Ref to store the previous dropping position across renders
  const prevDroppingPositionRef = useRef<?{ left: number, top: number }>(null);

  // Get position parameters based on props
  const getPositionParams = useCallback(
    (p: Props = props): PositionParams => ({
      cols: p.cols,
      containerPadding: p.containerPadding,
      containerWidth: p.containerWidth,
      margin: p.margin,
      maxRows: p.maxRows,
      rowHeight: p.rowHeight
    }),
    [cols, containerWidth, rowHeight, margin, maxRows, containerPadding]
  );

  // Create style object for grid item placement
  const createStyle = useCallback(
    (pos: Position): { [string]: ?string } => {
      if (useCSSTransforms) {
        return setTransform(pos);
      } else {
        const styleObj = setTopLeft(pos);
        if (usePercentages) {
          styleObj.left = perc(pos.left / containerWidth);
          styleObj.width = perc(pos.width / containerWidth);
        }
        return styleObj;
      }
    },
    [useCSSTransforms, usePercentages, containerWidth]
  );

  // Handler for drag start event
  const handleDragStart = useCallback(
    (e: Event, data: ReactDraggableCallbackData) => {
      if (!onDragStart) return;
      const { node } = data;
      const newPosition: PartialPosition = { top: 0, left: 0 };

      const offsetParent = node.offsetParent;
      if (!offsetParent) return;
      const parentRect = offsetParent.getBoundingClientRect();
      const clientRect = node.getBoundingClientRect();
      const cLeft = clientRect.left / transformScale;
      const pLeft = parentRect.left / transformScale;
      const cTop = clientRect.top / transformScale;
      const pTop = parentRect.top / transformScale;
      newPosition.left = cLeft - pLeft + offsetParent.scrollLeft;
      newPosition.top = cTop - pTop + offsetParent.scrollTop;
      setDragging(newPosition);

      const posParams = getPositionParams();
      const { x: gridX, y: gridY } = calcXY(
        posParams,
        newPosition.top,
        newPosition.left,
        w,
        h
      );
      onDragStart(i, gridX, gridY, { e, node, newPosition });
    },
    [onDragStart, transformScale, getPositionParams, w, h, i]
  );

  // Handler for drag event
  const handleDrag = useCallback(
    (e: Event, data: ReactDraggableCallbackData) => {
      if (!onDrag) return;
      if (!dragging) {
        throw new Error("onDrag called before onDragStart.");
      }
      let top = dragging.top + data.deltaY;
      let left = dragging.left + data.deltaX;
      const posParams = getPositionParams();

      if (isBounded) {
        const offsetParent = data.node.offsetParent;
        if (offsetParent) {
          const bottomBoundary =
            offsetParent.clientHeight -
            calcGridItemWHPx(h, rowHeight, margin[1]);
          top = clamp(top - containerPadding[1], 0, bottomBoundary);
          const colWidth = calcGridColWidth(posParams);
          const rightBoundary =
            containerWidth - calcGridItemWHPx(w, colWidth, margin[0]);
          left = clamp(left - containerPadding[0], 0, rightBoundary);
        }
      }
      const newPosition = { top, left };
      setDragging(newPosition);
      const { x: gridX, y: gridY } = calcXY(posParams, top, left, w, h);
      onDrag(i, gridX, gridY, { e, node: data.node, newPosition });
    },
    [
      onDrag,
      dragging,
      getPositionParams,
      isBounded,
      containerPadding,
      containerWidth,
      margin,
      rowHeight,
      w,
      h,
      i
    ]
  );

  // Handler for drag stop event
  const handleDragStop = useCallback(
    (e: Event, data: ReactDraggableCallbackData) => {
      if (!onDragStop) return;
      if (!dragging) {
        throw new Error("onDragStop called before onDragStart.");
      }
      const newPosition = { top: dragging.top, left: dragging.left };
      setDragging(null);
      const posParams = getPositionParams();
      const { x: gridX, y: gridY } = calcXY(
        posParams,
        dragging.top,
        dragging.left,
        w,
        h
      );
      onDragStop(i, gridX, gridY, { e, node: data.node, newPosition });
    },
    [onDragStop, dragging, getPositionParams, w, h, i]
  );

  // Utility function to curry resize handlers
  const curryResizeHandler = useCallback(
    (position: Position, handler: Function) => {
      return (e: Event, data: ResizeCallbackData) => handler(e, data, position);
    },
    []
  );

  // Handler for resize operations
  const handleResizeHandler = useCallback(
    (
      e: Event,
      data: ResizeCallbackData,
      position: Position,
      handlerName: "onResizeStart" | "onResize" | "onResizeStop"
    ) => {
      const handler = props[handlerName];
      if (!handler) return;
      const posParams = getPositionParams();
      let updatedSize = data.size;

      if (data.node) {
        updatedSize = resizeItemInDirection(
          data.handle,
          position,
          data.size,
          containerWidth
        );
        if (handlerName === "onResizeStop") {
          setResizing(null);
        } else {
          setResizing(updatedSize);
        }
      }

      let { w: newW, h: newH } = calcWH(
        posParams,
        updatedSize.width,
        updatedSize.height,
        x,
        y,
        data.handle
      );

      newW = clamp(newW, Math.max(minW, 1), maxW);
      newH = clamp(newH, minH, maxH);
      handler(i, newW, newH, {
        e,
        node: data.node,
        size: updatedSize,
        handle: data.handle
      });
    },
    [getPositionParams, containerWidth, x, y, minW, maxW, minH, maxH, i]
  );

  const handleResizeStart = useCallback(
    (e: Event, data: ResizeCallbackData, position: Position) => {
      handleResizeHandler(e, data, position, "onResizeStart");
    },
    [handleResizeHandler]
  );

  const handleResize = useCallback(
    (e: Event, data: ResizeCallbackData, position: Position) => {
      handleResizeHandler(e, data, position, "onResize");
    },
    [handleResizeHandler]
  );

  const handleResizeStop = useCallback(
    (e: Event, data: ResizeCallbackData, position: Position) => {
      handleResizeHandler(e, data, position, "onResizeStop");
    },
    [handleResizeHandler]
  );

  // Function to wrap a child with Draggable functionality
  const mixinDraggable = useCallback(
    (child: ReactElement, draggable: boolean) => {
      return (
        <DraggableCore
          disabled={!draggable}
          onStart={handleDragStart}
          onDrag={handleDrag}
          onStop={handleDragStop}
          handle={handle}
          cancel={".react-resizable-handle" + (cancel ? "," + cancel : "")}
          scale={transformScale}
          nodeRef={elementRef}
        >
          {child}
        </DraggableCore>
      );
    },
    [
      handleDragStart,
      handleDrag,
      handleDragStop,
      handle,
      cancel,
      transformScale
    ]
  );

  // Function to wrap a child with Resizable functionality
  const mixinResizable = useCallback(
    (child: ReactElement, position: Position, resizable: boolean) => {
      const posParams = getPositionParams();
      const maxWidth = calcGridItemPosition(posParams, 0, 0, cols, 0).width;
      const mins = calcGridItemPosition(posParams, 0, 0, minW, minH);
      const maxes = calcGridItemPosition(posParams, 0, 0, maxW, maxH);
      const minConstraints = [mins.width, mins.height];
      const maxConstraints = [
        Math.min(maxes.width, maxWidth),
        Math.min(maxes.height, Infinity)
      ];

      return (
        <Resizable
          draggableOpts={{ disabled: !resizable }}
          className={resizable ? undefined : "react-resizable-hide"}
          width={position.width}
          height={position.height}
          minConstraints={minConstraints}
          maxConstraints={maxConstraints}
          onResizeStart={curryResizeHandler(position, handleResizeStart)}
          onResize={curryResizeHandler(position, handleResize)}
          onResizeStop={curryResizeHandler(position, handleResizeStop)}
          transformScale={transformScale}
          resizeHandles={resizeHandles}
          handle={resizeHandle}
        >
          {child}
        </Resizable>
      );
    },
    [
      getPositionParams,
      cols,
      minW,
      minH,
      maxW,
      maxH,
      transformScale,
      resizeHandles,
      resizeHandle,
      curryResizeHandler,
      handleResizeStart,
      handleResize,
      handleResizeStop
    ]
  );

  // Effect to handle droppingPosition changes (simulate componentDidMount and componentDidUpdate)
  useEffect(() => {
    if (!droppingPosition) return;
    const node = elementRef.current;
    if (!node) return;

    const prevDropping = prevDroppingPositionRef.current || { left: 0, top: 0 };
    const shouldDrag =
      (dragging && droppingPosition.left !== prevDropping.left) ||
      droppingPosition.top !== prevDropping.top;

    if (!dragging) {
      handleDragStart(droppingPosition.e, {
        node,
        deltaX: droppingPosition.left,
        deltaY: droppingPosition.top
      });
    } else if (shouldDrag) {
      const deltaX = droppingPosition.left - (dragging ? dragging.left : 0);
      const deltaY = droppingPosition.top - (dragging ? dragging.top : 0);
      handleDrag(droppingPosition.e, { node, deltaX, deltaY });
    }
    prevDroppingPositionRef.current = {
      left: droppingPosition.left,
      top: droppingPosition.top
    };
  }, [droppingPosition, dragging, handleDragStart, handleDrag]);

  // Calculate the grid position for rendering
  const pos = calcGridItemPosition(getPositionParams(), x, y, w, h, {
    dragging,
    resizing
  });

  // Clone the only child element to merge props
  const child = React.Children.only(children);
  const newChild = React.cloneElement(child, {
    ref: elementRef,
    className: clsx("react-grid-item", child.props.className, className, {
      static: staticItem,
      resizing: Boolean(resizing),
      "react-draggable": isDraggable,
      "react-draggable-dragging": Boolean(dragging),
      dropping: Boolean(droppingPosition),
      cssTransforms: useCSSTransforms
    }),
    style: {
      ...style,
      ...child.props.style,
      ...createStyle(pos)
    }
  });

  // Wrap with Resizable then Draggable
  const resizableChild = mixinResizable(newChild, pos, isResizable);
  const draggableChild = mixinDraggable(resizableChild, isDraggable);

  return draggableChild;
}

GridItem.propTypes = {
  children: PropTypes.element,
  cols: PropTypes.number.isRequired,
  containerWidth: PropTypes.number.isRequired,
  rowHeight: PropTypes.number.isRequired,
  margin: PropTypes.array.isRequired,
  maxRows: PropTypes.number.isRequired,
  containerPadding: PropTypes.array.isRequired,

  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  w: PropTypes.number.isRequired,
  h: PropTypes.number.isRequired,

  minW: function (props: Props, propName: string) {
    const value = props[propName];
    if (typeof value !== "number") return new Error("minWidth not Number");
    if (value > props.w || value > props.maxW)
      return new Error("minWidth larger than item width/maxWidth");
  },

  maxW: function (props: Props, propName: string) {
    const value = props[propName];
    if (typeof value !== "number") return new Error("maxWidth not Number");
    if (value < props.w || value < props.minW)
      return new Error("maxWidth smaller than item width/minWidth");
  },

  minH: function (props: Props, propName: string) {
    const value = props[propName];
    if (typeof value !== "number") return new Error("minHeight not Number");
    if (value > props.h || value > props.maxH)
      return new Error("minHeight larger than item height/maxHeight");
  },

  maxH: function (props: Props, propName: string) {
    const value = props[propName];
    if (typeof value !== "number") return new Error("maxHeight not Number");
    if (value < props.h || value < props.minH)
      return new Error("maxHeight smaller than item height/minHeight");
  },

  i: PropTypes.string.isRequired,
  resizeHandles: resizeHandleAxesType,
  resizeHandle: resizeHandleType,
  onDragStop: PropTypes.func,
  onDragStart: PropTypes.func,
  onDrag: PropTypes.func,
  onResizeStop: PropTypes.func,
  onResizeStart: PropTypes.func,
  onResize: PropTypes.func,
  isDraggable: PropTypes.bool.isRequired,
  isResizable: PropTypes.bool.isRequired,
  isBounded: PropTypes.bool.isRequired,
  static: PropTypes.bool,
  useCSSTransforms: PropTypes.bool.isRequired,
  transformScale: PropTypes.number,
  droppingPosition: PropTypes.shape({
    e: PropTypes.object.isRequired,
    left: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired
  }),
  className: PropTypes.string,
  handle: PropTypes.string,
  cancel: PropTypes.string
};

GridItem.defaultProps = defaultProps;

export default GridItem;
