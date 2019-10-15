"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactDraggable = require("react-draggable");

var _reactResizable = require("react-resizable");

var _utils = require("./utils");

var _classnames = _interopRequireDefault(require("classnames"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * An individual item within a ReactGridLayout.
 */
var GridItem =
/*#__PURE__*/
function (_React$Component) {
  _inherits(GridItem, _React$Component);

  function GridItem() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, GridItem);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(GridItem)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "state", {
      resizing: null,
      dragging: null,
      className: ""
    });

    _defineProperty(_assertThisInitialized(_this), "currentNode", void 0);

    _defineProperty(_assertThisInitialized(_this), "onDragStart", function (e
    /*: Event*/
    , _ref) {
      var node = _ref.node;
      if (!_this.props.onDragStart) return;
      var newPosition
      /*: PartialPosition*/
      = {
        top: 0,
        left: 0
      }; // TODO: this wont work on nested parents

      var offsetParent = node.offsetParent;
      if (!offsetParent) return;
      var parentRect = offsetParent.getBoundingClientRect();
      var clientRect = node.getBoundingClientRect();
      var cLeft = clientRect.left / _this.props.transformScale;
      var pLeft = parentRect.left / _this.props.transformScale;
      var cTop = clientRect.top / _this.props.transformScale;
      var pTop = parentRect.top / _this.props.transformScale;
      newPosition.left = cLeft - pLeft + offsetParent.scrollLeft;
      newPosition.top = cTop - pTop + offsetParent.scrollTop;

      _this.setState({
        dragging: newPosition
      });

      var _this$calcXY = _this.calcXY(newPosition.top, newPosition.left),
          x = _this$calcXY.x,
          y = _this$calcXY.y;

      return _this.props.onDragStart && _this.props.onDragStart.call(_assertThisInitialized(_this), _this.props.i, x, y, {
        e: e,
        node: node,
        newPosition: newPosition
      });
    });

    _defineProperty(_assertThisInitialized(_this), "onDrag", function (e
    /*: Event*/
    , _ref2) {
      var node = _ref2.node,
          deltaX = _ref2.deltaX,
          deltaY = _ref2.deltaY;
      if (!_this.props.onDrag) return;
      var newPosition
      /*: PartialPosition*/
      = {
        top: 0,
        left: 0
      };
      if (!_this.state.dragging) throw new Error("onDrag called before onDragStart.");
      newPosition.left = _this.state.dragging.left + deltaX;
      newPosition.top = _this.state.dragging.top + deltaY;

      _this.setState({
        dragging: newPosition
      });

      var _this$calcXY2 = _this.calcXY(newPosition.top, newPosition.left),
          x = _this$calcXY2.x,
          y = _this$calcXY2.y;

      return _this.props.onDrag && _this.props.onDrag.call(_assertThisInitialized(_this), _this.props.i, x, y, {
        e: e,
        node: node,
        newPosition: newPosition
      });
    });

    _defineProperty(_assertThisInitialized(_this), "onDragStop", function (e
    /*: Event*/
    , _ref3) {
      var node = _ref3.node;
      if (!_this.props.onDragStop) return;
      var newPosition
      /*: PartialPosition*/
      = {
        top: 0,
        left: 0
      };
      if (!_this.state.dragging) throw new Error("onDragEnd called before onDragStart.");
      newPosition.left = _this.state.dragging.left;
      newPosition.top = _this.state.dragging.top;

      _this.setState({
        dragging: null
      });

      var _this$calcXY3 = _this.calcXY(newPosition.top, newPosition.left),
          x = _this$calcXY3.x,
          y = _this$calcXY3.y;

      return _this.props.onDragStop && _this.props.onDragStop.call(_assertThisInitialized(_this), _this.props.i, x, y, {
        e: e,
        node: node,
        newPosition: newPosition
      });
    });

    _defineProperty(_assertThisInitialized(_this), "onResizeStop", function (e
    /*: Event*/
    , callbackData
    /*: { node: HTMLElement, size: Position }*/
    ) {
      _this.onResizeHandler(e, callbackData, "onResizeStop");
    });

    _defineProperty(_assertThisInitialized(_this), "onResizeStart", function (e
    /*: Event*/
    , callbackData
    /*: { node: HTMLElement, size: Position }*/
    ) {
      _this.onResizeHandler(e, callbackData, "onResizeStart");
    });

    _defineProperty(_assertThisInitialized(_this), "onResize", function (e
    /*: Event*/
    , callbackData
    /*: { node: HTMLElement, size: Position }*/
    ) {
      _this.onResizeHandler(e, callbackData, "onResize");
    });

    return _this;
  }

  _createClass(GridItem, [{
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps
    /*: Props*/
    ) {
      if (this.props.droppingPosition && prevProps.droppingPosition) {
        this.moveDroppingItem(prevProps);
      }
    }
  }, {
    key: "moveDroppingItem",
    value: function moveDroppingItem(prevProps
    /*: Props*/
    ) {
      var droppingPosition = this.props.droppingPosition;
      var dragging = this.state.dragging;

      if (!droppingPosition || !prevProps.droppingPosition) {
        return;
      }

      if (!this.currentNode) {
        // eslint-disable-next-line react/no-find-dom-node
        this.currentNode = ((_reactDom.default.findDOMNode(this)
        /*: any*/
        )
        /*: HTMLElement*/
        );
      }

      var shouldDrag = dragging && droppingPosition.x !== prevProps.droppingPosition.x || droppingPosition.y !== prevProps.droppingPosition.y;

      if (!dragging) {
        this.onDragStart(droppingPosition.e, {
          node: this.currentNode,
          deltaX: droppingPosition.x,
          deltaY: droppingPosition.y
        });
      } else if (shouldDrag) {
        var deltaX = droppingPosition.x - dragging.left;
        var deltaY = droppingPosition.y - dragging.top;
        this.onDrag(droppingPosition.e, {
          node: this.currentNode,
          deltaX: deltaX,
          deltaY: deltaY
        });
      }
    } // Helper for generating column width

  }, {
    key: "calcColWidth",
    value: function calcColWidth()
    /*: number*/
    {
      var _this$props = this.props,
          margin = _this$props.margin,
          containerPadding = _this$props.containerPadding,
          containerWidth = _this$props.containerWidth,
          cols = _this$props.cols;
      return (containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols;
    }
    /**
     * Return position on the page given an x, y, w, h.
     * left, top, width, height are all in pixels.
     * @param  {Number}  x             X coordinate in grid units.
     * @param  {Number}  y             Y coordinate in grid units.
     * @param  {Number}  w             W coordinate in grid units.
     * @param  {Number}  h             H coordinate in grid units.
     * @return {Object}                Object containing coords.
     */

  }, {
    key: "calcPosition",
    value: function calcPosition(x
    /*: number*/
    , y
    /*: number*/
    , w
    /*: number*/
    , h
    /*: number*/
    , state
    /*: ?Object*/
    )
    /*: Position*/
    {
      var _this$props2 = this.props,
          margin = _this$props2.margin,
          containerPadding = _this$props2.containerPadding,
          rowHeight = _this$props2.rowHeight;
      var colWidth = this.calcColWidth();
      var out = {
        left: Math.round((colWidth + margin[0]) * x + containerPadding[0]),
        top: Math.round((rowHeight + margin[1]) * y + containerPadding[1]),
        // 0 * Infinity === NaN, which causes problems with resize constraints;
        // Fix this if it occurs.
        // Note we do it here rather than later because Math.round(Infinity) causes deopt
        width: w === Infinity ? w : Math.round(colWidth * w + Math.max(0, w - 1) * margin[0]),
        height: h === Infinity ? h : Math.round(rowHeight * h + Math.max(0, h - 1) * margin[1])
      };

      if (state && state.resizing) {
        out.width = Math.round(state.resizing.width);
        out.height = Math.round(state.resizing.height);
      }

      if (state && state.dragging) {
        out.top = Math.round(state.dragging.top);
        out.left = Math.round(state.dragging.left);
      }

      return out;
    }
    /**
     * Translate x and y coordinates from pixels to grid units.
     * @param  {Number} top  Top position (relative to parent) in pixels.
     * @param  {Number} left Left position (relative to parent) in pixels.
     * @return {Object} x and y in grid units.
     */

  }, {
    key: "calcXY",
    value: function calcXY(top
    /*: number*/
    , left
    /*: number*/
    )
    /*: { x: number, y: number }*/
    {
      var _this$props3 = this.props,
          margin = _this$props3.margin,
          cols = _this$props3.cols,
          rowHeight = _this$props3.rowHeight,
          w = _this$props3.w,
          h = _this$props3.h,
          maxRows = _this$props3.maxRows;
      var colWidth = this.calcColWidth(); // left = colWidth * x + margin * (x + 1)
      // l = cx + m(x+1)
      // l = cx + mx + m
      // l - m = cx + mx
      // l - m = x(c + m)
      // (l - m) / (c + m) = x
      // x = (left - margin) / (coldWidth + margin)

      var x = Math.round((left - margin[0]) / (colWidth + margin[0]));
      var y = Math.round((top - margin[1]) / (rowHeight + margin[1])); // Capping

      x = Math.max(Math.min(x, cols - w), 0);
      y = Math.max(Math.min(y, maxRows - h), 0);
      return {
        x: x,
        y: y
      };
    }
    /**
     * Given a height and width in pixel values, calculate grid units.
     * @param  {Number} height Height in pixels.
     * @param  {Number} width  Width in pixels.
     * @return {Object} w, h as grid units.
     */

  }, {
    key: "calcWH",
    value: function calcWH(_ref4)
    /*: { w: number, h: number }*/
    {
      var height = _ref4.height,
          width = _ref4.width;
      var _this$props4 = this.props,
          margin = _this$props4.margin,
          maxRows = _this$props4.maxRows,
          cols = _this$props4.cols,
          rowHeight = _this$props4.rowHeight,
          x = _this$props4.x,
          y = _this$props4.y;
      var colWidth = this.calcColWidth(); // width = colWidth * w - (margin * (w - 1))
      // ...
      // w = (width + margin) / (colWidth + margin)

      var w = Math.round((width + margin[0]) / (colWidth + margin[0]));
      var h = Math.round((height + margin[1]) / (rowHeight + margin[1])); // Capping

      w = Math.max(Math.min(w, cols - x), 0);
      h = Math.max(Math.min(h, maxRows - y), 0);
      return {
        w: w,
        h: h
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

  }, {
    key: "createStyle",
    value: function createStyle(pos
    /*: Position*/
    )
    /*: { [key: string]: ?string }*/
    {
      var _this$props5 = this.props,
          usePercentages = _this$props5.usePercentages,
          containerWidth = _this$props5.containerWidth,
          useCSSTransforms = _this$props5.useCSSTransforms;
      var style; // CSS Transforms support (default)

      if (useCSSTransforms) {
        style = (0, _utils.setTransform)(pos);
      } else {
        // top,left (slow)
        style = (0, _utils.setTopLeft)(pos); // This is used for server rendering.

        if (usePercentages) {
          style.left = (0, _utils.perc)(pos.left / containerWidth);
          style.width = (0, _utils.perc)(pos.width / containerWidth);
        }
      }

      return style;
    }
    /**
     * Mix a Draggable instance into a child.
     * @param  {Element} child    Child element.
     * @return {Element}          Child wrapped in Draggable.
     */

  }, {
    key: "mixinDraggable",
    value: function mixinDraggable(child
    /*: ReactElement<any>*/
    )
    /*: ReactElement<any>*/
    {
      return _react.default.createElement(_reactDraggable.DraggableCore, {
        onStart: this.onDragStart,
        onDrag: this.onDrag,
        onStop: this.onDragStop,
        handle: this.props.handle,
        cancel: ".react-resizable-handle" + (this.props.cancel ? "," + this.props.cancel : "")
      }, child);
    }
    /**
     * Mix a Resizable instance into a child.
     * @param  {Element} child    Child element.
     * @param  {Object} position  Position object (pixel values)
     * @return {Element}          Child wrapped in Resizable.
     */

  }, {
    key: "mixinResizable",
    value: function mixinResizable(child
    /*: ReactElement<any>*/
    , position
    /*: Position*/
    )
    /*: ReactElement<any>*/
    {
      var _this$props6 = this.props,
          cols = _this$props6.cols,
          x = _this$props6.x,
          minW = _this$props6.minW,
          minH = _this$props6.minH,
          maxW = _this$props6.maxW,
          maxH = _this$props6.maxH; // This is the max possible width - doesn't go to infinity because of the width of the window

      var maxWidth = this.calcPosition(0, 0, cols - x, 0).width; // Calculate min/max constraints using our min & maxes

      var mins = this.calcPosition(0, 0, minW, minH);
      var maxes = this.calcPosition(0, 0, maxW, maxH);
      var minConstraints = [mins.width, mins.height];
      var maxConstraints = [Math.min(maxes.width, maxWidth), Math.min(maxes.height, Infinity)];
      return _react.default.createElement(_reactResizable.Resizable, {
        width: position.width,
        height: position.height,
        minConstraints: minConstraints,
        maxConstraints: maxConstraints,
        onResizeStop: this.onResizeStop,
        onResizeStart: this.onResizeStart,
        onResize: this.onResize
      }, child);
    }
    /**
     * onDragStart event handler
     * @param  {Event}  e             event data
     * @param  {Object} callbackData  an object with node, delta and position information
     */

  }, {
    key: "onResizeHandler",

    /**
     * Wrapper around drag events to provide more useful data.
     * All drag events call the function with the given handler name,
     * with the signature (index, x, y).
     *
     * @param  {String} handlerName Handler name to wrap.
     * @return {Function}           Handler function.
     */
    value: function onResizeHandler(e
    /*: Event*/
    , _ref5, handlerName
    /*: string*/
    ) {
      var node = _ref5.node,
          size = _ref5.size;
      var handler = this.props[handlerName];
      if (!handler) return;
      var _this$props7 = this.props,
          cols = _this$props7.cols,
          x = _this$props7.x,
          i = _this$props7.i,
          maxW = _this$props7.maxW,
          minW = _this$props7.minW,
          maxH = _this$props7.maxH,
          minH = _this$props7.minH; // Get new XY

      var _this$calcWH = this.calcWH(size),
          w = _this$calcWH.w,
          h = _this$calcWH.h; // Cap w at numCols


      w = Math.min(w, cols - x); // Ensure w is at least 1

      w = Math.max(w, 1); // Min/max capping

      w = Math.max(Math.min(w, maxW), minW);
      h = Math.max(Math.min(h, maxH), minH);
      this.setState({
        resizing: handlerName === "onResizeStop" ? null : size
      });
      handler.call(this, i, w, h, {
        e: e,
        node: node,
        size: size
      });
    }
  }, {
    key: "render",
    value: function render()
    /*: ReactNode*/
    {
      var _this$props8 = this.props,
          x = _this$props8.x,
          y = _this$props8.y,
          w = _this$props8.w,
          h = _this$props8.h,
          isDraggable = _this$props8.isDraggable,
          isResizable = _this$props8.isResizable,
          droppingPosition = _this$props8.droppingPosition,
          useCSSTransforms = _this$props8.useCSSTransforms;
      var pos = this.calcPosition(x, y, w, h, this.state);

      var child = _react.default.Children.only(this.props.children); // Create the child element. We clone the existing element but modify its className and style.


      var newChild = _react.default.cloneElement(child, {
        className: (0, _classnames.default)("react-grid-item", child.props.className, this.props.className, {
          static: this.props.static,
          resizing: Boolean(this.state.resizing),
          "react-draggable": isDraggable,
          "react-draggable-dragging": Boolean(this.state.dragging),
          dropping: Boolean(droppingPosition),
          cssTransforms: useCSSTransforms
        }),
        // We can set the width and height on the child, but unfortunately we can't set the position.
        style: _objectSpread({}, this.props.style, {}, child.props.style, {}, this.createStyle(pos))
      }); // Resizable support. This is usually on but the user can toggle it off.


      if (isResizable) newChild = this.mixinResizable(newChild, pos); // Draggable support. This is always on, except for with placeholders.

      if (isDraggable) newChild = this.mixinDraggable(newChild);
      return newChild;
    }
  }]);

  return GridItem;
}(_react.default.Component);

exports.default = GridItem;

_defineProperty(GridItem, "propTypes", {
  // Children must be only a single element
  children: _propTypes.default.element,
  // General grid attributes
  cols: _propTypes.default.number.isRequired,
  containerWidth: _propTypes.default.number.isRequired,
  rowHeight: _propTypes.default.number.isRequired,
  margin: _propTypes.default.array.isRequired,
  maxRows: _propTypes.default.number.isRequired,
  containerPadding: _propTypes.default.array.isRequired,
  // These are all in grid units
  x: _propTypes.default.number.isRequired,
  y: _propTypes.default.number.isRequired,
  w: _propTypes.default.number.isRequired,
  h: _propTypes.default.number.isRequired,
  // All optional
  minW: function minW(props
  /*: Props*/
  , propName
  /*: string*/
  ) {
    var value = props[propName];
    if (typeof value !== "number") return new Error("minWidth not Number");
    if (value > props.w || value > props.maxW) return new Error("minWidth larger than item width/maxWidth");
  },
  maxW: function maxW(props
  /*: Props*/
  , propName
  /*: string*/
  ) {
    var value = props[propName];
    if (typeof value !== "number") return new Error("maxWidth not Number");
    if (value < props.w || value < props.minW) return new Error("maxWidth smaller than item width/minWidth");
  },
  minH: function minH(props
  /*: Props*/
  , propName
  /*: string*/
  ) {
    var value = props[propName];
    if (typeof value !== "number") return new Error("minHeight not Number");
    if (value > props.h || value > props.maxH) return new Error("minHeight larger than item height/maxHeight");
  },
  maxH: function maxH(props
  /*: Props*/
  , propName
  /*: string*/
  ) {
    var value = props[propName];
    if (typeof value !== "number") return new Error("maxHeight not Number");
    if (value < props.h || value < props.minH) return new Error("maxHeight smaller than item height/minHeight");
  },
  // ID is nice to have for callbacks
  i: _propTypes.default.string.isRequired,
  // Functions
  onDragStop: _propTypes.default.func,
  onDragStart: _propTypes.default.func,
  onDrag: _propTypes.default.func,
  onResizeStop: _propTypes.default.func,
  onResizeStart: _propTypes.default.func,
  onResize: _propTypes.default.func,
  // Flags
  isDraggable: _propTypes.default.bool.isRequired,
  isResizable: _propTypes.default.bool.isRequired,
  static: _propTypes.default.bool,
  // Use CSS transforms instead of top/left
  useCSSTransforms: _propTypes.default.bool.isRequired,
  transformScale: _propTypes.default.number,
  // Others
  className: _propTypes.default.string,
  // Selector for draggable handle
  handle: _propTypes.default.string,
  // Selector for draggable cancel (see react-draggable)
  cancel: _propTypes.default.string,
  // Current position of a dropping element
  droppingPosition: _propTypes.default.shape({
    e: _propTypes.default.object.isRequired,
    x: _propTypes.default.number.isRequired,
    y: _propTypes.default.number.isRequired
  })
});

_defineProperty(GridItem, "defaultProps", {
  className: "",
  cancel: "",
  handle: "",
  minH: 1,
  minW: 1,
  maxH: Infinity,
  maxW: Infinity,
  transformScale: 1
});