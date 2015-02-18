webpackJsonp([8],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(4);
	var PureRenderMixin = __webpack_require__(6);
	var _ = __webpack_require__(15);
	var ReactGridLayout = __webpack_require__(9);
	
	var NoDraggingLayout = React.createClass({
	  displayName: "NoDraggingLayout",
	  mixins: [PureRenderMixin],
	
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
	  __webpack_require__(10)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)(module)))

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzItbm8tZHJhZ2dpbmcuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQU9FLFNBQU0sRUFBRSxDQUFDLGVBQWUsQ0FBQzs7QUFFekIsWUFBUyxFQUFFO0FBQ1QsbUJBQWMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0lBQ2hEOztBQUVELGtCQUFlLDZCQUFHO0FBQ2hCLFlBQU87QUFDTCxnQkFBUyxFQUFFLFFBQVE7QUFDbkIsa0JBQVcsRUFBRSxLQUFLO0FBQ2xCLGtCQUFXLEVBQUUsS0FBSztBQUNsQixZQUFLLEVBQUUsRUFBRTtBQUNULFdBQUksRUFBRSxFQUFFO0FBQ1IsZ0JBQVMsRUFBRSxFQUFFO01BQ2QsQ0FBQztJQUNIOztBQUVELGtCQUFlLDZCQUFHO0FBQ2hCLFNBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUNuQyxZQUFPO0FBQ0wsYUFBTSxFQUFFLE1BQU07TUFDZixDQUFDO0lBQ0g7O0FBRUQsY0FBVyx5QkFBRztBQUNaLFlBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBUyxDQUFDLEVBQUU7QUFDbEQsY0FBUTs7V0FBSyxHQUFHLEVBQUUsQ0FBRTtTQUFDOzthQUFNLFNBQVMsRUFBQyxNQUFNO1dBQUUsQ0FBQztVQUFRO1FBQU0sQ0FBRTtNQUMvRCxDQUFDLENBQUM7SUFDSjs7QUFFRCxpQkFBYyw0QkFBRztBQUNmLFNBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDbkIsWUFBTyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFTLElBQUksRUFBRSxDQUFDLEVBQUU7QUFDakQsV0FBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdELGNBQU8sRUFBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDO01BQ3BFLENBQUMsQ0FBQztJQUNKOztBQUVELGlCQUFjLEVBQUUsVUFBUyxNQUFNLEVBQUU7QUFDL0IsU0FBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkM7O0FBRUQsU0FBTSxvQkFBRztBQUNQLFlBQ0U7QUFBQyxzQkFBZTt3QkFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFPLEVBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFlO1VBQ3hFLElBQUksQ0FBQyxLQUFLO09BQ2YsSUFBSSxDQUFDLFdBQVcsRUFBRTtNQUVILENBQ2xCO0lBQ0g7RUFDRixDQUFDLENBQUM7O0FBRUgsT0FBTSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQzs7QUFFbEMsS0FBSSx3QkFBWSxLQUFLLE1BQU0sRUFBRTtBQUMzQixzQkFBTyxDQUFDLEVBQWtCLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFB1cmVSZW5kZXJNaXhpbiA9IHJlcXVpcmUoJ3JlYWN0L2xpYi9SZWFjdENvbXBvbmVudFdpdGhQdXJlUmVuZGVyTWl4aW4nKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgUmVhY3RHcmlkTGF5b3V0ID0gcmVxdWlyZSgncmVhY3QtZ3JpZC1sYXlvdXQnKTtcblxudmFyIE5vRHJhZ2dpbmdMYXlvdXQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIG1peGluczogW1B1cmVSZW5kZXJNaXhpbl0sXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgb25MYXlvdXRDaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNsYXNzTmFtZTogXCJsYXlvdXRcIixcbiAgICAgIGlzRHJhZ2dhYmxlOiBmYWxzZSxcbiAgICAgIGlzUmVzaXphYmxlOiBmYWxzZSxcbiAgICAgIGl0ZW1zOiA1MCxcbiAgICAgIGNvbHM6IDEyLFxuICAgICAgcm93SGVpZ2h0OiAzMFxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHZhciBsYXlvdXQgPSB0aGlzLmdlbmVyYXRlTGF5b3V0KCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxheW91dDogbGF5b3V0XG4gICAgfTtcbiAgfSxcblxuICBnZW5lcmF0ZURPTSgpIHtcbiAgICByZXR1cm4gXy5tYXAoXy5yYW5nZSh0aGlzLnByb3BzLml0ZW1zKSwgZnVuY3Rpb24oaSkge1xuICAgICAgcmV0dXJuICg8ZGl2IGtleT17aX0+PHNwYW4gY2xhc3NOYW1lPVwidGV4dFwiPntpfTwvc3Bhbj48L2Rpdj4pO1xuICAgIH0pO1xuICB9LFxuXG4gIGdlbmVyYXRlTGF5b3V0KCkge1xuICAgIHZhciBwID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gXy5tYXAobmV3IEFycmF5KHAuaXRlbXMpLCBmdW5jdGlvbihpdGVtLCBpKSB7XG4gICAgICB2YXIgeSA9IF8ucmVzdWx0KHAsICd5JykgfHwgTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiA0KSArIDE7XG4gICAgICByZXR1cm4ge3g6IGkgKiAyICUgMTIsIHk6IE1hdGguZmxvb3IoaSAvIDYpICogeSwgdzogMiwgaDogeSwgaTogaX07XG4gICAgfSk7XG4gIH0sXG5cbiAgb25MYXlvdXRDaGFuZ2U6IGZ1bmN0aW9uKGxheW91dCkge1xuICAgIHRoaXMucHJvcHMub25MYXlvdXRDaGFuZ2UobGF5b3V0KTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxSZWFjdEdyaWRMYXlvdXQgbGF5b3V0PXt0aGlzLnN0YXRlLmxheW91dH0gb25MYXlvdXRDaGFuZ2U9e3RoaXMub25MYXlvdXRDaGFuZ2V9XG4gICAgICAgICAgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICB7dGhpcy5nZW5lcmF0ZURPTSgpfVxuICAgICAgPC9SZWFjdEdyaWRMYXlvdXQ+XG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTm9EcmFnZ2luZ0xheW91dDtcblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIHJlcXVpcmUoJy4uL3Rlc3QtaG9vay5qc3gnKShtb2R1bGUuZXhwb3J0cyk7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3Rlc3QvZXhhbXBsZXMvMi1uby1kcmFnZ2luZy5qc3hcbiAqKi8iXSwic291cmNlUm9vdCI6IiIsImZpbGUiOiIyLW5vLWRyYWdnaW5nLmJ1bmRsZS5qcyJ9