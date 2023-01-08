// @flow
import React from "react";
import PropTypes from "prop-types";
import { DraggableCore } from "react-draggable";
import { Resizable } from "react-resizable";
import { fastPositionEqual, perc, setTopLeft, setTransform } from "./utils";
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
import clsx from "clsx";
import type { Element as ReactElement, Node as ReactNode } from "react";

import type {
  ReactDraggableCallbackData,
  GridDragEvent,
  GridResizeEvent,
  DroppingPosition,
  Position
} from "./utils";

import type { PositionParams } from "./calculateUtils";
import type {
  ResizeHandleAxis,
  ResizeHandle,
  ReactRef
} from "./ReactGridLayoutPropTypes";

type PartialPosition = { top: number, left: number };
type GridItemCallback<Data: GridDragEvent | GridResizeEvent> = (
  i: string,
  w: number,
  h: number,
  Data
) => void;

type State = {
  resizing: ?{ width: number, height: number },
  dragging: ?{ top: number, left: number },
  allowedToDrag: boolean,
  className: string
};

type Props = {
  children: ReactElement<any>,
  cols: number,
  containerWidth: number,
  margin: [number, number],
  containerPadding: [number, number],
  rowHeight: number,
  maxRows: number,
  isDraggable: boolean,
  dragTouchDelayDuration: number,
  isResizable: boolean,
  isBounded: boolean,
  static?: boolean,
  useCSSTransforms?: boolean,
  usePercentages?: boolean,
  transformScale: number,
  droppingPosition?: DroppingPosition,

  className: string,
  style?: Object,
  // Draggability
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

type DefaultProps = {
  className: string,
  cancel: string,
  dragTouchDelayDuration: number,
  handle: string,
  minH: number,
  minW: number,
  maxH: number,
  maxW: number,
  transformScale: number
};

/**
 * An individual item within a ReactGridLayout.
 */
export default class GridItem extends React.Component<Props, State> {
  static propTypes = {
    // Children must be only a single element
    children: PropTypes.element,

    // General grid attributes
    cols: PropTypes.number.isRequired,
    containerWidth: PropTypes.number.isRequired,
    rowHeight: PropTypes.number.isRequired,
    margin: PropTypes.array.isRequired,
    maxRows: PropTypes.number.isRequired,
    containerPadding: PropTypes.array.isRequired,

    // These are all in grid units
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    w: PropTypes.number.isRequired,
    h: PropTypes.number.isRequired,

    // All optional
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

    // ID is nice to have for callbacks
    i: PropTypes.string.isRequired,

    // Resize handle options
    resizeHandles: resizeHandleAxesType,
    resizeHandle: resizeHandleType,

    // Functions
    onDragStop: PropTypes.func,
    onDragStart: PropTypes.func,
    onDrag: PropTypes.func,
    onResizeStop: PropTypes.func,
    onResizeStart: PropTypes.func,
    onResize: PropTypes.func,

    // Flags
    isDraggable: PropTypes.bool.isRequired,
    dragTouchDelayDuration: PropTypes.number,
    isResizable: PropTypes.bool.isRequired,
    isBounded: PropTypes.bool.isRequired,
    static: PropTypes.bool,

    // Use CSS transforms instead of top/left
    useCSSTransforms: PropTypes.bool.isRequired,
    transformScale: PropTypes.number,

    // Others
    className: PropTypes.string,
    // Selector for draggable handle
    handle: PropTypes.string,
    // Selector for draggable cancel (see react-draggable)
    cancel: PropTypes.string,
    // Current position of a dropping element
    droppingPosition: PropTypes.shape({
      e: PropTypes.object.isRequired,
      left: PropTypes.number.isRequired,
      top: PropTypes.number.isRequired
    })
  };

  static defaultProps: DefaultProps = {
    className: "",
    cancel: "",
    dragTouchDelayDuration: 0,
    handle: "",
    minH: 1,
    minW: 1,
    maxH: Infinity,
    maxW: Infinity,
    transformScale: 1
  };

  state: State = {
    dragEnabled: false,
    allowedToDrag: false,
    resizing: null,
    dragging: null,
    className: ""
  };

  elementRef: ReactRef<HTMLDivElement> = React.createRef();

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    // We can't deeply compare children. If the developer memoizes them, we can
    // use this optimization.
    if (this.props.children !== nextProps.children) return true;
    if (this.props.droppingPosition !== nextProps.droppingPosition) return true;
    if (this.state.allowedToDrag !== nextState.allowedToDrag) return true;
    // TODO memoize these calculations so they don't take so long?
    const oldPosition = calcGridItemPosition(
      this.getPositionParams(this.props),
      this.props.x,
      this.props.y,
      this.props.w,
      this.props.h,
      this.state
    );
    const newPosition = calcGridItemPosition(
      this.getPositionParams(nextProps),
      nextProps.x,
      nextProps.y,
      nextProps.w,
      nextProps.h,
      nextState
    );
    return (
      !fastPositionEqual(oldPosition, newPosition) ||
      this.props.useCSSTransforms !== nextProps.useCSSTransforms
    );
  }

  componentDidMount() {
    this.moveDroppingItem({});
  }

  componentDidUpdate(prevProps: Props) {
    this.moveDroppingItem(prevProps);
  }

  // When a droppingPosition is present, this means we should fire a move event, as if we had moved
  // this element by `x, y` pixels.
  moveDroppingItem(prevProps: Props) {
    const { droppingPosition } = this.props;
    if (!droppingPosition) return;
    const node = this.elementRef.current;
    // Can't find DOM node (are we unmounted?)
    if (!node) return;

    const prevDroppingPosition = prevProps.droppingPosition || {
      left: 0,
      top: 0
    };
    const { dragging } = this.state;

    const shouldDrag =
      (dragging && droppingPosition.left !== prevDroppingPosition.left) ||
      droppingPosition.top !== prevDroppingPosition.top;

    if (!dragging) {
      this.onDragStart(droppingPosition.e, {
        node,
        deltaX: droppingPosition.left,
        deltaY: droppingPosition.top
      });
    } else if (shouldDrag) {
      const deltaX = droppingPosition.left - dragging.left;
      const deltaY = droppingPosition.top - dragging.top;

      this.onDrag(droppingPosition.e, {
        node,
        deltaX,
        deltaY
      });
    }
  }

  getPositionParams(props: Props = this.props): PositionParams {
    return {
      cols: props.cols,
      containerPadding: props.containerPadding,
      containerWidth: props.containerWidth,
      margin: props.margin,
      maxRows: props.maxRows,
      rowHeight: props.rowHeight
    };
  }

  /**
   * This is where we set the grid item's absolute placement. It gets a little tricky because we want to do it
   * well when server rendering, and the only way to do that properly is to use percentage width/left because
   * we don't know exactly what the browser viewport is.
   * Unfortunately, CSS Transforms, which are great for performance, break in this instance because a percentage
   * left is relative to the item itself, not its container! So we cannot use them on the server rendering pass.
   *
   * @param  {Object} pos Position object with width, height, left, top.
   * @return {Object}     Style object.
   */
  createStyle(pos: Position): { [key: string]: ?string } {
    const {
      static: isStatic,
      usePercentages,
      containerWidth,
      useCSSTransforms
    } = this.props;
    const scale = !isStatic && this.state.allowedToDrag ? 1.1 : 1;

    let style;
    // CSS Transforms support (default)
    if (useCSSTransforms) {
      style = setTransform(pos, scale);
    } else {
      // top,left (slow)
      style = setTopLeft(pos, scale);

      // This is used for server rendering.
      if (usePercentages) {
        style.left = perc(pos.left / containerWidth);
        style.width = perc(pos.width / containerWidth);
      }
    }

    return style;
  }

  // Check if device is touch-capable.
  isTouchCapable(): boolean {
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }

  // A reference to the DraggableCore component to access it directly.
  draggableCoreRef = React.createRef();

  /**
   * Mix a Draggable instance into a child.
   * @param  {Element} child    Child element.
   * @return {Element}          Child wrapped in Draggable.
   */
  mixinDraggable(
    child: ReactElement<any>,
    isDraggable: boolean
  ): ReactElement<any> {
    const delayedDragEnabled: boolean =
      this.props.dragTouchDelayDuration && this.isTouchCapable();

    // Delayed touch works by changing disabling DraggableCore for a short while.
    const delayedDragNeedsWait =
      delayedDragEnabled && !this.state.allowedToDrag;

    return (
      <DraggableCore
        disabled={!isDraggable || delayedDragNeedsWait}
        onStart={this.onDragStart}
        onMouseDown={delayedDragEnabled ? this.onMouseDown : undefined}
        onDrag={this.onDrag}
        onStop={this.onDragStop}
        handle={this.props.handle}
        cancel={
          ".react-resizable-handle" +
          (this.props.cancel ? "," + this.props.cancel : "")
        }
        scale={this.props.transformScale}
        nodeRef={this.elementRef}
        ref={this.draggableCoreRef}
      >
        {child}
      </DraggableCore>
    );
  }

  /**
   * Mix a Resizable instance into a child.
   * @param  {Element} child    Child element.
   * @param  {Object} position  Position object (pixel values)
   * @return {Element}          Child wrapped in Resizable.
   */
  mixinResizable(
    child: ReactElement<any>,
    position: Position,
    isResizable: boolean
  ): ReactElement<any> {
    const {
      cols,
      x,
      minW,
      minH,
      maxW,
      maxH,
      transformScale,
      resizeHandles,
      resizeHandle
    } = this.props;
    const positionParams = this.getPositionParams();

    // This is the max possible width - doesn't go to infinity because of the width of the window
    const maxWidth = calcGridItemPosition(
      positionParams,
      0,
      0,
      cols - x,
      0
    ).width;

    // Calculate min/max constraints using our min & maxes
    const mins = calcGridItemPosition(positionParams, 0, 0, minW, minH);
    const maxes = calcGridItemPosition(positionParams, 0, 0, maxW, maxH);
    const minConstraints = [mins.width, mins.height];
    const maxConstraints = [
      Math.min(maxes.width, maxWidth),
      Math.min(maxes.height, Infinity)
    ];
    return (
      <Resizable
        // These are opts for the resize handle itself
        draggableOpts={{
          disabled: !isResizable
        }}
        className={isResizable ? undefined : "react-resizable-hide"}
        width={position.width}
        height={position.height}
        minConstraints={minConstraints}
        maxConstraints={maxConstraints}
        onResizeStop={this.onResizeStop}
        onResizeStart={this.onResizeStart}
        onResize={this.onResize}
        transformScale={transformScale}
        resizeHandles={resizeHandles}
        handle={resizeHandle}
      >
        {child}
      </Resizable>
    );
  }

  childEvents: { type: string, event: (e: Event) => void, passive: boolean }[] =
    [];

  /**
   * Add an event listener to the grid item.
   * The event will also be added to childEvents array for future use.
   * @param  {string} type  Type of event to add (eg: mousedown, touchstart, etc)
   * @param  {(e: Event) => void} event  The event callback
   * @param  {boolean} passive  Whether the event should be passive, defaults to false
   */
  addChildEvent: (
    type: string,
    event: (e: Event) => void,
    passive: ?boolean
  ) => void = (type, event, passive = true) => {
    if (this.elementRef.current) {
      this.elementRef.current.addEventListener(type, event, {
        passive
      });
      this.childEvents.push({ type, event, passive });
    }
  };

  removeChildEvents: () => void = () => {
    if (this.elementRef.current) {
      this.childEvents.forEach(({ type, event, passive }) => {
        this.elementRef.current.removeEventListener(type, event, {
          passive
        });
      });
      this.childEvents = [];
    }
  };

  // A reference to the timeout handler to be able to access it at any time.
  dragDelayTimeout: ?TimeoutID = null;

  /**
   * onMouseDown event is tied to both 'mousedown' and 'touchstart' events in DraggableCore.
   * We start the delayed drag process when the user presses the mouse button or the finger.
   * @param  {Event} e  TouchStart/MouseDown event.
   */
  onMouseDown: Event => void = e => {
    // handle touch events only
    if (!this.dragDelayTimeout && e instanceof TouchEvent) {
      this.startDragDelayTimeout(e);
    }
  };

  /**
   * Start the delayed counter to determine when a drag should start.
   * @param  {Event} e          TouchStart/MouseDown event.
   */
  startDragDelayTimeout: Event => void = e => {
    // Prevent text selection while dragging.
    if (
      document.body.style.userSelect === "" ||
      document.body.style.webkitUserSelect === ""
    ) {
      document.body.style.webkitUserSelect = "none";
      document.body.style.userSelect = "none";
    }

    if (!this.state.allowedToDrag) {
      /**
       * Register events to cancel the timeout handler if user releases the mouse or touch
       */
      this.addChildEvent("touchend", this.resetDelayTimeout);
      /**
       * Prevent user from doing touch and scroll at the same time.
       * If the user starts scrolling, we can not cancel the scroll event,
       * so we cancel the drag event instead.
       */
      this.addChildEvent("touchmove", this.handleTouchMove, false);

      // Start the timeout and assign its handler to the dragDelayTimeout
      this.dragDelayTimeout = setTimeout(() => {
        this.dragDelayTimeout = null;
        // vibrate api is not available on safari, so we need to check it
        if (navigator.vibrate && !this.props.static) {
          // vibrate device for 80ms
          navigator.vibrate(80);
        }
        this.setState({ allowedToDrag: true });
        // Start the drag process by calling the DraggableCore handleDragStartFunction directly.
        this.draggableCoreRef.current.handleDragStart(e);
      }, this.props.dragTouchDelayDuration);
    }
  };

  /**
   * Prevent user from doing touch and scroll at the same time.
   * If the user starts scrolling, we can not cancel the scroll event,
   * so we cancel the drag event instead.
   *
   * if the user is currently dragging, and the timeout has not been canceled,
   * we prevent the future scroll events by calling preventDefault.
   *
   * @param  {Event} e  TouchMove/Scroll event.
   */
  handleTouchMove: Event => void = (e: Event) => {
    if (this.state.allowedToDrag) {
      e.preventDefault();
    } else {
      this.resetDelayTimeout();
    }
  };

  /**
   * Reset the drag timer and clear all events and values.
   */
  resetDelayTimeout: () => void = () => {
    clearTimeout(this.dragDelayTimeout);
    this.dragDelayTimeout = null;

    this.setState({ allowedToDrag: false });
    this.removeChildEvents();

    if (
      document.body.style.userSelect === "none" ||
      document.body.style.webkitUserSelect === "none"
    ) {
      document.body.style.webkitUserSelect = "";
      document.body.style.userSelect = "";
    }
  };

  /**
   * onDragStart event handler
   * @param  {Event}  e             event data
   * @param  {Object} callbackData  an object with node, delta and position information
   */
  onDragStart: (Event, ReactDraggableCallbackData) => void = (e, { node }) => {
    const { onDragStart, transformScale } = this.props;
    if (!onDragStart) return;

    const newPosition: PartialPosition = { top: 0, left: 0 };

    // TODO: this wont work on nested parents
    const { offsetParent } = node;
    if (!offsetParent) return;
    const parentRect = offsetParent.getBoundingClientRect();
    const clientRect = node.getBoundingClientRect();
    const cLeft = clientRect.left / transformScale;
    const pLeft = parentRect.left / transformScale;
    const cTop = clientRect.top / transformScale;
    const pTop = parentRect.top / transformScale;
    newPosition.left = cLeft - pLeft + offsetParent.scrollLeft;
    newPosition.top = cTop - pTop + offsetParent.scrollTop;
    this.setState({ dragging: newPosition });

    // Call callback with this data
    const { x, y } = calcXY(
      this.getPositionParams(),
      newPosition.top,
      newPosition.left,
      this.props.w,
      this.props.h
    );

    return onDragStart.call(this, this.props.i, x, y, {
      e,
      node,
      newPosition
    });
  };

  /**
   * onDrag event handler
   * @param  {Event}  e             event data
   * @param  {Object} callbackData  an object with node, delta and position information
   */
  onDrag: (Event, ReactDraggableCallbackData) => void = (
    e,
    { node, deltaX, deltaY }
  ) => {
    const { onDrag } = this.props;
    if (!onDrag) return;

    if (!this.state.dragging) {
      throw new Error("onDrag called before onDragStart.");
    }
    let top = this.state.dragging.top + deltaY;
    let left = this.state.dragging.left + deltaX;

    const { isBounded, i, w, h, containerWidth } = this.props;
    const positionParams = this.getPositionParams();

    // Boundary calculations; keeps items within the grid
    if (isBounded) {
      const { offsetParent } = node;

      if (offsetParent) {
        const { margin, rowHeight } = this.props;
        const bottomBoundary =
          offsetParent.clientHeight - calcGridItemWHPx(h, rowHeight, margin[1]);
        top = clamp(top, 0, bottomBoundary);

        const colWidth = calcGridColWidth(positionParams);
        const rightBoundary =
          containerWidth - calcGridItemWHPx(w, colWidth, margin[0]);
        left = clamp(left, 0, rightBoundary);
      }
    }

    const newPosition: PartialPosition = { top, left };
    this.setState({ dragging: newPosition });

    // Call callback with this data
    const { x, y } = calcXY(positionParams, top, left, w, h);
    return onDrag.call(this, i, x, y, {
      e,
      node,
      newPosition
    });
  };

  /**
   * onDragStop event handler
   * @param  {Event}  e             event data
   * @param  {Object} callbackData  an object with node, delta and position information
   */
  onDragStop: (Event, ReactDraggableCallbackData) => void = (e, { node }) => {
    this.resetDelayTimeout();

    const { onDragStop } = this.props;
    if (!onDragStop) return;

    if (!this.state.dragging) {
      throw new Error("onDragEnd called before onDragStart.");
    }
    const { w, h, i } = this.props;
    const { left, top } = this.state.dragging;
    const newPosition: PartialPosition = { top, left };
    this.setState({ dragging: null });

    const { x, y } = calcXY(this.getPositionParams(), top, left, w, h);

    return onDragStop.call(this, i, x, y, {
      e,
      node,
      newPosition
    });
  };

  /**
   * onResizeStop event handler
   * @param  {Event}  e             event data
   * @param  {Object} callbackData  an object with node and size information
   */
  onResizeStop: (Event, { node: HTMLElement, size: Position }) => void = (
    e,
    callbackData
  ) => {
    this.onResizeHandler(e, callbackData, "onResizeStop");
  };

  /**
   * onResizeStart event handler
   * @param  {Event}  e             event data
   * @param  {Object} callbackData  an object with node and size information
   */
  onResizeStart: (Event, { node: HTMLElement, size: Position }) => void = (
    e,
    callbackData
  ) => {
    this.onResizeHandler(e, callbackData, "onResizeStart");
  };

  /**
   * onResize event handler
   * @param  {Event}  e             event data
   * @param  {Object} callbackData  an object with node and size information
   */
  onResize: (Event, { node: HTMLElement, size: Position }) => void = (
    e,
    callbackData
  ) => {
    this.onResizeHandler(e, callbackData, "onResize");
  };

  /**
   * Wrapper around drag events to provide more useful data.
   * All drag events call the function with the given handler name,
   * with the signature (index, x, y).
   *
   * @param  {String} handlerName Handler name to wrap.
   * @return {Function}           Handler function.
   */
  onResizeHandler(
    e: Event,
    { node, size }: { node: HTMLElement, size: Position },
    handlerName: string
  ): void {
    const handler = this.props[handlerName];
    if (!handler) return;
    const { cols, x, y, i, maxH, minH } = this.props;
    let { minW, maxW } = this.props;

    // Get new XY
    let { w, h } = calcWH(
      this.getPositionParams(),
      size.width,
      size.height,
      x,
      y
    );

    // minW should be at least 1 (TODO propTypes validation?)
    minW = Math.max(minW, 1);

    // maxW should be at most (cols - x)
    maxW = Math.min(maxW, cols - x);

    // Min/max capping
    w = clamp(w, minW, maxW);
    h = clamp(h, minH, maxH);

    this.setState({ resizing: handlerName === "onResizeStop" ? null : size });

    handler.call(this, i, w, h, { e, node, size });
  }

  render(): ReactNode {
    const {
      x,
      y,
      w,
      h,
      isDraggable,
      isResizable,
      droppingPosition,
      useCSSTransforms
    } = this.props;

    const pos = calcGridItemPosition(
      this.getPositionParams(),
      x,
      y,
      w,
      h,
      this.state
    );
    const child = React.Children.only(this.props.children);

    // Create the child element. We clone the existing element but modify its className and style.
    let newChild = React.cloneElement(child, {
      ref: this.elementRef,
      className: clsx(
        "react-grid-item",
        child.props.className,
        this.props.className,
        {
          static: this.props.static,
          resizing: Boolean(this.state.resizing),
          "react-draggable": isDraggable,
          "react-draggable-dragging": Boolean(this.state.dragging),
          dropping: Boolean(droppingPosition),
          cssTransforms: useCSSTransforms
        }
      ),
      // We can set the width and height on the child, but unfortunately we can't set the position.
      style: {
        ...this.props.style,
        ...child.props.style,
        ...this.createStyle(pos)
      }
    });

    // Resizable support. This is usually on but the user can toggle it off.
    newChild = this.mixinResizable(newChild, pos, isResizable);

    // Draggable support. This is always on, except for with placeholders.
    newChild = this.mixinDraggable(newChild, isDraggable);

    return newChild;
  }
}
