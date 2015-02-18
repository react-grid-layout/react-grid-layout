webpackJsonp([6],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(4);
	var PureRenderMixin = __webpack_require__(6);
	var _ = __webpack_require__(15);
	var ReactGridLayout = __webpack_require__(9);
	
	var GridPropertyLayout = React.createClass({
	  displayName: "GridPropertyLayout",
	  mixins: [PureRenderMixin],
	
	  getDefaultProps: function getDefaultProps() {
	    return {
	      isDraggable: true,
	      isResizable: true,
	      items: 20,
	      rowHeight: 30,
	      cols: 12 };
	  },
	
	  getInitialState: function getInitialState() {
	    return {};
	  },
	
	  generateDOM: function generateDOM() {
	    // Generate items with properties from the layout, rather than pass the layout directly
	    var layout = this.generateLayout();
	    return _.map(_.range(this.props.items), function (i) {
	      return React.createElement(
	        "div",
	        { key: i, _grid: layout[i] },
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
	      var w = _.result(p, "w") || Math.ceil(Math.random() * 4);
	      var y = _.result(p, "y") || Math.ceil(Math.random() * 4) + 1;
	      return { x: i * 2 % 12, y: Math.floor(i / 6) * y, w: w, h: y, i: i };
	    });
	  },
	
	  onLayoutChange: function (layout) {
	    this.props.onLayoutChange(layout);
	  },
	
	  render: function render() {
	    return React.createElement(
	      ReactGridLayout,
	      React.__spread({ onLayoutChange: this.onLayoutChange
	      }, this.props),
	      this.generateDOM()
	    );
	  }
	});
	
	module.exports = GridPropertyLayout;
	
	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(10)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)(module)))

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzQtZ3JpZC1wcm9wZXJ0eS5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBT0UsU0FBTSxFQUFFLENBQUMsZUFBZSxDQUFDOztBQUV6QixrQkFBZSw2QkFBRztBQUNoQixZQUFPO0FBQ0wsa0JBQVcsRUFBRSxJQUFJO0FBQ2pCLGtCQUFXLEVBQUUsSUFBSTtBQUNqQixZQUFLLEVBQUUsRUFBRTtBQUNULGdCQUFTLEVBQUUsRUFBRTtBQUNiLFdBQUksRUFBRSxFQUFFLEVBQ1QsQ0FBQzs7O0FBR0osb0JBQWUsMkJBQUc7QUFDaEIsY0FDQyxDQUFDO0lBQ0g7O0FBRUQsY0FBVyx5QkFBRzs7QUFFWixTQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDbkMsWUFBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFTLENBQUMsRUFBRTtBQUNsRCxjQUFROztXQUFLLEdBQUcsRUFBRSxDQUFFLEVBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUU7U0FBQzs7YUFBTSxTQUFTLEVBQUMsTUFBTTtXQUFFLENBQUM7VUFBUTtRQUFNLENBQUU7TUFDakYsQ0FBQyxDQUFDO0lBQ0o7O0FBRUQsaUJBQWMsNEJBQUc7QUFDZixTQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ25CLFlBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBUyxJQUFJLEVBQUUsQ0FBQyxFQUFFO0FBQ2pELFdBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3pELFdBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3RCxjQUFPLEVBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQztNQUNwRSxDQUFDLENBQUM7SUFDSjs7QUFFRCxpQkFBYyxFQUFFLFVBQVMsTUFBTSxFQUFFO0FBQy9CLFNBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ25DOztBQUVELFNBQU0sb0JBQUc7QUFDUCxZQUNFO0FBQUMsc0JBQWU7d0JBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFlO1VBQzdDLElBQUksQ0FBQyxLQUFLO09BQ2YsSUFBSSxDQUFDLFdBQVcsRUFBRTtNQUVILENBQ2xCO0lBQ0g7RUFDRixDQUFDLENBQUM7O0FBRUgsT0FBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQzs7QUFFcEMsS0FBSSx3QkFBWSxLQUFLLE1BQU0sRUFBRTtBQUMzQixzQkFBTyxDQUFDLEVBQWtCLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFB1cmVSZW5kZXJNaXhpbiA9IHJlcXVpcmUoJ3JlYWN0L2xpYi9SZWFjdENvbXBvbmVudFdpdGhQdXJlUmVuZGVyTWl4aW4nKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgUmVhY3RHcmlkTGF5b3V0ID0gcmVxdWlyZSgncmVhY3QtZ3JpZC1sYXlvdXQnKTtcblxudmFyIEdyaWRQcm9wZXJ0eUxheW91dCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgbWl4aW5zOiBbUHVyZVJlbmRlck1peGluXSxcblxuICBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzRHJhZ2dhYmxlOiB0cnVlLFxuICAgICAgaXNSZXNpemFibGU6IHRydWUsXG4gICAgICBpdGVtczogMjAsXG4gICAgICByb3dIZWlnaHQ6IDMwLFxuICAgICAgY29sczogMTIsXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICB9O1xuICB9LFxuXG4gIGdlbmVyYXRlRE9NKCkge1xuICAgIC8vIEdlbmVyYXRlIGl0ZW1zIHdpdGggcHJvcGVydGllcyBmcm9tIHRoZSBsYXlvdXQsIHJhdGhlciB0aGFuIHBhc3MgdGhlIGxheW91dCBkaXJlY3RseVxuICAgIHZhciBsYXlvdXQgPSB0aGlzLmdlbmVyYXRlTGF5b3V0KCk7XG4gICAgcmV0dXJuIF8ubWFwKF8ucmFuZ2UodGhpcy5wcm9wcy5pdGVtcyksIGZ1bmN0aW9uKGkpIHtcbiAgICAgIHJldHVybiAoPGRpdiBrZXk9e2l9IF9ncmlkPXtsYXlvdXRbaV19PjxzcGFuIGNsYXNzTmFtZT1cInRleHRcIj57aX08L3NwYW4+PC9kaXY+KTtcbiAgICB9KTtcbiAgfSxcblxuICBnZW5lcmF0ZUxheW91dCgpIHtcbiAgICB2YXIgcCA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIF8ubWFwKG5ldyBBcnJheShwLml0ZW1zKSwgZnVuY3Rpb24oaXRlbSwgaSkge1xuICAgICAgdmFyIHcgPSBfLnJlc3VsdChwLCAndycpIHx8IE1hdGguY2VpbChNYXRoLnJhbmRvbSgpICogNCk7XG4gICAgICB2YXIgeSA9IF8ucmVzdWx0KHAsICd5JykgfHwgTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiA0KSArIDE7XG4gICAgICByZXR1cm4ge3g6IGkgKiAyICUgMTIsIHk6IE1hdGguZmxvb3IoaSAvIDYpICogeSwgdzogdywgaDogeSwgaTogaX07XG4gICAgfSk7XG4gIH0sXG5cbiAgb25MYXlvdXRDaGFuZ2U6IGZ1bmN0aW9uKGxheW91dCkge1xuICAgIHRoaXMucHJvcHMub25MYXlvdXRDaGFuZ2UobGF5b3V0KTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxSZWFjdEdyaWRMYXlvdXQgb25MYXlvdXRDaGFuZ2U9e3RoaXMub25MYXlvdXRDaGFuZ2V9XG4gICAgICAgICAgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICB7dGhpcy5nZW5lcmF0ZURPTSgpfVxuICAgICAgPC9SZWFjdEdyaWRMYXlvdXQ+XG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3JpZFByb3BlcnR5TGF5b3V0O1xuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgcmVxdWlyZSgnLi4vdGVzdC1ob29rLmpzeCcpKG1vZHVsZS5leHBvcnRzKTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vdGVzdC9leGFtcGxlcy80LWdyaWQtcHJvcGVydHkuanN4XG4gKiovIl0sInNvdXJjZVJvb3QiOiIiLCJmaWxlIjoiNC1ncmlkLXByb3BlcnR5LmJ1bmRsZS5qcyJ9