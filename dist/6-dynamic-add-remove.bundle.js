webpackJsonp([4],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	
	var _extends = __webpack_require__(8)["default"];
	
	var React = __webpack_require__(4);
	var PureRenderMixin = __webpack_require__(6);
	var _ = __webpack_require__(16);
	var ResponsiveReactGridLayout = __webpack_require__(10).Responsive;
	
	/**
	 * This layout demonstrates how to use a grid with a dynamic number of elements.
	 */
	var AddRemoveLayout = React.createClass({
	  displayName: "AddRemoveLayout",
	
	  mixins: [PureRenderMixin],
	
	  getDefaultProps: function getDefaultProps() {
	    return {
	      className: "layout",
	      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
	      rowHeight: 100
	    };
	  },
	
	  getInitialState: function getInitialState() {
	    return {
	      items: [0, 1, 2, 3, 4].map(function (i, key, list) {
	        return { i: i, x: i * 2, y: 0, w: 2, h: 2, add: i === list.length - 1 };
	      }),
	      newCounter: 0
	    };
	  },
	
	  createElement: function createElement(el) {
	    var removeStyle = {
	      position: "absolute",
	      right: "2px",
	      top: 0,
	      cursor: "pointer"
	    };
	    var i = el.add ? "+" : el.i;
	    return React.createElement(
	      "div",
	      { key: i, _grid: el },
	      el.add ? React.createElement(
	        "span",
	        { className: "add text", onClick: this.onAddItem, title: "You can add an item by clicking here, too." },
	        "Add +"
	      ) : React.createElement(
	        "span",
	        { className: "text" },
	        i
	      ),
	      React.createElement(
	        "span",
	        { className: "remove", style: removeStyle, onClick: this.onRemoveItem.bind(this, i) },
	        "x"
	      )
	    );
	  },
	
	  onAddItem: function onAddItem() {
	    console.log("adding", "n" + this.state.newCounter);
	    this.setState({
	      // Add a new item. It must have a unique key!
	      items: this.state.items.concat({
	        i: "n" + this.state.newCounter,
	        x: this.state.items.length * 2 % (this.state.cols || 12),
	        y: Infinity, // puts it at the bottom
	        w: 2,
	        h: 2
	      }),
	      // Increment the counter to ensure key is always unique.
	      newCounter: this.state.newCounter + 1
	    });
	  },
	
	  // We're using the cols coming back from this to calculate where to add new items.
	  onBreakpointChange: function onBreakpointChange(breakpoint, cols) {
	    this.setState({
	      breakpoint: breakpoint,
	      cols: cols
	    });
	  },
	
	  onLayoutChange: function onLayoutChange(layout) {
	    this.props.onLayoutChange(layout);
	    this.setState({ layout: layout });
	  },
	
	  onRemoveItem: function onRemoveItem(i) {
	    console.log("removing", i);
	    this.setState({ items: _.reject(this.state.items, { i: i }) });
	  },
	
	  render: function render() {
	    return React.createElement(
	      "div",
	      null,
	      React.createElement(
	        "button",
	        { onClick: this.onAddItem },
	        "Add Item"
	      ),
	      React.createElement(
	        ResponsiveReactGridLayout,
	        _extends({ onLayoutChange: this.onLayoutChange, onBreakpointChange: this.onBreakpointChange
	        }, this.props),
	        _.map(this.state.items, this.createElement)
	      )
	    );
	  }
	});
	
	module.exports = AddRemoveLayout;
	
	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(11)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)(module)))

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzYtZHluYW1pYy1hZGQtcmVtb3ZlLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsMkRBQVksQ0FBQzs7OztBQUNiLEtBQUksS0FBSyxHQUFHLG1CQUFPLENBQUMsQ0FBTyxDQUFDLENBQUM7QUFDN0IsS0FBSSxlQUFlLEdBQUcsbUJBQU8sQ0FBQyxDQUE2QyxDQUFDLENBQUM7QUFDN0UsS0FBSSxDQUFDLEdBQUcsbUJBQU8sQ0FBQyxFQUFRLENBQUMsQ0FBQztBQUMxQixLQUFJLHlCQUF5QixHQUFHLG1CQUFPLENBQUMsRUFBbUIsQ0FBQyxDQUFDLFVBQVUsQ0FBQzs7Ozs7QUFLeEUsS0FBSSxlQUFlLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBQ3RDLFNBQU0sRUFBRSxDQUFDLGVBQWUsQ0FBQzs7QUFFekIsa0JBQWUsNkJBQUc7QUFDaEIsWUFBTztBQUNMLGdCQUFTLEVBQUUsUUFBUTtBQUNuQixXQUFJLEVBQUUsRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUM7QUFDNUMsZ0JBQVMsRUFBRSxHQUFHO01BQ2YsQ0FBQztJQUNIOztBQUVELGtCQUFlLDZCQUFHO0FBQ2hCLFlBQU87QUFDTCxZQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7QUFDaEQsZ0JBQU8sRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxD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R0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDbEI7TUFDeEIsQ0FDTjtJQUNIO0VBQ0YsQ0FBQyxDQUFDOztBQUVILE9BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDOztBQUVqQyxLQUFJLHdCQUFZLEtBQUssTUFBTSxFQUFFO0FBQzNCLHNCQUFPLENBQUMsRUFBa0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUHVyZVJlbmRlck1peGluID0gcmVxdWlyZSgncmVhY3QvbGliL1JlYWN0Q29tcG9uZW50V2l0aFB1cmVSZW5kZXJNaXhpbicpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBSZXNwb25zaXZlUmVhY3RHcmlkTGF5b3V0ID0gcmVxdWlyZSgncmVhY3QtZ3JpZC1sYXlvdXQnKS5SZXNwb25zaXZlO1xuXG4vKipcbiAqIFRoaXMgbGF5b3V0IGRlbW9uc3RyYXRlcyBob3cgdG8gdXNlIGEgZ3JpZCB3aXRoIGEgZHluYW1pYyBudW1iZXIgb2YgZWxlbWVudHMuXG4gKi9cbnZhciBBZGRSZW1vdmVMYXlvdXQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIG1peGluczogW1B1cmVSZW5kZXJNaXhpbl0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjbGFzc05hbWU6IFwibGF5b3V0XCIsXG4gICAgICBjb2xzOiB7bGc6IDEyLCBtZDogMTAsIHNtOiA2LCB4czogNCwgeHhzOiAyfSxcbiAgICAgIHJvd0hlaWdodDogMTAwXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGl0ZW1zOiBbMCwgMSwgMiwgMywgNF0ubWFwKGZ1bmN0aW9uKGksIGtleSwgbGlzdCkge1xuICAgICAgICByZXR1cm4ge2k6IGksIHg6IGkgKiAyLCB5OiAwLCB3OiAyLCBoOiAyLCBhZGQ6IGkgPT09IGxpc3QubGVuZ3RoIC0gMX07XG4gICAgICB9KSxcbiAgICAgIG5ld0NvdW50ZXI6IDBcbiAgICB9O1xuICB9LFxuXG4gIGNyZWF0ZUVsZW1lbnQoZWwpIHtcbiAgICB2YXIgcmVtb3ZlU3R5bGUgPSB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIHJpZ2h0OiAnMnB4JyxcbiAgICAgIHRvcDogMCxcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInXG4gICAgfTtcbiAgICB2YXIgaSA9IGVsLmFkZCA/ICcrJyA6IGVsLmk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYga2V5PXtpfSBfZ3JpZD17ZWx9PlxuICAgICAgICB7ZWwuYWRkID9cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJhZGQgdGV4dFwiIG9uQ2xpY2s9e3RoaXMub25BZGRJdGVtfSB0aXRsZT1cIllvdSBjYW4gYWRkIGFuIGl0ZW0gYnkgY2xpY2tpbmcgaGVyZSwgdG9vLlwiPkFkZCArPC9zcGFuPlxuICAgICAgICA6IDxzcGFuIGNsYXNzTmFtZT1cInRleHRcIj57aX08L3NwYW4+fVxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJyZW1vdmVcIiBzdHlsZT17cmVtb3ZlU3R5bGV9IG9uQ2xpY2s9e3RoaXMub25SZW1vdmVJdGVtLmJpbmQodGhpcywgaSl9Png8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9LFxuXG4gIG9uQWRkSXRlbSgpIHtcbiAgICBjb25zb2xlLmxvZygnYWRkaW5nJywgJ24nICsgdGhpcy5zdGF0ZS5uZXdDb3VudGVyKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIC8vIEFkZCBhIG5ldyBpdGVtLiBJdCBtdXN0IGhhdmUgYSB1bmlxdWUga2V5IVxuICAgICAgaXRlbXM6IHRoaXMuc3RhdGUuaXRlbXMuY29uY2F0KHtcbiAgICAgICAgaTogJ24nICsgdGhpcy5zdGF0ZS5uZXdDb3VudGVyLFxuICAgICAgICB4OiB0aGlzLnN0YXRlLml0ZW1zLmxlbmd0aCAqIDIgJSAodGhpcy5zdGF0ZS5jb2xzIHx8IDEyKSxcbiAgICAgICAgeTogSW5maW5pdHksIC8vIHB1dHMgaXQgYXQgdGhlIGJvdHRvbVxuICAgICAgICB3OiAyLFxuICAgICAgICBoOiAyXG4gICAgICB9KSxcbiAgICAgIC8vIEluY3JlbWVudCB0aGUgY291bnRlciB0byBlbnN1cmUga2V5IGlzIGFsd2F5cyB1bmlxdWUuXG4gICAgICBuZXdDb3VudGVyOiB0aGlzLnN0YXRlLm5ld0NvdW50ZXIgKyAxXG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gV2UncmUgdXNpbmcgdGhlIGNvbHMgY29taW5nIGJhY2sgZnJvbSB0aGlzIHRvIGNhbGN1bGF0ZSB3aGVyZSB0byBhZGQgbmV3IGl0ZW1zLlxuICBvbkJyZWFrcG9pbnRDaGFuZ2UoYnJlYWtwb2ludCwgY29scykge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYnJlYWtwb2ludDogYnJlYWtwb2ludCxcbiAgICAgIGNvbHM6IGNvbHNcbiAgICB9KTtcbiAgfSxcblxuICBvbkxheW91dENoYW5nZShsYXlvdXQpIHtcbiAgICB0aGlzLnByb3BzLm9uTGF5b3V0Q2hhbmdlKGxheW91dCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bGF5b3V0OiBsYXlvdXR9KTtcbiAgfSxcblxuICBvblJlbW92ZUl0ZW0oaSkge1xuICAgIGNvbnNvbGUubG9nKCdyZW1vdmluZycsIGkpO1xuICAgIHRoaXMuc2V0U3RhdGUoe2l0ZW1zOiBfLnJlamVjdCh0aGlzLnN0YXRlLml0ZW1zLCB7aTogaX0pfSk7XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMub25BZGRJdGVtfT5BZGQgSXRlbTwvYnV0dG9uPlxuICAgICAgICA8UmVzcG9uc2l2ZVJlYWN0R3JpZExheW91dCBvbkxheW91dENoYW5nZT17dGhpcy5vbkxheW91dENoYW5nZX0gb25CcmVha3BvaW50Q2hhbmdlPXt0aGlzLm9uQnJlYWtwb2ludENoYW5nZX1cbiAgICAgICAgICAgIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICB7Xy5tYXAodGhpcy5zdGF0ZS5pdGVtcywgdGhpcy5jcmVhdGVFbGVtZW50KX1cbiAgICAgICAgPC9SZXNwb25zaXZlUmVhY3RHcmlkTGF5b3V0PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQWRkUmVtb3ZlTGF5b3V0O1xuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgcmVxdWlyZSgnLi4vdGVzdC1ob29rLmpzeCcpKG1vZHVsZS5leHBvcnRzKTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vdGVzdC9leGFtcGxlcy82LWR5bmFtaWMtYWRkLXJlbW92ZS5qc3hcbiAqKi8iXSwic291cmNlUm9vdCI6IiIsImZpbGUiOiI2LWR5bmFtaWMtYWRkLXJlbW92ZS5idW5kbGUuanMifQ==