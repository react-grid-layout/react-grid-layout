"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _lodash = _interopRequireDefault(require("lodash.isequal"));

var _classnames = _interopRequireDefault(require("classnames"));

var _utils = require("./utils");

var _GridItem = _interopRequireDefault(require("./GridItem"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// End Types
var compactType = function compactType(props
/*: Props*/
)
/*: CompactType*/
{
  var _ref = props || {},
      verticalCompact = _ref.verticalCompact,
      compactType = _ref.compactType;

  return verticalCompact === false ? null : compactType;
};

var layoutClassName = "react-grid-layout";
var isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
/**
 * A reactive, fluid grid layout with draggable, resizable components.
 */

var ReactGridLayout =
/*#__PURE__*/
function (_React$Component) {
  _inherits(ReactGridLayout, _React$Component);

  // TODO publish internal ReactClass displayName transform
  function ReactGridLayout(props
  /*: Props*/
  , context
  /*: any*/
  )
  /*: void*/
  {
    var _this;

    _classCallCheck(this, ReactGridLayout);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ReactGridLayout).call(this, props, context));

    _defineProperty(_assertThisInitialized(_this), "state", {
      activeDrag: null,
      layout: (0, _utils.synchronizeLayoutWithChildren)(_this.props.layout, _this.props.children, _this.props.cols, // Legacy support for verticalCompact: false
      compactType(_this.props)),
      mounted: false,
      oldDragItem: null,
      oldLayout: null,
      oldResizeItem: null,
      droppingDOMNode: null,
      children: []
    });

    _defineProperty(_assertThisInitialized(_this), "dragEnterCounter", 0);

    _defineProperty(_assertThisInitialized(_this), "onDragOver", function (e
    /*: DragOverEvent*/
    ) {
      // we should ignore events from layout's children in Firefox
      // to avoid unpredictable jumping of a dropping placeholder
      if (isFirefox && !e.nativeEvent.target.className.includes(layoutClassName)) {
        return false;
      }

      var droppingItem = _this.props.droppingItem;
      var layout = _this.state.layout;
      var _e$nativeEvent = e.nativeEvent,
          layerX = _e$nativeEvent.layerX,
          layerY = _e$nativeEvent.layerY;
      var droppingPosition = {
        x: layerX,
        y: layerY,
        e: e
      };

      if (!_this.state.droppingDOMNode) {
        _this.setState({
          droppingDOMNode: _react.default.createElement("div", {
            key: droppingItem.i
          }),
          droppingPosition: droppingPosition,
          layout: [].concat(_toConsumableArray(layout), [_objectSpread({}, droppingItem, {
            x: 0,
            y: 0,
            static: false,
            isDraggable: true
          })])
        });
      } else if (_this.state.droppingPosition) {
        var shouldUpdatePosition = _this.state.droppingPosition.x != layerX || _this.state.droppingPosition.y != layerY;
        shouldUpdatePosition && _this.setState({
          droppingPosition: droppingPosition
        });
      }

      e.stopPropagation();
      e.preventDefault();
    });

    _defineProperty(_assertThisInitialized(_this), "removeDroppingPlaceholder", function () {
      var _this$props = _this.props,
          droppingItem = _this$props.droppingItem,
          cols = _this$props.cols;
      var layout = _this.state.layout;
      var newLayout = (0, _utils.compact)(layout.filter(function (l) {
        return l.i !== droppingItem.i;
      }), compactType(_this.props), cols);

      _this.setState({
        layout: newLayout,
        droppingDOMNode: null,
        activeDrag: null,
        droppingPosition: undefined
      });
    });

    _defineProperty(_assertThisInitialized(_this), "onDragLeave", function () {
      _this.dragEnterCounter--; // onDragLeave can be triggered on each layout's child.
      // But we know that count of dragEnter and dragLeave events
      // will be balanced after leaving the layout's container
      // so we can increase and decrease count of dragEnter and
      // when it'll be equal to 0 we'll remove the placeholder

      if (_this.dragEnterCounter === 0) {
        _this.removeDroppingPlaceholder();
      }
    });

    _defineProperty(_assertThisInitialized(_this), "onDragEnter", function () {
      _this.dragEnterCounter++;
    });

    _defineProperty(_assertThisInitialized(_this), "onDrop", function () {
      var droppingItem = _this.props.droppingItem;
      var layout = _this.state.layout;

      var _ref2 = layout.find(function (l) {
        return l.i === droppingItem.i;
      }) || {},
          x = _ref2.x,
          y = _ref2.y,
          w = _ref2.w,
          h = _ref2.h; // reset gragEnter counter on drop


      _this.dragEnterCounter = 0;

      _this.removeDroppingPlaceholder();

      _this.props.onDrop({
        x: x,
        y: y,
        w: w,
        h: h
      });
    });

    (0, _utils.autoBindHandlers)(_assertThisInitialized(_this), ["onDragStart", "onDrag", "onDragStop", "onResizeStart", "onResize", "onResizeStop"]);
    return _this;
  }

  _createClass(ReactGridLayout, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.setState({
        mounted: true
      }); // Possibly call back with layout on mount. This should be done after correcting the layout width
      // to ensure we don't rerender with the wrong width.

      this.onLayoutMaybeChanged(this.state.layout, this.props.layout);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps
    /*: Props*/
    , prevState
    /*: State*/
    ) {
      if (!this.state.activeDrag) {
        var newLayout = this.state.layout;
        var oldLayout = prevState.layout;
        this.onLayoutMaybeChanged(newLayout, oldLayout);
      }
    }
    /**
     * Calculates a pixel value for the container.
     * @return {String} Container height in pixels.
     */

  }, {
    key: "containerHeight",
    value: function containerHeight() {
      if (!this.props.autoSize) return;
      var nbRow = (0, _utils.bottom)(this.state.layout);
      var containerPaddingY = this.props.containerPadding ? this.props.containerPadding[1] : this.props.margin[1];
      return nbRow * this.props.rowHeight + (nbRow - 1) * this.props.margin[1] + containerPaddingY * 2 + "px";
    }
    /**
     * When dragging starts
     * @param {String} i Id of the child
     * @param {Number} x X position of the move
     * @param {Number} y Y position of the move
     * @param {Event} e The mousedown event
     * @param {Element} node The current dragging DOM element
     */

  }, {
    key: "onDragStart",
    value: function onDragStart(i
    /*: string*/
    , x
    /*: number*/
    , y
    /*: number*/
    , _ref3) {
      var e = _ref3.e,
          node = _ref3.node;
      var layout = this.state.layout;
      var l = (0, _utils.getLayoutItem)(layout, i);
      if (!l) return;
      this.setState({
        oldDragItem: (0, _utils.cloneLayoutItem)(l),
        oldLayout: this.state.layout
      });
      return this.props.onDragStart(layout, l, l, null, e, node);
    }
    /**
     * Each drag movement create a new dragelement and move the element to the dragged location
     * @param {String} i Id of the child
     * @param {Number} x X position of the move
     * @param {Number} y Y position of the move
     * @param {Event} e The mousedown event
     * @param {Element} node The current dragging DOM element
     */

  }, {
    key: "onDrag",
    value: function onDrag(i
    /*: string*/
    , x
    /*: number*/
    , y
    /*: number*/
    , _ref4) {
      var e = _ref4.e,
          node = _ref4.node;
      var oldDragItem = this.state.oldDragItem;
      var layout = this.state.layout;
      var cols = this.props.cols;
      var l = (0, _utils.getLayoutItem)(layout, i);
      if (!l) return; // Create placeholder (display only)

      var placeholder = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        placeholder: true,
        i: i
      }; // Move the element to the dragged location.

      var isUserAction = true;
      layout = (0, _utils.moveElement)(layout, l, x, y, isUserAction, this.props.preventCollision, compactType(this.props), cols);
      this.props.onDrag(layout, oldDragItem, l, placeholder, e, node);
      this.setState({
        layout: (0, _utils.compact)(layout, compactType(this.props), cols),
        activeDrag: placeholder
      });
    }
    /**
     * When dragging stops, figure out which position the element is closest to and update its x and y.
     * @param  {String} i Index of the child.
     * @param {Number} x X position of the move
     * @param {Number} y Y position of the move
     * @param {Event} e The mousedown event
     * @param {Element} node The current dragging DOM element
     */

  }, {
    key: "onDragStop",
    value: function onDragStop(i
    /*: string*/
    , x
    /*: number*/
    , y
    /*: number*/
    , _ref5) {
      var e = _ref5.e,
          node = _ref5.node;
      var oldDragItem = this.state.oldDragItem;
      var layout = this.state.layout;
      var _this$props2 = this.props,
          cols = _this$props2.cols,
          preventCollision = _this$props2.preventCollision;
      var l = (0, _utils.getLayoutItem)(layout, i);
      if (!l) return; // Move the element here

      var isUserAction = true;
      layout = (0, _utils.moveElement)(layout, l, x, y, isUserAction, preventCollision, compactType(this.props), cols);

      if (this.state.activeDrag) {
        this.props.onDragStop(layout, oldDragItem, l, null, e, node);
      } // Set state


      var newLayout = (0, _utils.compact)(layout, compactType(this.props), cols);
      var oldLayout = this.state.oldLayout;
      this.setState({
        activeDrag: null,
        layout: newLayout,
        oldDragItem: null,
        oldLayout: null
      });
      this.onLayoutMaybeChanged(newLayout, oldLayout);
    }
  }, {
    key: "onLayoutMaybeChanged",
    value: function onLayoutMaybeChanged(newLayout
    /*: Layout*/
    , oldLayout
    /*: ?Layout*/
    ) {
      if (!oldLayout) oldLayout = this.state.layout;

      if (!(0, _lodash.default)(oldLayout, newLayout)) {
        this.props.onLayoutChange(newLayout);
      }
    }
  }, {
    key: "onResizeStart",
    value: function onResizeStart(i
    /*: string*/
    , w
    /*: number*/
    , h
    /*: number*/
    , _ref6) {
      var e = _ref6.e,
          node = _ref6.node;
      var layout = this.state.layout;
      var l = (0, _utils.getLayoutItem)(layout, i);
      if (!l) return;
      this.setState({
        oldResizeItem: (0, _utils.cloneLayoutItem)(l),
        oldLayout: this.state.layout
      });
      this.props.onResizeStart(layout, l, l, null, e, node);
    }
  }, {
    key: "onResize",
    value: function onResize(i
    /*: string*/
    , w
    /*: number*/
    , h
    /*: number*/
    , _ref7) {
      var e = _ref7.e,
          node = _ref7.node;
      var _this$state = this.state,
          layout = _this$state.layout,
          oldResizeItem = _this$state.oldResizeItem;
      var _this$props3 = this.props,
          cols = _this$props3.cols,
          preventCollision = _this$props3.preventCollision;
      var l
      /*: ?LayoutItem*/
      = (0, _utils.getLayoutItem)(layout, i);
      if (!l) return; // Something like quad tree should be used
      // to find collisions faster

      var hasCollisions;

      if (preventCollision) {
        var collisions = (0, _utils.getAllCollisions)(layout, _objectSpread({}, l, {
          w: w,
          h: h
        })).filter(function (layoutItem) {
          return layoutItem.i !== l.i;
        });
        hasCollisions = collisions.length > 0; // If we're colliding, we need adjust the placeholder.

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
      } // Create placeholder element (display only)


      var placeholder = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        static: true,
        i: i
      };
      this.props.onResize(layout, oldResizeItem, l, placeholder, e, node); // Re-compact the layout and set the drag placeholder.

      this.setState({
        layout: (0, _utils.compact)(layout, compactType(this.props), cols),
        activeDrag: placeholder
      });
    }
  }, {
    key: "onResizeStop",
    value: function onResizeStop(i
    /*: string*/
    , w
    /*: number*/
    , h
    /*: number*/
    , _ref8) {
      var e = _ref8.e,
          node = _ref8.node;
      var _this$state2 = this.state,
          layout = _this$state2.layout,
          oldResizeItem = _this$state2.oldResizeItem;
      var cols = this.props.cols;
      var l = (0, _utils.getLayoutItem)(layout, i);
      this.props.onResizeStop(layout, oldResizeItem, l, null, e, node); // Set state

      var newLayout = (0, _utils.compact)(layout, compactType(this.props), cols);
      var oldLayout = this.state.oldLayout;
      this.setState({
        activeDrag: null,
        layout: newLayout,
        oldResizeItem: null,
        oldLayout: null
      });
      this.onLayoutMaybeChanged(newLayout, oldLayout);
    }
    /**
     * Create a placeholder object.
     * @return {Element} Placeholder div.
     */

  }, {
    key: "placeholder",
    value: function placeholder()
    /*: ?ReactElement<any>*/
    {
      var activeDrag = this.state.activeDrag;
      if (!activeDrag) return null;
      var _this$props4 = this.props,
          width = _this$props4.width,
          cols = _this$props4.cols,
          margin = _this$props4.margin,
          containerPadding = _this$props4.containerPadding,
          rowHeight = _this$props4.rowHeight,
          maxRows = _this$props4.maxRows,
          useCSSTransforms = _this$props4.useCSSTransforms,
          transformScale = _this$props4.transformScale; // {...this.state.activeDrag} is pretty slow, actually

      return _react.default.createElement(_GridItem.default, {
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
        useCSSTransforms: useCSSTransforms,
        transformScale: transformScale
      }, _react.default.createElement("div", null));
    }
    /**
     * Given a grid item, set its style attributes & surround in a <Draggable>.
     * @param  {Element} child React element.
     * @return {Element}       Element wrapped in draggable and properly placed.
     */

  }, {
    key: "processGridItem",
    value: function processGridItem(child
    /*: ReactElement<any>*/
    , isDroppingItem
    /*: boolean*/
    )
    /*: ?ReactElement<any>*/
    {
      if (!child || !child.key) return;
      var l = (0, _utils.getLayoutItem)(this.state.layout, String(child.key));
      if (!l) return null;
      var _this$props5 = this.props,
          width = _this$props5.width,
          cols = _this$props5.cols,
          margin = _this$props5.margin,
          containerPadding = _this$props5.containerPadding,
          rowHeight = _this$props5.rowHeight,
          maxRows = _this$props5.maxRows,
          isDraggable = _this$props5.isDraggable,
          isResizable = _this$props5.isResizable,
          useCSSTransforms = _this$props5.useCSSTransforms,
          transformScale = _this$props5.transformScale,
          draggableCancel = _this$props5.draggableCancel,
          draggableHandle = _this$props5.draggableHandle;
      var _this$state3 = this.state,
          mounted = _this$state3.mounted,
          droppingPosition = _this$state3.droppingPosition; // Parse 'static'. Any properties defined directly on the grid item will take precedence.

      var draggable = Boolean(!l.static && isDraggable && (l.isDraggable || l.isDraggable == null));
      var resizable = Boolean(!l.static && isResizable && (l.isResizable || l.isResizable == null));
      return _react.default.createElement(_GridItem.default, {
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
        droppingPosition: isDroppingItem ? droppingPosition : undefined
      }, child);
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props6 = this.props,
          className = _this$props6.className,
          style = _this$props6.style,
          isDroppable = _this$props6.isDroppable;
      var mergedClassName = (0, _classnames.default)(layoutClassName, className);

      var mergedStyle = _objectSpread({
        height: this.containerHeight()
      }, style);

      return _react.default.createElement("div", {
        className: mergedClassName,
        style: mergedStyle,
        onDrop: isDroppable ? this.onDrop : _utils.noop,
        onDragLeave: isDroppable ? this.onDragLeave : _utils.noop,
        onDragEnter: isDroppable ? this.onDragEnter : _utils.noop,
        onDragOver: isDroppable ? this.onDragOver : _utils.noop
      }, _react.default.Children.map(this.props.children, function (child) {
        return _this2.processGridItem(child);
      }), isDroppable && this.state.droppingDOMNode && this.processGridItem(this.state.droppingDOMNode, true), this.placeholder());
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps
    /*: Props*/
    , prevState
    /*: State*/
    ) {
      var newLayoutBase;

      if (prevState.activeDrag) {
        return null;
      } // Legacy support for compactType
      // Allow parent to set layout directly.


      if (!(0, _lodash.default)(nextProps.layout, prevState.propsLayout) || nextProps.compactType !== prevState.compactType) {
        newLayoutBase = nextProps.layout;
      } else if (!(0, _utils.childrenEqual)(nextProps.children, prevState.children)) {
        // If children change, also regenerate the layout. Use our state
        // as the base in case because it may be more up to date than
        // what is in props.
        newLayoutBase = prevState.layout;
      } // We need to regenerate the layout.


      if (newLayoutBase) {
        var newLayout = (0, _utils.synchronizeLayoutWithChildren)(newLayoutBase, nextProps.children, nextProps.cols, compactType(nextProps));
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
  }]);

  return ReactGridLayout;
}(_react.default.Component);

exports.default = ReactGridLayout;

_defineProperty(ReactGridLayout, "displayName", "ReactGridLayout");

_defineProperty(ReactGridLayout, "propTypes", {
  //
  // Basic props
  //
  className: _propTypes.default.string,
  style: _propTypes.default.object,
  // This can be set explicitly. If it is not set, it will automatically
  // be set to the container width. Note that resizes will *not* cause this to adjust.
  // If you need that behavior, use WidthProvider.
  width: _propTypes.default.number,
  // If true, the container height swells and contracts to fit contents
  autoSize: _propTypes.default.bool,
  // # of cols.
  cols: _propTypes.default.number,
  // A selector that will not be draggable.
  draggableCancel: _propTypes.default.string,
  // A selector for the draggable handler
  draggableHandle: _propTypes.default.string,
  // Deprecated
  verticalCompact: function verticalCompact(props
  /*: Props*/
  ) {
    if (props.verticalCompact === false && process.env.NODE_ENV !== "production") {
      console.warn( // eslint-disable-line no-console
      "`verticalCompact` on <ReactGridLayout> is deprecated and will be removed soon. " + 'Use `compactType`: "horizontal" | "vertical" | null.');
    }
  },
  // Choose vertical or hotizontal compaction
  compactType: _propTypes.default.oneOf(["vertical", "horizontal"]),
  // layout is an array of object with the format:
  // {x: Number, y: Number, w: Number, h: Number, i: String}
  layout: function layout(props
  /*: Props*/
  ) {
    var layout = props.layout; // I hope you're setting the data-grid property on the grid items

    if (layout === undefined) return;
    (0, _utils.validateLayout)(layout, "layout");
  },
  //
  // Grid Dimensions
  //
  // Margin between items [x, y] in px
  margin: _propTypes.default.arrayOf(_propTypes.default.number),
  // Padding inside the container [x, y] in px
  containerPadding: _propTypes.default.arrayOf(_propTypes.default.number),
  // Rows have a static height, but you can change this based on breakpoints if you like
  rowHeight: _propTypes.default.number,
  // Default Infinity, but you can specify a max here if you like.
  // Note that this isn't fully fleshed out and won't error if you specify a layout that
  // extends beyond the row capacity. It will, however, not allow users to drag/resize
  // an item past the barrier. They can push items beyond the barrier, though.
  // Intentionally not documented for this reason.
  maxRows: _propTypes.default.number,
  //
  // Flags
  //
  isDraggable: _propTypes.default.bool,
  isResizable: _propTypes.default.bool,
  // If true, grid items won't change position when being dragged over.
  preventCollision: _propTypes.default.bool,
  // Use CSS transforms instead of top/left
  useCSSTransforms: _propTypes.default.bool,
  // parent layout transform scale
  transformScale: _propTypes.default.number,
  // If true, an external element can trigger onDrop callback with a specific grid position as a parameter
  isDroppable: _propTypes.default.bool,
  //
  // Callbacks
  //
  // Callback so you can save the layout. Calls after each drag & resize stops.
  onLayoutChange: _propTypes.default.func,
  // Calls when drag starts. Callback is of the signature (layout, oldItem, newItem, placeholder, e, ?node).
  // All callbacks below have the same signature. 'start' and 'stop' callbacks omit the 'placeholder'.
  onDragStart: _propTypes.default.func,
  // Calls on each drag movement.
  onDrag: _propTypes.default.func,
  // Calls when drag is complete.
  onDragStop: _propTypes.default.func,
  //Calls when resize starts.
  onResizeStart: _propTypes.default.func,
  // Calls when resize movement happens.
  onResize: _propTypes.default.func,
  // Calls when resize is complete.
  onResizeStop: _propTypes.default.func,
  // Calls when some element is dropped.
  onDrop: _propTypes.default.func,
  //
  // Other validations
  //
  droppingItem: _propTypes.default.shape({
    i: _propTypes.default.string.isRequired,
    w: _propTypes.default.number.isRequired,
    h: _propTypes.default.number.isRequired
  }),
  // Children must not have duplicate keys.
  children: function children(props
  /*: Props*/
  , propName
  /*: string*/
  ) {
    var children = props[propName]; // Check children keys for duplicates. Throw if found.

    var keys = {};

    _react.default.Children.forEach(children, function (child) {
      if (keys[child.key]) {
        throw new Error('Duplicate child key "' + child.key + '" found! This will cause problems in ReactGridLayout.');
      }

      keys[child.key] = true;
    });
  }
});

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
  isDraggable: true,
  isResizable: true,
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
  onLayoutChange: _utils.noop,
  onDragStart: _utils.noop,
  onDrag: _utils.noop,
  onDragStop: _utils.noop,
  onResizeStart: _utils.noop,
  onResize: _utils.noop,
  onResizeStop: _utils.noop,
  onDrop: _utils.noop
});