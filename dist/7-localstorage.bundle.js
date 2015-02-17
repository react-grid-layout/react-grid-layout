webpackJsonp([3],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module) {"use strict";
	var React = __webpack_require__(4);
	var PureRenderMixin = __webpack_require__(6);
	var ReactGridLayout = __webpack_require__(10);
	
	/**
	 * This layout demonstrates how to sync to localstorage.
	 */
	var LocalStorageLayout = React.createClass({
	  displayName: "LocalStorageLayout",
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
	        ls = JSON.parse(global.localStorage.getItem("rgl-7")) || {};
	      } catch (e) {}
	    }
	    return { layout: ls.layout || [] };
	  },
	
	  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
	    this._saveToLocalStorage();
	  },
	
	  resetLayout: function resetLayout() {
	    this.setState({ layout: [] });
	  },
	
	  _saveToLocalStorage: function SaveToLocalStorage() {
	    if (global.localStorage) {
	      global.localStorage.setItem("rgl-7", JSON.stringify({
	        layout: this.state.layout
	      }));
	    }
	  },
	
	  onLayoutChange: function onLayoutChange(layout) {
	    console.log("layout changed", layout);
	    this.props.onLayoutChange(layout); // updates status display
	    this.setState({ layout: layout });
	  },
	
	  render: function render() {
	    return React.createElement(
	      "div",
	      null,
	      React.createElement(
	        "button",
	        { onClick: this.resetLayout },
	        "Reset Layout"
	      ),
	      React.createElement(
	        ReactGridLayout,
	        React.__spread({}, this.props, {
	          layout: this.state.layout,
	          onLayoutChange: this.onLayoutChange }),
	        React.createElement(
	          "div",
	          { key: 1, _grid: { w: 2, h: 3, x: 0, y: 0 } },
	          React.createElement(
	            "span",
	            { className: "text" },
	            "1"
	          )
	        ),
	        React.createElement(
	          "div",
	          { key: 2, _grid: { w: 2, h: 3, x: 2, y: 0 } },
	          React.createElement(
	            "span",
	            { className: "text" },
	            "2"
	          )
	        ),
	        React.createElement(
	          "div",
	          { key: 3, _grid: { w: 2, h: 3, x: 4, y: 0 } },
	          React.createElement(
	            "span",
	            { className: "text" },
	            "3"
	          )
	        ),
	        React.createElement(
	          "div",
	          { key: 4, _grid: { w: 2, h: 3, x: 6, y: 0 } },
	          React.createElement(
	            "span",
	            { className: "text" },
	            "4"
	          )
	        ),
	        React.createElement(
	          "div",
	          { key: 5, _grid: { w: 2, h: 3, x: 8, y: 0 } },
	          React.createElement(
	            "span",
	            { className: "text" },
	            "5"
	          )
	        )
	      )
	    );
	  }
	});
	
	module.exports = LocalStorageLayout;
	
	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(11)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(9)(module)))

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzctbG9jYWxzdG9yYWdlLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQVNFLFNBQU0sRUFBRSxDQUFDLGVBQWUsQ0FBQzs7QUFFekIsa0JBQWUsNkJBQUc7QUFDaEIsWUFBTztBQUNMLGdCQUFTLEVBQUUsUUFBUTtBQUNuQixXQUFJLEVBQUUsRUFBRTtBQUNSLGdCQUFTLEVBQUUsRUFBRTtNQUNkLENBQUM7SUFDSDs7QUFFRCxrQkFBZSw2QkFBRztBQUNoQixTQUFJLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDWixTQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUU7QUFDdkIsV0FBSTtBQUNGLFdBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzdELENBQUMsT0FBTSxDQUFDLEVBQUUsRUFBRTtNQUNkO0FBQ0QsWUFBTyxFQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxJQUFJLEVBQUUsRUFBQyxDQUFDO0lBQ2xDOztBQUVELHFCQUFrQiw4QkFBQyxTQUFTLEVBQUUsU0FBUyxFQUFFO0FBQ3ZDLFNBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0lBQzVCOztBQUVELGNBQVcseUJBQUc7QUFDWixTQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLEVBQUUsRUFBQyxDQUFDLENBQUM7SUFDN0I7O0FBRUQsc0JBQW1CLGdDQUFHO0FBQ3BCLFNBQUksTUFBTSxDQUFDLFlBQVksRUFBRTtBQUN2QixhQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUNsRCxlQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNO1FBQzFCLENBQUMsQ0FBQyxDQUFDO01BQ0w7SUFDRjs7QUFFRCxpQkFBYywwQkFBQyxNQUFNLEVBQUU7QUFDckIsWUFBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN0QyxTQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsQyxTQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7SUFDakM7O0FBRUQsU0FBTSxvQkFBRztBQUNQLFlBQ0U7OztPQUNFOztXQUFRLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBWTs7UUFBc0I7T0FFeEQ7QUFBQyx3QkFBZTs0QkFDUixJQUFJLENBQUMsS0FBSztBQUNkLGlCQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFPO0FBQzFCLHlCQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWU7U0FDdEM7O2FBQUssR0FBRyxFQUFFLENBQUUsRUFBQyxLQUFLLEVBQUUsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1dBQUM7O2VBQU0sU0FBUyxFQUFDLE1BQU07O1lBQVM7VUFBTTtTQUVuRjs7YUFBSyxHQUFHLEVBQUUsQ0FBRSxFQUFDLEtBQUssRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7V0FBQzs7ZUFBTSxTQUFTLEVBQUMsTUFBTTs7WUFBUztVQUFNO1NBRW5GOzthQUFLLEdBQUcsRUFBRSxDQUFFLEVBQUMsS0FBSyxFQUFFLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtXQUFDOztlQUFNLFNBQVMsRUFBQyxNQUFNOztZQUFTO1VBQU07U0FFbkY7O2FBQUssR0FBRyxFQUFFLENBQUUsRUFBQyxLQUFLLEVBQUUsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1dBQUM7O2VBQU0sU0FBUyxFQUFDLE1BQU07O1lBQVM7VUFBTTtTQUVuRjs7YUFBSyxHQUFHLEVBQUUsQ0FBRSxFQUFDLEtBQUssRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7V0FBQzs7ZUFBTSxTQUFTLEVBQUMsTUFBTTs7WUFBUztVQUFNO1FBRW5FO01BRWQsQ0FDTjtJQUNIO0VBQ0YsQ0FBQyxDQUFDOztBQUVILE9BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUM7O0FBRXBDLEtBQUksd0JBQVksS0FBSyxNQUFNLEVBQUU7QUFDM0Isc0JBQU8sQ0FBQyxFQUFrQixDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBQdXJlUmVuZGVyTWl4aW4gPSByZXF1aXJlKCdyZWFjdC9saWIvUmVhY3RDb21wb25lbnRXaXRoUHVyZVJlbmRlck1peGluJyk7XG52YXIgUmVhY3RHcmlkTGF5b3V0ID0gcmVxdWlyZSgncmVhY3QtZ3JpZC1sYXlvdXQnKTtcblxuLyoqXG4gKiBUaGlzIGxheW91dCBkZW1vbnN0cmF0ZXMgaG93IHRvIHN5bmMgdG8gbG9jYWxzdG9yYWdlLlxuICovXG52YXIgTG9jYWxTdG9yYWdlTGF5b3V0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBtaXhpbnM6IFtQdXJlUmVuZGVyTWl4aW5dLFxuXG4gIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2xhc3NOYW1lOiBcImxheW91dFwiLFxuICAgICAgY29sczogMTIsXG4gICAgICByb3dIZWlnaHQ6IDMwXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgdmFyIGxzID0ge307XG4gICAgaWYgKGdsb2JhbC5sb2NhbFN0b3JhZ2UpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxzID0gSlNPTi5wYXJzZShnbG9iYWwubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3JnbC03JykpIHx8IHt9O1xuICAgICAgfSBjYXRjaChlKSB7fVxuICAgIH1cbiAgICByZXR1cm4ge2xheW91dDogbHMubGF5b3V0IHx8IFtdfTtcbiAgfSxcblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICB0aGlzLl9zYXZlVG9Mb2NhbFN0b3JhZ2UoKTtcbiAgfSxcblxuICByZXNldExheW91dCgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtsYXlvdXQ6IFtdfSk7XG4gIH0sXG5cbiAgX3NhdmVUb0xvY2FsU3RvcmFnZSgpIHtcbiAgICBpZiAoZ2xvYmFsLmxvY2FsU3RvcmFnZSkge1xuICAgICAgZ2xvYmFsLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdyZ2wtNycsIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgbGF5b3V0OiB0aGlzLnN0YXRlLmxheW91dFxuICAgICAgfSkpO1xuICAgIH1cbiAgfSxcblxuICBvbkxheW91dENoYW5nZShsYXlvdXQpIHtcbiAgICBjb25zb2xlLmxvZygnbGF5b3V0IGNoYW5nZWQnLCBsYXlvdXQpO1xuICAgIHRoaXMucHJvcHMub25MYXlvdXRDaGFuZ2UobGF5b3V0KTsgLy8gdXBkYXRlcyBzdGF0dXMgZGlzcGxheVxuICAgIHRoaXMuc2V0U3RhdGUoe2xheW91dDogbGF5b3V0fSk7XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMucmVzZXRMYXlvdXR9PlJlc2V0IExheW91dDwvYnV0dG9uPlxuICAgICAgICA8UmVhY3RHcmlkTGF5b3V0IFxuICAgICAgICAgICAgey4uLnRoaXMucHJvcHN9XG4gICAgICAgICAgICBsYXlvdXQ9e3RoaXMuc3RhdGUubGF5b3V0fVxuICAgICAgICAgICAgb25MYXlvdXRDaGFuZ2U9e3RoaXMub25MYXlvdXRDaGFuZ2V9PlxuICAgICAgICAgIDxkaXYga2V5PXsxfSBfZ3JpZD17e3c6IDIsIGg6IDMsIHg6IDAsIHk6IDB9fT48c3BhbiBjbGFzc05hbWU9XCJ0ZXh0XCI+MTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGtleT17Mn0gX2dyaWQ9e3t3OiAyLCBoOiAzLCB4OiAyLCB5OiAwfX0+PHNwYW4gY2xhc3NOYW1lPVwidGV4dFwiPjI8L3NwYW4+PC9kaXY+XG4gICAgICAgICAgPGRpdiBrZXk9ezN9IF9ncmlkPXt7dzogMiwgaDogMywgeDogNCwgeTogMH19PjxzcGFuIGNsYXNzTmFtZT1cInRleHRcIj4zPC9zcGFuPjwvZGl2PlxuICAgICAgICAgIDxkaXYga2V5PXs0fSBfZ3JpZD17e3c6IDIsIGg6IDMsIHg6IDYsIHk6IDB9fT48c3BhbiBjbGFzc05hbWU9XCJ0ZXh0XCI+NDwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGtleT17NX0gX2dyaWQ9e3t3OiAyLCBoOiAzLCB4OiA4LCB5OiAwfX0+PHNwYW4gY2xhc3NOYW1lPVwidGV4dFwiPjU8L3NwYW4+PC9kaXY+XG4gICAgICAgIDwvUmVhY3RHcmlkTGF5b3V0PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTG9jYWxTdG9yYWdlTGF5b3V0O1xuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgcmVxdWlyZSgnLi4vdGVzdC1ob29rLmpzeCcpKG1vZHVsZS5leHBvcnRzKTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vdGVzdC9leGFtcGxlcy83LWxvY2Fsc3RvcmFnZS5qc3hcbiAqKi8iXSwic291cmNlUm9vdCI6IiIsImZpbGUiOiI3LWxvY2Fsc3RvcmFnZS5idW5kbGUuanMifQ==