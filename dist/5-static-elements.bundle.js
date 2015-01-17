webpackJsonp([5],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(4);
	var ReactGridLayout = __webpack_require__(10);
	
	/**
	 * This layout demonstrates how to use static grid elements.
	 * Static elements are not draggable or resizable, and cannot be moved.
	 */
	var StaticElementsLayout = React.createClass({
	  displayName: "StaticElementsLayout",
	  mixins: [React.addons.PureRenderMixin],
	
	  getInitialState: function getInitialState() {
	    return {};
	  },
	
	  onLayoutChange: function (layout) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzUtc3RhdGljLWVsZW1lbnRzLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQVNFLFNBQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDOztBQUV0QyxrQkFBZSw2QkFBRztBQUNoQixZQUFPLEVBQUUsQ0FBQztJQUNYOztBQUVELGlCQUFjLEVBQUUsVUFBUyxNQUFNLEVBQUU7QUFDL0IsU0FBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkM7O0FBRUQsU0FBTSxvQkFBRztBQUNQLFlBQ0U7QUFBQyxzQkFBZTtTQUFDLFNBQVMsRUFBQyxRQUFRLEVBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFlLEVBQUMsU0FBUyxFQUFFLEVBQUc7T0FDckY7O1dBQUssR0FBRyxFQUFFLENBQUUsRUFBQyxLQUFLLEVBQUUsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1NBQUM7O2FBQU0sU0FBUyxFQUFDLE1BQU07O1VBQVM7UUFBTTtPQUVuRjs7V0FBSyxHQUFHLEVBQUUsQ0FBRSxFQUFDLEtBQUssRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsVUFBUSxJQUFJLEVBQUU7U0FBQzs7YUFBTSxTQUFTLEVBQUMsTUFBTTs7VUFBa0I7UUFBTTtPQUUxRzs7V0FBSyxHQUFHLEVBQUUsQ0FBRSxFQUFDLEtBQUssRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7U0FBQzs7YUFBTSxTQUFTLEVBQUMsTUFBTTs7VUFBUztRQUFNO01BRW5FLENBQ2xCO0lBQ0g7RUFDRixDQUFDLENBQUM7O0FBRUgsT0FBTSxDQUFDLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQzs7QUFFdEMsS0FBSSx3QkFBWSxLQUFLLE1BQU0sRUFBRTtBQUMzQixzQkFBTyxDQUFDLEVBQWtCLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSZWFjdEdyaWRMYXlvdXQgPSByZXF1aXJlKCdyZWFjdC1ncmlkLWxheW91dCcpO1xuXG4vKipcbiAqIFRoaXMgbGF5b3V0IGRlbW9uc3RyYXRlcyBob3cgdG8gdXNlIHN0YXRpYyBncmlkIGVsZW1lbnRzLlxuICogU3RhdGljIGVsZW1lbnRzIGFyZSBub3QgZHJhZ2dhYmxlIG9yIHJlc2l6YWJsZSwgYW5kIGNhbm5vdCBiZSBtb3ZlZC5cbiAqL1xudmFyIFN0YXRpY0VsZW1lbnRzTGF5b3V0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBtaXhpbnM6IFtSZWFjdC5hZGRvbnMuUHVyZVJlbmRlck1peGluXSxcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuXG4gIG9uTGF5b3V0Q2hhbmdlOiBmdW5jdGlvbihsYXlvdXQpIHtcbiAgICB0aGlzLnByb3BzLm9uTGF5b3V0Q2hhbmdlKGxheW91dCk7XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8UmVhY3RHcmlkTGF5b3V0IGNsYXNzTmFtZT1cImxheW91dFwiIG9uTGF5b3V0Q2hhbmdlPXt0aGlzLm9uTGF5b3V0Q2hhbmdlfSByb3dIZWlnaHQ9ezMwfT5cbiAgICAgICAgPGRpdiBrZXk9ezF9IF9ncmlkPXt7eDogMCwgeTogMCwgdzogMiwgaDogM319PjxzcGFuIGNsYXNzTmFtZT1cInRleHRcIj4xPC9zcGFuPjwvZGl2PlxuICAgICAgICA8ZGl2IGtleT17Mn0gX2dyaWQ9e3t4OiAyLCB5OiAwLCB3OiA0LCBoOiAzLCBzdGF0aWM6IHRydWV9fT48c3BhbiBjbGFzc05hbWU9XCJ0ZXh0XCI+MiAtIFN0YXRpYzwvc3Bhbj48L2Rpdj5cbiAgICAgICAgPGRpdiBrZXk9ezN9IF9ncmlkPXt7eDogNiwgeTogMCwgdzogMiwgaDogM319PjxzcGFuIGNsYXNzTmFtZT1cInRleHRcIj4zPC9zcGFuPjwvZGl2PlxuICAgICAgPC9SZWFjdEdyaWRMYXlvdXQ+XG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdGljRWxlbWVudHNMYXlvdXQ7XG5cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICByZXF1aXJlKCcuLi90ZXN0LWhvb2suanN4JykobW9kdWxlLmV4cG9ydHMpO1xufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi90ZXN0L2V4YW1wbGVzLzUtc3RhdGljLWVsZW1lbnRzLmpzeFxuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6IjUtc3RhdGljLWVsZW1lbnRzLmJ1bmRsZS5qcyJ9