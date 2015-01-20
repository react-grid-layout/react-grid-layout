webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(4);
	var PureRenderMixin = __webpack_require__(6);
	var _ = __webpack_require__(18);
	var ReactGridLayout = __webpack_require__(10);
	
	var MinMaxLayout = React.createClass({
	  displayName: "MinMaxLayout",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzktbWluLW1heC13aC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBT0UsU0FBTSxFQUFFLENBQUMsZUFBZSxDQUFDOztBQUV6QixrQkFBZSw2QkFBRztBQUNoQixZQUFPO0FBQ0wsa0JBQVcsRUFBRSxJQUFJO0FBQ2pCLGtCQUFXLEVBQUUsSUFBSTtBQUNqQixZQUFLLEVBQUUsRUFBRTtBQUNULGdCQUFTLEVBQUUsRUFBRTtBQUNiLFdBQUksRUFBRSxFQUFFLEVBQ1QsQ0FBQzs7O0FBR0osb0JBQWUsMkJBQUc7QUFDaEI7OztBQUdGLGdCQUFXLHVCQUFHOztBQUVaO0FBQ0Esb0NBQThCLENBQUMsRUFBRTtBQUMvQjtXQUE2QixLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0RCxjQUNFOztXQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBRSxFQUFDLEtBQUssRUFBRSxDQUFFO1NBQ3RCOzthQUFNLFNBQVMsRUFBQyxNQUFNO1dBQUUsQ0FBQyxDQUFDLENBQUM7VUFBUTtTQUVuQzs7YUFBSyxTQUFTLEVBQUMsUUFBUTtXQUFFLE1BQU0sR0FBRyxJQUFJLEdBQUcsU0FBUyxHQUFHLEtBQUs7VUFBTztRQUU3RCxDQUNOO01BQ0gsQ0FBQyxDQUFDO0lBQ0o7O0FBRUQsaUJBQWMsNEJBQUc7QUFDZixTQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ25CLFlBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBUyxJQUFJLEVBQUUsQ0FBQyxFQUFFO0FBQ2pELFdBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztXQUFFLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNqRCxXQUFJLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7V0FBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkQsV0FBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsV0FBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsY0FBTztBQUNMLFVBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN6RCxhQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtRQUMvQyxDQUFDO01BQ0gsQ0FBQyxDQUFDO0lBQ0o7O0FBRUQsaUJBQWMsRUFBRSxVQUFTLE1BQU0sRUFBRTtBQUMvQixTQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuQzs7QUFFRCxTQUFNLG9CQUFHO0FBQ1AsWUFDRTtBQUFDLHNCQUFlO3dCQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBZTtVQUM3QyxJQUFJLENBQUMsS0FBSztPQUNmLElBQUksQ0FBQyxXQUFXLEVBQUU7TUFFSCxDQUNsQjtJQUNIO0VBQ0YsQ0FBQyxDQUFDOztBQUVILE9BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDOztBQUU5QixLQUFJLHdCQUFZLEtBQUssTUFBTSxFQUFFO0FBQzNCLHNCQUFPLENBQUMsRUFBa0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUHVyZVJlbmRlck1peGluID0gcmVxdWlyZSgncmVhY3QvbGliL1JlYWN0Q29tcG9uZW50V2l0aFB1cmVSZW5kZXJNaXhpbicpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBSZWFjdEdyaWRMYXlvdXQgPSByZXF1aXJlKCdyZWFjdC1ncmlkLWxheW91dCcpO1xuXG52YXIgTWluTWF4TGF5b3V0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBtaXhpbnM6IFtQdXJlUmVuZGVyTWl4aW5dLFxuXG4gIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNEcmFnZ2FibGU6IHRydWUsXG4gICAgICBpc1Jlc2l6YWJsZTogdHJ1ZSxcbiAgICAgIGl0ZW1zOiAyMCxcbiAgICAgIHJvd0hlaWdodDogMzAsXG4gICAgICBjb2xzOiAxMixcbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge307XG4gIH0sXG5cbiAgZ2VuZXJhdGVET00oKSB7XG4gICAgLy8gR2VuZXJhdGUgaXRlbXMgd2l0aCBwcm9wZXJ0aWVzIGZyb20gdGhlIGxheW91dCwgcmF0aGVyIHRoYW4gcGFzcyB0aGUgbGF5b3V0IGRpcmVjdGx5XG4gICAgdmFyIGxheW91dCA9IHRoaXMuZ2VuZXJhdGVMYXlvdXQoKTtcbiAgICByZXR1cm4gXy5tYXAobGF5b3V0LCBmdW5jdGlvbihsKSB7XG4gICAgICB2YXIgbWlucyA9IFtsLm1pblcsIGwubWluSF0sIG1heGVzID0gW2wubWF4VywgbC5tYXhIXTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYga2V5PXtsLml9IF9ncmlkPXtsfT5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0XCI+e2wuaX08L3NwYW4+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtaW5NYXhcIj57J21pbjonICsgbWlucyArICcgLSBtYXg6JyArIG1heGVzfTwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSk7XG4gIH0sXG5cbiAgZ2VuZXJhdGVMYXlvdXQoKSB7XG4gICAgdmFyIHAgPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiBfLm1hcChuZXcgQXJyYXkocC5pdGVtcyksIGZ1bmN0aW9uKGl0ZW0sIGkpIHtcbiAgICAgIHZhciBtaW5XID0gXy5yYW5kb20oMSwgNiksIG1pbkggPSBfLnJhbmRvbSgxLCA2KTtcbiAgICAgIHZhciBtYXhXID0gXy5yYW5kb20obWluVywgNiksIG1heEggPSBfLnJhbmRvbShtaW5ILCA2KTtcbiAgICAgIHZhciB3ID0gXy5yYW5kb20obWluVywgbWF4Vyk7XG4gICAgICB2YXIgeSA9IF8ucmFuZG9tKG1pbkgsIG1heEgpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogaSAqIDIgJSAxMiwgeTogTWF0aC5mbG9vcihpIC8gNikgKiB5LCB3OiB3LCBoOiB5LCBpOiBpLCBcbiAgICAgICAgbWluVzogbWluVywgbWF4VzogbWF4VywgbWluSDogbWluSCwgbWF4SDogbWF4SFxuICAgICAgfTtcbiAgICB9KTtcbiAgfSxcblxuICBvbkxheW91dENoYW5nZTogZnVuY3Rpb24obGF5b3V0KSB7XG4gICAgdGhpcy5wcm9wcy5vbkxheW91dENoYW5nZShsYXlvdXQpO1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFJlYWN0R3JpZExheW91dCBvbkxheW91dENoYW5nZT17dGhpcy5vbkxheW91dENoYW5nZX1cbiAgICAgICAgICB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgIHt0aGlzLmdlbmVyYXRlRE9NKCl9XG4gICAgICA8L1JlYWN0R3JpZExheW91dD5cbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNaW5NYXhMYXlvdXQ7XG5cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICByZXF1aXJlKCcuLi90ZXN0LWhvb2suanN4JykobW9kdWxlLmV4cG9ydHMpO1xufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi90ZXN0L2V4YW1wbGVzLzktbWluLW1heC13aC5qc3hcbiAqKi8iXSwic291cmNlUm9vdCI6IiIsImZpbGUiOiI5LW1pbi1tYXgtd2guYnVuZGxlLmpzIn0=