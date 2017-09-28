webpackJsonp([4],{

/***/ 53:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {

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

/**
 * This layout demonstrates how to use static grid elements.
 * Static elements are not draggable or resizable, and cannot be moved.
 */

var StaticElementsLayout = function (_React$PureComponent) {
  _inherits(StaticElementsLayout, _React$PureComponent);

  function StaticElementsLayout(props) {
    _classCallCheck(this, StaticElementsLayout);

    var _this = _possibleConstructorReturn(this, _React$PureComponent.call(this, props));

    _this.onLayoutChange = _this.onLayoutChange.bind(_this);
    return _this;
  }

  StaticElementsLayout.prototype.onLayoutChange = function onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
  };

  StaticElementsLayout.prototype.render = function render() {
    return _jsx(ReactGridLayout, {
      className: 'layout',
      onLayoutChange: this.onLayoutChange,
      rowHeight: 30
    }, void 0, _jsx('div', {
      'data-grid': { x: 0, y: 0, w: 2, h: 3 }
    }, '1', _jsx('span', {
      className: 'text'
    }, void 0, '1')), _jsx('div', {
      'data-grid': { x: 2, y: 0, w: 4, h: 3, static: true }
    }, '2', _jsx('span', {
      className: 'text'
    }, void 0, '2 - Static')), _jsx('div', {
      'data-grid': { x: 6, y: 0, w: 2, h: 3 }
    }, '3', _jsx('span', {
      className: 'text'
    }, void 0, '3')), _jsx('div', {
      'data-grid': { x: 8, y: 0, w: 4, h: 3, draggableHandle: '.react-grid-dragHandleExample' }
    }, '4', _jsx('span', {
      className: 'text'
    }, void 0, '4 - Draggable with Handle', _jsx('hr', {}), _jsx('hr', {}), _jsx('span', {
      className: 'react-grid-dragHandleExample'
    }, void 0, '[DRAG HERE]'), _jsx('hr', {}), _jsx('hr', {}))));
  };

  return StaticElementsLayout;
}(_react2.default.PureComponent);

module.exports = StaticElementsLayout;

if (__webpack_require__.c[__webpack_require__.s] === module) {
  __webpack_require__(4)(module.exports);
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)(module)))

/***/ })

},[53]);