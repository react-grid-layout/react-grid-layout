"use strict";

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require("lodash.isequal");

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = require("classnames");

var _classnames2 = _interopRequireDefault(_classnames);

var _utils = require("./utils");

var _GridItem = require("./GridItem");

var _GridItem2 = _interopRequireDefault(_GridItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// End Types

/**
 * A reactive, fluid grid layout with draggable, resizable components.
 */

// Types
var ReactGridLayout = function (_React$Component) {
  _inherits(ReactGridLayout, _React$Component);

  // TODO publish internal ReactClass displayName transform
  function ReactGridLayout(props, context) {
    _classCallCheck(this, ReactGridLayout);

    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props, context));

    _initialiseProps.call(_this);

    (0, _utils.autoBindHandlers)(_this, ["onDragStart", "onDrag", "onDragStop", "onResizeStart", "onResize", "onResizeStop"]);
    return _this;
  }

  ReactGridLayout.prototype.componentDidMount = function componentDidMount() {
    this.setState({ mounted: true });
    // Possibly call back with layout on mount. This should be done after correcting the layout width
    // to ensure we don't rerender with the wrong width.
    this.onLayoutMaybeChanged(this.state.layout, this.props.layout);
  };

  ReactGridLayout.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    var newLayoutBase = void 0;
    // Legacy support for compactType
    // Allow parent to set layout directly.
    if (!(0, _lodash2.default)(nextProps.layout, this.props.layout) || nextProps.compactType !== this.props.compactType) {
      newLayoutBase = nextProps.layout;
    } else if (!(0, _utils.childrenEqual)(this.props.children, nextProps.children)) {
      // If children change, also regenerate the layout. Use our state
      // as the base in case because it may be more up to date than
      // what is in props.
      newLayoutBase = this.state.layout;
    }

    // We need to regenerate the layout.
    if (newLayoutBase) {
      var newLayout = (0, _utils.synchronizeLayoutWithChildren)(newLayoutBase, nextProps.children, nextProps.cols, this.compactType(nextProps));
      var _oldLayout = this.state.layout;
      this.setState({ layout: newLayout });
      this.onLayoutMaybeChanged(newLayout, _oldLayout);
    }
  };

  /**
   * Calculates a pixel value for the container.
   * @return {String} Container height in pixels.
   */


  ReactGridLayout.prototype.containerHeight = function containerHeight() {
    if (!this.props.autoSize) return;
    var nbRow = (0, _utils.bottom)(this.state.layout);
    var containerPaddingY = this.props.containerPadding ? this.props.containerPadding[1] : this.props.margin[1];
    return nbRow * this.props.rowHeight + (nbRow - 1) * this.props.margin[1] + containerPaddingY * 2 + "px";
  };

  ReactGridLayout.prototype.compactType = function compactType(props) {
    if (!props) props = this.props;
    return props.verticalCompact === false ? null : props.compactType;
  };

  /**
   * When dragging starts
   * @param {String} i Id of the child
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} node The current dragging DOM element
   */


  ReactGridLayout.prototype.onDragStart = function onDragStart(i, x, y, _ref) {
    var e = _ref.e,
        node = _ref.node;
    var layout = this.state.layout;

    var l = (0, _utils.getLayoutItem)(layout, i);
    if (!l) return;

    this.setState({
      oldDragItem: (0, _utils.cloneLayoutItem)(l),
      oldLayout: this.state.layout
    });

    return this.props.onDragStart(layout, l, l, null, e, node);
  };

  /**
   * Each drag movement create a new dragelement and move the element to the dragged location
   * @param {String} i Id of the child
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} node The current dragging DOM element
   */


  ReactGridLayout.prototype.onDrag = function onDrag(i, x, y, _ref2) {
    var e = _ref2.e,
        node = _ref2.node;
    var oldDragItem = this.state.oldDragItem;
    var layout = this.state.layout;
    var cols = this.props.cols;

    var l = (0, _utils.getLayoutItem)(layout, i);
    if (!l) return;

    // Create placeholder (display only)
    var placeholder = {
      w: l.w,
      h: l.h,
      x: l.x,
      y: l.y,
      placeholder: true,
      i: i
    };

    // Move the element to the dragged location.
    var isUserAction = true;
    layout = (0, _utils.moveElement)(layout, l, x, y, isUserAction, this.props.preventCollision, this.compactType(), cols);

    this.props.onDrag(layout, oldDragItem, l, placeholder, e, node);

    this.setState({
      layout: (0, _utils.compact)(layout, this.compactType(), cols),
      activeDrag: placeholder
    });
  };

  /**
   * When dragging stops, figure out which position the element is closest to and update its x and y.
   * @param  {String} i Index of the child.
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} node The current dragging DOM element
   */


  ReactGridLayout.prototype.onDragStop = function onDragStop(i, x, y, _ref3) {
    var e = _ref3.e,
        node = _ref3.node;
    var oldDragItem = this.state.oldDragItem;
    var layout = this.state.layout;
    var _props = this.props,
        cols = _props.cols,
        preventCollision = _props.preventCollision;

    var l = (0, _utils.getLayoutItem)(layout, i);
    if (!l) return;

    // Move the element here
    var isUserAction = true;
    layout = (0, _utils.moveElement)(layout, l, x, y, isUserAction, preventCollision, this.compactType(), cols);

    this.props.onDragStop(layout, oldDragItem, l, null, e, node);

    // Set state
    var newLayout = (0, _utils.compact)(layout, this.compactType(), cols);
    var oldLayout = this.state.oldLayout;

    this.setState({
      activeDrag: null,
      layout: newLayout,
      oldDragItem: null,
      oldLayout: null
    });

    this.onLayoutMaybeChanged(newLayout, oldLayout);
  };

  ReactGridLayout.prototype.onLayoutMaybeChanged = function onLayoutMaybeChanged(newLayout, oldLayout) {
    if (!oldLayout) oldLayout = this.state.layout;
    if (!(0, _lodash2.default)(oldLayout, newLayout)) {
      this.props.onLayoutChange(newLayout);
    }
  };

  ReactGridLayout.prototype.onResizeStart = function onResizeStart(i, w, h, _ref4) {
    var e = _ref4.e,
        node = _ref4.node;
    var layout = this.state.layout;

    var l = (0, _utils.getLayoutItem)(layout, i);
    if (!l) return;

    this.setState({
      oldResizeItem: (0, _utils.cloneLayoutItem)(l),
      oldLayout: this.state.layout
    });

    this.props.onResizeStart(layout, l, l, null, e, node);
  };

  ReactGridLayout.prototype.onResize = function onResize(i, w, h, _ref5) {
    var e = _ref5.e,
        node = _ref5.node;
    var _state = this.state,
        layout = _state.layout,
        oldResizeItem = _state.oldResizeItem;
    var _props2 = this.props,
        cols = _props2.cols,
        preventCollision = _props2.preventCollision;

    var l = (0, _utils.getLayoutItem)(layout, i);
    if (!l) return;

    // Something like quad tree should be used
    // to find collisions faster
    var hasCollisions = void 0;
    if (preventCollision) {
      var collisions = (0, _utils.getAllCollisions)(layout, _extends({}, l, { w: w, h: h })).filter(function (layoutItem) {
        return layoutItem.i !== l.i;
      });
      hasCollisions = collisions.length > 0;

      // If we're colliding, we need adjust the placeholder.
      if (hasCollisions) {
        // adjust w && h to maximum allowed space
        var leastX = Infinity,
            leastY = Infinity;
        collisions.forEach(function (layoutItem) {
          if (layoutItem.x > l.x) leastX = Math.min(leastX, layoutItem.x);
          if (layoutItem.y > l.y) leastY = Math.min(leastY, layoutItem.y);
        });

        if (Number.isFinite(leastX)) l.w = leastX - l.x;
        if (Number.isFinite(leastY)) l.h = leastY - l.y;
      }
    }

    if (!hasCollisions) {
      // Set new width and height.
      l.w = w;
      l.h = h;
    }

    // Create placeholder element (display only)
    var placeholder = {
      w: l.w,
      h: l.h,
      x: l.x,
      y: l.y,
      static: true,
      i: i
    };

    this.props.onResize(layout, oldResizeItem, l, placeholder, e, node);

    // Re-compact the layout and set the drag placeholder.
    this.setState({
      layout: (0, _utils.compact)(layout, this.compactType(), cols),
      activeDrag: placeholder
    });
  };

  ReactGridLayout.prototype.onResizeStop = function onResizeStop(i, w, h, _ref6) {
    var e = _ref6.e,
        node = _ref6.node;
    var _state2 = this.state,
        layout = _state2.layout,
        oldResizeItem = _state2.oldResizeItem;
    var cols = this.props.cols;

    var l = (0, _utils.getLayoutItem)(layout, i);

    this.props.onResizeStop(layout, oldResizeItem, l, null, e, node);

    // Set state
    var newLayout = (0, _utils.compact)(layout, this.compactType(), cols);
    var oldLayout = this.state.oldLayout;

    this.setState({
      activeDrag: null,
      layout: newLayout,
      oldResizeItem: null,
      oldLayout: null
    });

    this.onLayoutMaybeChanged(newLayout, oldLayout);
  };

  /**
   * Create a placeholder object.
   * @return {Element} Placeholder div.
   */


  ReactGridLayout.prototype.placeholder = function placeholder() {
    var activeDrag = this.state.activeDrag;

    if (!activeDrag) return null;
    var _props3 = this.props,
        width = _props3.width,
        cols = _props3.cols,
        margin = _props3.margin,
        containerPadding = _props3.containerPadding,
        rowHeight = _props3.rowHeight,
        maxRows = _props3.maxRows,
        useCSSTransforms = _props3.useCSSTransforms;

    // {...this.state.activeDrag} is pretty slow, actually

    return _react2.default.createElement(
      _GridItem2.default,
      {
        w: activeDrag.w,
        h: activeDrag.h,
        x: activeDrag.x,
        y: activeDrag.y,
        i: activeDrag.i,
        className: "react-grid-placeholder",
        containerWidth: width,
        cols: cols,
        margin: margin,
        containerPadding: containerPadding || margin,
        maxRows: maxRows,
        rowHeight: rowHeight,
        isDraggable: false,
        isResizable: false,
        useCSSTransforms: useCSSTransforms
      },
      _react2.default.createElement("div", null)
    );
  };

  /**
   * Given a grid item, set its style attributes & surround in a <Draggable>.
   * @param  {Element} child React element.
   * @return {Element}       Element wrapped in draggable and properly placed.
   */


  ReactGridLayout.prototype.processGridItem = function processGridItem(child) {
    if (!child || !child.key) return;
    var l = (0, _utils.getLayoutItem)(this.state.layout, String(child.key));
    if (!l) return null;
    var _props4 = this.props,
        width = _props4.width,
        cols = _props4.cols,
        margin = _props4.margin,
        containerPadding = _props4.containerPadding,
        rowHeight = _props4.rowHeight,
        maxRows = _props4.maxRows,
        isDraggable = _props4.isDraggable,
        isResizable = _props4.isResizable,
        useCSSTransforms = _props4.useCSSTransforms,
        draggableCancel = _props4.draggableCancel,
        draggableHandle = _props4.draggableHandle;
    var mounted = this.state.mounted;

    // Parse 'static'. Any properties defined directly on the grid item will take precedence.

    var draggable = Boolean(!l.static && isDraggable && (l.isDraggable || l.isDraggable == null));
    var resizable = Boolean(!l.static && isResizable && (l.isResizable || l.isResizable == null));

    return _react2.default.createElement(
      _GridItem2.default,
      {
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
        useCSSTransforms: useCSSTransforms && mounted,
        usePercentages: !mounted,
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        i: l.i,
        minH: l.minH,
        minW: l.minW,
        maxH: l.maxH,
        maxW: l.maxW,
        "static": l.static
      },
      child
    );
  };

  ReactGridLayout.prototype.render = function render() {
    var _this2 = this;

    var _props5 = this.props,
        className = _props5.className,
        style = _props5.style;


    var mergedClassName = (0, _classnames2.default)("react-grid-layout", className);
    var mergedStyle = _extends({
      height: this.containerHeight()
    }, style);

    return _react2.default.createElement(
      "div",
      { className: mergedClassName, style: mergedStyle },
      _react2.default.Children.map(this.props.children, function (child) {
        return _this2.processGridItem(child);
      }),
      this.placeholder()
    );
  };

  return ReactGridLayout;
}(_react2.default.Component);

ReactGridLayout.displayName = "ReactGridLayout";
ReactGridLayout.propTypes = {
  //
  // Basic props
  //
  className: _propTypes2.default.string,
  style: _propTypes2.default.object,

  // This can be set explicitly. If it is not set, it will automatically
  // be set to the container width. Note that resizes will *not* cause this to adjust.
  // If you need that behavior, use WidthProvider.
  width: _propTypes2.default.number,

  // If true, the container height swells and contracts to fit contents
  autoSize: _propTypes2.default.bool,
  // # of cols.
  cols: _propTypes2.default.number,

  // A selector that will not be draggable.
  draggableCancel: _propTypes2.default.string,
  // A selector for the draggable handler
  draggableHandle: _propTypes2.default.string,

  // Deprecated
  verticalCompact: function verticalCompact(props) {
    if (props.verticalCompact === false && process.env.NODE_ENV !== "production") {
      console.warn(
      // eslint-disable-line no-console
      "`verticalCompact` on <ReactGridLayout> is deprecated and will be removed soon. " + 'Use `compactType`: "horizontal" | "vertical" | null.');
    }
  },
  // Choose vertical or hotizontal compaction
  compactType: _propTypes2.default.oneOf(["vertical", "horizontal"]),

  // layout is an array of object with the format:
  // {x: Number, y: Number, w: Number, h: Number, i: String}
  layout: function layout(props) {
    var layout = props.layout;
    // I hope you're setting the data-grid property on the grid items
    if (layout === undefined) return;
    (0, _utils.validateLayout)(layout, "layout");
  },

  //
  // Grid Dimensions
  //

  // Margin between items [x, y] in px
  margin: _propTypes2.default.arrayOf(_propTypes2.default.number),
  // Padding inside the container [x, y] in px
  containerPadding: _propTypes2.default.arrayOf(_propTypes2.default.number),
  // Rows have a static height, but you can change this based on breakpoints if you like
  rowHeight: _propTypes2.default.number,
  // Default Infinity, but you can specify a max here if you like.
  // Note that this isn't fully fleshed out and won't error if you specify a layout that
  // extends beyond the row capacity. It will, however, not allow users to drag/resize
  // an item past the barrier. They can push items beyond the barrier, though.
  // Intentionally not documented for this reason.
  maxRows: _propTypes2.default.number,

  //
  // Flags
  //
  isDraggable: _propTypes2.default.bool,
  isResizable: _propTypes2.default.bool,
  // If true, grid items won't change position when being dragged over.
  preventCollision: _propTypes2.default.bool,
  // Use CSS transforms instead of top/left
  useCSSTransforms: _propTypes2.default.bool,

  //
  // Callbacks
  //

  // Callback so you can save the layout. Calls after each drag & resize stops.
  onLayoutChange: _propTypes2.default.func,

  // Calls when drag starts. Callback is of the signature (layout, oldItem, newItem, placeholder, e, ?node).
  // All callbacks below have the same signature. 'start' and 'stop' callbacks omit the 'placeholder'.
  onDragStart: _propTypes2.default.func,
  // Calls on each drag movement.
  onDrag: _propTypes2.default.func,
  // Calls when drag is complete.
  onDragStop: _propTypes2.default.func,
  //Calls when resize starts.
  onResizeStart: _propTypes2.default.func,
  // Calls when resize movement happens.
  onResize: _propTypes2.default.func,
  // Calls when resize is complete.
  onResizeStop: _propTypes2.default.func,

  //
  // Other validations
  //

  // Children must not have duplicate keys.
  children: function children(props, propName) {
    var children = props[propName];

    // Check children keys for duplicates. Throw if found.
    var keys = {};
    _react2.default.Children.forEach(children, function (child) {
      if (keys[child.key]) {
        throw new Error('Duplicate child key "' + child.key + '" found! This will cause problems in ReactGridLayout.');
      }
      keys[child.key] = true;
    });
  }
};
ReactGridLayout.defaultProps = {
  autoSize: true,
  cols: 12,
  className: "",
  style: {},
  draggableHandle: "",
  draggableCancel: "",
  containerPadding: null,
  rowHeight: 150,
  maxRows: Infinity, // infinite vertical growth
  layout: [],
  margin: [10, 10],
  isDraggable: true,
  isResizable: true,
  useCSSTransforms: true,
  verticalCompact: true,
  compactType: "vertical",
  preventCollision: false,
  onLayoutChange: _utils.noop,
  onDragStart: _utils.noop,
  onDrag: _utils.noop,
  onDragStop: _utils.noop,
  onResizeStart: _utils.noop,
  onResize: _utils.noop,
  onResizeStop: _utils.noop
};

var _initialiseProps = function _initialiseProps() {
  this.state = {
    activeDrag: null,
    layout: (0, _utils.synchronizeLayoutWithChildren)(this.props.layout, this.props.children, this.props.cols,
    // Legacy support for verticalCompact: false
    this.compactType()),
    mounted: false,
    oldDragItem: null,
    oldLayout: null,
    oldResizeItem: null
  };
};

exports.default = ReactGridLayout;