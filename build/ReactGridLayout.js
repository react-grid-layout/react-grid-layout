"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _lodash = _interopRequireDefault(require("lodash.isequal"));

var _clsx = _interopRequireDefault(require("clsx"));

var _utils = require("./utils");

var _calculateUtils = require("./calculateUtils");

var _GridItem = _interopRequireDefault(require("./GridItem"));

var _ReactGridLayoutPropTypes = _interopRequireDefault(require("./ReactGridLayoutPropTypes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// End Types
var layoutClassName = "react-grid-layout";
var isFirefox = false; // Try...catch will protect from navigator not existing (e.g. node) or a bad implementation of navigator

try {
  isFirefox = /firefox/i.test(navigator.userAgent);
} catch (e) {
  /* Ignore */
}
/**
 * A reactive, fluid grid layout with draggable, resizable components.
 */


var ReactGridLayout = /*#__PURE__*/function (_React$Component) {
  _inherits(ReactGridLayout, _React$Component);

  var _super = _createSuper(ReactGridLayout);

  function ReactGridLayout() {
    var _this;

    _classCallCheck(this, ReactGridLayout);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "state", {
      activeDrag: null,
      layout: _this.props.fillGaps ? (0, _utils.fillInGaps)((0, _utils.synchronizeLayoutWithChildren)(_this.props.layout, _this.props.children, _this.props.cols, // Legacy support for verticalCompact: false
      (0, _utils.compactType)(_this.props), _this.props.allowOverlap), _this.props.cols, _this.props.lastRowGap, _this.props.heightUnits) : (0, _utils.synchronizeLayoutWithChildren)(_this.props.layout, _this.props.children, _this.props.cols, // Legacy support for verticalCompact: false
      (0, _utils.compactType)(_this.props), _this.props.allowOverlap),
      mounted: false,
      oldDragItem: null,
      oldLayout: null,
      oldResizeItem: null,
      droppingDOMNode: null,
      children: []
    });

    _defineProperty(_assertThisInitialized(_this), "dragEnterCounter", 0);

    _defineProperty(_assertThisInitialized(_this), "onDragStart", function (i
    /*: string*/
    , x
    /*: number*/
    , y
    /*: number*/
    , _ref) {
      var e = _ref.e,
          node = _ref.node;
      var layout = _this.state.layout;
      var l = (0, _utils.getLayoutItem)(layout, i);
      if (!l) return;

      _this.setState({
        oldDragItem: (0, _utils.cloneLayoutItem)(l),
        oldLayout: layout
      });

      return _this.props.onDragStart(layout, l, l, null, e, node);
    });

    _defineProperty(_assertThisInitialized(_this), "onDrag", function (i, x, y, _ref2) {
      var e = _ref2.e,
          node = _ref2.node;
      var oldDragItem = _this.state.oldDragItem;
      var layout = _this.state.layout;
      var _this$props = _this.props,
          cols = _this$props.cols,
          allowOverlap = _this$props.allowOverlap,
          preventCollision = _this$props.preventCollision,
          fillGaps = _this$props.fillGaps;
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
      layout = (0, _utils.moveElement)(layout, l, x, y, isUserAction, preventCollision, (0, _utils.compactType)(_this.props), cols, allowOverlap); // if you are filling gaps and want to hide them on drag, filter gaps out

      var tempLayout = fillGaps ? (0, _utils.filterOutGaps)(layout, true) : layout;

      _this.props.onDrag(tempLayout, oldDragItem, l, placeholder, e, node);

      _this.setState({
        layout: allowOverlap ? tempLayout : (0, _utils.compact)(tempLayout, (0, _utils.compactType)(_this.props), cols),
        activeDrag: placeholder
      });
    });

    _defineProperty(_assertThisInitialized(_this), "onDragStop", function (i, x, y, _ref3) {
      var e = _ref3.e,
          node = _ref3.node;
      if (!_this.state.activeDrag) return;
      var oldDragItem = _this.state.oldDragItem;
      var layout = _this.state.layout;
      var _this$props2 = _this.props,
          cols = _this$props2.cols,
          preventCollision = _this$props2.preventCollision,
          allowOverlap = _this$props2.allowOverlap,
          fillGaps = _this$props2.fillGaps,
          lastRowGap = _this$props2.lastRowGap,
          heightUnits = _this$props2.heightUnits;
      var l = (0, _utils.getLayoutItem)(layout, i);
      if (!l) return; // Move the element here

      var isUserAction = true;
      layout = (0, _utils.moveElement)(layout, l, x, y, isUserAction, preventCollision, (0, _utils.compactType)(_this.props), cols, allowOverlap);

      _this.props.onDragStop(layout, oldDragItem, l, null, e, node); // Set state


      var compactedLayout = allowOverlap ? layout : (0, _utils.compact)(layout, (0, _utils.compactType)(_this.props), cols);
      var newLayout = fillGaps ? (0, _utils.fillInGaps)(compactedLayout, cols, lastRowGap, heightUnits) : compactedLayout;
      var oldLayout = _this.state.oldLayout;

      _this.setState({
        activeDrag: null,
        layout: newLayout,
        oldDragItem: null,
        oldLayout: null
      });

      _this.onLayoutMaybeChanged(newLayout, oldLayout);
    });

    _defineProperty(_assertThisInitialized(_this), "onResizeStart", function (i, w, h, _ref4) {
      var e = _ref4.e,
          node = _ref4.node;
      var layout = _this.state.layout;
      var l = (0, _utils.getLayoutItem)(layout, i);
      if (!l) return;

      _this.setState({
        oldResizeItem: (0, _utils.cloneLayoutItem)(l),
        oldLayout: _this.state.layout
      });

      _this.props.onResizeStart(layout, l, l, null, e, node);
    });

    _defineProperty(_assertThisInitialized(_this), "onResize", function (i, w, h, _ref5) {
      var e = _ref5.e,
          node = _ref5.node;
      var _this$state = _this.state,
          layout = _this$state.layout,
          oldResizeItem = _this$state.oldResizeItem;
      var _this$props3 = _this.props,
          cols = _this$props3.cols,
          preventCollision = _this$props3.preventCollision,
          allowOverlap = _this$props3.allowOverlap,
          fillGaps = _this$props3.fillGaps;

      var _withLayoutItem = (0, _utils.withLayoutItem)(layout, i, function (l) {
        // Something like quad tree should be used
        // to find collisions faster
        var hasCollisions;

        if (preventCollision && !allowOverlap) {
          var collisions = (0, _utils.getAllCollisions)(layout, _objectSpread(_objectSpread({}, l), {}, {
            w: w,
            h: h
          })).filter(function (layoutItem) {
            return layoutItem.i !== l.i;
          });
          hasCollisions = collisions.length > 0; // If we're colliding, we need adjust the placeholder.

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

        return l;
      }),
          _withLayoutItem2 = _slicedToArray(_withLayoutItem, 2),
          newLayout = _withLayoutItem2[0],
          l = _withLayoutItem2[1]; // Shouldn't ever happen, but typechecking makes it necessary


      if (!l) return; // Create placeholder element (display only)

      var placeholder = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        static: true,
        i: i
      };

      _this.props.onResize(newLayout, oldResizeItem, l, placeholder, e, node); // Re-compact the newLayout and set the drag placeholder.


      var tempLayout = fillGaps ? (0, _utils.filterOutGaps)(newLayout, true) : newLayout;

      _this.setState({
        layout: allowOverlap ? tempLayout : (0, _utils.compact)(tempLayout, (0, _utils.compactType)(_this.props), cols),
        activeDrag: placeholder
      });
    });

    _defineProperty(_assertThisInitialized(_this), "onResizeStop", function (i, w, h, _ref6) {
      var e = _ref6.e,
          node = _ref6.node;
      var _this$state2 = _this.state,
          layout = _this$state2.layout,
          oldResizeItem = _this$state2.oldResizeItem;
      var _this$props4 = _this.props,
          cols = _this$props4.cols,
          allowOverlap = _this$props4.allowOverlap,
          fillGaps = _this$props4.fillGaps,
          lastRowGap = _this$props4.lastRowGap,
          heightUnits = _this$props4.heightUnits;
      var l = (0, _utils.getLayoutItem)(layout, i);

      _this.props.onResizeStop(layout, oldResizeItem, l, null, e, node); // Set state


      var compactedLayout = allowOverlap ? layout : (0, _utils.compact)(layout, (0, _utils.compactType)(_this.props), cols);
      var newLayout = fillGaps ? (0, _utils.fillInGaps)(compactedLayout, cols, lastRowGap, heightUnits) : compactedLayout;
      var oldLayout = _this.state.oldLayout;

      _this.setState({
        activeDrag: null,
        layout: newLayout,
        oldResizeItem: null,
        oldLayout: null
      });

      _this.onLayoutMaybeChanged(newLayout, oldLayout);
    });

    _defineProperty(_assertThisInitialized(_this), "onDragOver", function (e) {
      var _e$nativeEvent$target;

      e.preventDefault(); // Prevent any browser native action

      e.stopPropagation(); // we should ignore events from layout's children in Firefox
      // to avoid unpredictable jumping of a dropping placeholder
      // FIXME remove this hack

      if (isFirefox && // $FlowIgnore can't figure this out
      !((_e$nativeEvent$target = e.nativeEvent.target) !== null && _e$nativeEvent$target !== void 0 && _e$nativeEvent$target.classList.contains(layoutClassName))) {
        return false;
      }

      var _this$props5 = _this.props,
          droppingItem = _this$props5.droppingItem,
          onDropDragOver = _this$props5.onDropDragOver,
          margin = _this$props5.margin,
          cols = _this$props5.cols,
          rowHeight = _this$props5.rowHeight,
          maxRows = _this$props5.maxRows,
          width = _this$props5.width,
          containerPadding = _this$props5.containerPadding,
          transformScale = _this$props5.transformScale; // Allow user to customize the dropping item or short-circuit the drop based on the results
      // of the `onDragOver(e: Event)` callback.

      var onDragOverResult = onDropDragOver === null || onDropDragOver === void 0 ? void 0 : onDropDragOver(e);

      if (onDragOverResult === false) {
        if (_this.state.droppingDOMNode) {
          _this.removeDroppingPlaceholder();
        }

        return false;
      }

      var finalDroppingItem = _objectSpread(_objectSpread({}, droppingItem), onDragOverResult);

      var layout = _this.state.layout; // This is relative to the DOM element that this event fired for.

      var _e$nativeEvent = e.nativeEvent,
          layerX = _e$nativeEvent.layerX,
          layerY = _e$nativeEvent.layerY;
      var droppingPosition = {
        left: layerX / transformScale,
        top: layerY / transformScale,
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
        var calculatedPosition = (0, _calculateUtils.calcXY)(positionParams, layerY, layerX, finalDroppingItem.w, finalDroppingItem.h);

        _this.setState({
          droppingDOMNode: /*#__PURE__*/React.createElement("div", {
            key: finalDroppingItem.i
          }),
          droppingPosition: droppingPosition,
          layout: [].concat(_toConsumableArray(layout), [_objectSpread(_objectSpread({}, finalDroppingItem), {}, {
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
        var shouldUpdatePosition = left != layerX || top != layerY;

        if (shouldUpdatePosition) {
          _this.setState({
            droppingPosition: droppingPosition
          });
        }
      }
    });

    _defineProperty(_assertThisInitialized(_this), "removeDroppingPlaceholder", function () {
      var _this$props6 = _this.props,
          droppingItem = _this$props6.droppingItem,
          cols = _this$props6.cols;
      var layout = _this.state.layout;
      var newLayout = (0, _utils.compact)(layout.filter(function (l) {
        return l.i !== droppingItem.i;
      }), (0, _utils.compactType)(_this.props), cols);

      _this.setState({
        layout: newLayout,
        droppingDOMNode: null,
        activeDrag: null,
        droppingPosition: undefined
      });
    });

    _defineProperty(_assertThisInitialized(_this), "onDragLeave", function (e) {
      e.preventDefault(); // Prevent any browser native action

      e.stopPropagation();
      _this.dragEnterCounter--; // onDragLeave can be triggered on each layout's child.
      // But we know that count of dragEnter and dragLeave events
      // will be balanced after leaving the layout's container
      // so we can increase and decrease count of dragEnter and
      // when it'll be equal to 0 we'll remove the placeholder

      if (_this.dragEnterCounter === 0) {
        _this.removeDroppingPlaceholder();
      }
    });

    _defineProperty(_assertThisInitialized(_this), "onDragEnter", function (e) {
      e.preventDefault(); // Prevent any browser native action

      e.stopPropagation();
      _this.dragEnterCounter++;
    });

    _defineProperty(_assertThisInitialized(_this), "onDrop", function (e
    /*: Event*/
    ) {
      e.preventDefault(); // Prevent any browser native action

      e.stopPropagation();
      var droppingItem = _this.props.droppingItem;
      var layout = _this.state.layout;
      var item = layout.find(function (l) {
        return l.i === droppingItem.i;
      }); // reset dragEnter counter on drop

      _this.dragEnterCounter = 0;

      _this.removeDroppingPlaceholder();

      _this.props.onDrop(layout, item, e);
    });

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
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps
    /*: Props*/
    , nextState
    /*: State*/
    )
    /*: boolean*/
    {
      return (// NOTE: this is almost always unequal. Therefore the only way to get better performance
        // from SCU is if the user intentionally memoizes children. If they do, and they can
        // handle changes properly, performance will increase.
        this.props.children !== nextProps.children || !(0, _utils.fastRGLPropsEqual)(this.props, nextProps, _lodash.default) || this.state.activeDrag !== nextState.activeDrag || this.state.mounted !== nextState.mounted || this.state.droppingPosition !== nextState.droppingPosition
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
      }
    }
    /**
     * Calculates a pixel value for the container.
     * @return {String} Container height in pixels.
     */

  }, {
    key: "containerHeight",
    value: function containerHeight()
    /*: ?string*/
    {
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
    key: "onLayoutMaybeChanged",
    value: function onLayoutMaybeChanged(newLayout
    /*: Layout*/
    , oldLayout
    /*: ?Layout*/
    ) {
      if (!oldLayout) oldLayout = this.state.layout;
      var previousLayout = this.props.fillGaps ? (0, _utils.filterOutGaps)(oldLayout) : oldLayout;
      var nextLayout = this.props.fillGaps ? (0, _utils.filterOutGaps)(newLayout) : newLayout;

      if (!(0, _lodash.default)(previousLayout, nextLayout)) {
        this.props.onLayoutChange(nextLayout);
      }
    }
  }, {
    key: "placeholder",
    value:
    /**
     * Create a placeholder object.
     * @return {Element} Placeholder div.
     */
    function placeholder()
    /*: ?ReactElement<any>*/
    {
      var activeDrag = this.state.activeDrag;
      if (!activeDrag) return null;
      var _this$props7 = this.props,
          width = _this$props7.width,
          cols = _this$props7.cols,
          margin = _this$props7.margin,
          containerPadding = _this$props7.containerPadding,
          rowHeight = _this$props7.rowHeight,
          maxRows = _this$props7.maxRows,
          useCSSTransforms = _this$props7.useCSSTransforms,
          transformScale = _this$props7.transformScale; // {...this.state.activeDrag} is pretty slow, actually

      return /*#__PURE__*/React.createElement(_GridItem.default, {
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
        isBounded: false,
        useCSSTransforms: useCSSTransforms,
        transformScale: transformScale
      }, /*#__PURE__*/React.createElement("div", null));
    }
    /**
     * Fill all gaps with gapRenderFunction output
     * @return {Element} Placeholder div.
     */

  }, {
    key: "addGaps",
    value: function addGaps()
    /*: ?ReactElement<any>*/
    {
      var _this$props8 = this.props,
          width = _this$props8.width,
          cols = _this$props8.cols,
          margin = _this$props8.margin,
          containerPadding = _this$props8.containerPadding,
          rowHeight = _this$props8.rowHeight,
          maxRows = _this$props8.maxRows,
          useCSSTransforms = _this$props8.useCSSTransforms,
          gapRenderFunction = _this$props8.gapRenderFunction;
      var _this$state3 = this.state,
          layout = _this$state3.layout,
          activeDrag = _this$state3.activeDrag;
      var addGaps = (0, _utils.getOnlyGaps)(layout, activeDrag);
      return addGaps.map(function (gap) {
        return /*#__PURE__*/React.createElement(_GridItem.default, {
          key: gap.i,
          w: gap.w,
          h: gap.h,
          x: gap.x,
          y: gap.y,
          i: gap.i,
          containerWidth: width,
          className: "react-grid-gap",
          style: {
            display: activeDrag ? "none" : null
          },
          cols: cols,
          margin: margin,
          containerPadding: containerPadding || margin,
          maxRows: maxRows,
          rowHeight: rowHeight,
          isDraggable: false,
          isResizable: false,
          useCSSTransforms: useCSSTransforms
        }, /*#__PURE__*/React.createElement("div", {
          key: gap.i
        }, gapRenderFunction(gap)));
      });
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
      var _this$props9 = this.props,
          width = _this$props9.width,
          cols = _this$props9.cols,
          margin = _this$props9.margin,
          containerPadding = _this$props9.containerPadding,
          rowHeight = _this$props9.rowHeight,
          maxRows = _this$props9.maxRows,
          isDraggable = _this$props9.isDraggable,
          isResizable = _this$props9.isResizable,
          isBounded = _this$props9.isBounded,
          useCSSTransforms = _this$props9.useCSSTransforms,
          transformScale = _this$props9.transformScale,
          draggableCancel = _this$props9.draggableCancel,
          draggableHandle = _this$props9.draggableHandle,
          resizeHandles = _this$props9.resizeHandles,
          resizeHandle = _this$props9.resizeHandle;
      var _this$state4 = this.state,
          mounted = _this$state4.mounted,
          droppingPosition = _this$state4.droppingPosition; // Determine user manipulations possible.
      // If an item is static, it can't be manipulated by default.
      // Any properties defined directly on the grid item will take precedence.

      var draggable = typeof l.isDraggable === "boolean" ? l.isDraggable : !l.static && isDraggable;
      var resizable = typeof l.isResizable === "boolean" ? l.isResizable : !l.static && isResizable;
      var resizeHandlesOptions = l.resizeHandles || resizeHandles; // isBounded set on child if set on parent, and child is not explicitly false

      var bounded = draggable && isBounded && l.isBounded !== false;
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
        hideOnDrag: l.hideOnDrag,
        droppingPosition: isDroppingItem ? droppingPosition : undefined,
        resizeHandles: resizeHandlesOptions,
        resizeHandle: resizeHandle
      }, child);
    } // Called while dragging an element. Part of browser native drag/drop API.
    // Native event target might be the layout itself, or an element within the layout.

  }, {
    key: "render",
    value: function render()
    /*: React.Element<"div">*/
    {
      var _this2 = this;

      var _this$props10 = this.props,
          className = _this$props10.className,
          style = _this$props10.style,
          isDroppable = _this$props10.isDroppable,
          innerRef = _this$props10.innerRef,
          fillGaps = _this$props10.fillGaps;
      var mergedClassName = (0, _clsx.default)(layoutClassName, className);

      var mergedStyle = _objectSpread({
        height: this.containerHeight()
      }, style);

      return /*#__PURE__*/React.createElement("div", {
        ref: innerRef // ref={node => (this.grid = node)}
        ,
        className: mergedClassName,
        style: mergedStyle,
        onDrop: isDroppable ? this.onDrop : _utils.noop,
        onDragLeave: isDroppable ? this.onDragLeave : _utils.noop,
        onDragEnter: isDroppable ? this.onDragEnter : _utils.noop,
        onDragOver: isDroppable ? this.onDragOver : _utils.noop
      }, React.Children.map(this.props.children, function (child) {
        return _this2.processGridItem(child);
      }), isDroppable && this.state.droppingDOMNode && this.processGridItem(this.state.droppingDOMNode, true), this.placeholder(), fillGaps && this.addGaps(this.props.children));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps
    /*: Props*/
    , prevState
    /*: State*/
    )
    /*: $Shape<State> | null*/
    {
      var newLayoutBase;

      if (prevState.activeDrag) {
        return null;
      } // Legacy support for compactType
      // Allow parent to set layout directly.


      if (!(0, _lodash.default)(nextProps.layout, prevState.propsLayout) || !(0, _lodash.default)(nextProps.lastRowGap, prevState.lastRowGap) || !(0, _lodash.default)(nextProps.fillGaps, prevState.fillGaps) || nextProps.compactType !== prevState.compactType) {
        newLayoutBase = nextProps.layout;
      } else if (!(0, _utils.childrenEqual)(nextProps.children, prevState.children)) {
        // If children change, also regenerate the layout. Use our state
        // as the base in case because it may be more up to date than
        // what is in props.
        newLayoutBase = prevState.layout;
      } // We need to regenerate the layout.


      if (newLayoutBase) {
        var newLayout = (0, _utils.synchronizeLayoutWithChildren)(newLayoutBase, nextProps.children, nextProps.cols, (0, _utils.compactType)(nextProps), nextProps.allowOverlap); // When we get new griditems, we want to make sure there are no gaps stored in it

        var tempLayout = nextProps.fillGaps ? (0, _utils.fillInGaps)(newLayout, nextProps.cols, nextProps.lastRowGap, nextProps.heightUnits) : newLayout;
        return {
          layout: tempLayout,
          // We need to save these props to state for using
          // getDerivedStateFromProps instead of componentDidMount (in which we would get extra rerender)
          compactType: nextProps.compactType,
          lastRowGap: nextProps.lastRowGap,
          fillGaps: nextProps.fillGaps,
          children: nextProps.children,
          propsLayout: nextProps.layout
        };
      }

      return null;
    }
  }]);

  return ReactGridLayout;
}(React.Component);

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
  containerPadding: null,
  rowHeight: 150,
  maxRows: Infinity,
  // infinite vertical growth
  fillGaps: false,
  // fill empty spaces in grid with gapRenderFunction
  lastRowGap: false,
  // should there be a last row "gap"
  gapRenderFunction: _utils.noop,
  // the render function for the gap element
  heightUnits: 1,
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
  onDropDragOver: _utils.noop
});