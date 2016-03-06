webpackJsonp([2],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module) {'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var React = __webpack_require__(5);
	var PureRenderMixin = __webpack_require__(10);
	var WidthProvider = __webpack_require__(4).WidthProvider;
	var ResponsiveReactGridLayout = __webpack_require__(4).Responsive;
	ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

	var originalLayouts = getFromLS('layouts');
	/**
	 * This layout demonstrates how to sync multiple responsive layouts to localstorage.
	 */
	var ResponsiveLocalStorageLayout = React.createClass({
	  displayName: 'ResponsiveLocalStorageLayout',

	  mixins: [PureRenderMixin],

	  getDefaultProps: function getDefaultProps() {
	    return {
	      className: "layout",
	      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
	      rowHeight: 30
	    };
	  },
	  getInitialState: function getInitialState() {
	    return {
	      layouts: JSON.parse(JSON.stringify(originalLayouts))
	    };
	  },
	  resetLayout: function resetLayout() {
	    this.refs.rrgl.setState({
	      layouts: JSON.parse(JSON.stringify(originalLayouts))
	    });
	  },
	  _saveToLocalStorage: function _saveToLocalStorage() {
	    saveToLS('layouts', this.state.layouts);
	  },
	  onLayoutChange: function onLayoutChange(layout, layouts) {
	    this._saveToLocalStorage();
	    this.props.onLayoutChange(layout, layouts);
	  },
	  render: function render() {
	    return React.createElement(
	      'div',
	      null,
	      React.createElement(
	        'button',
	        { onClick: this.resetLayout },
	        'Reset Layout'
	      ),
	      React.createElement(
	        ResponsiveReactGridLayout,
	        _extends({
	          ref: 'rrgl'
	        }, this.props, {
	          layouts: this.state.layouts,
	          onLayoutChange: this.onLayoutChange }),
	        React.createElement(
	          'div',
	          { key: '1', _grid: { w: 2, h: 3, x: 0, y: 0 } },
	          React.createElement(
	            'span',
	            { className: 'text' },
	            '1'
	          )
	        ),
	        React.createElement(
	          'div',
	          { key: '2', _grid: { w: 2, h: 3, x: 2, y: 0 } },
	          React.createElement(
	            'span',
	            { className: 'text' },
	            '2'
	          )
	        ),
	        React.createElement(
	          'div',
	          { key: '3', _grid: { w: 2, h: 3, x: 4, y: 0 } },
	          React.createElement(
	            'span',
	            { className: 'text' },
	            '3'
	          )
	        ),
	        React.createElement(
	          'div',
	          { key: '4', _grid: { w: 2, h: 3, x: 6, y: 0 } },
	          React.createElement(
	            'span',
	            { className: 'text' },
	            '4'
	          )
	        ),
	        React.createElement(
	          'div',
	          { key: '5', _grid: { w: 2, h: 3, x: 8, y: 0 } },
	          React.createElement(
	            'span',
	            { className: 'text' },
	            '5'
	          )
	        )
	      )
	    );
	  }
	});

	module.exports = ResponsiveLocalStorageLayout;

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

	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(9)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(8)(module)))

/***/ }
]);