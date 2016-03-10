webpackJsonp([5],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var React = __webpack_require__(5);
	var PureRenderMixin = __webpack_require__(10);
	var WidthProvider = __webpack_require__(4).WidthProvider;
	var ReactGridLayout = __webpack_require__(4);
	ReactGridLayout = WidthProvider(ReactGridLayout);

	/**
	 * This layout demonstrates how to use static grid elements.
	 * Static elements are not draggable or resizable, and cannot be moved.
	 */
	var StaticElementsLayout = React.createClass({
	  displayName: 'StaticElementsLayout',

	  mixins: [PureRenderMixin],

	  getInitialState: function getInitialState() {
	    return {};
	  },


	  onLayoutChange: function onLayoutChange(layout) {
	    this.props.onLayoutChange(layout);
	  },

	  render: function render() {
	    return _jsx(ReactGridLayout, {
	      className: 'layout',
	      onLayoutChange: this.onLayoutChange,
	      rowHeight: 30
	    }, void 0, _jsx('div', {
	      _grid: { x: 0, y: 0, w: 2, h: 3 }
	    }, '1', _jsx('span', {
	      className: 'text'
	    }, void 0, '1')), _jsx('div', {
	      _grid: { x: 2, y: 0, w: 4, h: 3, static: true }
	    }, '2', _jsx('span', {
	      className: 'text'
	    }, void 0, '2 - Static')), _jsx('div', {
	      _grid: { x: 6, y: 0, w: 2, h: 3 }
	    }, '3', _jsx('span', {
	      className: 'text'
	    }, void 0, '3')));
	  }
	});

	module.exports = StaticElementsLayout;

	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(9)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)(module)))

/***/ }
]);