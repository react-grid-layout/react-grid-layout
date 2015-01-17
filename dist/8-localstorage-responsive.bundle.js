webpackJsonp([2],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module) {"use strict";
	var React = __webpack_require__(4);
	var ResponsiveReactGridLayout = __webpack_require__(10).Responsive;
	
	/**
	 * This layout demonstrates how to sync multiple responsive layouts to localstorage.
	 */
	var ResponsiveLocalStorageLayout = React.createClass({
	  displayName: "ResponsiveLocalStorageLayout",
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
	
	  _saveToLocalStorage: function SaveToLocalStorage() {
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
	
	module.exports = ResponsiveLocalStorageLayout;
	
	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(11)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(9)(module)))

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzgtbG9jYWxzdG9yYWdlLXJlc3BvbnNpdmUuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFRRSxTQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQzs7QUFFdEMsa0JBQWUsNkJBQUc7QUFDaEIsU0FBSSxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ1osU0FBSSxNQUFNLENBQUMsWUFBWSxFQUFFO0FBQ3ZCLFdBQUk7QUFDRixXQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM3RCxDQUFDLE9BQU0sQ0FBQyxFQUFFLEVBQUU7TUFDZDtBQUNELFlBQU87QUFDTCxnQkFBUyxFQUFFLFFBQVE7QUFDbkIsV0FBSSxFQUFFLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFDO0FBQzVDLGdCQUFTLEVBQUUsRUFBRTtBQUNiLGNBQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxJQUFJLEVBQUU7TUFDMUIsQ0FBQztJQUNIOztBQUVELGtCQUFlLDZCQUFHO0FBQ2hCLFlBQU8sRUFBRSxDQUFDO0lBQ1g7O0FBRUQscUJBQWtCLDhCQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUU7QUFDdkMsU0FBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFDNUI7O0FBRUQsY0FBVyx5QkFBRztBQUNaLFNBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxNQUFNLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQztJQUM3Qjs7QUFFRCxzQkFBbUIsZ0NBQUc7QUFDcEIsU0FBSSxNQUFNLENBQUMsWUFBWSxFQUFFO0FBQ3ZCLGFBQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQ2xELGdCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPO1FBQzVCLENBQUMsQ0FBQyxDQUFDO01BQ0w7SUFDRjs7QUFFRCxpQkFBYywwQkFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFO0FBQzlCLFNBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2xDLFNBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO0lBQ25EOztBQUVELFNBQU0sb0JBQUc7QUFDUCxZQUNFOzs7T0FDRTs7V0FBUSxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVk7O1FBQXNCO09BRXhEO0FBQUMsa0NBQXlCOzRCQUNsQixJQUFJLENBQUMsS0FBSztBQUNkLHlCQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWU7U0FDdEM7O2FBQUssR0FBRyxFQUFFLENBQUUsRUFBQyxLQUFLLEVBQUUsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1dBQUM7O2VBQU0sU0FBUyxFQUFDLE1BQU07O1lBQVM7VUFBTTtTQUVuRjs7YUFBSyxHQUFHLEVBQUUsQ0FBRSxFQUFDLEtBQUssRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7V0FBQzs7ZUFBTSxTQUFTLEVBQUMsTUFBTTs7WUFBUztVQUFNO1NBRW5GOzthQUFLLEdBQUcsRUFBRSxDQUFFLEVBQUMsS0FBSyxFQUFFLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtXQUFDOztlQUFNLFNBQVMsRUFBQyxNQUFNOztZQUFTO1VBQU07U0FFbkY7O2FBQUssR0FBRyxFQUFFLENBQUUsRUFBQyxLQUFLLEVBQUUsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1dBQUM7O2VBQU0sU0FBUyxFQUFDLE1BQU07O1lBQVM7VUFBTTtTQUVuRjs7YUFBSyxHQUFHLEVBQUUsQ0FBRSxFQUFDLEtBQUssRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7V0FBQzs7ZUFBTSxTQUFTLEVBQUMsTUFBTTs7WUFBUztVQUFNO1FBRXpEO01BRXhCLENBQ047SUFDSDtFQUNGLENBQUMsQ0FBQzs7QUFFSCxPQUFNLENBQUMsT0FBTyxHQUFHLDRCQUE0QixDQUFDOztBQUU5QyxLQUFJLHdCQUFZLEtBQUssTUFBTSxFQUFFO0FBQzNCLHNCQUFPLENBQUMsRUFBa0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFJlc3BvbnNpdmVSZWFjdEdyaWRMYXlvdXQgPSByZXF1aXJlKCdyZWFjdC1ncmlkLWxheW91dCcpLlJlc3BvbnNpdmU7XG5cbi8qKlxuICogVGhpcyBsYXlvdXQgZGVtb25zdHJhdGVzIGhvdyB0byBzeW5jIG11bHRpcGxlIHJlc3BvbnNpdmUgbGF5b3V0cyB0byBsb2NhbHN0b3JhZ2UuXG4gKi9cbnZhciBSZXNwb25zaXZlTG9jYWxTdG9yYWdlTGF5b3V0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBtaXhpbnM6IFtSZWFjdC5hZGRvbnMuUHVyZVJlbmRlck1peGluXSxcblxuICBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgdmFyIGxzID0ge307XG4gICAgaWYgKGdsb2JhbC5sb2NhbFN0b3JhZ2UpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxzID0gSlNPTi5wYXJzZShnbG9iYWwubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3JnbC03JykpIHx8IHt9O1xuICAgICAgfSBjYXRjaChlKSB7fVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgY2xhc3NOYW1lOiBcImxheW91dFwiLFxuICAgICAgY29sczoge2xnOiAxMiwgbWQ6IDEwLCBzbTogNiwgeHM6IDQsIHh4czogMn0sXG4gICAgICByb3dIZWlnaHQ6IDMwLFxuICAgICAgbGF5b3V0czogbHMubGF5b3V0cyB8fCB7fVxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSxcblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICB0aGlzLl9zYXZlVG9Mb2NhbFN0b3JhZ2UoKTtcbiAgfSxcblxuICByZXNldExheW91dCgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtsYXlvdXQ6IFtdfSk7XG4gIH0sXG5cbiAgX3NhdmVUb0xvY2FsU3RvcmFnZSgpIHtcbiAgICBpZiAoZ2xvYmFsLmxvY2FsU3RvcmFnZSkge1xuICAgICAgZ2xvYmFsLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdyZ2wtNycsIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgbGF5b3V0czogdGhpcy5zdGF0ZS5sYXlvdXRzXG4gICAgICB9KSk7XG4gICAgfVxuICB9LFxuXG4gIG9uTGF5b3V0Q2hhbmdlKGxheW91dCwgbGF5b3V0cykge1xuICAgIHRoaXMucHJvcHMub25MYXlvdXRDaGFuZ2UobGF5b3V0KTtcbiAgICB0aGlzLnNldFN0YXRlKHtsYXlvdXQ6IGxheW91dCwgbGF5b3V0czogbGF5b3V0c30pO1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLnJlc2V0TGF5b3V0fT5SZXNldCBMYXlvdXQ8L2J1dHRvbj5cbiAgICAgICAgPFJlc3BvbnNpdmVSZWFjdEdyaWRMYXlvdXQgXG4gICAgICAgICAgICB7Li4udGhpcy5wcm9wc31cbiAgICAgICAgICAgIG9uTGF5b3V0Q2hhbmdlPXt0aGlzLm9uTGF5b3V0Q2hhbmdlfT5cbiAgICAgICAgICA8ZGl2IGtleT17MX0gX2dyaWQ9e3t3OiAyLCBoOiAzLCB4OiAwLCB5OiAwfX0+PHNwYW4gY2xhc3NOYW1lPVwidGV4dFwiPjE8L3NwYW4+PC9kaXY+XG4gICAgICAgICAgPGRpdiBrZXk9ezJ9IF9ncmlkPXt7dzogMiwgaDogMywgeDogMiwgeTogMH19PjxzcGFuIGNsYXNzTmFtZT1cInRleHRcIj4yPC9zcGFuPjwvZGl2PlxuICAgICAgICAgIDxkaXYga2V5PXszfSBfZ3JpZD17e3c6IDIsIGg6IDMsIHg6IDQsIHk6IDB9fT48c3BhbiBjbGFzc05hbWU9XCJ0ZXh0XCI+Mzwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGtleT17NH0gX2dyaWQ9e3t3OiAyLCBoOiAzLCB4OiA2LCB5OiAwfX0+PHNwYW4gY2xhc3NOYW1lPVwidGV4dFwiPjQ8L3NwYW4+PC9kaXY+XG4gICAgICAgICAgPGRpdiBrZXk9ezV9IF9ncmlkPXt7dzogMiwgaDogMywgeDogOCwgeTogMH19PjxzcGFuIGNsYXNzTmFtZT1cInRleHRcIj41PC9zcGFuPjwvZGl2PlxuICAgICAgICA8L1Jlc3BvbnNpdmVSZWFjdEdyaWRMYXlvdXQ+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZXNwb25zaXZlTG9jYWxTdG9yYWdlTGF5b3V0O1xuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgcmVxdWlyZSgnLi4vdGVzdC1ob29rLmpzeCcpKG1vZHVsZS5leHBvcnRzKTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vdGVzdC9leGFtcGxlcy84LWxvY2Fsc3RvcmFnZS1yZXNwb25zaXZlLmpzeFxuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6IjgtbG9jYWxzdG9yYWdlLXJlc3BvbnNpdmUuYnVuZGxlLmpzIn0=