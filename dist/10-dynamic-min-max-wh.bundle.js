webpackJsonp([10],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(4);
	var PureRenderMixin = __webpack_require__(6);
	var _ = __webpack_require__(15);
	var ReactGridLayout = __webpack_require__(9);
	
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
	
	  onLayoutChange: function (layout) {
	    this.props.onLayoutChange(layout);
	  },
	
	  onResize: function (layout, oldLayoutItem, layoutItem, placeholder, e) {
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
	      React.__spread({ onLayoutChange: this.onLayoutChange, onResize: this.onResize
	      }, this.props),
	      this.generateDOM()
	    );
	  }
	});
	
	module.exports = DynamicMinMaxLayout;
	
	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(10)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)(module)))

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzEwLWR5bmFtaWMtbWluLW1heC13aC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBYUUsU0FBTSxFQUFFLENBQUMsZUFBZSxDQUFDOztBQUV6QixrQkFBZSw2QkFBRztBQUNoQixZQUFPO0FBQ0wsa0JBQVcsRUFBRSxJQUFJO0FBQ2pCLGtCQUFXLEVBQUUsSUFBSTtBQUNqQixZQUFLLEVBQUUsRUFBRTtBQUNULGdCQUFTLEVBQUUsRUFBRTtBQUNiLFdBQUksRUFBRSxFQUFFLEVBQ1QsQ0FBQzs7O0FBR0osb0JBQWUsMkJBQUc7QUFDaEI7OztBQUdGLGdCQUFXLHVCQUFHOztBQUVaO0FBQ0Esb0NBQThCLENBQUMsRUFBRTtBQUMvQixjQUNFOztXQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBRSxFQUFDLEtBQUssRUFBRSxDQUFFO1NBQ3RCOzthQUFNLFNBQVMsRUFBQyxNQUFNO1dBQUUsQ0FBQyxDQUFDLENBQUM7VUFBUTtRQUUvQixDQUNOO01BQ0gsQ0FBQyxDQUFDO0lBQ0o7O0FBRUQsaUJBQWMsNEJBQUc7QUFDZixTQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ25CLFlBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBUyxJQUFJLEVBQUUsQ0FBQyxFQUFFO0FBQ2pELFdBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLFdBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLGNBQU87QUFDTCxVQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN0RCxDQUFDO01BQ0gsQ0FBQyxDQUFDO0lBQ0o7O0FBRUQsaUJBQWMsRUFBRSxVQUFTLE1BQU0sRUFBRTtBQUMvQixTQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuQzs7QUFFRCxXQUFRLEVBQUUsVUFBUyxNQUFNLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFOzs7O0FBSXBFLFNBQUksVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDeEMsaUJBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLGtCQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztNQUNuQjs7QUFFRCxTQUFJLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3pDLGlCQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqQixrQkFBVyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7TUFDbkI7SUFDRjs7QUFFRCxTQUFNLG9CQUFHO0FBQ1AsWUFDRTtBQUFDLHNCQUFlO3dCQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBZSxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUztVQUN0RSxJQUFJLENBQUMsS0FBSztPQUNmLElBQUksQ0FBQyxXQUFXLEVBQUU7TUFFSCxDQUNsQjtJQUNIO0VBQ0YsQ0FBQyxDQUFDOztBQUVILE9BQU0sQ0FBQyxPQUFPLEdBQUcsbUJBQW1CLENBQUM7O0FBRXJDLEtBQUksd0JBQVksS0FBSyxNQUFNLEVBQUU7QUFDM0Isc0JBQU8sQ0FBQyxFQUFrQixDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBQdXJlUmVuZGVyTWl4aW4gPSByZXF1aXJlKCdyZWFjdC9saWIvUmVhY3RDb21wb25lbnRXaXRoUHVyZVJlbmRlck1peGluJyk7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xudmFyIFJlYWN0R3JpZExheW91dCA9IHJlcXVpcmUoJ3JlYWN0LWdyaWQtbGF5b3V0Jyk7XG5cbi8qKlxuICogVGhpcyBsYXlvdXQgZGVtb25zdHJhdGVzIGhvdyB0byB1c2UgdGhlIGBvblJlc2l6ZWAgaGFuZGxlciB0byBlbmZvcmNlIGEgbWluL21heCB3aWR0aCBhbmQgaGVpZ2h0LlxuICpcbiAqIEluIHRoaXMgZ3JpZCwgYWxsIGVsZW1lbnRzIGFyZSBhbGxvd2VkIGEgbWF4IHdpZHRoIG9mIDIgaWYgdGhlIGhlaWdodCA8IDMsIFxuICogYW5kIGEgbWluIHdpZHRoIG9mIDIgaWYgdGhlIGhlaWdodCA+PSAzLlxuICovXG52YXIgRHluYW1pY01pbk1heExheW91dCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgbWl4aW5zOiBbUHVyZVJlbmRlck1peGluXSxcblxuICBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzRHJhZ2dhYmxlOiB0cnVlLFxuICAgICAgaXNSZXNpemFibGU6IHRydWUsXG4gICAgICBpdGVtczogMjAsXG4gICAgICByb3dIZWlnaHQ6IDMwLFxuICAgICAgY29sczogMTIsXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuXG4gIGdlbmVyYXRlRE9NKCkge1xuICAgIC8vIEdlbmVyYXRlIGl0ZW1zIHdpdGggcHJvcGVydGllcyBmcm9tIHRoZSBsYXlvdXQsIHJhdGhlciB0aGFuIHBhc3MgdGhlIGxheW91dCBkaXJlY3RseVxuICAgIHZhciBsYXlvdXQgPSB0aGlzLmdlbmVyYXRlTGF5b3V0KCk7XG4gICAgcmV0dXJuIF8ubWFwKGxheW91dCwgZnVuY3Rpb24obCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBrZXk9e2wuaX0gX2dyaWQ9e2x9PlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHRcIj57bC5pfTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0pO1xuICB9LFxuXG4gIGdlbmVyYXRlTGF5b3V0KCkge1xuICAgIHZhciBwID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gXy5tYXAobmV3IEFycmF5KHAuaXRlbXMpLCBmdW5jdGlvbihpdGVtLCBpKSB7XG4gICAgICB2YXIgdyA9IF8ucmFuZG9tKDEsIDIpO1xuICAgICAgdmFyIGggPSBfLnJhbmRvbSgxLCAzKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IGkgKiAyICUgMTIsIHk6IE1hdGguZmxvb3IoaSAvIDYpLCB3OiB3LCBoOiBoLCBpOiBpXG4gICAgICB9O1xuICAgIH0pO1xuICB9LFxuXG4gIG9uTGF5b3V0Q2hhbmdlOiBmdW5jdGlvbihsYXlvdXQpIHtcbiAgICB0aGlzLnByb3BzLm9uTGF5b3V0Q2hhbmdlKGxheW91dCk7XG4gIH0sXG5cbiAgb25SZXNpemU6IGZ1bmN0aW9uKGxheW91dCwgb2xkTGF5b3V0SXRlbSwgbGF5b3V0SXRlbSwgcGxhY2Vob2xkZXIsIGUpIHtcbiAgICAvLyBgb2xkTGF5b3V0SXRlbWAgY29udGFpbnMgdGhlIHN0YXRlIG9mIHRoZSBpdGVtIGJlZm9yZSB0aGUgcmVzaXplLlxuICAgIC8vIFlvdSBjYW4gbW9kaWZ5IGBsYXlvdXRJdGVtYCB0byBlbmZvcmNlIGNvbnN0cmFpbnRzLlxuXG4gICAgaWYgKGxheW91dEl0ZW0uaCA8IDMgJiYgbGF5b3V0SXRlbS53ID4gMikge1xuICAgICAgbGF5b3V0SXRlbS53ID0gMjtcbiAgICAgIHBsYWNlaG9sZGVyLncgPSAyO1xuICAgIH1cblxuICAgIGlmIChsYXlvdXRJdGVtLmggPj0gMyAmJiBsYXlvdXRJdGVtLncgPCAyKSB7XG4gICAgICBsYXlvdXRJdGVtLncgPSAyO1xuICAgICAgcGxhY2Vob2xkZXIudyA9IDI7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFJlYWN0R3JpZExheW91dCBvbkxheW91dENoYW5nZT17dGhpcy5vbkxheW91dENoYW5nZX0gb25SZXNpemU9e3RoaXMub25SZXNpemV9XG4gICAgICAgICAgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICB7dGhpcy5nZW5lcmF0ZURPTSgpfVxuICAgICAgPC9SZWFjdEdyaWRMYXlvdXQ+XG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRHluYW1pY01pbk1heExheW91dDtcblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIHJlcXVpcmUoJy4uL3Rlc3QtaG9vay5qc3gnKShtb2R1bGUuZXhwb3J0cyk7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3Rlc3QvZXhhbXBsZXMvMTAtZHluYW1pYy1taW4tbWF4LXdoLmpzeFxuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6IjEwLWR5bmFtaWMtbWluLW1heC13aC5idW5kbGUuanMifQ==