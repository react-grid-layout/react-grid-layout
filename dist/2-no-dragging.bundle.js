webpackJsonp([8],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(4);
	var _ = __webpack_require__(17);
	var ReactGridLayout = __webpack_require__(10);
	
	var NoDraggingLayout = React.createClass({
	  displayName: "NoDraggingLayout",
	  mixins: [React.addons.PureRenderMixin],
	
	  propTypes: {
	    onLayoutChange: React.PropTypes.func.isRequired
	  },
	
	  getDefaultProps: function getDefaultProps() {
	    return {
	      className: "layout",
	      isDraggable: false,
	      isResizable: false,
	      items: 50,
	      cols: 12,
	      rowHeight: 30
	    };
	  },
	
	  getInitialState: function getInitialState() {
	    var layout = this.generateLayout();
	    return {
	      layout: layout
	    };
	  },
	
	  generateDOM: function generateDOM() {
	    return _.map(_.range(this.props.items), function (i) {
	      return React.createElement(
	        "div",
	        { key: i },
	        React.createElement(
	          "span",
	          { className: "text" },
	          i
	        )
	      );
	    });
	  },
	
	  generateLayout: function generateLayout() {
	    var p = this.props;
	    return _.map(new Array(p.items), function (item, i) {
	      var y = _.result(p, "y") || Math.ceil(Math.random() * 4) + 1;
	      return { x: i * 2 % 12, y: Math.floor(i / 6) * y, w: 2, h: y, i: i };
	    });
	  },
	
	  onLayoutChange: function (layout) {
	    this.props.onLayoutChange(layout);
	  },
	
	  render: function render() {
	    return React.createElement(
	      ReactGridLayout,
	      React.__spread({ layout: this.state.layout, onLayoutChange: this.onLayoutChange
	      }, this.props),
	      this.generateDOM()
	    );
	  }
	});
	
	module.exports = NoDraggingLayout;
	
	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(11)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)(module)))

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzItbm8tZHJhZ2dpbmcuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBTUUsU0FBTSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUM7O0FBRXRDLFlBQVMsRUFBRTtBQUNULG1CQUFjLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtJQUNoRDs7QUFFRCxrQkFBZSw2QkFBRztBQUNoQixZQUFPO0FBQ0wsZ0JBQVMsRUFBRSxRQUFRO0FBQ25CLGtCQUFXLEVBQUUsS0FBSztBQUNsQixrQkFBVyxFQUFFLEtBQUs7QUFDbEIsWUFBSyxFQUFFLEVBQUU7QUFDVCxXQUFJLEVBQUUsRUFBRTtBQUNSLGdCQUFTLEVBQUUsRUFBRTtNQUNkLENBQUM7SUFDSDs7QUFFRCxrQkFBZSw2QkFBRztBQUNoQixTQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDbkMsWUFBTztBQUNMLGFBQU0sRUFBRSxNQUFNO01BQ2YsQ0FBQztJQUNIOztBQUVELGNBQVcseUJBQUc7QUFDWixZQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVMsQ0FBQyxFQUFFO0FBQ2xELGNBQVE7O1dBQUssR0FBRyxFQUFFLENBQUU7U0FBQzs7YUFBTSxTQUFTLEVBQUMsTUFBTTtXQUFFLENBQUM7VUFBUTtRQUFNLENBQUU7TUFDL0QsQ0FBQyxDQUFDO0lBQ0o7O0FBRUQsaUJBQWMsNEJBQUc7QUFDZixTQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ25CLFlBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBUyxJQUFJLEVBQUUsQ0FBQyxFQUFFO0FBQ2pELFdBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3RCxjQUFPLEVBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQztNQUNwRSxDQUFDLENBQUM7SUFDSjs7QUFFRCxpQkFBYyxFQUFFLFVBQVMsTUFBTSxFQUFFO0FBQy9CLFNBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ25DOztBQUVELFNBQU0sb0JBQUc7QUFDUCxZQUNFO0FBQUMsc0JBQWU7d0JBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTyxFQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBZTtVQUN4RSxJQUFJLENBQUMsS0FBSztPQUNmLElBQUksQ0FBQyxXQUFXLEVBQUU7TUFFSCxDQUNsQjtJQUNIO0VBQ0YsQ0FBQyxDQUFDOztBQUVILE9BQU0sQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLENBQUM7O0FBRWxDLEtBQUksd0JBQVksS0FBSyxNQUFNLEVBQUU7QUFDM0Isc0JBQU8sQ0FBQyxFQUFrQixDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xudmFyIFJlYWN0R3JpZExheW91dCA9IHJlcXVpcmUoJ3JlYWN0LWdyaWQtbGF5b3V0Jyk7XG5cbnZhciBOb0RyYWdnaW5nTGF5b3V0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBtaXhpbnM6IFtSZWFjdC5hZGRvbnMuUHVyZVJlbmRlck1peGluXSxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBvbkxheW91dENoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2xhc3NOYW1lOiBcImxheW91dFwiLFxuICAgICAgaXNEcmFnZ2FibGU6IGZhbHNlLFxuICAgICAgaXNSZXNpemFibGU6IGZhbHNlLFxuICAgICAgaXRlbXM6IDUwLFxuICAgICAgY29sczogMTIsXG4gICAgICByb3dIZWlnaHQ6IDMwXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgdmFyIGxheW91dCA9IHRoaXMuZ2VuZXJhdGVMYXlvdXQoKTtcbiAgICByZXR1cm4ge1xuICAgICAgbGF5b3V0OiBsYXlvdXRcbiAgICB9O1xuICB9LFxuXG4gIGdlbmVyYXRlRE9NKCkge1xuICAgIHJldHVybiBfLm1hcChfLnJhbmdlKHRoaXMucHJvcHMuaXRlbXMpLCBmdW5jdGlvbihpKSB7XG4gICAgICByZXR1cm4gKDxkaXYga2V5PXtpfT48c3BhbiBjbGFzc05hbWU9XCJ0ZXh0XCI+e2l9PC9zcGFuPjwvZGl2Pik7XG4gICAgfSk7XG4gIH0sXG5cbiAgZ2VuZXJhdGVMYXlvdXQoKSB7XG4gICAgdmFyIHAgPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiBfLm1hcChuZXcgQXJyYXkocC5pdGVtcyksIGZ1bmN0aW9uKGl0ZW0sIGkpIHtcbiAgICAgIHZhciB5ID0gXy5yZXN1bHQocCwgJ3knKSB8fCBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIDQpICsgMTtcbiAgICAgIHJldHVybiB7eDogaSAqIDIgJSAxMiwgeTogTWF0aC5mbG9vcihpIC8gNikgKiB5LCB3OiAyLCBoOiB5LCBpOiBpfTtcbiAgICB9KTtcbiAgfSxcblxuICBvbkxheW91dENoYW5nZTogZnVuY3Rpb24obGF5b3V0KSB7XG4gICAgdGhpcy5wcm9wcy5vbkxheW91dENoYW5nZShsYXlvdXQpO1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFJlYWN0R3JpZExheW91dCBsYXlvdXQ9e3RoaXMuc3RhdGUubGF5b3V0fSBvbkxheW91dENoYW5nZT17dGhpcy5vbkxheW91dENoYW5nZX1cbiAgICAgICAgICB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgIHt0aGlzLmdlbmVyYXRlRE9NKCl9XG4gICAgICA8L1JlYWN0R3JpZExheW91dD5cbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBOb0RyYWdnaW5nTGF5b3V0O1xuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgcmVxdWlyZSgnLi4vdGVzdC1ob29rLmpzeCcpKG1vZHVsZS5leHBvcnRzKTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vdGVzdC9leGFtcGxlcy8yLW5vLWRyYWdnaW5nLmpzeFxuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6IjItbm8tZHJhZ2dpbmcuYnVuZGxlLmpzIn0=