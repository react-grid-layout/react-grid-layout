webpackJsonp([10],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	
	var _extends = __webpack_require__(8)["default"];
	
	var React = __webpack_require__(4);
	var PureRenderMixin = __webpack_require__(6);
	var _ = __webpack_require__(16);
	var ReactGridLayout = __webpack_require__(10);
	
	/**
	 * This layout demonstrates how to use the `onResize` handler to enforce a min/max width and height.
	 *
	 * In this grid, all elements are allowed a max width of 2 if the height < 3,
	 * and a min width of 2 if the height >= 3.
	 */
	var DynamicMinMaxLayout = React.createClass({
	  displayName: "DynamicMinMaxLayout",
	
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
	      return React.createElement(
	        "div",
	        { key: l.i, _grid: l },
	        React.createElement(
	          "span",
	          { className: "text" },
	          l.i
	        )
	      );
	    });
	  },
	
	  generateLayout: function generateLayout() {
	    var p = this.props;
	    return _.map(new Array(p.items), function (item, i) {
	      var w = _.random(1, 2);
	      var h = _.random(1, 3);
	      return {
	        x: i * 2 % 12, y: Math.floor(i / 6), w: w, h: h, i: i
	      };
	    });
	  },
	
	  onLayoutChange: function onLayoutChange(layout) {
	    this.props.onLayoutChange(layout);
	  },
	
	  onResize: function onResize(layout, oldLayoutItem, layoutItem, placeholder, e) {
	    // `oldLayoutItem` contains the state of the item before the resize.
	    // You can modify `layoutItem` to enforce constraints.
	
	    if (layoutItem.h < 3 && layoutItem.w > 2) {
	      layoutItem.w = 2;
	      placeholder.w = 2;
	    }
	
	    if (layoutItem.h >= 3 && layoutItem.w < 2) {
	      layoutItem.w = 2;
	      placeholder.w = 2;
	    }
	  },
	
	  render: function render() {
	    return React.createElement(
	      ReactGridLayout,
	      _extends({ onLayoutChange: this.onLayoutChange, onResize: this.onResize
	      }, this.props),
	      this.generateDOM()
	    );
	  }
	});
	
	module.exports = DynamicMinMaxLayout;
	
	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(11)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)(module)))

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzEwLWR5bmFtaWMtbWluLW1heC13aC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLDJEQUFZLENBQUM7Ozs7QUFDYixLQUFJLEtBQUssR0FBRyxtQkFBTyxDQUFDLENBQU8sQ0FBQyxDQUFDO0FBQzdCLEtBQUksZUFBZSxHQUFHLG1CQUFPLENBQUMsQ0FBNkMsQ0FBQyxDQUFDO0FBQzdFLEtBQUksQ0FBQyxHQUFHLG1CQUFPLENBQUMsRUFBUSxDQUFDLENBQUM7QUFDMUIsS0FBSSxlQUFlLEdBQUcsbUJBQU8sQ0FBQyxFQUFtQixDQUFDLENBQUM7Ozs7Ozs7O0FBUW5ELEtBQUksbUJBQW1CLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBQzFDLFNBQU0sRUFBRSxDQUFDLGVBQWUsQ0FBQzs7QUFFekIsa0JBQWUsNkJBQUc7QUFDaEIsWUFBTztBQUNMLGtCQUFXLEVBQUUsSUFBSTtBQUNqQixrQkFBVyxFQUFFLElBQUk7QUFDakIsWUFBSyxFQUFFLEVBQUU7QUFDVCxnQkFBUyxFQUFFLEVBQUU7QUFDYixXQUFJLEVBQUUsRUFBRSxFQUNULENBQUM7SUFDSDs7QUFFRCxrQkFBZSw2QkFBRztBQUNoQixZQUFPLEVBQUUsQ0FBQztJQUNYOztBQUVELGNBQVcseUJBQUc7O0FBRVosU0FBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ25DLFlBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBUyxDQUFDLEVBQUU7QUFDL0IsY0FDRTs7V0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUUsRUFBQyxLQUFLLEVBQUUsQ0FBRTtTQUN0Qjs7YUFBTSxTQUFTLEVBQUMsTUFBTTtXQUFFLENBQUMsQ0FBQyxDQUFDO1VBQVE7UUFDL0IsQ0FDTjtNQUNILENBQUMsQ0FBQztJQUNKOztBQUVELGlCQUFjLDRCQUFHO0FBQ2YsU0FBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNuQixZQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVMsSUFBSSxFQUFFLENBQUMsRUFBRTtBQUNqRCxXQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QixXQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QixjQUFPO0FBQ0wsVUFBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDdEQsQ0FBQztNQUNILENBQUMsQ0FBQztJQUNKOztBQUVELGlCQUFjLEVBQUUsd0JBQVMsTUFBTSxFQUFFO0FBQy9CLFNBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ25DOztBQUVELFdBQVEsRUFBRSxrQkFBUyxNQUFNLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFOzs7O0FBSXBFLFNBQUksVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDeEMsaUJBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLGtCQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztNQUNuQjs7QUFFRCxTQUFJLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3pDLGlCQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqQixrQkFBVyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7TUFDbkI7SUFDRjs7QUFFRCxTQUFNLG9CQUFHO0FBQ1AsWUFDRTtBQUFDLHNCQUFlO2tCQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBZSxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUztVQUN0RSxJQUFJLENBQUMsS0FBSztPQUNmLElBQUksQ0FBQyxXQUFXLEVBQUU7TUFDSCxDQUNsQjtJQUNIO0VBQ0YsQ0FBQyxDQUFDOztBQUVILE9BQU0sQ0FBQyxPQUFPLEdBQUcsbUJBQW1CLENBQUM7O0FBRXJDLEtBQUksd0JBQVksS0FBSyxNQUFNLEVBQUU7QUFDM0Isc0JBQU8sQ0FBQyxFQUFrQixDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBQdXJlUmVuZGVyTWl4aW4gPSByZXF1aXJlKCdyZWFjdC9saWIvUmVhY3RDb21wb25lbnRXaXRoUHVyZVJlbmRlck1peGluJyk7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xudmFyIFJlYWN0R3JpZExheW91dCA9IHJlcXVpcmUoJ3JlYWN0LWdyaWQtbGF5b3V0Jyk7XG5cbi8qKlxuICogVGhpcyBsYXlvdXQgZGVtb25zdHJhdGVzIGhvdyB0byB1c2UgdGhlIGBvblJlc2l6ZWAgaGFuZGxlciB0byBlbmZvcmNlIGEgbWluL21heCB3aWR0aCBhbmQgaGVpZ2h0LlxuICpcbiAqIEluIHRoaXMgZ3JpZCwgYWxsIGVsZW1lbnRzIGFyZSBhbGxvd2VkIGEgbWF4IHdpZHRoIG9mIDIgaWYgdGhlIGhlaWdodCA8IDMsXG4gKiBhbmQgYSBtaW4gd2lkdGggb2YgMiBpZiB0aGUgaGVpZ2h0ID49IDMuXG4gKi9cbnZhciBEeW5hbWljTWluTWF4TGF5b3V0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBtaXhpbnM6IFtQdXJlUmVuZGVyTWl4aW5dLFxuXG4gIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNEcmFnZ2FibGU6IHRydWUsXG4gICAgICBpc1Jlc2l6YWJsZTogdHJ1ZSxcbiAgICAgIGl0ZW1zOiAyMCxcbiAgICAgIHJvd0hlaWdodDogMzAsXG4gICAgICBjb2xzOiAxMixcbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge307XG4gIH0sXG5cbiAgZ2VuZXJhdGVET00oKSB7XG4gICAgLy8gR2VuZXJhdGUgaXRlbXMgd2l0aCBwcm9wZXJ0aWVzIGZyb20gdGhlIGxheW91dCwgcmF0aGVyIHRoYW4gcGFzcyB0aGUgbGF5b3V0IGRpcmVjdGx5XG4gICAgdmFyIGxheW91dCA9IHRoaXMuZ2VuZXJhdGVMYXlvdXQoKTtcbiAgICByZXR1cm4gXy5tYXAobGF5b3V0LCBmdW5jdGlvbihsKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGtleT17bC5pfSBfZ3JpZD17bH0+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dFwiPntsLml9PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSk7XG4gIH0sXG5cbiAgZ2VuZXJhdGVMYXlvdXQoKSB7XG4gICAgdmFyIHAgPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiBfLm1hcChuZXcgQXJyYXkocC5pdGVtcyksIGZ1bmN0aW9uKGl0ZW0sIGkpIHtcbiAgICAgIHZhciB3ID0gXy5yYW5kb20oMSwgMik7XG4gICAgICB2YXIgaCA9IF8ucmFuZG9tKDEsIDMpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogaSAqIDIgJSAxMiwgeTogTWF0aC5mbG9vcihpIC8gNiksIHc6IHcsIGg6IGgsIGk6IGlcbiAgICAgIH07XG4gICAgfSk7XG4gIH0sXG5cbiAgb25MYXlvdXRDaGFuZ2U6IGZ1bmN0aW9uKGxheW91dCkge1xuICAgIHRoaXMucHJvcHMub25MYXlvdXRDaGFuZ2UobGF5b3V0KTtcbiAgfSxcblxuICBvblJlc2l6ZTogZnVuY3Rpb24obGF5b3V0LCBvbGRMYXlvdXRJdGVtLCBsYXlvdXRJdGVtLCBwbGFjZWhvbGRlciwgZSkge1xuICAgIC8vIGBvbGRMYXlvdXRJdGVtYCBjb250YWlucyB0aGUgc3RhdGUgb2YgdGhlIGl0ZW0gYmVmb3JlIHRoZSByZXNpemUuXG4gICAgLy8gWW91IGNhbiBtb2RpZnkgYGxheW91dEl0ZW1gIHRvIGVuZm9yY2UgY29uc3RyYWludHMuXG5cbiAgICBpZiAobGF5b3V0SXRlbS5oIDwgMyAmJiBsYXlvdXRJdGVtLncgPiAyKSB7XG4gICAgICBsYXlvdXRJdGVtLncgPSAyO1xuICAgICAgcGxhY2Vob2xkZXIudyA9IDI7XG4gICAgfVxuXG4gICAgaWYgKGxheW91dEl0ZW0uaCA+PSAzICYmIGxheW91dEl0ZW0udyA8IDIpIHtcbiAgICAgIGxheW91dEl0ZW0udyA9IDI7XG4gICAgICBwbGFjZWhvbGRlci53ID0gMjtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8UmVhY3RHcmlkTGF5b3V0IG9uTGF5b3V0Q2hhbmdlPXt0aGlzLm9uTGF5b3V0Q2hhbmdlfSBvblJlc2l6ZT17dGhpcy5vblJlc2l6ZX1cbiAgICAgICAgICB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgIHt0aGlzLmdlbmVyYXRlRE9NKCl9XG4gICAgICA8L1JlYWN0R3JpZExheW91dD5cbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBEeW5hbWljTWluTWF4TGF5b3V0O1xuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgcmVxdWlyZSgnLi4vdGVzdC1ob29rLmpzeCcpKG1vZHVsZS5leHBvcnRzKTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vdGVzdC9leGFtcGxlcy8xMC1keW5hbWljLW1pbi1tYXgtd2guanN4XG4gKiovIl0sInNvdXJjZVJvb3QiOiIiLCJmaWxlIjoiMTAtZHluYW1pYy1taW4tbWF4LXdoLmJ1bmRsZS5qcyJ9