webpackJsonp([3],{

/***/ 54:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactGridLayout = __webpack_require__(3);

var _lodash = __webpack_require__(5);

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ResponsiveReactGridLayout = (0, _reactGridLayout.WidthProvider)(_reactGridLayout.Responsive);

/**
 * This layout demonstrates how to use a grid with a dynamic number of elements.
 */

var AddRemoveLayout = function (_React$PureComponent) {
  _inherits(AddRemoveLayout, _React$PureComponent);

  function AddRemoveLayout(props) {
    _classCallCheck(this, AddRemoveLayout);

    var _this = _possibleConstructorReturn(this, _React$PureComponent.call(this, props));

    _this.state = {
      items: [0, 1, 2, 3, 4].map(function (i, key, list) {
        return { i: i.toString(), x: i * 2, y: 0, w: 2, h: 2, add: i === (list.length - 1).toString() };
      }),
      newCounter: 0
    };

    _this.onAddItem = _this.onAddItem.bind(_this);
    return _this;
  }

  AddRemoveLayout.prototype.createElement = function createElement(el) {
    var removeStyle = {
      position: 'absolute',
      right: '2px',
      top: 0,
      cursor: 'pointer'
    };
    var i = el.add ? '+' : el.i;
    return _jsx('div', {
      'data-grid': el
    }, i, el.add ? _jsx('span', {
      className: 'add text',
      onClick: this.onAddItem,
      title: 'You can add an item by clicking here, too.'
    }, void 0, 'Add +') : _jsx('span', {
      className: 'text'
    }, void 0, i), _jsx('span', {
      className: 'remove',
      style: removeStyle,
      onClick: this.onRemoveItem.bind(this, i)
    }, void 0, 'x'));
  };

  AddRemoveLayout.prototype.onAddItem = function onAddItem() {
    /*eslint no-console: 0*/
    console.log('adding', 'n' + this.state.newCounter);
    this.setState({
      // Add a new item. It must have a unique key!
      items: this.state.items.concat({
        i: 'n' + this.state.newCounter,
        x: this.state.items.length * 2 % (this.state.cols || 12),
        y: Infinity, // puts it at the bottom
        w: 2,
        h: 2
      }),
      // Increment the counter to ensure key is always unique.
      newCounter: this.state.newCounter + 1
    });
  };

  // We're using the cols coming back from this to calculate where to add new items.


  AddRemoveLayout.prototype.onBreakpointChange = function onBreakpointChange(breakpoint, cols) {
    this.setState({
      breakpoint: breakpoint,
      cols: cols
    });
  };

  AddRemoveLayout.prototype.onLayoutChange = function onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
    this.setState({ layout: layout });
  };

  AddRemoveLayout.prototype.onRemoveItem = function onRemoveItem(i) {
    console.log('removing', i);
    this.setState({ items: _lodash2.default.reject(this.state.items, { i: i }) });
  };

  AddRemoveLayout.prototype.render = function render() {
    var _this2 = this;

    return _jsx('div', {}, void 0, _jsx('button', {
      onClick: this.onAddItem
    }, void 0, 'Add Item'), _react2.default.createElement(
      ResponsiveReactGridLayout,
      _extends({ onLayoutChange: this.onLayoutChange, onBreakpointChange: this.onBreakpointChange
      }, this.props),
      _lodash2.default.map(this.state.items, function (el) {
        return _this2.createElement(el);
      })
    ));
  };

  return AddRemoveLayout;
}(_react2.default.PureComponent);

AddRemoveLayout.defaultProps = {
  className: "layout",
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  rowHeight: 100
};


module.exports = AddRemoveLayout;

if (__webpack_require__.c[__webpack_require__.s] === module) {
  __webpack_require__(4)(module.exports);
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)(module)))

/***/ })

},[54]);