"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _fastEquals = require("fast-equals");
var _clsx = _interopRequireDefault(require("clsx"));
var _utils = require("./utils");
var _calculateUtils = require("./calculateUtils");
var _GridItem = _interopRequireDefault(require("./GridItem"));
var _ReactGridLayoutPropTypes = _interopRequireDefault(require("./ReactGridLayoutPropTypes"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/*:: import type {
  ChildrenArray as ReactChildrenArray,
  Element as ReactElement
} from "react";*/
/*:: import type {
  CompactType,
  GridResizeEvent,
  GridDragEvent,
  DragOverEvent,
  Layout,
  DroppingPosition,
  LayoutItem
} from "./utils";*/
// Types
/*:: import type { PositionParams } from "./calculateUtils";*/
/*:: type State = {
  activeDrag: ?LayoutItem,
  layout: Layout,
  mounted: boolean,
  oldDragItem: ?LayoutItem,
  oldLayout: ?Layout,
  oldResizeItem: ?LayoutItem,
  resizing: boolean,
  droppingDOMNode: ?ReactElement<any>,
  droppingPosition?: DroppingPosition,
  // Mirrored props
  children: ReactChildrenArray<ReactElement<any>>,
  compactType?: CompactType,
  propsLayout?: Layout
};*/
/*:: import type { Props, DefaultProps } from "./ReactGridLayoutPropTypes";*/
// End Types
const layoutClassName = "react-grid-layout";
let isFirefox = false;
// Try...catch will protect from navigator not existing (e.g. node) or a bad implementation of navigator
try {
  isFirefox = /firefox/i.test(navigator.userAgent);
} catch (e) {
  /* Ignore */
}

/**
 * A reactive, fluid grid layout with draggable, resizable components.
 */

class ReactGridLayout extends React.Component /*:: <Props, State>*/{
  constructor() {
    super(...arguments);
    _defineProperty(this, "state", {
      activeDrag: null,
      layout: (0, _utils.synchronizeLayoutWithChildren)(this.props.layout, this.props.children, this.props.cols,
      // Legacy support for verticalCompact: false
      (0, _utils.compactType)(this.props), this.props.allowOverlap),
      mounted: false,
      oldDragItem: null,
      oldLayout: null,
      oldResizeItem: null,
      resizing: false,
      droppingDOMNode: null,
      children: []
    });
    _defineProperty(this, "dragEnterCounter", 0);
    /**
     * When dragging starts
     * @param {String} i Id of the child
     * @param {Number} x X position of the move
     * @param {Number} y Y position of the move
     * @param {Event} e The mousedown event
     * @param {Element} node The current dragging DOM element
     */
    _defineProperty(this, "onDragStart", (i /*: string*/, x /*: number*/, y /*: number*/, _ref /*:: */) => {
      let {
        e,
        node
      } /*: GridDragEvent*/ = _ref /*: GridDragEvent*/;
      const {
        layout
      } = this.state;
      const l = (0, _utils.getLayoutItem)(layout, i);
      if (!l) return;

      // Create placeholder (display only)
      const placeholder = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        placeholder: true,
        i: i
      };
      
      // Apply any custom styling that was applied to the original element
      // This ensures the dragged representation matches the visual appearance
      if (node && this.props.onItemStyleOverride) {
        // Get the current computed style of the item
        const computedStyle = window.getComputedStyle(node);
        const computedWidth = parseInt(computedStyle.width, 10);
        
        // If the width is different from what would be expected for the item's w value
        // then we need to adjust the placeholder width
        placeholder._customWidth = computedWidth;
      }
      
      this.setState({
        oldDragItem: (0, _utils.cloneLayoutItem)(l),
        oldLayout: layout,
        activeDrag: placeholder
      });
      return this.props.onDragStart(layout, l, l, null, e, node);
    });
    /**
     * Each drag movement create a new dragelement and move the element to the dragged location
     * @param {String} i Id of the child
     * @param {Number} x X position of the move
     * @param {Number} y Y position of the move
     * @param {Event} e The mousedown event
     * @param {Element} node The current dragging DOM element
     */
    _defineProperty(this, "onDrag", (i, x, y, _ref2) => {
      let {
        e,
        node
      } = _ref2;
      const {
        oldDragItem
      } = this.state;
      let {
        layout
      } = this.state;
      const {
        cols,
        allowOverlap,
        preventCollision
      } = this.props;
      const l = (0, _utils.getLayoutItem)(layout, i);
      if (!l) return;

      // Create placeholder (display only)
      const placeholder = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        placeholder: true,
        i: i
      };

      // Move the element to the dragged location.
      const isUserAction = true;
      layout = (0, _utils.moveElement)(layout, l, x, y, isUserAction, preventCollision, (0, _utils.compactType)(this.props), cols, allowOverlap);
      this.props.onDrag(layout, oldDragItem, l, placeholder, e, node);
      this.setState({
        layout: allowOverlap ? layout : (0, _utils.compact)(layout, (0, _utils.compactType)(this.props), cols),
        activeDrag: placeholder
      });
    });
    /**
     * When dragging stops, figure out which position the element is closest to and update its x and y.
     * @param  {String} i Index of the child.
     * @param {Number} x X position of the move
     * @param {Number} y Y position of the move
     * @param {Event} e The mousedown event
     * @param {Element} node The current dragging DOM element
     */
    _defineProperty(this, "onDragStop", (i, x, y, _ref3) => {
      let {
        e,
        node
      } = _ref3;
      if (!this.state.activeDrag) return;
      const {
        oldDragItem
      } = this.state;
      let {
        layout
      } = this.state;
      const {
        cols,
        preventCollision,
        allowOverlap
      } = this.props;
      const l = (0, _utils.getLayoutItem)(layout, i);
      if (!l) return;

      // Move the element here
      const isUserAction = true;
      layout = (0, _utils.moveElement)(layout, l, x, y, isUserAction, preventCollision, (0, _utils.compactType)(this.props), cols, allowOverlap);

      // Set state
      const newLayout = allowOverlap ? layout : (0, _utils.compact)(layout, (0, _utils.compactType)(this.props), cols);
      this.props.onDragStop(newLayout, oldDragItem, l, null, e, node);
      const {
        oldLayout
      } = this.state;
      this.setState({
        activeDrag: null,
        layout: newLayout,
        oldDragItem: null,
        oldLayout: null
      });
      this.onLayoutMaybeChanged(newLayout, oldLayout);
    });
    _defineProperty(this, "onResizeStart", (i, w, h, _ref4) => {
      let {
        e,
        node
      } = _ref4;
      const {
        layout
      } = this.state;
      const l = (0, _utils.getLayoutItem)(layout, i);
      if (!l) return;
      this.setState({
        oldResizeItem: (0, _utils.cloneLayoutItem)(l),
        oldLayout: this.state.layout,
        resizing: true
      });
      this.props.onResizeStart(layout, l, l, null, e, node);
    });
    _defineProperty(this, "onResize", (i, w, h, _ref5) => {
      let {
        e,
        node,
        size,
        handle
      } = _ref5;
      const {
        oldResizeItem
      } = this.state;
      const {
        layout
      } = this.state;
      const {
        cols,
        preventCollision,
        allowOverlap
      } = this.props;
      let shouldMoveItem = false;
      let finalLayout;
      let x;
      let y;
      const [newLayout, l] = (0, _utils.withLayoutItem)(layout, i, l => {
        let hasCollisions;
        x = l.x;
        y = l.y;
        if (["sw", "w", "nw", "n", "ne"].indexOf(handle) !== -1) {
          if (["sw", "nw", "w"].indexOf(handle) !== -1) {
            x = l.x + (l.w - w);
            w = l.x !== x && x < 0 ? l.w : w;
            x = x < 0 ? 0 : x;
          }
          if (["ne", "n", "nw"].indexOf(handle) !== -1) {
            y = l.y + (l.h - h);
            h = l.y !== y && y < 0 ? l.h : h;
            y = y < 0 ? 0 : y;
          }
          shouldMoveItem = true;
        }

        // Something like quad tree should be used
        // to find collisions faster
        if (preventCollision && !allowOverlap) {
          const collisions = (0, _utils.getAllCollisions)(layout, {
            ...l,
            w,
            h,
            x,
            y
          }).filter(layoutItem => layoutItem.i !== l.i);
          hasCollisions = collisions.length > 0;

          // If we're colliding, we need adjust the placeholder.
          if (hasCollisions) {
            // Reset layoutItem dimensions if there were collisions
            y = l.y;
            h = l.h;
            x = l.x;
            w = l.w;
            shouldMoveItem = false;
          }
        }
        l.w = w;
        l.h = h;
        return l;
      });

      // Shouldn't ever happen, but typechecking makes it necessary
      if (!l) return;
      finalLayout = newLayout;
      if (shouldMoveItem) {
        // Move the element to the new position.
        const isUserAction = true;
        finalLayout = (0, _utils.moveElement)(newLayout, l, x, y, isUserAction, this.props.preventCollision, (0, _utils.compactType)(this.props), cols, allowOverlap);
      }

      // Create placeholder element (display only)
      const placeholder = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        static: true,
        i: i
      };
      this.props.onResize(finalLayout, oldResizeItem, l, placeholder, e, node);

      // Re-compact the newLayout and set the drag placeholder.
      this.setState({
        layout: allowOverlap ? finalLayout : (0, _utils.compact)(finalLayout, (0, _utils.compactType)(this.props), cols),
        activeDrag: placeholder
      });
    });
    _defineProperty(this, "onResizeStop", (i, w, h, _ref6) => {
      let {
        e,
        node
      } = _ref6;
      const {
        layout,
        oldResizeItem
      } = this.state;
      const {
        cols,
        allowOverlap
      } = this.props;
      const l = (0, _utils.getLayoutItem)(layout, i);

      // Set state
      const newLayout = allowOverlap ? layout : (0, _utils.compact)(layout, (0, _utils.compactType)(this.props), cols);
      this.props.onResizeStop(newLayout, oldResizeItem, l, null, e, node);
      const {
        oldLayout
      } = this.state;
      this.setState({
        activeDrag: null,
        layout: newLayout,
        oldResizeItem: null,
        oldLayout: null,
        resizing: false
      });
      this.onLayoutMaybeChanged(newLayout, oldLayout);
    });
    // Called while dragging an element. Part of browser native drag/drop API.
    // Native event target might be the layout itself, or an element within the layout.
    _defineProperty(this, "onDragOver", e => {
      e.preventDefault(); // Prevent any browser native action
      e.stopPropagation();

      // we should ignore events from layout's children in Firefox
      // to avoid unpredictable jumping of a dropping placeholder
      // FIXME remove this hack
      if (isFirefox &&
      // $FlowIgnore can't figure this out
      !e.nativeEvent.target?.classList.contains(layoutClassName)) {
        return false;
      }
      const {
        droppingItem,
        onDropDragOver,
        margin,
        cols,
        rowHeight,
        maxRows,
        width,
        containerPadding,
        transformScale
      } = this.props;
      // Allow user to customize the dropping item or short-circuit the drop based on the results
      // of the `onDragOver(e: Event)` callback.
      const onDragOverResult = onDropDragOver?.(e);
      if (onDragOverResult === false) {
        if (this.state.droppingDOMNode) {
          this.removeDroppingPlaceholder();
        }
        return false;
      }
      const finalDroppingItem = {
        ...droppingItem,
        ...onDragOverResult
      };
      const {
        layout
      } = this.state;

      // $FlowIgnore missing def
      const gridRect = e.currentTarget.getBoundingClientRect(); // The grid's position in the viewport

      // Calculate the mouse position relative to the grid
      const layerX = e.clientX - gridRect.left;
      const layerY = e.clientY - gridRect.top;
      const droppingPosition = {
        left: layerX / transformScale,
        top: layerY / transformScale,
        e
      };
      if (!this.state.droppingDOMNode) {
        const positionParams /*: PositionParams*/ = {
          cols,
          margin,
          maxRows,
          rowHeight,
          containerWidth: width,
          containerPadding: containerPadding || margin
        };
        const calculatedPosition = (0, _calculateUtils.calcXY)(positionParams, layerY, layerX, finalDroppingItem.w, finalDroppingItem.h);
        this.setState({
          droppingDOMNode: /*#__PURE__*/React.createElement("div", {
            key: finalDroppingItem.i
          }),
          droppingPosition,
          layout: [...layout, {
            ...finalDroppingItem,
            x: calculatedPosition.x,
            y: calculatedPosition.y,
            static: false,
            isDraggable: true
          }]
        });
      } else if (this.state.droppingPosition) {
        const {
          left,
          top
        } = this.state.droppingPosition;
        const shouldUpdatePosition = left != layerX || top != layerY;
        if (shouldUpdatePosition) {
          this.setState({
            droppingPosition
          });
        }
      }
    });
    _defineProperty(this, "removeDroppingPlaceholder", () => {
      const {
        droppingItem,
        cols
      } = this.props;
      const {
        layout
      } = this.state;
      const newLayout = (0, _utils.compact)(layout.filter(l => l.i !== droppingItem.i), (0, _utils.compactType)(this.props), cols, this.props.allowOverlap);
      this.setState({
        layout: newLayout,
        droppingDOMNode: null,
        activeDrag: null,
        droppingPosition: undefined
      });
    });
    _defineProperty(this, "onDragLeave", e => {
      e.preventDefault(); // Prevent any browser native action
      e.stopPropagation();
      this.dragEnterCounter--;

      // onDragLeave can be triggered on each layout's child.
      // But we know that count of dragEnter and dragLeave events
      // will be balanced after leaving the layout's container
      // so we can increase and decrease count of dragEnter and
      // when it'll be equal to 0 we'll remove the placeholder
      if (this.dragEnterCounter === 0) {
        this.removeDroppingPlaceholder();
      }
    });
    _defineProperty(this, "onDragEnter", e => {
      e.preventDefault(); // Prevent any browser native action
      e.stopPropagation();
      this.dragEnterCounter++;
    });
    _defineProperty(this, "onDrop", (e /*: Event*/) => {
      e.preventDefault(); // Prevent any browser native action
      e.stopPropagation();
      const {
        droppingItem
      } = this.props;
      const {
        layout
      } = this.state;
      const item = layout.find(l => l.i === droppingItem.i);

      // reset dragEnter counter on drop
      this.dragEnterCounter = 0;
      this.removeDroppingPlaceholder();
      this.props.onDrop(layout, item, e);
    });
  }
  componentDidMount() {
    this.setState({
      mounted: true
    });
    // Possibly call back with layout on mount. This should be done after correcting the layout width
    // to ensure we don't rerender with the wrong width.
    this.onLayoutMaybeChanged(this.state.layout, this.props.layout);
  }
  static getDerivedStateFromProps(nextProps /*: Props*/, prevState /*: State*/) /*: $Shape<State> | null*/{
    let newLayoutBase;
    if (prevState.activeDrag) {
      return null;
    }

    // Legacy support for compactType
    // Allow parent to set layout directly.
    if (!(0, _fastEquals.deepEqual)(nextProps.layout, prevState.propsLayout) || nextProps.compactType !== prevState.compactType) {
      newLayoutBase = nextProps.layout;
    } else if (!(0, _utils.childrenEqual)(nextProps.children, prevState.children)) {
      // If children change, also regenerate the layout. Use our state
      // as the base in case because it may be more up to date than
      // what is in props.
      newLayoutBase = prevState.layout;
    }

    // We need to regenerate the layout.
    if (newLayoutBase) {
      const newLayout = (0, _utils.synchronizeLayoutWithChildren)(newLayoutBase, nextProps.children, nextProps.cols, (0, _utils.compactType)(nextProps), nextProps.allowOverlap);
      return {
        layout: newLayout,
        // We need to save these props to state for using
        // getDerivedStateFromProps instead of componentDidMount (in which we would get extra rerender)
        compactType: nextProps.compactType,
        children: nextProps.children,
        propsLayout: nextProps.layout
      };
    }
    return null;
  }
  shouldComponentUpdate(nextProps /*: Props*/, nextState /*: State*/) /*: boolean*/{
    return (
      // NOTE: this is almost always unequal. Therefore the only way to get better performance
      // from SCU is if the user intentionally memoizes children. If they do, and they can
      // handle changes properly, performance will increase.
      this.props.children !== nextProps.children || !(0, _utils.fastRGLPropsEqual)(this.props, nextProps, _fastEquals.deepEqual) || this.state.activeDrag !== nextState.activeDrag || this.state.mounted !== nextState.mounted || this.state.droppingPosition !== nextState.droppingPosition
    );
  }
  componentDidUpdate(prevProps /*: Props*/, prevState /*: State*/) {
    if (!this.state.activeDrag) {
      const newLayout = this.state.layout;
      const oldLayout = prevState.layout;
      this.onLayoutMaybeChanged(newLayout, oldLayout);
    }
  }

  /**
   * Calculates a pixel value for the container.
   * @return {String} Container height in pixels.
   */
  containerHeight() /*: ?string*/{
    if (!this.props.autoSize) return;
    const nbRow = (0, _utils.bottom)(this.state.layout);
    const containerPaddingY = this.props.containerPadding ? this.props.containerPadding[1] : this.props.margin[1];
    return nbRow * this.props.rowHeight + (nbRow - 1) * this.props.margin[1] + containerPaddingY * 2 + "px";
  }
  onLayoutMaybeChanged(newLayout /*: Layout*/, oldLayout /*: ?Layout*/) {
    if (!oldLayout) oldLayout = this.state.layout;
    if (!(0, _fastEquals.deepEqual)(oldLayout, newLayout)) {
      this.props.onLayoutChange(newLayout);
    }
  }
  /**
   * Create a placeholder object.
   * @return {Element} Placeholder div.
   */
  placeholder() /*: ?ReactElement<any>*/{
    const { activeDrag } = this.state;
    if (!activeDrag) return null;
    const { width, cols, margin, containerPadding, rowHeight, maxRows, useCSSTransforms, transformScale } = this.props;
    
    // {...this.state.activeDrag} is pretty slow, actually
    return /*#__PURE__*/React.createElement(_GridItem.default, {
      w: activeDrag.w,
      h: activeDrag.h,
      x: activeDrag.x,
      y: activeDrag.y,
      i: activeDrag.i,
      className: `react-grid-placeholder ${this.state.resizing ? "placeholder-resizing" : ""}`,
      containerWidth: width,
      cols: cols,
      margin: margin,
      containerPadding: containerPadding || margin,
      maxRows: maxRows,
      rowHeight: rowHeight,
      isDraggable: false,
      isResizable: false,
      isBounded: false,
      useCSSTransforms: useCSSTransforms,
      transformScale: transformScale,
      style: {border: '2px solid red',backgroundColor: 'red',opacity: 1}
    }, /*#__PURE__*/React.createElement("div", null));
  }

  /**
   * Given a grid item, set its style attributes & surround in a <Draggable>.
   * @param  {Element} child React element.
   * @return {Element}       Element wrapped in draggable and properly placed.
   */
  processGridItem(child /*: ReactElement<any>*/, isDroppingItem /*: boolean*/) /*: ?ReactElement<any>*/{
    if (!child || !child.key) return;
    const l = (0, _utils.getLayoutItem)(this.state.layout, String(child.key));
    if (!l) return null;
    const {
      width,
      cols,
      margin,
      containerPadding,
      rowHeight,
      maxRows,
      isDraggable,
      isResizable,
      isBounded,
      useCSSTransforms,
      transformScale,
      draggableCancel,
      draggableHandle,
      resizeHandles,
      resizeHandle,
      onItemStyleOverride
    } = this.props;
    const {
      mounted,
      droppingPosition
    } = this.state;

    // Determine user manipulations possible.
    // If an item is static, it can't be manipulated by default.
    // Any properties defined directly on the grid item will take precedence.
    const draggable = typeof l.isDraggable === "boolean" ? l.isDraggable : !l.static && isDraggable;
    const resizable = typeof l.isResizable === "boolean" ? l.isResizable : !l.static && isResizable;
    const resizeHandlesOptions = l.resizeHandles || resizeHandles;

    // isBounded set on child if set on parent, and child is not explicitly false
    const bounded = draggable && isBounded && l.isBounded !== false;
    return /*#__PURE__*/React.createElement(_GridItem.default, {
      containerWidth: width,
      cols: cols,
      margin: margin,
      containerPadding: containerPadding || margin,
      maxRows: maxRows,
      rowHeight: rowHeight,
      cancel: draggableCancel,
      handle: draggableHandle,
      onDragStop: this.onDragStop,
      onDragStart: this.onDragStart,
      onDrag: this.onDrag,
      onResizeStart: this.onResizeStart,
      onResize: this.onResize,
      onResizeStop: this.onResizeStop,
      isDraggable: draggable,
      isResizable: resizable,
      isBounded: bounded,
      useCSSTransforms: useCSSTransforms && mounted,
      usePercentages: !mounted,
      transformScale: transformScale,
      w: l.w,
      h: l.h,
      x: l.x,
      y: l.y,
      i: l.i,
      minH: l.minH,
      minW: l.minW,
      maxH: l.maxH,
      maxW: l.maxW,
      static: l.static,
      droppingPosition: isDroppingItem ? droppingPosition : undefined,
      resizeHandles: resizeHandlesOptions,
      resizeHandle: resizeHandle,
      styleOverrides: onItemStyleOverride ? styles => onItemStyleOverride(styles, {
        ...l,
        isDraggable: draggable,
        isResizable: resizable
      }) : undefined
    }, child);
  }
  render() /*: React.Element<"div">*/{
    console.log("I AM RENDERING");
    const {
      className,
      style,
      isDroppable,
      innerRef
    } = this.props;
    const mergedClassName = (0, _clsx.default)(layoutClassName, className);
    const mergedStyle = {
      height: this.containerHeight(),
      ...style
    };
    return /*#__PURE__*/React.createElement("div", {
      ref: innerRef,
      className: mergedClassName,
      style: mergedStyle,
      onDrop: isDroppable ? this.onDrop : _utils.noop,
      onDragLeave: isDroppable ? this.onDragLeave : _utils.noop,
      onDragEnter: isDroppable ? this.onDragEnter : _utils.noop,
      onDragOver: isDroppable ? this.onDragOver : _utils.noop
    }, React.Children.map(this.props.children, child => this.processGridItem(child)), isDroppable && this.state.droppingDOMNode && this.processGridItem(this.state.droppingDOMNode, true), this.placeholder());
  }
}
exports.default = ReactGridLayout;
// TODO publish internal ReactClass displayName transform
_defineProperty(ReactGridLayout, "displayName", "ReactGridLayout");
// Refactored to another module to make way for preval
_defineProperty(ReactGridLayout, "propTypes", _ReactGridLayoutPropTypes.default);
_defineProperty(ReactGridLayout, "defaultProps", {
  autoSize: true,
  cols: 12,
  className: "",
  style: {},
  draggableHandle: "",
  draggableCancel: "",
  containerPadding: null,
  rowHeight: 150,
  maxRows: Infinity,
  // infinite vertical growth
  layout: [],
  margin: [10, 10],
  isBounded: false,
  isDraggable: true,
  isResizable: true,
  allowOverlap: false,
  isDroppable: false,
  useCSSTransforms: true,
  transformScale: 1,
  verticalCompact: true,
  compactType: "vertical",
  preventCollision: false,
  droppingItem: {
    i: "__dropping-elem__",
    h: 1,
    w: 1
  },
  resizeHandles: ["se"],
  onLayoutChange: _utils.noop,
  onDragStart: _utils.noop,
  onDrag: _utils.noop,
  onDragStop: _utils.noop,
  onResizeStart: _utils.noop,
  onResize: _utils.noop,
  onResizeStop: _utils.noop,
  onDrop: _utils.noop,
  onDropDragOver: _utils.noop,
  onItemStyleOverride: undefined
});