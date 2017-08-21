'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _class, _class2, _temp2;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _ResponsiveReactGridLayout = require('./ResponsiveReactGridLayout');

var _ResponsiveReactGridLayout2 = _interopRequireDefault(_ResponsiveReactGridLayout);

var _reactResizable = require('react-resizable');

var _reactDimensions = require('react-dimensions');

var _reactDimensions2 = _interopRequireDefault(_reactDimensions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AutoSizeLayout = (_dec = (0, _reactDimensions2.default)({
    containerStyle: {
        width: '100%',
        height: '100%',
        padding: 0,
        border: 0,
        display: 'flex',
        justifyContent: 'center'
    }
}), _dec(_class = (_temp2 = _class2 = function (_React$Component) {
    _inherits(AutoSizeLayout, _React$Component);

    function AutoSizeLayout() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, AutoSizeLayout);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = AutoSizeLayout.__proto__ || Object.getPrototypeOf(AutoSizeLayout)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            width: _this.props.containerWidth,
            height: _this.props.containerHeight
        }, _this.componentDidMount = function () {
            return window.addEventListener("resize", _this.onBrowserResize);
        }, _this.componentWillUnmount = function () {
            return window.removeEventListener("resize", _this.onBrowserResize);
        }, _this.render = function () {
            return _jsx(_reactResizable.ResizableBox, {
                width: _this.props.width || _this.props.containerWidth,
                height: _this.props.height || _this.props.containerHeight,
                minConstraints: _this.props.minConstraints,
                maxConstraints: _this.props.maxConstraints,
                onResize: _this.onResize,
                onMouseDown: _this.props.onMouseDown
            }, void 0, _react2.default.createElement(
                _ResponsiveReactGridLayout2.default,
                _extends({}, _this.props, {
                    width: _this.state.width,
                    height: _this.state.height,
                    initialWidth: _this.props.width }),
                _this.props.children
            ));
        }, _this.onResize = function (event, data) {
            return _this.setState({ width: data.size.width, height: data.size.height });
        }, _this.onBrowserResize = function (event) {
            return _this.setState({ width: _this.props.containerWidth, height: _this.props.containerHeight });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(AutoSizeLayout, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.width !== this.props.width) {
                this.setState({ width: nextProps.width });
            }
        }
    }]);

    return AutoSizeLayout;
}(_react2.default.Component), _class2.propTypes = {
    width: _propTypes2.default.number,
    minConstraints: _propTypes2.default.array,
    maxConstraints: _propTypes2.default.array
}, _class2.defaultProps = {
    onDrop: function onDrop() {}
}, _temp2)) || _class);
exports.default = AutoSizeLayout;