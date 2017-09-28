webpackJsonp([2],{

/***/ 55:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global, module) {

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
var originalLayout = getFromLS('layout') || [];
/**
 * This layout demonstrates how to sync to localstorage.
 */

var LocalStorageLayout = function (_React$PureComponent) {
  _inherits(LocalStorageLayout, _React$PureComponent);

  function LocalStorageLayout(props) {
    _classCallCheck(this, LocalStorageLayout);

    var _this = _possibleConstructorReturn(this, _React$PureComponent.call(this, props));

    _this.state = {
      layout: JSON.parse(JSON.stringify(originalLayout))
    };

    _this.onLayoutChange = _this.onLayoutChange.bind(_this);
    _this.resetLayout = _this.resetLayout.bind(_this);
    return _this;
  }

  LocalStorageLayout.prototype.resetLayout = function resetLayout() {
    this.setState({
      layout: []
    });
  };

  LocalStorageLayout.prototype.onLayoutChange = function onLayoutChange(layout) {
    /*eslint no-console: 0*/
    saveToLS('layout', layout);
    this.setState({ layout: layout });
    this.props.onLayoutChange(layout); // updates status display
  };

  LocalStorageLayout.prototype.render = function render() {
    return _jsx('div', {}, void 0, _jsx('button', {
      onClick: this.resetLayout
    }, void 0, 'Reset Layout'), _react2.default.createElement(
      ReactGridLayout,
      _extends({
        ref: 'rgl'
      }, this.props, {
        layout: this.state.layout,
        onLayoutChange: this.onLayoutChange }),
      _jsx('div', {
        'data-grid': { w: 2, h: 3, x: 0, y: 0 }
      }, '1', _jsx('span', {
        className: 'text'
      }, void 0, '1')),
      _jsx('div', {
        'data-grid': { w: 2, h: 3, x: 2, y: 0 }
      }, '2', _jsx('span', {
        className: 'text'
      }, void 0, '2')),
      _jsx('div', {
        'data-grid': { w: 2, h: 3, x: 4, y: 0 }
      }, '3', _jsx('span', {
        className: 'text'
      }, void 0, '3')),
      _jsx('div', {
        'data-grid': { w: 2, h: 3, x: 6, y: 0 }
      }, '4', _jsx('span', {
        className: 'text'
      }, void 0, '4')),
      _jsx('div', {
        'data-grid': { w: 2, h: 3, x: 8, y: 0 }
      }, '5', _jsx('span', {
        className: 'text'
      }, void 0, '5'))
    ));
  };

  return LocalStorageLayout;
}(_react2.default.PureComponent);

LocalStorageLayout.defaultProps = {
  className: "layout",
  cols: 12,
  rowHeight: 30,
  onLayoutChange: function onLayoutChange() {}
};


function getFromLS(key) {
  var ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem('rgl-7')) || {};
    } catch (e) {/*Ignore*/}
  }
  return ls[key];
}

function saveToLS(key, value) {
  if (global.localStorage) {
    var _JSON$stringify;

    global.localStorage.setItem('rgl-7', JSON.stringify((_JSON$stringify = {}, _JSON$stringify[key] = value, _JSON$stringify)));
  }
}

module.exports = LocalStorageLayout;

if (__webpack_require__.c[__webpack_require__.s] === module) {
  __webpack_require__(4)(module.exports);
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7), __webpack_require__(2)(module)))

/***/ })

},[55]);