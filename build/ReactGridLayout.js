"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _lodash = _interopRequireDefault(require("lodash.isequal"));

var _classnames = _interopRequireDefault(require("classnames"));

var _utils = require("./utils");

var _calculateUtils = require("./calculateUtils");

var _GridItem = _interopRequireDefault(require("./GridItem"));

var _ReactGridLayoutPropTypes = _interopRequireDefault(require("./ReactGridLayoutPropTypes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
// https://gist.github.com/gordonbrander/2230317
var generateID = function generateID()
/*: string*/
{
  return "_" + Math.random().toString(36).substr(2, 9);
};

var layoutClassName = "react-grid-layout";
var isFirefox = false; // Try...catch will protect from navigator not existing (e.g. node) or a bad implementation of navigator

try {
  isFirefox = /firefox/i.test(navigator.userAgent);
} catch (e) {}
/* Ignore */

/**
 * A reactive, fluid grid layout with draggable, resizable components.
 */


var ReactGridLayout = /*#__PURE__*/function (_React$Component) {
  _inherits(ReactGridLayout, _React$Component);

  // TODO publish internal ReactClass displayName transform
  // Refactored to another module to make way for preval
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
      id: "reactGrid" + generateID(),
      activeDrag: null,
      layout: (0, _utils.synchronizeLayoutWithChildren)(_this.props.layout, _this.props.children, _this.props.cols, // Legacy support for verticalCompact: false
      (0, _utils.compactType)(_this.props)),
      mounted: false,
      oldDragItem: null,
      oldLayout: null,
      oldResizeItem: null,
      droppingDOMNode: null,
      children: []
    });

    _defineProperty(_assertThisInitialized(_this), "dragEnterCounter", 0);

    _defineProperty(_assertThisInitialized(_this), "dropZoneXY", [0, 0]);

    _defineProperty(_assertThisInitialized(_this), "delayedFunction", null);

    _defineProperty(_assertThisInitialized(_this), "dragDebug", {});

    _defineProperty(_assertThisInitialized(_this), "onDragOver", function (e
    /*: any*/
    ) {
      _this.debugBox(2, JSON.stringify({
        dropZoneX: _this.dropZoneXY[0],
        dropZoneY: _this.dropZoneXY[1],
        clientX: e.clientX,
        clientY: e.clientY,
        finalX: e.clientX - _this.dropZoneXY[0],
        finalY: e.clientY - _this.dropZoneXY[1],
        target: e.target ? e.target.nodeName + "(" + e.target.className + ")#" + e.target.id : ''
      }));

      var _this$props = _this.props,
          droppingItem = _this$props.droppingItem,
          margin = _this$props.margin,
          cols = _this$props.cols,
          rowHeight = _this$props.rowHeight,
          maxRows = _this$props.maxRows,
          width = _this$props.width,
          containerPadding = _this$props.containerPadding;
      var layout = _this.state.layout;
      var clientX = e.clientX - _this.dropZoneXY[0];
      var clientY = e.clientY - _this.dropZoneXY[1];
      var droppingPosition = {
        left: clientX,
        top: clientY,
        e: e
      };

      if (!_this.state.droppingDOMNode) {
        var positionParams
        /*: PositionParams*/
        = {
          cols: cols,
          margin: margin,
          maxRows: maxRows,
          rowHeight: rowHeight,
          containerWidth: width,
          containerPadding: containerPadding || margin
        };
        var calculatedPosition = (0, _calculateUtils.calcXY)(positionParams, clientY, clientX, droppingItem.w, droppingItem.h);

        _this.setState({
          droppingDOMNode: _react.default.createElement("div", {
            key: droppingItem.i
          }),
          droppingPosition: droppingPosition,
          layout: [].concat(_toConsumableArray(layout), [_objectSpread({}, droppingItem, {
            x: calculatedPosition.x,
            y: calculatedPosition.y,
            static: false,
            isDraggable: true
          })])
        });
      } else if (_this.state.droppingPosition) {
        var _this$state$droppingP = _this.state.droppingPosition,
            left = _this$state$droppingP.left,
            top = _this$state$droppingP.top;
        var shouldUpdatePosition = left != clientX || top != clientY;

        if (shouldUpdatePosition) {
          _this.setState({
            droppingPosition: droppingPosition
          });
        }
      }

      e.stopPropagation();
      e.preventDefault();
    });

    _defineProperty(_assertThisInitialized(_this), "removeDroppingPlaceholder", function (compactAfter
    /*: boolean*/
    ) {
      var _this$props2 = _this.props,
          droppingItem = _this$props2.droppingItem,
          cols = _this$props2.cols;
      var layout = _this.state.layout;
      var newLayout = [];

      if (compactAfter) {
        newLayout = (0, _utils.compact)(layout.filter(function (l) {
          return l.i !== droppingItem.i;
        }), (0, _utils.compactType)(_this.props), cols);
      } else {
        newLayout = layout.filter(function (l) {
          return l.i !== droppingItem.i;
        });
      }

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
        _this.removeDroppingPlaceholder(true);
      }

      _this.debugBox(1, _this.dragEnterCounter.toString());
    });

    _defineProperty(_assertThisInitialized(_this), "onDragEnter", function () {
      var gridContainerDims = (document.getElementById(_this.state.id)
      /*: any*/
      ).getBoundingClientRect();
      _this.dragEnterCounter++;
      _this.dropZoneXY = [gridContainerDims.left, gridContainerDims.top];

      _this.debugBox(1, _this.dragEnterCounter.toString());
    });

    _defineProperty(_assertThisInitialized(_this), "onDrop", function (e
    /*: Event*/
    ) {
      var droppingItem = _this.props.droppingItem;
      var layout = _this.state.layout;

      var _ref = layout.find(function (l) {
        return l.i === droppingItem.i;
      }) || {},
          x = _ref.x,
          y = _ref.y,
          w = _ref.w,
          h = _ref.h; // reset gragEnter counter on drop


      _this.dragEnterCounter = 0;

      _this.removeDroppingPlaceholder();

      _this.props.onDrop({
        x: x,
        y: y,
        w: w,
        h: h,
        e: e
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

      this.onLayoutMaybeChanged(this.state.layout, this.props.layout); // Add drag & drop events manually on the created DOM, rather than using react's event model.  This may
      // help avoid conflicts.

      if (this.props.isDroppable) {
        this.enableDropEvents();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      if (this.props.isDroppable) {
        this.disableDropEvents();
      }
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps
    /*: Props*/
    , nextState
    /*: State*/
    ) {
      return (// NOTE: this is almost always unequal. Therefore the only way to get better performance
        // from SCU is if the user intentionally memoizes children. If they do, and they can
        // handle changes properly, performance will increase.
        this.props.children !== nextProps.children || !(0, _utils.fastRGLPropsEqual)(this.props, nextProps, _lodash.default) || this.state.activeDrag !== nextState.activeDrag || this.state.droppingPosition !== nextState.droppingPosition
      );
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

        if (prevProps.isDroppable !== this.props.isDroppable) {
          if (this.props.isDroppable) {
            this.enableDropEvents();
          } else {
            this.disableDropEvents();
          }
        }
      }
    }
  }, {
    key: "enableDropEvents",
    value: function enableDropEvents() {
      var rootDOM
      /*: HTMLElement | null*/
      = document.getElementById(this.state.id);

      if (rootDOM != null) {
        rootDOM.addEventListener("drop", this.onDrop);
        rootDOM.addEventListener("dragover", this.onDragOver);
        rootDOM.addEventListener("dragleave", this.onDragLeave);
        rootDOM.addEventListener("dragenter", this.onDragEnter);
      }
    }
  }, {
    key: "disableDropEvents",
    value: function disableDropEvents() {
      var rootDOM
      /*: HTMLElement | null*/
      = document.getElementById(this.state.id);

      if (rootDOM != null) {
        rootDOM.removeEventListener("drop", this.onDrop);
        rootDOM.removeEventListener("dragover", this.onDragOver);
        rootDOM.removeEventListener("dragleave", this.onDragLeave);
        rootDOM.removeEventListener("dragenter", this.onDragEnter);
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
      var calcHeight = nbRow * this.props.rowHeight + (nbRow - 1) * this.props.margin[1] + containerPaddingY * 2;
      return (this.props.minHeight !== 0 && calcHeight < this.props.minHeight ? this.props.minHeight : calcHeight) + "px";
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
    , _ref2) {
      var e = _ref2.e,
          node = _ref2.node;
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
    , _ref3) {
      var _this2 = this;

      var e = _ref3.e,
          node = _ref3.node;
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
      layout = (0, _utils.moveElement)(layout, l, x, y, isUserAction, this.props.preventCollision, (0, _utils.compactType)(this.props), cols, this.props.collisionDelay !== 0 ? function () {
        return setTimeout(function () {
          (0, _utils.moveElement)(layout, l, x, y, isUserAction, _this2.props.preventCollision, (0, _utils.compactType)(_this2.props), cols);
          Window.rglCollisionDelayObj = null;

          _this2.props.onDrag(layout, oldDragItem, l, placeholder, e, node);

          _this2.setState({
            layout: (0, _utils.compact)(layout, (0, _utils.compactType)(_this2.props), cols),
            activeDrag: placeholder
          });
        }, _this2.props.collisionDelay);
      } : undefined);
      this.props.onDrag(layout, oldDragItem, l, placeholder, e, node);
      this.setState({
        layout: (0, _utils.compact)(layout, (0, _utils.compactType)(this.props), cols),
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
    , _ref4) {
      var _this3 = this;

      var e = _ref4.e,
          node = _ref4.node;
      if (!this.state.activeDrag) return;
      var oldDragItem = this.state.oldDragItem;
      var layout = this.state.layout;
      var _this$props3 = this.props,
          cols = _this$props3.cols,
          preventCollision = _this$props3.preventCollision;
      var l = (0, _utils.getLayoutItem)(layout, i);
      if (!l) return; // Move the element here

      var isUserAction = true;
      layout = (0, _utils.moveElement)(layout, l, x, y, isUserAction, preventCollision, (0, _utils.compactType)(this.props), cols, this.props.collisionDelay !== 0 ? function () {
        return setTimeout(function () {
          (0, _utils.moveElement)(layout, l, x, y, isUserAction, _this3.props.preventCollision, (0, _utils.compactType)(_this3.props), cols);
          Window.rglCollisionDelayObj = null;

          if (_this3.state.activeDrag) {
            _this3.props.onDragStop(layout, oldDragItem, l, null, e, node);
          } // Set state


          var newLayout = (0, _utils.compact)(layout, (0, _utils.compactType)(_this3.props), cols);
          var oldLayout = _this3.state.oldLayout;

          _this3.setState({
            activeDrag: null,
            layout: newLayout,
            oldDragItem: null,
            oldLayout: null
          });

          _this3.onLayoutMaybeChanged(newLayout, oldLayout);
        }, _this3.props.collisionDelay);
      } : undefined);
      this.props.onDragStop(layout, oldDragItem, l, null, e, node); // Set state

      var newLayout = (0, _utils.compact)(layout, (0, _utils.compactType)(this.props), cols);
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
    , _ref5) {
      var e = _ref5.e,
          node = _ref5.node;
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
    , _ref6) {
      var e = _ref6.e,
          node = _ref6.node;
      var _this$state = this.state,
          layout = _this$state.layout,
          oldResizeItem = _this$state.oldResizeItem;
      var _this$props4 = this.props,
          cols = _this$props4.cols,
          preventCollision = _this$props4.preventCollision;
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
        layout: (0, _utils.compact)(layout, (0, _utils.compactType)(this.props), cols),
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
    , _ref7) {
      var e = _ref7.e,
          node = _ref7.node;
      var _this$state2 = this.state,
          layout = _this$state2.layout,
          oldResizeItem = _this$state2.oldResizeItem;
      var cols = this.props.cols;
      var l = (0, _utils.getLayoutItem)(layout, i);
      this.props.onResizeStop(layout, oldResizeItem, l, null, e, node); // Set state

      var newLayout = (0, _utils.compact)(layout, (0, _utils.compactType)(this.props), cols);
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
      var _this$props5 = this.props,
          width = _this$props5.width,
          cols = _this$props5.cols,
          margin = _this$props5.margin,
          containerPadding = _this$props5.containerPadding,
          rowHeight = _this$props5.rowHeight,
          maxRows = _this$props5.maxRows,
          useCSSTransforms = _this$props5.useCSSTransforms,
          transformScale = _this$props5.transformScale; // {...this.state.activeDrag} is pretty slow, actually

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
      var _this$props6 = this.props,
          width = _this$props6.width,
          cols = _this$props6.cols,
          margin = _this$props6.margin,
          containerPadding = _this$props6.containerPadding,
          rowHeight = _this$props6.rowHeight,
          maxRows = _this$props6.maxRows,
          isDraggable = _this$props6.isDraggable,
          isResizable = _this$props6.isResizable,
          useCSSTransforms = _this$props6.useCSSTransforms,
          transformScale = _this$props6.transformScale,
          draggableCancel = _this$props6.draggableCancel,
          draggableHandle = _this$props6.draggableHandle;
      var _this$state3 = this.state,
          mounted = _this$state3.mounted,
          droppingPosition = _this$state3.droppingPosition; // Determine user manipulations possible.
      // If an item is static, it can't be manipulated by default.
      // Any properties defined directly on the grid item will take precedence.

      var draggable = typeof l.isDraggable === "boolean" ? l.isDraggable : !l.static && isDraggable;
      var resizable = typeof l.isResizable === "boolean" ? l.isResizable : !l.static && isResizable;
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
    } // Called while dragging an element. Part of browser native drag/drop API.
    // Native event target might be the layout itself, or an element within the layout.

  }, {
    key: "debugBox",
    value: function debugBox(boxNo
    /*: number*/
    , boxText
    /*: string*/
    ) {
      if (this.props.debug) {
        (document.getElementById(this.state.id + "-debug-box" + boxNo)
        /*: any*/
        ).innerText = boxText;
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this4 = this;

      var _this$props7 = this.props,
          className = _this$props7.className,
          style = _this$props7.style,
          isDroppable = _this$props7.isDroppable;
      var mergedClassName = (0, _classnames.default)(layoutClassName, className);

      var mergedStyle = _objectSpread({
        height: this.containerHeight()
      }, style);

      return _react.default.createElement(_react.default.Fragment, null, _react.default.createElement("div", {
        id: this.state.id,
        className: mergedClassName,
        style: mergedStyle
      }, _react.default.Children.map(this.props.children, function (child) {
        return _this4.processGridItem(child);
      }), isDroppable && this.state.droppingDOMNode && this.processGridItem(this.state.droppingDOMNode, true), this.placeholder()), this.props.debug && _react.default.createElement("div", {
        style: {
          backgroundColor: '#0000ff',
          color: '#ffffff',
          wordBreak: 'break-all'
        }
      }, _react.default.createElement("div", {
        id: this.state.id + "-debug-box1"
      }), _react.default.createElement("div", {
        id: this.state.id + "-debug-box2"
      }), _react.default.createElement("div", {
        id: this.state.id + "-debug-box3"
      }), _react.default.createElement("div", {
        id: this.state.id + "-debug-box4"
      }), _react.default.createElement("div", {
        id: this.state.id + "-debug-box5"
      }), JSON.stringify(this.state.layout.map(function (item) {
        return {
          i: item.i,
          x: item.x,
          y: item.y
        };
      }))));
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
        var newLayout = (0, _utils.synchronizeLayoutWithChildren)(newLayoutBase, nextProps.children, nextProps.cols, (0, _utils.compactType)(nextProps));
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

_defineProperty(ReactGridLayout, "propTypes", _ReactGridLayoutPropTypes.default);

_defineProperty(ReactGridLayout, "defaultProps", {
  autoSize: true,
  cols: 12,
  className: "",
  style: {},
  draggableHandle: "",
  draggableCancel: "",
  minHeight: 0,
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
  collisionDelay: 0,
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
  onDrop: _utils.noop,
  debug: false
});