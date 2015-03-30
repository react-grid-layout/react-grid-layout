webpackJsonp([2],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module) {"use strict";
	
	var _extends = __webpack_require__(8)["default"];
	
	var React = __webpack_require__(4);
	var PureRenderMixin = __webpack_require__(6);
	var ResponsiveReactGridLayout = __webpack_require__(10).Responsive;
	
	/**
	 * This layout demonstrates how to sync multiple responsive layouts to localstorage.
	 */
	var ResponsiveLocalStorageLayout = React.createClass({
	  displayName: "ResponsiveLocalStorageLayout",
	
	  mixins: [PureRenderMixin],
	
	  getDefaultProps: function getDefaultProps() {
	    var ls = {};
	    if (global.localStorage) {
	      try {
	        ls = JSON.parse(global.localStorage.getItem("rgl-7")) || {};
	      } catch (e) {}
	    }
	    return {
	      className: "layout",
	      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
	      rowHeight: 30,
	      layouts: ls.layouts || {}
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
	
	  _saveToLocalStorage: function _saveToLocalStorage() {
	    if (global.localStorage) {
	      global.localStorage.setItem("rgl-7", JSON.stringify({
	        layouts: this.state.layouts
	      }));
	    }
	  },
	
	  onLayoutChange: function onLayoutChange(layout, layouts) {
	    this.props.onLayoutChange(layout);
	    this.setState({ layout: layout, layouts: layouts });
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
	        ResponsiveReactGridLayout,
	        _extends({}, this.props, {
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
	
	module.exports = ResponsiveLocalStorageLayout;
	
	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(11)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(9)(module)))

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzgtbG9jYWxzdG9yYWdlLXJlc3BvbnNpdmUuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxtRUFBWSxDQUFDOzs7O0FBQ2IsS0FBSSxLQUFLLEdBQUcsbUJBQU8sQ0FBQyxDQUFPLENBQUMsQ0FBQztBQUM3QixLQUFJLGVBQWUsR0FBRyxtQkFBTyxDQUFDLENBQTZDLENBQUMsQ0FBQztBQUM3RSxLQUFJLHlCQUF5QixHQUFHLG1CQUFPLENBQUMsRUFBbUIsQ0FBQyxDQUFDLFVBQVUsQ0FBQzs7Ozs7QUFLeEUsS0FBSSw0QkFBNEIsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFDbkQsU0FBTSxFQUFFLENBQUMsZUFBZSxDQUFDOztBQUV6QixrQkFBZSw2QkFBRztBQUNoQixTQUFJLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDWixTQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUU7QUFDdkIsV0FBSTtBQUNGLFdBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzdELENBQUMsT0FBTSxDQUFDLEVBQUUsRUFBRTtNQUNkO0FBQ0QsWUFBTztBQUNMLGdCQUFTLEVBQUUsUUFBUTtBQUNuQixXQUFJLEVBQUUsRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUM7QUFDNUMsZ0JBQVMsRUFBRSxFQUFFO0FBQ2IsY0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLElBQUksRUFBRTtNQUMxQixDQUFDO0lBQ0g7O0FBRUQsa0JBQWUsNkJBQUc7QUFDaEIsWUFBTyxFQUFFLENBQUM7SUFDWDs7QUFFRCxxQkFBa0IsOEJBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRTtBQUN2QyxTQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztJQUM1Qjs7QUFFRCxjQUFXLHlCQUFHO0FBQ1osU0FBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDO0lBQzdCOztBQUVELHNCQUFtQixpQ0FBRztBQUNwQixTQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUU7QUFDdkIsYUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDbEQsZ0JBQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU87UUFDNUIsQ0FBQyxDQUFDLENBQUM7TUFDTDtJQUNGOztBQUVELGlCQUFjLDBCQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUU7QUFDOUIsU0FBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbEMsU0FBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQUM7SUFDbkQ7O0FBRUQsU0FBTSxvQkFBRztBQUNQLFlBQ0U7OztPQUNFOztXQUFRLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBWTs7UUFBc0I7T0FDeEQ7QUFBQyxrQ0FBeUI7c0JBQ2xCLElBQUksQ0FBQyxLQUFLO0FBQ2QseUJBQWMsRUFBRSxJQUFJLENBQUMsY0FBZTtTQUN0Qzs7YUFBSyxHQUFHLEVBQUUsQ0FBRSxFQUFDLEtBQUssRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7V0FBQzs7ZUFBTSxTQUFTLEVBQUMsTUFBTTs7WUFBUztVQUFNO1NBQ25GOzthQUFLLEdBQUcsRUFBRSxDQUFFLEVBQUMsS0FBSyxFQUFFLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtXQUFDOztlQUFNLFNBQVMsRUFBQyxNQUFNOztZQUFTO1VBQU07U0FDbkY7O2FBQUssR0FBRyxFQUFFLENBQUUsRUFBQyxLQUFLLEVBQUUsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1dBQUM7O2VBQU0sU0FBUyxFQUFDLE1BQU07O1lBQVM7VUFBTTtTQUNuRjs7YUFBSyxHQUFHLEVBQUUsQ0FBRSxFQUFDLEtBQUssRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7V0FBQzs7ZUFBTSxTQUFTLEVBQUMsTUFBTTs7WUFBUztVQUFNO1NBQ25GOzthQUFLLEdBQUcsRUFBRSxDQUFFLEVBQUMsS0FBSyxFQUFFLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtXQUFDOztlQUFNLFNBQVMsRUFBQyxNQUFNOztZQUFTO1VBQU07UUFDekQ7TUFDeEIsQ0FDTjtJQUNIO0VBQ0YsQ0FBQyxDQUFDOztBQUVILE9BQU0sQ0FBQyxPQUFPLEdBQUcsNEJBQTRCLENBQUM7O0FBRTlDLEtBQUksd0JBQVksS0FBSyxNQUFNLEVBQUU7QUFDM0Isc0JBQU8sQ0FBQyxFQUFrQixDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBQdXJlUmVuZGVyTWl4aW4gPSByZXF1aXJlKCdyZWFjdC9saWIvUmVhY3RDb21wb25lbnRXaXRoUHVyZVJlbmRlck1peGluJyk7XG52YXIgUmVzcG9uc2l2ZVJlYWN0R3JpZExheW91dCA9IHJlcXVpcmUoJ3JlYWN0LWdyaWQtbGF5b3V0JykuUmVzcG9uc2l2ZTtcblxuLyoqXG4gKiBUaGlzIGxheW91dCBkZW1vbnN0cmF0ZXMgaG93IHRvIHN5bmMgbXVsdGlwbGUgcmVzcG9uc2l2ZSBsYXlvdXRzIHRvIGxvY2Fsc3RvcmFnZS5cbiAqL1xudmFyIFJlc3BvbnNpdmVMb2NhbFN0b3JhZ2VMYXlvdXQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIG1peGluczogW1B1cmVSZW5kZXJNaXhpbl0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHZhciBscyA9IHt9O1xuICAgIGlmIChnbG9iYWwubG9jYWxTdG9yYWdlKSB7XG4gICAgICB0cnkge1xuICAgICAgICBscyA9IEpTT04ucGFyc2UoZ2xvYmFsLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdyZ2wtNycpKSB8fCB7fTtcbiAgICAgIH0gY2F0Y2goZSkge31cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGNsYXNzTmFtZTogXCJsYXlvdXRcIixcbiAgICAgIGNvbHM6IHtsZzogMTIsIG1kOiAxMCwgc206IDYsIHhzOiA0LCB4eHM6IDJ9LFxuICAgICAgcm93SGVpZ2h0OiAzMCxcbiAgICAgIGxheW91dHM6IGxzLmxheW91dHMgfHwge31cbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge307XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG4gICAgdGhpcy5fc2F2ZVRvTG9jYWxTdG9yYWdlKCk7XG4gIH0sXG5cbiAgcmVzZXRMYXlvdXQoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bGF5b3V0OiBbXX0pO1xuICB9LFxuXG4gIF9zYXZlVG9Mb2NhbFN0b3JhZ2UoKSB7XG4gICAgaWYgKGdsb2JhbC5sb2NhbFN0b3JhZ2UpIHtcbiAgICAgIGdsb2JhbC5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncmdsLTcnLCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGxheW91dHM6IHRoaXMuc3RhdGUubGF5b3V0c1xuICAgICAgfSkpO1xuICAgIH1cbiAgfSxcblxuICBvbkxheW91dENoYW5nZShsYXlvdXQsIGxheW91dHMpIHtcbiAgICB0aGlzLnByb3BzLm9uTGF5b3V0Q2hhbmdlKGxheW91dCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bGF5b3V0OiBsYXlvdXQsIGxheW91dHM6IGxheW91dHN9KTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5yZXNldExheW91dH0+UmVzZXQgTGF5b3V0PC9idXR0b24+XG4gICAgICAgIDxSZXNwb25zaXZlUmVhY3RHcmlkTGF5b3V0XG4gICAgICAgICAgICB7Li4udGhpcy5wcm9wc31cbiAgICAgICAgICAgIG9uTGF5b3V0Q2hhbmdlPXt0aGlzLm9uTGF5b3V0Q2hhbmdlfT5cbiAgICAgICAgICA8ZGl2IGtleT17MX0gX2dyaWQ9e3t3OiAyLCBoOiAzLCB4OiAwLCB5OiAwfX0+PHNwYW4gY2xhc3NOYW1lPVwidGV4dFwiPjE8L3NwYW4+PC9kaXY+XG4gICAgICAgICAgPGRpdiBrZXk9ezJ9IF9ncmlkPXt7dzogMiwgaDogMywgeDogMiwgeTogMH19PjxzcGFuIGNsYXNzTmFtZT1cInRleHRcIj4yPC9zcGFuPjwvZGl2PlxuICAgICAgICAgIDxkaXYga2V5PXszfSBfZ3JpZD17e3c6IDIsIGg6IDMsIHg6IDQsIHk6IDB9fT48c3BhbiBjbGFzc05hbWU9XCJ0ZXh0XCI+Mzwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGtleT17NH0gX2dyaWQ9e3t3OiAyLCBoOiAzLCB4OiA2LCB5OiAwfX0+PHNwYW4gY2xhc3NOYW1lPVwidGV4dFwiPjQ8L3NwYW4+PC9kaXY+XG4gICAgICAgICAgPGRpdiBrZXk9ezV9IF9ncmlkPXt7dzogMiwgaDogMywgeDogOCwgeTogMH19PjxzcGFuIGNsYXNzTmFtZT1cInRleHRcIj41PC9zcGFuPjwvZGl2PlxuICAgICAgICA8L1Jlc3BvbnNpdmVSZWFjdEdyaWRMYXlvdXQ+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZXNwb25zaXZlTG9jYWxTdG9yYWdlTGF5b3V0O1xuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgcmVxdWlyZSgnLi4vdGVzdC1ob29rLmpzeCcpKG1vZHVsZS5leHBvcnRzKTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vdGVzdC9leGFtcGxlcy84LWxvY2Fsc3RvcmFnZS1yZXNwb25zaXZlLmpzeFxuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6IjgtbG9jYWxzdG9yYWdlLXJlc3BvbnNpdmUuYnVuZGxlLmpzIn0=