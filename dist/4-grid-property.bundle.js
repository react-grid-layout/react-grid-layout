webpackJsonp([5],{

/***/ 52:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = __webpack_require__(5);

var _lodash2 = _interopRequireDefault(_lodash);

var _reactGridLayout = __webpack_require__(3);

var _reactGridLayout2 = _interopRequireDefault(_reactGridLayout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReactGridLayout = (0, _reactGridLayout.WidthProvider)(_reactGridLayout2.default);

var GridPropertyLayout = function (_React$PureComponent) {
  _inherits(GridPropertyLayout, _React$PureComponent);

  function GridPropertyLayout() {
    _classCallCheck(this, GridPropertyLayout);

    return _possibleConstructorReturn(this, _React$PureComponent.apply(this, arguments));
  }

  GridPropertyLayout.prototype.generateDOM = function generateDOM() {
    // Generate items with properties from the layout, rather than pass the layout directly
    var layout = this.generateLayout();
    return _lodash2.default.map(_lodash2.default.range(this.props.items), function (i) {
      return _jsx('div', {
        'data-grid': layout[i]
      }, i, _jsx('span', {
        className: 'text'
      }, void 0, i));
    });
  };

  GridPropertyLayout.prototype.generateLayout = function generateLayout() {
    var p = this.props;
    return _lodash2.default.map(new Array(p.items), function (item, i) {
      var w = _lodash2.default.result(p, 'w') || Math.ceil(Math.random() * 4);
      var y = _lodash2.default.result(p, 'y') || Math.ceil(Math.random() * 4) + 1;
      return { x: i * 2 % 12, y: Math.floor(i / 6) * y, w: w, h: y, i: i.toString() };
    });
  };

  GridPropertyLayout.prototype.onLayoutChange = function onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
  };

  GridPropertyLayout.prototype.render = function render() {
    return _react2.default.createElement(
      ReactGridLayout,
      _extends({ onLayoutChange: this.onLayoutChange
      }, this.props),
      this.generateDOM()
    );
  };

  return GridPropertyLayout;
}(_react2.default.PureComponent);

GridPropertyLayout.propTypes = {
  onLayoutChange: _propTypes2.default.func.isRequired
};
GridPropertyLayout.defaultProps = {
  isDraggable: true,
  isResizable: true,
  items: 20,
  rowHeight: 30,
  onLayoutChange: function onLayoutChange() {},
  cols: 12
};


module.exports = GridPropertyLayout;

if (__webpack_require__.c[__webpack_require__.s] === module) {
  __webpack_require__(4)(module.exports);
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)(module)))

/***/ })

},[52]);