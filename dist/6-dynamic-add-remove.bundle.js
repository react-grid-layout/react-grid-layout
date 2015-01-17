webpackJsonp([4],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(4);
	var _ = __webpack_require__(17);
	var ResponsiveReactGridLayout = __webpack_require__(10).Responsive;
	
	/**
	 * This layout demonstrates how to use a grid with a dynamic number of elements.
	 */
	var AddRemoveLayout = React.createClass({
	  displayName: "AddRemoveLayout",
	  mixins: [React.addons.PureRenderMixin],
	
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzYtZHluYW1pYy1hZGQtcmVtb3ZlLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQVNFLFNBQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDOztBQUV0QyxrQkFBZSw2QkFBRztBQUNoQixZQUFPO0FBQ0wsZ0JBQVMsRUFBRSxRQUFRO0FBQ25CLFdBQUksRUFBRSxFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBQztBQUM1QyxnQkFBUyxFQUFFLEdBQUc7TUFDZixDQUFDO0lBQ0g7O0FBRUQsa0JBQWUsNkJBQUc7QUFDaEIsWUFBTztBQUNMLFlBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBUyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtBQUNoRCxnQkFBTyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQyxDQUFDO1FBQ3ZFLENBQUM7QUFDRixpQkFBVSxFQUFFLENBQUM7TUFDZCxDQUFDO0lBQ0g7O0FBRUQsZ0JBQWEseUJBQUMsRUFBRSxFQUFFO0FBQ2hCLFNBQUksV0FBVyxHQUFHO0FBQ2hCLGVBQVEsRUFBRSxVQUFVO0FBQ3BCLFlBQUssRUFBRSxLQUFLO0FBQ1osVUFBRyxFQUFFLENBQUM7QUFDTixhQUFNLEVBQUUsU0FBUztNQUNsQixDQUFDO0FBQ0Ys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bnQiOlsiJ3VzZSBzdHJpY3QnO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xudmFyIFJlc3BvbnNpdmVSZWFjdEdyaWRMYXlvdXQgPSByZXF1aXJlKCdyZWFjdC1ncmlkLWxheW91dCcpLlJlc3BvbnNpdmU7XG5cbi8qKlxuICogVGhpcyBsYXlvdXQgZGVtb25zdHJhdGVzIGhvdyB0byB1c2UgYSBncmlkIHdpdGggYSBkeW5hbWljIG51bWJlciBvZiBlbGVtZW50cy5cbiAqL1xudmFyIEFkZFJlbW92ZUxheW91dCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgbWl4aW5zOiBbUmVhY3QuYWRkb25zLlB1cmVSZW5kZXJNaXhpbl0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjbGFzc05hbWU6IFwibGF5b3V0XCIsXG4gICAgICBjb2xzOiB7bGc6IDEyLCBtZDogMTAsIHNtOiA2LCB4czogNCwgeHhzOiAyfSxcbiAgICAgIHJvd0hlaWdodDogMTAwXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGl0ZW1zOiBbMCwgMSwgMiwgMywgNF0ubWFwKGZ1bmN0aW9uKGksIGtleSwgbGlzdCkge1xuICAgICAgICByZXR1cm4ge2k6IGksIHg6IGkgKiAyLCB5OiAwLCB3OiAyLCBoOiAyLCBhZGQ6IGkgPT09IGxpc3QubGVuZ3RoIC0gMX07XG4gICAgICB9KSxcbiAgICAgIG5ld0NvdW50ZXI6IDBcbiAgICB9O1xuICB9LFxuXG4gIGNyZWF0ZUVsZW1lbnQoZWwpIHtcbiAgICB2YXIgcmVtb3ZlU3R5bGUgPSB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIHJpZ2h0OiAnMnB4JyxcbiAgICAgIHRvcDogMCxcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInXG4gICAgfTtcbiAgICB2YXIgaSA9IGVsLmFkZCA/ICcrJyA6IGVsLmk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYga2V5PXtpfSBfZ3JpZD17ZWx9PlxuICAgICAgICB7ZWwuYWRkID8gXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiYWRkIHRleHRcIiBvbkNsaWNrPXt0aGlzLm9uQWRkSXRlbX0gdGl0bGU9XCJZb3UgY2FuIGFkZCBhbiBpdGVtIGJ5IGNsaWNraW5nIGhlcmUsIHRvby5cIj5BZGQgKzwvc3Bhbj5cbiAgICAgICAgOiA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0XCI+e2l9PC9zcGFuPn1cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwicmVtb3ZlXCIgc3R5bGU9e3JlbW92ZVN0eWxlfSBvbkNsaWNrPXt0aGlzLm9uUmVtb3ZlSXRlbS5iaW5kKHRoaXMsIGkpfT54PC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfSxcblxuICBvbkFkZEl0ZW0oKSB7XG4gICAgY29uc29sZS5sb2coJ2FkZGluZycsICduJyArIHRoaXMuc3RhdGUubmV3Q291bnRlcik7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAvLyBBZGQgYSBuZXcgaXRlbS4gSXQgbXVzdCBoYXZlIGEgdW5pcXVlIGtleSFcbiAgICAgIGl0ZW1zOiB0aGlzLnN0YXRlLml0ZW1zLmNvbmNhdCh7XG4gICAgICAgIGk6ICduJyArIHRoaXMuc3RhdGUubmV3Q291bnRlcixcbiAgICAgICAgeDogdGhpcy5zdGF0ZS5pdGVtcy5sZW5ndGggKiAyICUgKHRoaXMuc3RhdGUuY29scyB8fCAxMiksXG4gICAgICAgIHk6IEluZmluaXR5LCAvLyBwdXRzIGl0IGF0IHRoZSBib3R0b21cbiAgICAgICAgdzogMiwgXG4gICAgICAgIGg6IDJcbiAgICAgIH0pLFxuICAgICAgLy8gSW5jcmVtZW50IHRoZSBjb3VudGVyIHRvIGVuc3VyZSBrZXkgaXMgYWx3YXlzIHVuaXF1ZS5cbiAgICAgIG5ld0NvdW50ZXI6IHRoaXMuc3RhdGUubmV3Q291bnRlciArIDFcbiAgICB9KTtcbiAgfSxcblxuICAvLyBXZSdyZSB1c2luZyB0aGUgY29scyBjb21pbmcgYmFjayBmcm9tIHRoaXMgdG8gY2FsY3VsYXRlIHdoZXJlIHRvIGFkZCBuZXcgaXRlbXMuXG4gIG9uQnJlYWtwb2ludENoYW5nZShicmVha3BvaW50LCBjb2xzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBicmVha3BvaW50OiBicmVha3BvaW50LFxuICAgICAgY29sczogY29sc1xuICAgIH0pO1xuICB9LFxuXG4gIG9uTGF5b3V0Q2hhbmdlKGxheW91dCkge1xuICAgIHRoaXMucHJvcHMub25MYXlvdXRDaGFuZ2UobGF5b3V0KTtcbiAgICB0aGlzLnNldFN0YXRlKHtsYXlvdXQ6IGxheW91dH0pO1xuICB9LFxuXG4gIG9uUmVtb3ZlSXRlbShpKSB7XG4gICAgY29uc29sZS5sb2coJ3JlbW92aW5nJywgaSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7aXRlbXM6IF8ucmVqZWN0KHRoaXMuc3RhdGUuaXRlbXMsIHtpOiBpfSl9KTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5vbkFkZEl0ZW19PkFkZCBJdGVtPC9idXR0b24+XG4gICAgICAgIDxSZXNwb25zaXZlUmVhY3RHcmlkTGF5b3V0IG9uTGF5b3V0Q2hhbmdlPXt0aGlzLm9uTGF5b3V0Q2hhbmdlfSBvbkJyZWFrcG9pbnRDaGFuZ2U9e3RoaXMub25CcmVha3BvaW50Q2hhbmdlfSBcbiAgICAgICAgICAgIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICB7Xy5tYXAodGhpcy5zdGF0ZS5pdGVtcywgdGhpcy5jcmVhdGVFbGVtZW50KX1cbiAgICAgICAgPC9SZXNwb25zaXZlUmVhY3RHcmlkTGF5b3V0PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQWRkUmVtb3ZlTGF5b3V0O1xuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgcmVxdWlyZSgnLi4vdGVzdC1ob29rLmpzeCcpKG1vZHVsZS5leHBvcnRzKTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vdGVzdC9leGFtcGxlcy82LWR5bmFtaWMtYWRkLXJlbW92ZS5qc3hcbiAqKi8iXSwic291cmNlUm9vdCI6IiIsImZpbGUiOiI2LWR5bmFtaWMtYWRkLXJlbW92ZS5idW5kbGUuanMifQ==