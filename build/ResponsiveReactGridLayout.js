'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp2; /* eslint-disable no-unused-vars,react/prop-types */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('./utils');

var _responsiveUtils = require('./responsiveUtils');

var _ReactGridLayout = require('./ReactGridLayout');

var _ReactGridLayout2 = _interopRequireDefault(_ReactGridLayout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var type = function type(obj) {
    return Object.prototype.toString.call(obj);
};
var noop = function noop() {};

var ResponsiveReactGridLayout = (_temp2 = _class = function (_React$Component) {
    _inherits(ResponsiveReactGridLayout, _React$Component);

    function ResponsiveReactGridLayout() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, ResponsiveReactGridLayout);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ResponsiveReactGridLayout.__proto__ || Object.getPrototypeOf(ResponsiveReactGridLayout)).call.apply(_ref, [this].concat(args))), _this), _this.state = _this.generateInitialState(), _this.onLayoutChange = function (layout) {
            _this.props.onLayoutChange(layout, _extends({}, _this.props.layouts, _defineProperty({}, _this.state.breakpoint, layout)));
            _this.setState({ layout: layout });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    // This should only include propTypes needed in this code; RGL itself
    // will do validation of the rest props passed to it.


    _createClass(ResponsiveReactGridLayout, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            // Allow parent to set width or breakpoint directly.
            if (nextProps.width !== this.props.width || nextProps.breakpoint !== this.props.breakpoint || !(0, _lodash2.default)(nextProps.breakpoints, this.props.breakpoints) || !(0, _lodash2.default)(nextProps.cols, this.props.cols)) {
                this.updateWidth(nextProps);
            }

            // Allow parent to set layouts directly.
            else if (!(0, _lodash2.default)(nextProps.layouts, this.props.layouts)) {
                    var _state = this.state,
                        breakpoint = _state.breakpoint,
                        cols = _state.cols;

                    // Since we're setting an entirely new layout object, we must generate a new responsive layout
                    // if one does not exist.

                    var newLayout = (0, _responsiveUtils.getResponsiveLayout)(nextProps.layouts, nextProps.breakpoints, breakpoint, breakpoint, cols, nextProps.verticalCompact);
                    this.setState({ layout: newLayout });
                }
        }
    }, {
        key: 'render',
        value: function render() {
            // eslint-disable-next-line no-unused-vars
            var _props = this.props,
                breakpoint = _props.breakpoint,
                breakpoints = _props.breakpoints,
                cols = _props.cols,
                layouts = _props.layouts,
                onBreakpointChange = _props.onBreakpointChange,
                onLayoutChange = _props.onLayoutChange,
                onWidthChange = _props.onWidthChange,
                width = _props.width,
                other = _objectWithoutProperties(_props, ['breakpoint', 'breakpoints', 'cols', 'layouts', 'onBreakpointChange', 'onLayoutChange', 'onWidthChange', 'width']);

            return _react2.default.createElement(_ReactGridLayout2.default, _extends({}, other, {
                width: this.state.width,
                breakpoint: this.state.breakpoint,
                onLayoutChange: this.onLayoutChange,
                layout: this.state.layout,
                cols: this.state.cols }));
        }
    }, {
        key: 'generateInitialState',
        value: function generateInitialState() {
            var _props2 = this.props,
                breakpoints = _props2.breakpoints,
                layouts = _props2.layouts,
                verticalCompact = _props2.verticalCompact,
                cols = _props2.cols;

            var width = this.props.initialWidth || this.props.width;
            var breakpoint = (0, _responsiveUtils.getBreakpointFromWidth)(breakpoints, width);
            var colNo = (0, _responsiveUtils.getColsFromBreakpoint)(breakpoint, cols);
            // Get the initial layout. This can tricky; we try to generate one however possible if one doesn't exist
            // for this layout.
            var layout = (0, _responsiveUtils.getResponsiveLayout)(layouts, breakpoints, breakpoint, breakpoint, colNo, verticalCompact);

            return {
                layout: layout,
                breakpoint: breakpoint,
                cols: colNo,
                width: width
            };
        }
    }, {
        key: 'updateWidth',


        /**
         * When the width changes work through breakpoints and reset state with the new width & breakpoint.
         * Width changes are necessary to figure out the widget widths.
         */
        value: function updateWidth(nextProps) {
            var newBreakpoint = nextProps.breakpoint || (0, _responsiveUtils.getBreakpointFromWidth)(nextProps.breakpoints, nextProps.width);
            var isBreakPointChanged = this.isBreakpointChanged(newBreakpoint, nextProps);

            if (isBreakPointChanged) {
                this.updateBreakpoint(newBreakpoint, nextProps);
                return;
            }

            this.setState({ width: nextProps.width });
        }
    }, {
        key: 'isBreakpointChanged',
        value: function isBreakpointChanged(newBreakpoint, _ref2) {
            var breakpoints = _ref2.breakpoints,
                cols = _ref2.cols;

            return this.state.breakpoint !== newBreakpoint || this.props.breakpoints !== breakpoints || this.props.cols !== cols;
        }
    }, {
        key: 'updateBreakpoint',
        value: function updateBreakpoint(breakpoint, _ref3) {
            var breakpoints = _ref3.breakpoints,
                cols = _ref3.cols,
                layouts = _ref3.layouts,
                verticalCompact = _ref3.verticalCompact,
                children = _ref3.children,
                margin = _ref3.margin,
                width = _ref3.width,
                containerPadding = _ref3.containerPadding;

            var newCols = (0, _responsiveUtils.getColsFromBreakpoint)(breakpoint, cols);
            var layout = (0, _responsiveUtils.getResponsiveLayout)(layouts, breakpoints, breakpoint, this.state.breakpoint, newCols, verticalCompact);
            layout = (0, _utils.synchronizeLayoutWithChildren)(layout, children, newCols, verticalCompact, breakpoint);

            this.props.onLayoutChange(layout, layouts);
            this.props.onBreakpointChange(breakpoint, newCols);
            this.props.onWidthChange(width, margin, newCols, containerPadding);

            this.setState({
                breakpoint: breakpoint,
                layout: layout,
                cols: newCols,
                width: width
            });
        }
    }]);

    return ResponsiveReactGridLayout;
}(_react2.default.Component), _class.propTypes = {

    // {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
    breakpoints: _propTypes2.default.object,

    // # of cols. This is a breakpoint -> cols map
    cols: _propTypes2.default.object,

    // layouts is an object mapping breakpoints to layouts.
    // e.g. {lg, md, ...}
    layouts: function layouts(props, propName) {
        if (type(props[propName]) !== '[object Object]') {
            throw new Error('Layout property must be an object. Received: ' + type(props[propName]));
        }
        Object.keys(props[propName]).forEach(function (key) {
            if (!(key in props.breakpoints)) {
                throw new Error('Each key in layouts must align with a key in breakpoints.');
            }
            (0, _utils.validateLayout)(props.layouts[key], 'layouts.' + key);
        });
    },


    initialWidth: _propTypes2.default.number.isRequired,
    // The width of this component.
    // Required in this propTypes stanza because generateInitialState() will fail without it.
    width: _propTypes2.default.number.isRequired,

    //
    // Callbacks
    //

    // Calls back with breakpoint and new # cols
    onBreakpointChange: _propTypes2.default.func,

    // Callback so you can save the layout.
    // Calls back with (currentLayout, allLayouts). allLayouts are keyed by breakpoint.
    onLayoutChange: _propTypes2.default.func,

    // Calls back with (containerWidth, margin, cols, containerPadding)
    onWidthChange: _propTypes2.default.func,
    static: _propTypes2.default.bool
}, _class.defaultProps = {
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    layouts: {},
    onBreakpointChange: noop,
    onLayoutChange: noop,
    onWidthChange: noop,
    static: false
}, _temp2);
exports.default = ResponsiveReactGridLayout;