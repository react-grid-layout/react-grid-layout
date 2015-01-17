webpackJsonp([3],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module) {"use strict";
	var React = __webpack_require__(4);
	var ReactGridLayout = __webpack_require__(10);
	
	/**
	 * This layout demonstrates how to sync to localstorage.
	 */
	var LocalStorageLayout = React.createClass({
	  displayName: "LocalStorageLayout",
	  mixins: [React.addons.PureRenderMixin],
	
	  getDefaultProps: function getDefaultProps() {
	    var ls = {};
	    if (global.localStorage) {
	      try {
	        ls = JSON.parse(global.localStorage.getItem("rgl-7")) || {};
	      } catch (e) {}
	    }
	    return {
	      className: "layout",
	      cols: 12,
	      rowHeight: 30,
	      layout: ls.layout || []
	    };
	  },
	
	  getInitialState: function getInitialState() {
	    return {};
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
	    this.props.onLayoutChange(layout);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzctbG9jYWxzdG9yYWdlLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBUUUsU0FBTSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUM7O0FBRXRDLGtCQUFlLDZCQUFHO0FBQ2hCLFNBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNaLFNBQUksTUFBTSxDQUFDLFlBQVksRUFBRTtBQUN2QixXQUFJO0FBQ0YsV0FBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDN0QsQ0FBQyxPQUFNLENBQUMsRUFBRSxFQUFFO01BQ2Q7QUFDRCxZQUFPO0FBQ0wsZ0JBQVMsRUFBRSxRQUFRO0FBQ25CLFdBQUksRUFBRSxFQUFFO0FBQ1IsZ0JBQVMsRUFBRSxFQUFFO0FBQ2IsYUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLElBQUksRUFBRTtNQUN4QixDQUFDO0lBQ0g7O0FBRUQsa0JBQWUsNkJBQUc7QUFDaEIsWUFBTyxFQUFFLENBQUM7SUFDWDs7QUFFRCxxQkFBa0IsOEJBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRTtBQUN2QyxTQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztJQUM1Qjs7QUFFRCxjQUFXLHlCQUFHO0FBQ1osU0FBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDO0lBQzdCOztBQUVELHNCQUFtQixnQ0FBRztBQUNwQixTQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUU7QUFDdkIsYUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDbEQsZUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTtRQUMxQixDQUFDLENBQUMsQ0FBQztNQUNMO0lBQ0Y7O0FBRUQsaUJBQWMsMEJBQUMsTUFBTSxFQUFFO0FBQ3JCLFlBQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDdEMsU0FBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbEMsU0FBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO0lBQ2pDOztBQUVELFNBQU0sb0JBQUc7QUFDUCxZQUNFOzs7T0FDRTs7V0FBUSxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVk7O1FBQXNCO09BRXhEO0FBQUMsd0JBQWU7NEJBQ1IsSUFBSSxDQUFDLEtBQUs7QUFDZCx5QkFBYyxFQUFFLElBQUksQ0FBQyxjQUFlO1NBQ3RDOzthQUFLLEdBQUcsRUFBRSxDQUFFLEVBQUMsS0FBSyxFQUFFLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtXQUFDOztlQUFNLFNBQVMsRUFBQyxNQUFNOztZQUFTO1VBQU07U0FFbkY7O2FBQUssR0FBRyxFQUFFLENBQUUsRUFBQyxLQUFLLEVBQUUsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1dBQUM7O2VBQU0sU0FBUyxFQUFDLE1BQU07O1lBQVM7VUFBTTtTQUVuRjs7YUFBSyxHQUFHLEVBQUUsQ0FBRSxFQUFDLEtBQUssRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7V0FBQzs7ZUFBTSxTQUFTLEVBQUMsTUFBTTs7WUFBUztVQUFNO1NBRW5GOzthQUFLLEdBQUcsRUFBRSxDQUFFLEVBQUMsS0FBSyxFQUFFLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtXQUFDOztlQUFNLFNBQVMsRUFBQyxNQUFNOztZQUFTO1VBQU07U0FFbkY7O2FBQUssR0FBRyxFQUFFLENBQUUsRUFBQyxLQUFLLEVBQUUsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1dBQUM7O2VBQU0sU0FBUyxFQUFDLE1BQU07O1lBQVM7VUFBTTtRQUVuRTtNQUVkLENBQ047SUFDSDtFQUNGLENBQUMsQ0FBQzs7QUFFSCxPQUFNLENBQUMsT0FBTyxHQUFHLGtCQUFrQixDQUFDOztBQUVwQyxLQUFJLHdCQUFZLEtBQUssTUFBTSxFQUFFO0FBQzNCLHNCQUFPLENBQUMsRUFBa0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFJlYWN0R3JpZExheW91dCA9IHJlcXVpcmUoJ3JlYWN0LWdyaWQtbGF5b3V0Jyk7XG5cbi8qKlxuICogVGhpcyBsYXlvdXQgZGVtb25zdHJhdGVzIGhvdyB0byBzeW5jIHRvIGxvY2Fsc3RvcmFnZS5cbiAqL1xudmFyIExvY2FsU3RvcmFnZUxheW91dCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgbWl4aW5zOiBbUmVhY3QuYWRkb25zLlB1cmVSZW5kZXJNaXhpbl0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHZhciBscyA9IHt9O1xuICAgIGlmIChnbG9iYWwubG9jYWxTdG9yYWdlKSB7XG4gICAgICB0cnkge1xuICAgICAgICBscyA9IEpTT04ucGFyc2UoZ2xvYmFsLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdyZ2wtNycpKSB8fCB7fTtcbiAgICAgIH0gY2F0Y2goZSkge31cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGNsYXNzTmFtZTogXCJsYXlvdXRcIixcbiAgICAgIGNvbHM6IDEyLFxuICAgICAgcm93SGVpZ2h0OiAzMCxcbiAgICAgIGxheW91dDogbHMubGF5b3V0IHx8IFtdXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMsIHByZXZTdGF0ZSkge1xuICAgIHRoaXMuX3NhdmVUb0xvY2FsU3RvcmFnZSgpO1xuICB9LFxuXG4gIHJlc2V0TGF5b3V0KCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe2xheW91dDogW119KTtcbiAgfSxcblxuICBfc2F2ZVRvTG9jYWxTdG9yYWdlKCkge1xuICAgIGlmIChnbG9iYWwubG9jYWxTdG9yYWdlKSB7XG4gICAgICBnbG9iYWwubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3JnbC03JywgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBsYXlvdXQ6IHRoaXMuc3RhdGUubGF5b3V0XG4gICAgICB9KSk7XG4gICAgfVxuICB9LFxuXG4gIG9uTGF5b3V0Q2hhbmdlKGxheW91dCkge1xuICAgIGNvbnNvbGUubG9nKCdsYXlvdXQgY2hhbmdlZCcsIGxheW91dCk7XG4gICAgdGhpcy5wcm9wcy5vbkxheW91dENoYW5nZShsYXlvdXQpO1xuICAgIHRoaXMuc2V0U3RhdGUoe2xheW91dDogbGF5b3V0fSk7XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMucmVzZXRMYXlvdXR9PlJlc2V0IExheW91dDwvYnV0dG9uPlxuICAgICAgICA8UmVhY3RHcmlkTGF5b3V0IFxuICAgICAgICAgICAgey4uLnRoaXMucHJvcHN9XG4gICAgICAgICAgICBvbkxheW91dENoYW5nZT17dGhpcy5vbkxheW91dENoYW5nZX0+XG4gICAgICAgICAgPGRpdiBrZXk9ezF9IF9ncmlkPXt7dzogMiwgaDogMywgeDogMCwgeTogMH19PjxzcGFuIGNsYXNzTmFtZT1cInRleHRcIj4xPC9zcGFuPjwvZGl2PlxuICAgICAgICAgIDxkaXYga2V5PXsyfSBfZ3JpZD17e3c6IDIsIGg6IDMsIHg6IDIsIHk6IDB9fT48c3BhbiBjbGFzc05hbWU9XCJ0ZXh0XCI+Mjwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGtleT17M30gX2dyaWQ9e3t3OiAyLCBoOiAzLCB4OiA0LCB5OiAwfX0+PHNwYW4gY2xhc3NOYW1lPVwidGV4dFwiPjM8L3NwYW4+PC9kaXY+XG4gICAgICAgICAgPGRpdiBrZXk9ezR9IF9ncmlkPXt7dzogMiwgaDogMywgeDogNiwgeTogMH19PjxzcGFuIGNsYXNzTmFtZT1cInRleHRcIj40PC9zcGFuPjwvZGl2PlxuICAgICAgICAgIDxkaXYga2V5PXs1fSBfZ3JpZD17e3c6IDIsIGg6IDMsIHg6IDgsIHk6IDB9fT48c3BhbiBjbGFzc05hbWU9XCJ0ZXh0XCI+NTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgPC9SZWFjdEdyaWRMYXlvdXQ+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2NhbFN0b3JhZ2VMYXlvdXQ7XG5cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICByZXF1aXJlKCcuLi90ZXN0LWhvb2suanN4JykobW9kdWxlLmV4cG9ydHMpO1xufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi90ZXN0L2V4YW1wbGVzLzctbG9jYWxzdG9yYWdlLmpzeFxuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6IjctbG9jYWxzdG9yYWdlLmJ1bmRsZS5qcyJ9