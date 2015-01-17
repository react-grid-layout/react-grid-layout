webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(4);
	var _ = __webpack_require__(17);
	var ReactGridLayout = __webpack_require__(10);
	
	var MinMaxLayout = React.createClass({
	  displayName: "MinMaxLayout",
	  mixins: [React.addons.PureRenderMixin],
	
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
	    return _.map(layout, function (l) {
	      var mins = [l.minW, l.minH],
	          maxes = [l.maxW, l.maxH];
	      return React.createElement(
	        "div",
	        { key: l.i, _grid: l },
	        React.createElement(
	          "span",
	          { className: "text" },
	          l.i
	        ),
	        React.createElement(
	          "div",
	          { className: "minMax" },
	          "min:" + mins + " - max:" + maxes
	        )
	      );
	    });
	  },
	
	  generateLayout: function generateLayout() {
	    var p = this.props;
	    return _.map(new Array(p.items), function (item, i) {
	      var minW = _.random(1, 6),
	          minH = _.random(1, 6);
	      var maxW = _.random(minW, 6),
	          maxH = _.random(minH, 6);
	      var w = _.random(minW, maxW);
	      var y = _.random(minH, maxH);
	      return {
	        x: i * 2 % 12, y: Math.floor(i / 6) * y, w: w, h: y, i: i,
	        minW: minW, maxW: maxW, minH: minH, maxH: maxH
	      };
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
	
	module.exports = MinMaxLayout;
	
	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(11)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)(module)))

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzktbWluLW1heC13aC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFNRSxTQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQzs7QUFFdEMsa0JBQWUsNkJBQUc7QUFDaEIsWUFBTztBQUNMLGtCQUFXLEVBQUUsSUFBSTtBQUNqQixrQkFBVyxFQUFFLElBQUk7QUFDakIsWUFBSyxFQUFFLEVBQUU7QUFDVCxnQkFBUyxFQUFFLEVBQUU7QUFDYixXQUFJLEVBQUUsRUFBRSxFQUNULENBQUM7OztBQUdKLG9CQUFlLDJCQUFHO0FBQ2hCOzs7QUFHRixnQkFBVyx1QkFBRzs7QUFFWjtBQUNBLG9DQUE4QixDQUFDLEVBQUU7QUFDL0I7V0FBNkIsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEQsY0FDRTs7V0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUUsRUFBQyxLQUFLLEVBQUUsQ0FBRTtTQUN0Qjs7YUFBTSxTQUFTLEVBQUMsTUFBTTtXQUFFLENBQUMsQ0FBQyxDQUFDO1VBQVE7U0FFbkM7O2FBQUssU0FBUyxFQUFDLFFBQVE7V0FBRSxNQUFNLEdBQUcsSUFBSSxHQUFHLFNBQVMsR0FBRyxLQUFLO1VBQU87UUFFN0QsQ0FDTjtNQUNILENBQUMsQ0FBQztJQUNKOztBQUVELGlCQUFjLDRCQUFHO0FBQ2YsU0FBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNuQixZQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVMsSUFBSSxFQUFFLENBQUMsRUFBRTtBQUNqRCxXQUFJLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7V0FBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDakQsV0FBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1dBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELFdBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLFdBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLGNBQU87QUFDTCxVQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDekQsYUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7UUFDL0MsQ0FBQztNQUNILENBQUMsQ0FBQztJQUNKOztBQUVELGlCQUFjLEVBQUUsVUFBUyxNQUFNLEVBQUU7QUFDL0IsU0FBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkM7O0FBRUQsU0FBTSxvQkFBRztBQUNQLFlBQ0U7QUFBQyxzQkFBZTt3QkFBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWU7VUFDN0MsSUFBSSxDQUFDLEtBQUs7T0FDZixJQUFJLENBQUMsV0FBVyxFQUFFO01BRUgsQ0FDbEI7SUFDSDtFQUNGLENBQUMsQ0FBQzs7QUFFSCxPQUFNLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQzs7QUFFOUIsS0FBSSx3QkFBWSxLQUFLLE1BQU0sRUFBRTtBQUMzQixzQkFBTyxDQUFDLEVBQWtCLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgUmVhY3RHcmlkTGF5b3V0ID0gcmVxdWlyZSgncmVhY3QtZ3JpZC1sYXlvdXQnKTtcblxudmFyIE1pbk1heExheW91dCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgbWl4aW5zOiBbUmVhY3QuYWRkb25zLlB1cmVSZW5kZXJNaXhpbl0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc0RyYWdnYWJsZTogdHJ1ZSxcbiAgICAgIGlzUmVzaXphYmxlOiB0cnVlLFxuICAgICAgaXRlbXM6IDIwLFxuICAgICAgcm93SGVpZ2h0OiAzMCxcbiAgICAgIGNvbHM6IDEyLFxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSxcblxuICBnZW5lcmF0ZURPTSgpIHtcbiAgICAvLyBHZW5lcmF0ZSBpdGVtcyB3aXRoIHByb3BlcnRpZXMgZnJvbSB0aGUgbGF5b3V0LCByYXRoZXIgdGhhbiBwYXNzIHRoZSBsYXlvdXQgZGlyZWN0bHlcbiAgICB2YXIgbGF5b3V0ID0gdGhpcy5nZW5lcmF0ZUxheW91dCgpO1xuICAgIHJldHVybiBfLm1hcChsYXlvdXQsIGZ1bmN0aW9uKGwpIHtcbiAgICAgIHZhciBtaW5zID0gW2wubWluVywgbC5taW5IXSwgbWF4ZXMgPSBbbC5tYXhXLCBsLm1heEhdO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBrZXk9e2wuaX0gX2dyaWQ9e2x9PlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHRcIj57bC5pfTwvc3Bhbj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1pbk1heFwiPnsnbWluOicgKyBtaW5zICsgJyAtIG1heDonICsgbWF4ZXN9PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9KTtcbiAgfSxcblxuICBnZW5lcmF0ZUxheW91dCgpIHtcbiAgICB2YXIgcCA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIF8ubWFwKG5ldyBBcnJheShwLml0ZW1zKSwgZnVuY3Rpb24oaXRlbSwgaSkge1xuICAgICAgdmFyIG1pblcgPSBfLnJhbmRvbSgxLCA2KSwgbWluSCA9IF8ucmFuZG9tKDEsIDYpO1xuICAgICAgdmFyIG1heFcgPSBfLnJhbmRvbShtaW5XLCA2KSwgbWF4SCA9IF8ucmFuZG9tKG1pbkgsIDYpO1xuICAgICAgdmFyIHcgPSBfLnJhbmRvbShtaW5XLCBtYXhXKTtcbiAgICAgIHZhciB5ID0gXy5yYW5kb20obWluSCwgbWF4SCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiBpICogMiAlIDEyLCB5OiBNYXRoLmZsb29yKGkgLyA2KSAqIHksIHc6IHcsIGg6IHksIGk6IGksIFxuICAgICAgICBtaW5XOiBtaW5XLCBtYXhXOiBtYXhXLCBtaW5IOiBtaW5ILCBtYXhIOiBtYXhIXG4gICAgICB9O1xuICAgIH0pO1xuICB9LFxuXG4gIG9uTGF5b3V0Q2hhbmdlOiBmdW5jdGlvbihsYXlvdXQpIHtcbiAgICB0aGlzLnByb3BzLm9uTGF5b3V0Q2hhbmdlKGxheW91dCk7XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8UmVhY3RHcmlkTGF5b3V0IG9uTGF5b3V0Q2hhbmdlPXt0aGlzLm9uTGF5b3V0Q2hhbmdlfVxuICAgICAgICAgIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAge3RoaXMuZ2VuZXJhdGVET00oKX1cbiAgICAgIDwvUmVhY3RHcmlkTGF5b3V0PlxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1pbk1heExheW91dDtcblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIHJlcXVpcmUoJy4uL3Rlc3QtaG9vay5qc3gnKShtb2R1bGUuZXhwb3J0cyk7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3Rlc3QvZXhhbXBsZXMvOS1taW4tbWF4LXdoLmpzeFxuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6IjktbWluLW1heC13aC5idW5kbGUuanMifQ==