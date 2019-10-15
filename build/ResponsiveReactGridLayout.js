"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _lodash = _interopRequireDefault(require("lodash.isequal"));

var _utils = require("./utils");

var _responsiveUtils = require("./responsiveUtils");

var _ReactGridLayout = _interopRequireDefault(require("./ReactGridLayout"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

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


function getIndentationValue(param
/*: { [key: string]: [number, number] } | [number, number]*/
, breakpoint
/*: string*/
) {
  return Array.isArray(param) ? param : param[breakpoint];
}
/*:: type State = {
  layout: Layout,
  breakpoint: string,
  cols: number,
  layouts?: { [key: string]: Layout }
};*/

/*:: type Props<Breakpoint: string = string> = {
  ...$Exact<RGLProps>,

  // Responsive config
  breakpoint: Breakpoint,
  breakpoints: { [key: Breakpoint]: number },
  cols: { [key: Breakpoint]: number },
  layouts: { [key: Breakpoint]: Layout },
  width: number,
  margin: { [key: Breakpoint]: [number, number] } | [number, number],
  containerPadding: { [key: Breakpoint]: [number, number] } | [number, number],

  // Callbacks
  onBreakpointChange: (Breakpoint, cols: number) => void,
  onLayoutChange: (Layout, { [key: Breakpoint]: Layout }) => void,
  onWidthChange: (
    containerWidth: number,
    margin: [number, number],
    cols: number,
    containerPadding: [number, number] | null
  ) => void
};*/


var ResponsiveReactGridLayout =
/*#__PURE__*/
function (_React$Component) {
  _inherits(ResponsiveReactGridLayout, _React$Component);

  function ResponsiveReactGridLayout() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, ResponsiveReactGridLayout);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(ResponsiveReactGridLayout)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "state", _this.generateInitialState());

    _defineProperty(_assertThisInitialized(_this), "onLayoutChange", function (layout
    /*: Layout*/
    ) {
      _this.props.onLayoutChange(layout, _objectSpread({}, _this.props.layouts, _defineProperty({}, _this.state.breakpoint, layout)));
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
        this.onWidthChange(this.props);
      }
    } // wrap layouts so we do not need to pass layouts to child

  }, {
    key: "onWidthChange",

    /**
     * When the width changes work through breakpoints and reset state with the new width & breakpoint.
     * Width changes are necessary to figure out the widget widths.
     */
    value: function onWidthChange(nextProps
    /*: Props<*>*/
    ) {
      var breakpoints = nextProps.breakpoints,
          cols = nextProps.cols,
          layouts = nextProps.layouts,
          compactType = nextProps.compactType;
      var newBreakpoint = nextProps.breakpoint || (0, _responsiveUtils.getBreakpointFromWidth)(nextProps.breakpoints, nextProps.width);
      var lastBreakpoint = this.state.breakpoint;
      var newCols
      /*: number*/
      = (0, _responsiveUtils.getColsFromBreakpoint)(newBreakpoint, cols); // Breakpoint change

      if (lastBreakpoint !== newBreakpoint || this.props.breakpoints !== breakpoints || this.props.cols !== cols) {
        // Preserve the current layout if the current breakpoint is not present in the next layouts.
        if (!(lastBreakpoint in layouts)) layouts[lastBreakpoint] = (0, _utils.cloneLayout)(this.state.layout); // Find or generate a new layout.

        var layout = (0, _responsiveUtils.findOrGenerateResponsiveLayout)(layouts, breakpoints, newBreakpoint, lastBreakpoint, newCols, compactType); // This adds missing items.

        layout = (0, _utils.synchronizeLayoutWithChildren)(layout, nextProps.children, newCols, compactType); // Store the new layout.

        layouts[newBreakpoint] = layout; // callbacks

        this.props.onLayoutChange(layout, layouts);
        this.props.onBreakpointChange(newBreakpoint, newCols);
        this.setState({
          breakpoint: newBreakpoint,
          layout: layout,
          cols: newCols
        });
      }

      var margin = getIndentationValue(nextProps.margin, newBreakpoint);
      var containerPadding = getIndentationValue(nextProps.containerPadding, newBreakpoint); //call onWidthChange on every change of width, not only on breakpoint changes

      this.props.onWidthChange(nextProps.width, margin, newCols, containerPadding);
    }
  }, {
    key: "render",
    value: function render() {
      /* eslint-disable no-unused-vars */
      var _this$props2 = this.props,
          breakpoint = _this$props2.breakpoint,
          breakpoints = _this$props2.breakpoints,
          cols = _this$props2.cols,
          layouts = _this$props2.layouts,
          margin = _this$props2.margin,
          containerPadding = _this$props2.containerPadding,
          onBreakpointChange = _this$props2.onBreakpointChange,
          onLayoutChange = _this$props2.onLayoutChange,
          onWidthChange = _this$props2.onWidthChange,
          other = _objectWithoutProperties(_this$props2, ["breakpoint", "breakpoints", "cols", "layouts", "margin", "containerPadding", "onBreakpointChange", "onLayoutChange", "onWidthChange"]);
      /* eslint-enable no-unused-vars */


      return _react.default.createElement(_ReactGridLayout.default, _extends({}, other, {
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
    ) {
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
}(_react.default.Component);

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
  layouts: {},
  margin: [10, 10],
  containerPadding: {
    lg: null,
    md: null,
    sm: null,
    xs: null,
    xxs: null
  },
  onBreakpointChange: _utils.noop,
  onLayoutChange: _utils.noop,
  onWidthChange: _utils.noop
});