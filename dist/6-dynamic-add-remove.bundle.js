webpackJsonp([4],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(4);
	var PureRenderMixin = __webpack_require__(6);
	var _ = __webpack_require__(18);
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
	        React.__spread({ onLayoutChange: this.onLayoutChange, onBreakpointChange: this.onBreakpointChange
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzYtZHluYW1pYy1hZGQtcmVtb3ZlLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFVRSxTQUFNLEVBQUUsQ0FBQyxlQUFlLENBQUM7O0FBRXpCLGtCQUFlLDZCQUFHO0FBQ2hCLFlBQU87QUFDTCxnQkFBUyxFQUFFLFFBQVE7QUFDbkIsV0FBSSxFQUFFLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFDO0FBQzVDLGdCQUFTLEVBQUUsR0FBRztNQUNmLENBQUM7SUFDSDs7QUFFRCxrQkFBZSw2QkFBRztBQUNoQixZQUFPO0FBQ0wsWUFBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0FBQ2hELGdCQUFPLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDLENBQUM7UUFDdkUsQ0FBQztBQUNGLGlCQUFVLEVBQUUsQ0FBQztNQUNkLENBQUM7SUFDSDs7QUFFRCxnQkFBYSx5QkFBQyxFQUFFLEVBQUU7QUFDaEIsU0FBSSxXQUFXLEdBQUc7QUFDaEIsZUFBUSxFQUFFLFVBQVU7QUFDcEIsWUFBSyxFQUFFLEtBQUs7QUFDWixVQUFHLEVBQUUsQ0FBQztBQUNOLGFBQU0sRUFBRSxTQUFTO01BQ2xCLENBQUM7QUFDRixTQUFJLENBQUMsR0FBRyxFQUFF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XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFB1cmVSZW5kZXJNaXhpbiA9IHJlcXVpcmUoJ3JlYWN0L2xpYi9SZWFjdENvbXBvbmVudFdpdGhQdXJlUmVuZGVyTWl4aW4nKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgUmVzcG9uc2l2ZVJlYWN0R3JpZExheW91dCA9IHJlcXVpcmUoJ3JlYWN0LWdyaWQtbGF5b3V0JykuUmVzcG9uc2l2ZTtcblxuLyoqXG4gKiBUaGlzIGxheW91dCBkZW1vbnN0cmF0ZXMgaG93IHRvIHVzZSBhIGdyaWQgd2l0aCBhIGR5bmFtaWMgbnVtYmVyIG9mIGVsZW1lbnRzLlxuICovXG52YXIgQWRkUmVtb3ZlTGF5b3V0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBtaXhpbnM6IFtQdXJlUmVuZGVyTWl4aW5dLFxuXG4gIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2xhc3NOYW1lOiBcImxheW91dFwiLFxuICAgICAgY29sczoge2xnOiAxMiwgbWQ6IDEwLCBzbTogNiwgeHM6IDQsIHh4czogMn0sXG4gICAgICByb3dIZWlnaHQ6IDEwMFxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpdGVtczogWzAsIDEsIDIsIDMsIDRdLm1hcChmdW5jdGlvbihpLCBrZXksIGxpc3QpIHtcbiAgICAgICAgcmV0dXJuIHtpOiBpLCB4OiBpICogMiwgeTogMCwgdzogMiwgaDogMiwgYWRkOiBpID09PSBsaXN0Lmxlbmd0aCAtIDF9O1xuICAgICAgfSksXG4gICAgICBuZXdDb3VudGVyOiAwXG4gICAgfTtcbiAgfSxcblxuICBjcmVhdGVFbGVtZW50KGVsKSB7XG4gICAgdmFyIHJlbW92ZVN0eWxlID0ge1xuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICByaWdodDogJzJweCcsXG4gICAgICB0b3A6IDAsXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJ1xuICAgIH07XG4gICAgdmFyIGkgPSBlbC5hZGQgPyAnKycgOiBlbC5pO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGtleT17aX0gX2dyaWQ9e2VsfT5cbiAgICAgICAge2VsLmFkZCA/IFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImFkZCB0ZXh0XCIgb25DbGljaz17dGhpcy5vbkFkZEl0ZW19IHRpdGxlPVwiWW91IGNhbiBhZGQgYW4gaXRlbSBieSBjbGlja2luZyBoZXJlLCB0b28uXCI+QWRkICs8L3NwYW4+XG4gICAgICAgIDogPHNwYW4gY2xhc3NOYW1lPVwidGV4dFwiPntpfTwvc3Bhbj59XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInJlbW92ZVwiIHN0eWxlPXtyZW1vdmVTdHlsZX0gb25DbGljaz17dGhpcy5vblJlbW92ZUl0ZW0uYmluZCh0aGlzLCBpKX0+eDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG5cbiAgb25BZGRJdGVtKCkge1xuICAgIGNvbnNvbGUubG9nKCdhZGRpbmcnLCAnbicgKyB0aGlzLnN0YXRlLm5ld0NvdW50ZXIpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgLy8gQWRkIGEgbmV3IGl0ZW0uIEl0IG11c3QgaGF2ZSBhIHVuaXF1ZSBrZXkhXG4gICAgICBpdGVtczogdGhpcy5zdGF0ZS5pdGVtcy5jb25jYXQoe1xuICAgICAgICBpOiAnbicgKyB0aGlzLnN0YXRlLm5ld0NvdW50ZXIsXG4gICAgICAgIHg6IHRoaXMuc3RhdGUuaXRlbXMubGVuZ3RoICogMiAlICh0aGlzLnN0YXRlLmNvbHMgfHwgMTIpLFxuICAgICAgICB5OiBJbmZpbml0eSwgLy8gcHV0cyBpdCBhdCB0aGUgYm90dG9tXG4gICAgICAgIHc6IDIsIFxuICAgICAgICBoOiAyXG4gICAgICB9KSxcbiAgICAgIC8vIEluY3JlbWVudCB0aGUgY291bnRlciB0byBlbnN1cmUga2V5IGlzIGFsd2F5cyB1bmlxdWUuXG4gICAgICBuZXdDb3VudGVyOiB0aGlzLnN0YXRlLm5ld0NvdW50ZXIgKyAxXG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gV2UncmUgdXNpbmcgdGhlIGNvbHMgY29taW5nIGJhY2sgZnJvbSB0aGlzIHRvIGNhbGN1bGF0ZSB3aGVyZSB0byBhZGQgbmV3IGl0ZW1zLlxuICBvbkJyZWFrcG9pbnRDaGFuZ2UoYnJlYWtwb2ludCwgY29scykge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYnJlYWtwb2ludDogYnJlYWtwb2ludCxcbiAgICAgIGNvbHM6IGNvbHNcbiAgICB9KTtcbiAgfSxcblxuICBvbkxheW91dENoYW5nZShsYXlvdXQpIHtcbiAgICB0aGlzLnByb3BzLm9uTGF5b3V0Q2hhbmdlKGxheW91dCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bGF5b3V0OiBsYXlvdXR9KTtcbiAgfSxcblxuICBvblJlbW92ZUl0ZW0oaSkge1xuICAgIGNvbnNvbGUubG9nKCdyZW1vdmluZycsIGkpO1xuICAgIHRoaXMuc2V0U3RhdGUoe2l0ZW1zOiBfLnJlamVjdCh0aGlzLnN0YXRlLml0ZW1zLCB7aTogaX0pfSk7XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMub25BZGRJdGVtfT5BZGQgSXRlbTwvYnV0dG9uPlxuICAgICAgICA8UmVzcG9uc2l2ZVJlYWN0R3JpZExheW91dCBvbkxheW91dENoYW5nZT17dGhpcy5vbkxheW91dENoYW5nZX0gb25CcmVha3BvaW50Q2hhbmdlPXt0aGlzLm9uQnJlYWtwb2ludENoYW5nZX0gXG4gICAgICAgICAgICB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAge18ubWFwKHRoaXMuc3RhdGUuaXRlbXMsIHRoaXMuY3JlYXRlRWxlbWVudCl9XG4gICAgICAgIDwvUmVzcG9uc2l2ZVJlYWN0R3JpZExheW91dD5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFkZFJlbW92ZUxheW91dDtcblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIHJlcXVpcmUoJy4uL3Rlc3QtaG9vay5qc3gnKShtb2R1bGUuZXhwb3J0cyk7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3Rlc3QvZXhhbXBsZXMvNi1keW5hbWljLWFkZC1yZW1vdmUuanN4XG4gKiovIl0sInNvdXJjZVJvb3QiOiIiLCJmaWxlIjoiNi1keW5hbWljLWFkZC1yZW1vdmUuYnVuZGxlLmpzIn0=