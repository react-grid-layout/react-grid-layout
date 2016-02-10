webpackJsonp([5],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

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
	    return React.createElement(
	      ReactGridLayout,
	      { className: 'layout', onLayoutChange: this.onLayoutChange, rowHeight: 30 },
	      React.createElement(
	        'div',
	        { key: '1', _grid: { x: 0, y: 0, w: 2, h: 3 } },
	        React.createElement(
	          'span',
	          { className: 'text' },
	          '1'
	        )
	      ),
	      React.createElement(
	        'div',
	        { key: '2', _grid: { x: 2, y: 0, w: 4, h: 3, static: true } },
	        React.createElement(
	          'span',
	          { className: 'text' },
	          '2 - Static'
	        )
	      ),
	      React.createElement(
	        'div',
	        { key: '3', _grid: { x: 6, y: 0, w: 2, h: 3 } },
	        React.createElement(
	          'span',
	          { className: 'text' },
	          '3'
	        )
	      )
	    );
	  }
	});

	module.exports = StaticElementsLayout;

	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(9)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)(module)))

/***/ }
]);