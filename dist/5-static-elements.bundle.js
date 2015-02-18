webpackJsonp([5],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(4);
	var PureRenderMixin = __webpack_require__(6);
	var ReactGridLayout = __webpack_require__(9);
	
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
	  __webpack_require__(10)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)(module)))

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzUtc3RhdGljLWVsZW1lbnRzLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFVRSxTQUFNLEVBQUUsQ0FBQyxlQUFlLENBQUM7O0FBRXpCLGtCQUFlLDZCQUFHO0FBQ2hCLFlBQU8sRUFBRSxDQUFDO0lBQ1g7O0FBRUQsaUJBQWMsRUFBRSxVQUFTLE1BQU0sRUFBRTtBQUMvQixTQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuQzs7QUFFRCxTQUFNLG9CQUFHO0FBQ1AsWUFDRTtBQUFDLHNCQUFlO1NBQUMsU0FBUyxFQUFDLFFBQVEsRUFBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWUsRUFBQyxTQUFTLEVBQUUsRUFBRztPQUNyRjs7V0FBSyxHQUFHLEVBQUUsQ0FBRSxFQUFDLEtBQUssRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7U0FBQzs7YUFBTSxTQUFTLEVBQUMsTUFBTTs7VUFBUztRQUFNO09BRW5GOztXQUFLLEdBQUcsRUFBRSxDQUFFLEVBQUMsS0FBSyxFQUFFLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxVQUFRLElBQUksRUFBRTtTQUFDOzthQUFNLFNBQVMsRUFBQyxNQUFNOztVQUFrQjtRQUFNO09BRTFHOztXQUFLLEdBQUcsRUFBRSxDQUFFLEVBQUMsS0FBSyxFQUFFLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtTQUFDOzthQUFNLFNBQVMsRUFBQyxNQUFNOztVQUFTO1FBQU07TUFFbkUsQ0FDbEI7SUFDSDtFQUNGLENBQUMsQ0FBQzs7QUFFSCxPQUFNLENBQUMsT0FBTyxHQUFHLG9CQUFvQixDQUFDOztBQUV0QyxLQUFJLHdCQUFZLEtBQUssTUFBTSxFQUFFO0FBQzNCLHNCQUFPLENBQUMsRUFBa0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUHVyZVJlbmRlck1peGluID0gcmVxdWlyZSgncmVhY3QvbGliL1JlYWN0Q29tcG9uZW50V2l0aFB1cmVSZW5kZXJNaXhpbicpO1xudmFyIFJlYWN0R3JpZExheW91dCA9IHJlcXVpcmUoJ3JlYWN0LWdyaWQtbGF5b3V0Jyk7XG5cbi8qKlxuICogVGhpcyBsYXlvdXQgZGVtb25zdHJhdGVzIGhvdyB0byB1c2Ugc3RhdGljIGdyaWQgZWxlbWVudHMuXG4gKiBTdGF0aWMgZWxlbWVudHMgYXJlIG5vdCBkcmFnZ2FibGUgb3IgcmVzaXphYmxlLCBhbmQgY2Fubm90IGJlIG1vdmVkLlxuICovXG52YXIgU3RhdGljRWxlbWVudHNMYXlvdXQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIG1peGluczogW1B1cmVSZW5kZXJNaXhpbl0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSxcblxuICBvbkxheW91dENoYW5nZTogZnVuY3Rpb24obGF5b3V0KSB7XG4gICAgdGhpcy5wcm9wcy5vbkxheW91dENoYW5nZShsYXlvdXQpO1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFJlYWN0R3JpZExheW91dCBjbGFzc05hbWU9XCJsYXlvdXRcIiBvbkxheW91dENoYW5nZT17dGhpcy5vbkxheW91dENoYW5nZX0gcm93SGVpZ2h0PXszMH0+XG4gICAgICAgIDxkaXYga2V5PXsxfSBfZ3JpZD17e3g6IDAsIHk6IDAsIHc6IDIsIGg6IDN9fT48c3BhbiBjbGFzc05hbWU9XCJ0ZXh0XCI+MTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgPGRpdiBrZXk9ezJ9IF9ncmlkPXt7eDogMiwgeTogMCwgdzogNCwgaDogMywgc3RhdGljOiB0cnVlfX0+PHNwYW4gY2xhc3NOYW1lPVwidGV4dFwiPjIgLSBTdGF0aWM8L3NwYW4+PC9kaXY+XG4gICAgICAgIDxkaXYga2V5PXszfSBfZ3JpZD17e3g6IDYsIHk6IDAsIHc6IDIsIGg6IDN9fT48c3BhbiBjbGFzc05hbWU9XCJ0ZXh0XCI+Mzwvc3Bhbj48L2Rpdj5cbiAgICAgIDwvUmVhY3RHcmlkTGF5b3V0PlxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXRpY0VsZW1lbnRzTGF5b3V0O1xuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgcmVxdWlyZSgnLi4vdGVzdC1ob29rLmpzeCcpKG1vZHVsZS5leHBvcnRzKTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vdGVzdC9leGFtcGxlcy81LXN0YXRpYy1lbGVtZW50cy5qc3hcbiAqKi8iXSwic291cmNlUm9vdCI6IiIsImZpbGUiOiI1LXN0YXRpYy1lbGVtZW50cy5idW5kbGUuanMifQ==