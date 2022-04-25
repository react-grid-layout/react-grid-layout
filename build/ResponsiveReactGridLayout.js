"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _lodash = _interopRequireDefault(require("lodash.isequal"));

var _utils = require("./utils");

var _responsiveUtils = require("./responsiveUtils");

var _ReactGridLayout = _interopRequireDefault(require("./ReactGridLayout"));

var _excluded = ["breakpoint", "breakpoints", "cols", "layouts", "margin", "containerPadding", "onBreakpointChange", "onLayoutChange", "onWidthChange"];

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

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

// $FlowFixMe[method-unbinding]
var type = function type(obj) {
  return Object.prototype.toString.call(obj);
};
/**
 * Get a value of margin or containerPadding.
 *
 * @param  {Array | Object} param Margin | containerPadding, e.g. [10, 10] | {lg: [10, 10], ...}.
 * @param  {String} breakpoint   Breakpoint: lg, md, sm, xs and etc.
 * @return {Array}
 */


function getIndentationValue
/*:: <T: ?[number, number]>*/
(param
/*: { [key: string]: T } | T*/
, breakpoint
/*: string*/
)
/*: T*/
{
  // $FlowIgnore TODO fix this typedef
  if (param == null) return null; // $FlowIgnore TODO fix this typedef

  return Array.isArray(param) ? param : param[breakpoint];
}
/*:: type State = {
  layout: Layout,
  breakpoint: string,
  cols: number,
  layouts?: ResponsiveLayout<string>
};*/

/*:: type Props<Breakpoint: string = string> = {|
  ...React.ElementConfig<typeof ReactGridLayout>,

  // Responsive config
  breakpoint?: ?Breakpoint,
  breakpoints: Breakpoints<Breakpoint>,
  cols: { [key: Breakpoint]: number },
  layouts: ResponsiveLayout<Breakpoint>,
  width: number,
  margin: { [key: Breakpoint]: [number, number] } | [number, number],
  /* prettier-ignore *-/
  containerPadding: { [key: Breakpoint]: ?[number, number] } | ?[number, number],

  // Callbacks
  onBreakpointChange: (Breakpoint, cols: number) => void,
  onLayoutChange: OnLayoutChangeCallback,
  onWidthChange: (
    containerWidth: number,
    margin: [number, number],
    cols: number,
    containerPadding: ?[number, number]
  ) => void
|};*/

/*:: type DefaultProps = Pick<
  Props<>,
  {|
    allowOverlap: 0,
    breakpoints: 0,
    cols: 0,
    containerPadding: 0,
    layouts: 0,
    margin: 0,
    onBreakpointChange: 0,
    onLayoutChange: 0,
    onWidthChange: 0
  |}
>;*/


var ResponsiveReactGridLayout = /*#__PURE__*/function (_React$Component) {
  _inherits(ResponsiveReactGridLayout, _React$Component);

  var _super = _createSuper(ResponsiveReactGridLayout);

  function ResponsiveReactGridLayout() {
    var _this;

    _classCallCheck(this, ResponsiveReactGridLayout);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "state", _this.generateInitialState());

    _defineProperty(_assertThisInitialized(_this), "onLayoutChange", function (layout
    /*: Layout*/
    ) {
      _this.props.onLayoutChange(layout, _objectSpread(_objectSpread({}, _this.props.layouts), {}, _defineProperty({}, _this.state.breakpoint, layout)));
    });

    return _this;
  }

  _createClass(ResponsiveReactGridLayout, [{
    key: "generateInitialState",
    value: function generateInitialState()
    /*: State*/
    {
      var _this$props = this.props,
          width = _this$props.width,
          breakpoints = _this$props.breakpoints,
          layouts = _this$props.layouts,
          cols = _this$props.cols;
      var breakpoint = (0, _responsiveUtils.getBreakpointFromWidth)(breakpoints, width);
      var colNo = (0, _responsiveUtils.getColsFromBreakpoint)(breakpoint, cols); // verticalCompact compatibility, now deprecated

      var compactType = this.props.verticalCompact === false ? null : this.props.compactType; // Get the initial layout. This can tricky; we try to generate one however possible if one doesn't exist
      // for this layout.

      var initialLayout = (0, _responsiveUtils.findOrGenerateResponsiveLayout)(layouts, breakpoints, breakpoint, breakpoint, colNo, compactType);
      return {
        layout: initialLayout,
        breakpoint: breakpoint,
        cols: colNo
      };
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps
    /*: Props<*>*/
    ) {
      // Allow parent to set width or breakpoint directly.
      if (this.props.width != prevProps.width || this.props.breakpoint !== prevProps.breakpoint || !(0, _lodash.default)(this.props.breakpoints, prevProps.breakpoints) || !(0, _lodash.default)(this.props.cols, prevProps.cols)) {
        this.onWidthChange(prevProps);
      }
    } // wrap layouts so we do not need to pass layouts to child

  }, {
    key: "onWidthChange",
    value:
    /**
     * When the width changes work through breakpoints and reset state with the new width & breakpoint.
     * Width changes are necessary to figure out the widget widths.
     */
    function onWidthChange(prevProps
    /*: Props<*>*/
    ) {
      var _this$props2 = this.props,
          breakpoints = _this$props2.breakpoints,
          cols = _this$props2.cols,
          layouts = _this$props2.layouts,
          compactType = _this$props2.compactType;
      var newBreakpoint = this.props.breakpoint || (0, _responsiveUtils.getBreakpointFromWidth)(this.props.breakpoints, this.props.width);
      var lastBreakpoint = this.state.breakpoint;
      var newCols
      /*: number*/
      = (0, _responsiveUtils.getColsFromBreakpoint)(newBreakpoint, cols);

      var newLayouts = _objectSpread({}, layouts); // Breakpoint change


      if (lastBreakpoint !== newBreakpoint || prevProps.breakpoints !== breakpoints || prevProps.cols !== cols) {
        // Preserve the current layout if the current breakpoint is not present in the next layouts.
        if (!(lastBreakpoint in newLayouts)) newLayouts[lastBreakpoint] = (0, _utils.cloneLayout)(this.state.layout); // Find or generate a new layout.

        var layout = (0, _responsiveUtils.findOrGenerateResponsiveLayout)(newLayouts, breakpoints, newBreakpoint, lastBreakpoint, newCols, compactType); // This adds missing items.

        layout = (0, _utils.synchronizeLayoutWithChildren)(layout, this.props.children, newCols, compactType, this.props.allowOverlap); // Store the new layout.

        newLayouts[newBreakpoint] = layout; // callbacks

        this.props.onLayoutChange(layout, newLayouts);
        this.props.onBreakpointChange(newBreakpoint, newCols);
        this.setState({
          breakpoint: newBreakpoint,
          layout: layout,
          cols: newCols
        });
      }

      var margin = getIndentationValue(this.props.margin, newBreakpoint);
      var containerPadding = getIndentationValue(this.props.containerPadding, newBreakpoint); //call onWidthChange on every change of width, not only on breakpoint changes

      this.props.onWidthChange(this.props.width, margin, newCols, containerPadding);
    }
  }, {
    key: "render",
    value: function render()
    /*: React.Element<typeof ReactGridLayout>*/
    {
      /* eslint-disable no-unused-vars */
      var _this$props3 = this.props,
          breakpoint = _this$props3.breakpoint,
          breakpoints = _this$props3.breakpoints,
          cols = _this$props3.cols,
          layouts = _this$props3.layouts,
          margin = _this$props3.margin,
          containerPadding = _this$props3.containerPadding,
          onBreakpointChange = _this$props3.onBreakpointChange,
          onLayoutChange = _this$props3.onLayoutChange,
          onWidthChange = _this$props3.onWidthChange,
          other = _objectWithoutProperties(_this$props3, _excluded);
      /* eslint-enable no-unused-vars */


      return /*#__PURE__*/React.createElement(_ReactGridLayout.default, _extends({}, other, {
        // $FlowIgnore should allow nullable here due to DefaultProps
        margin: getIndentationValue(margin, this.state.breakpoint),
        containerPadding: getIndentationValue(containerPadding, this.state.breakpoint),
        onLayoutChange: this.onLayoutChange,
        layout: this.state.layout,
        cols: this.state.cols
      }));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps
    /*: Props<*>*/
    , prevState
    /*: State*/
    )
    /*: ?$Shape<State>*/
    {
      if (!(0, _lodash.default)(nextProps.layouts, prevState.layouts)) {
        // Allow parent to set layouts directly.
        var breakpoint = prevState.breakpoint,
            _cols = prevState.cols; // Since we're setting an entirely new layout object, we must generate a new responsive layout
        // if one does not exist.

        var newLayout = (0, _responsiveUtils.findOrGenerateResponsiveLayout)(nextProps.layouts, nextProps.breakpoints, breakpoint, breakpoint, _cols, nextProps.compactType);
        return {
          layout: newLayout,
          layouts: nextProps.layouts
        };
      }

      return null;
    }
  }]);

  return ResponsiveReactGridLayout;
}(React.Component);

exports.default = ResponsiveReactGridLayout;

_defineProperty(ResponsiveReactGridLayout, "propTypes", {
  //
  // Basic props
  //
  // Optional, but if you are managing width yourself you may want to set the breakpoint
  // yourself as well.
  breakpoint: _propTypes.default.string,
  // {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
  breakpoints: _propTypes.default.object,
  allowOverlap: _propTypes.default.bool,
  // # of cols. This is a breakpoint -> cols map
  cols: _propTypes.default.object,
  // # of margin. This is a breakpoint -> margin map
  // e.g. { lg: [5, 5], md: [10, 10], sm: [15, 15] }
  // Margin between items [x, y] in px
  // e.g. [10, 10]
  margin: _propTypes.default.oneOfType([_propTypes.default.array, _propTypes.default.object]),
  // # of containerPadding. This is a breakpoint -> containerPadding map
  // e.g. { lg: [5, 5], md: [10, 10], sm: [15, 15] }
  // Padding inside the container [x, y] in px
  // e.g. [10, 10]
  containerPadding: _propTypes.default.oneOfType([_propTypes.default.array, _propTypes.default.object]),
  // layouts is an object mapping breakpoints to layouts.
  // e.g. {lg: Layout, md: Layout, ...}
  layouts: function layouts(props
  /*: Props<>*/
  , propName
  /*: string*/
  ) {
    if (type(props[propName]) !== "[object Object]") {
      throw new Error("Layout property must be an object. Received: " + type(props[propName]));
    }

    Object.keys(props[propName]).forEach(function (key) {
      if (!(key in props.breakpoints)) {
        throw new Error("Each key in layouts must align with a key in breakpoints.");
      }

      (0, _utils.validateLayout)(props.layouts[key], "layouts." + key);
    });
  },
  // The width of this component.
  // Required in this propTypes stanza because generateInitialState() will fail without it.
  width: _propTypes.default.number.isRequired,
  //
  // Callbacks
  //
  // Calls back with breakpoint and new # cols
  onBreakpointChange: _propTypes.default.func,
  // Callback so you can save the layout.
  // Calls back with (currentLayout, allLayouts). allLayouts are keyed by breakpoint.
  onLayoutChange: _propTypes.default.func,
  // Calls back with (containerWidth, margin, cols, containerPadding)
  onWidthChange: _propTypes.default.func
});

_defineProperty(ResponsiveReactGridLayout, "defaultProps", {
  breakpoints: {
    lg: 1200,
    md: 996,
    sm: 768,
    xs: 480,
    xxs: 0
  },
  cols: {
    lg: 12,
    md: 10,
    sm: 6,
    xs: 4,
    xxs: 2
  },
  containerPadding: {
    lg: null,
    md: null,
    sm: null,
    xs: null,
    xxs: null
  },
  layouts: {},
  margin: [10, 10],
  allowOverlap: false,
  onBreakpointChange: _utils.noop,
  onLayoutChange: _utils.noop,
  onWidthChange: _utils.noop
});