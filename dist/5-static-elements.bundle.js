webpackJsonp([5],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(4);
	var PureRenderMixin = __webpack_require__(6);
	var ReactGridLayout = __webpack_require__(10);
	
	/**
	 * This layout demonstrates how to use static grid elements.
	 * Static elements are not draggable or resizable, and cannot be moved.
	 */
	var StaticElementsLayout = React.createClass({
	  displayName: "StaticElementsLayout",
	
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
	      { className: "layout", onLayoutChange: this.onLayoutChange, rowHeight: 30 },
	      React.createElement(
	        "div",
	        { key: 1, _grid: { x: 0, y: 0, w: 2, h: 3 } },
	        React.createElement(
	          "span",
	          { className: "text" },
	          "1"
	        )
	      ),
	      React.createElement(
	        "div",
	        { key: 2, _grid: { x: 2, y: 0, w: 4, h: 3, "static": true } },
	        React.createElement(
	          "span",
	          { className: "text" },
	          "2 - Static"
	        )
	      ),
	      React.createElement(
	        "div",
	        { key: 3, _grid: { x: 6, y: 0, w: 2, h: 3 } },
	        React.createElement(
	          "span",
	          { className: "text" },
	          "3"
	        )
	      )
	    );
	  }
	});
	
	module.exports = StaticElementsLayout;
	
	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(11)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)(module)))

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzUtc3RhdGljLWVsZW1lbnRzLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsMkRBQVksQ0FBQztBQUNiLEtBQUksS0FBSyxHQUFHLG1CQUFPLENBQUMsQ0FBTyxDQUFDLENBQUM7QUFDN0IsS0FBSSxlQUFlLEdBQUcsbUJBQU8sQ0FBQyxDQUE2QyxDQUFDLENBQUM7QUFDN0UsS0FBSSxlQUFlLEdBQUcsbUJBQU8sQ0FBQyxFQUFtQixDQUFDLENBQUM7Ozs7OztBQU1uRCxLQUFJLG9CQUFvQixHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7OztBQUMzQyxTQUFNLEVBQUUsQ0FBQyxlQUFlLENBQUM7O0FBRXpCLGtCQUFlLDZCQUFHO0FBQ2hCLFlBQU8sRUFBRSxDQUFDO0lBQ1g7O0FBRUQsaUJBQWMsRUFBRSx3QkFBUyxNQUFNLEVBQUU7QUFDL0IsU0FBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkM7O0FBRUQsU0FBTSxvQkFBRztBQUNQLFlBQ0U7QUFBQyxzQkFBZTtTQUFDLFNBQVMsRUFBQyxRQUFRLEVBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFlLEVBQUMsU0FBUyxFQUFFLEVBQUc7T0FDckY7O1dBQUssR0FBRyxFQUFFLENBQUUsRUFBQyxLQUFLLEVBQUUsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1NBQUM7O2FBQU0sU0FBUyxFQUFDLE1BQU07O1VBQVM7UUFBTTtPQUNuRjs7V0FBSyxHQUFHLEVBQUUsQ0FBRSxFQUFDLEtBQUssRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsVUFBUSxJQUFJLEVBQUU7U0FBQzs7YUFBTSxTQUFTLEVBQUMsTUFBTTs7VUFBa0I7UUFBTTtPQUMxRzs7V0FBSyxHQUFHLEVBQUUsQ0FBRSxFQUFDLEtBQUssRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7U0FBQzs7YUFBTSxTQUFTLEVBQUMsTUFBTTs7VUFBUztRQUFNO01BQ25FLENBQ2xCO0lBQ0g7RUFDRixDQUFDLENBQUM7O0FBRUgsT0FBTSxDQUFDLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQzs7QUFFdEMsS0FBSSx3QkFBWSxLQUFLLE1BQU0sRUFBRTtBQUMzQixzQkFBTyxDQUFDLEVBQWtCLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFB1cmVSZW5kZXJNaXhpbiA9IHJlcXVpcmUoJ3JlYWN0L2xpYi9SZWFjdENvbXBvbmVudFdpdGhQdXJlUmVuZGVyTWl4aW4nKTtcbnZhciBSZWFjdEdyaWRMYXlvdXQgPSByZXF1aXJlKCdyZWFjdC1ncmlkLWxheW91dCcpO1xuXG4vKipcbiAqIFRoaXMgbGF5b3V0IGRlbW9uc3RyYXRlcyBob3cgdG8gdXNlIHN0YXRpYyBncmlkIGVsZW1lbnRzLlxuICogU3RhdGljIGVsZW1lbnRzIGFyZSBub3QgZHJhZ2dhYmxlIG9yIHJlc2l6YWJsZSwgYW5kIGNhbm5vdCBiZSBtb3ZlZC5cbiAqL1xudmFyIFN0YXRpY0VsZW1lbnRzTGF5b3V0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBtaXhpbnM6IFtQdXJlUmVuZGVyTWl4aW5dLFxuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge307XG4gIH0sXG5cbiAgb25MYXlvdXRDaGFuZ2U6IGZ1bmN0aW9uKGxheW91dCkge1xuICAgIHRoaXMucHJvcHMub25MYXlvdXRDaGFuZ2UobGF5b3V0KTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxSZWFjdEdyaWRMYXlvdXQgY2xhc3NOYW1lPVwibGF5b3V0XCIgb25MYXlvdXRDaGFuZ2U9e3RoaXMub25MYXlvdXRDaGFuZ2V9IHJvd0hlaWdodD17MzB9PlxuICAgICAgICA8ZGl2IGtleT17MX0gX2dyaWQ9e3t4OiAwLCB5OiAwLCB3OiAyLCBoOiAzfX0+PHNwYW4gY2xhc3NOYW1lPVwidGV4dFwiPjE8L3NwYW4+PC9kaXY+XG4gICAgICAgIDxkaXYga2V5PXsyfSBfZ3JpZD17e3g6IDIsIHk6IDAsIHc6IDQsIGg6IDMsIHN0YXRpYzogdHJ1ZX19PjxzcGFuIGNsYXNzTmFtZT1cInRleHRcIj4yIC0gU3RhdGljPC9zcGFuPjwvZGl2PlxuICAgICAgICA8ZGl2IGtleT17M30gX2dyaWQ9e3t4OiA2LCB5OiAwLCB3OiAyLCBoOiAzfX0+PHNwYW4gY2xhc3NOYW1lPVwidGV4dFwiPjM8L3NwYW4+PC9kaXY+XG4gICAgICA8L1JlYWN0R3JpZExheW91dD5cbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGF0aWNFbGVtZW50c0xheW91dDtcblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIHJlcXVpcmUoJy4uL3Rlc3QtaG9vay5qc3gnKShtb2R1bGUuZXhwb3J0cyk7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3Rlc3QvZXhhbXBsZXMvNS1zdGF0aWMtZWxlbWVudHMuanN4XG4gKiovIl0sInNvdXJjZVJvb3QiOiIiLCJmaWxlIjoiNS1zdGF0aWMtZWxlbWVudHMuYnVuZGxlLmpzIn0=