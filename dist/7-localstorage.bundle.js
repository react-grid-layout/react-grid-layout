webpackJsonp([3],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module) {'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var React = __webpack_require__(4);
	var PureRenderMixin = __webpack_require__(10);
	var WidthProvider = __webpack_require__(3).WidthProvider;
	var ReactGridLayout = __webpack_require__(3);
	ReactGridLayout = WidthProvider(ReactGridLayout);

	var originalLayout = getFromLS('layout') || [];
	/**
	 * This layout demonstrates how to sync to localstorage.
	 */
	var LocalStorageLayout = React.createClass({
	  displayName: 'LocalStorageLayout',

	  mixins: [PureRenderMixin],

	  getDefaultProps: function getDefaultProps() {
	    return {
	      className: "layout",
	      cols: 12,
	      rowHeight: 30
	    };
	  },
	  getInitialState: function getInitialState() {
	    return {
	      layout: JSON.parse(JSON.stringify(originalLayout))
	    };
	  },
	  resetLayout: function resetLayout() {
	    this.setState({
	      layout: []
	    });
	  },
	  onLayoutChange: function onLayoutChange(layout) {
	    /*eslint no-console: 0*/
	    saveToLS('layout', layout);
	    this.setState({ layout: layout });
	    this.props.onLayoutChange(layout); // updates status display
	  },
	  render: function render() {
	    return _jsx('div', {}, void 0, _jsx('button', {
	      onClick: this.resetLayout
	    }, void 0, 'Reset Layout'), React.createElement(
	      ReactGridLayout,
	      _extends({
	        ref: 'rgl'
	      }, this.props, {
	        layout: this.state.layout,
	        onLayoutChange: this.onLayoutChange }),
	      _jsx('div', {
	        _grid: { w: 2, h: 3, x: 0, y: 0 }
	      }, '1', _jsx('span', {
	        className: 'text'
	      }, void 0, '1')),
	      _jsx('div', {
	        _grid: { w: 2, h: 3, x: 2, y: 0 }
	      }, '2', _jsx('span', {
	        className: 'text'
	      }, void 0, '2')),
	      _jsx('div', {
	        _grid: { w: 2, h: 3, x: 4, y: 0 }
	      }, '3', _jsx('span', {
	        className: 'text'
	      }, void 0, '3')),
	      _jsx('div', {
	        _grid: { w: 2, h: 3, x: 6, y: 0 }
	      }, '4', _jsx('span', {
	        className: 'text'
	      }, void 0, '4')),
	      _jsx('div', {
	        _grid: { w: 2, h: 3, x: 8, y: 0 }
	      }, '5', _jsx('span', {
	        className: 'text'
	      }, void 0, '5'))
	    ));
	  }
	});

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

	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(9)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(7)(module)))

/***/ }
]);