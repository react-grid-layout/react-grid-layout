webpackJsonp([3],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module) {'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var React = __webpack_require__(5);
	var PureRenderMixin = __webpack_require__(10);
	var WidthProvider = __webpack_require__(4).WidthProvider;
	var ReactGridLayout = __webpack_require__(4);
	ReactGridLayout = WidthProvider(ReactGridLayout);
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
	    var ls = {};
	    if (global.localStorage) {
	      try {
	        ls = JSON.parse(global.localStorage.getItem('rgl-7')) || {};
	      } catch (e) {/*ignore*/}
	    }
	    return { layout: ls.layout || [] };
	  },
	  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
	    this._saveToLocalStorage();
	  },
	  resetLayout: function resetLayout() {
	    this.setState({ layout: [] });
	  },
	  _saveToLocalStorage: function _saveToLocalStorage() {
	    if (global.localStorage) {
	      global.localStorage.setItem('rgl-7', JSON.stringify({
	        layout: this.state.layout
	      }));
	    }
	  },
	  onLayoutChange: function onLayoutChange(layout) {
	    /*eslint no-console: 0*/
	    console.log('layout changed', layout);
	    this.props.onLayoutChange(layout); // updates status display
	    this.setState({ layout: layout });
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
	        ReactGridLayout,
	        _extends({}, this.props, {
	          layout: this.state.layout,
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

	module.exports = LocalStorageLayout;

	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(9)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(8)(module)))

/***/ }
]);