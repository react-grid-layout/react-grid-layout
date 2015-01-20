webpackJsonp([11],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(4);
	var PureRenderMixin = __webpack_require__(6);
	var _ = __webpack_require__(18);
	var ResponsiveReactGridLayout = __webpack_require__(10).Responsive;
	
	var BasicLayout = React.createClass({
	  displayName: "BasicLayout",
	  mixins: [PureRenderMixin],
	
	  propTypes: {
	    onLayoutChange: React.PropTypes.func.isRequired
	  },
	
	  getDefaultProps: function getDefaultProps() {
	    return {
	      className: "layout",
	      rowHeight: 30,
	      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }
	    };
	  },
	
	  getInitialState: function getInitialState() {
	    return {
	      layouts: { lg: this.generateLayout() },
	      currentLayout: [],
	      currentBreakpoint: "lg"
	    };
	  },
	
	  generateDOM: function generateDOM() {
	    return _.map(this.state.layouts.lg, function (l, i) {
	      return React.createElement(
	        "div",
	        { key: i, className: l["static"] ? "static" : "" },
	        l["static"] ? React.createElement(
	          "span",
	          { className: "text", title: "This item is static and cannot be removed or resized." },
	          "Static - ",
	          i
	        ) : React.createElement(
	          "span",
	          { className: "text" },
	          i
	        )
	      );
	    });
	  },
	
	  generateLayout: function generateLayout() {
	    var p = this.props;
	    return _.map(_.range(0, 25), function (item, i) {
	      var y = _.result(p, "y") || Math.ceil(Math.random() * 4) + 1;
	      return { x: _.random(0, 5) * 2 % 12, y: Math.floor(i / 6) * y, w: 2, h: y, i: i, "static": Math.random() < 0.05 };
	    });
	  },
	
	  onBreakpointChange: function onBreakpointChange(breakpoint) {
	    this.setState({
	      currentBreakpoint: breakpoint
	    });
	  },
	
	  onLayoutChange: function onLayoutChange(layout) {
	    this.props.onLayoutChange(layout);
	    this.setState({
	      currentLayout: layout
	    });
	  },
	
	  onNewLayout: function onNewLayout() {
	    this.setState({
	      layouts: { lg: this.generateLayout() }
	    });
	  },
	
	  render: function render() {
	    return React.createElement(
	      "div",
	      null,
	      React.createElement(
	        "div",
	        null,
	        "Current Breakpoint: ",
	        this.state.currentBreakpoint,
	        " (",
	        this.props.cols[this.state.currentBreakpoint],
	        " columns)"
	      ),
	      React.createElement(
	        "button",
	        { onClick: this.onNewLayout },
	        "Generate New Layout"
	      ),
	      React.createElement(
	        ResponsiveReactGridLayout,
	        React.__spread({
	          layouts: this.state.layouts,
	          onBreakpointChange: this.onBreakpointChange,
	          onLayoutChange: this.onLayoutChange,
	          useCSSTransforms: true
	        }, this.props),
	        this.generateDOM()
	      )
	    );
	  }
	});
	
	module.exports = BasicLayout;
	
	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(11)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)(module)))

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzAtc2hvd2Nhc2UuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQU9FLFNBQU0sRUFBRSxDQUFDLGVBQWUsQ0FBQzs7QUFFekIsWUFBUyxFQUFFO0FBQ1QsbUJBQWMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0lBQ2hEOztBQUVELGtCQUFlLDZCQUFHO0FBQ2hCLFlBQU87QUFDTCxnQkFBUyxFQUFFLFFBQVE7QUFDbkIsZ0JBQVMsRUFBRSxFQUFFO0FBQ2IsV0FBSSxFQUFFLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFDO01BQzdDLENBQUM7SUFDSDs7QUFFRCxrQkFBZSw2QkFBRztBQUNoQixZQUFPO0FBQ0wsY0FBTyxFQUFFLEVBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBQztBQUNwQyxvQkFBYSxFQUFFLEVBQUU7QUFDakIsd0JBQWlCLEVBQUUsSUFBSTtNQUN4QixDQUFDO0lBQ0g7O0FBRUQsY0FBVyx5QkFBRztBQUNaLFlBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2pELGNBQ0U7O1dBQUssR0FBRyxFQUFFLENBQUUsRUFBQyxTQUFTLEVBQUUsQ0FBQyxVQUFPLEdBQUcsUUFBUSxHQUFHLEVBQUc7U0FDOUMsQ0FBQyxVQUFPLEdBQ1A7O2FBQU0sU0FBUyxFQUFDLE1BQU0sRUFBQyxLQUFLLEVBQUMsdURBQXVEOztXQUFXLENBQUM7VUFBUSxHQUN0Rzs7YUFBTSxTQUFTLEVBQUMsTUFBTTtXQUFFLENBQUM7VUFBUTtRQUdqQyxDQUFFO01BQ1gsQ0FBQyxDQUFDO0lBQ0o7O0FBRUQsaUJBQWMsNEJBQUc7QUFDZixTQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ25CLFlBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxVQUFTLElBQUksRUFBRSxDQUFDLEVBQUU7QUFDN0MsV0FBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdELGNBQU8sRUFBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFVBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksRUFBQyxDQUFDO01BQy9HLENBQUMsQ0FBQztJQUNKOztBQUVELHFCQUFrQiw4QkFBQyxVQUFVLEVBQUU7QUFDN0IsU0FBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLHdCQUFpQixFQUFFLFVBQVU7TUFDOUIsQ0FBQyxDQUFDO0lBQ0o7O0FBRUQsaUJBQWMsMEJBQUMsTUFBTSxFQUFFO0FBQ3JCLFNBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2xDLFNBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixvQkFBYSxFQUFFLE1BQU07TUFDdEIsQ0FBQyxDQUFDO0lBQ0o7O0FBRUQsY0FBVyx5QkFBRztBQUNaLFNBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixjQUFPLEVBQUUsRUFBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFDO01BQ3JDLENBQUMsQ0FBQztJQUNKOztBQUVELFNBQU0sb0JBQUc7QUFDUCxZQUNFOzs7T0FDRTs7OztTQUEwQixJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQjs7U0FBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDOztRQUFnQjtPQUV2SDs7V0FBUSxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVk7O1FBQTZCO09BRS9EO0FBQUMsa0NBQXlCOztBQUN0QixrQkFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBUTtBQUM1Qiw2QkFBa0IsRUFBRSxJQUFJLENBQUMsa0JBQW1CO0FBQzVDLHlCQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWU7QUFDcEMsMkJBQWdCLEVBQUUsSUFBSztZQUNuQixJQUFJLENBQUMsS0FBSztTQUNmLElBQUksQ0FBQyxXQUFXLEVBQUU7UUFFTztNQUV4QixDQUNOO0lBQ0g7RUFDRixDQUFDLENBQUM7O0FBRUgsT0FBTSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUM7O0FBRTdCLEtBQUksd0JBQVksS0FBSyxNQUFNLEVBQUU7QUFDM0Isc0JBQU8sQ0FBQyxFQUFrQixDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBQdXJlUmVuZGVyTWl4aW4gPSByZXF1aXJlKCdyZWFjdC9saWIvUmVhY3RDb21wb25lbnRXaXRoUHVyZVJlbmRlck1peGluJyk7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xudmFyIFJlc3BvbnNpdmVSZWFjdEdyaWRMYXlvdXQgPSByZXF1aXJlKCdyZWFjdC1ncmlkLWxheW91dCcpLlJlc3BvbnNpdmU7XG5cbnZhciBCYXNpY0xheW91dCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgbWl4aW5zOiBbUHVyZVJlbmRlck1peGluXSxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBvbkxheW91dENoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2xhc3NOYW1lOiBcImxheW91dFwiLFxuICAgICAgcm93SGVpZ2h0OiAzMCxcbiAgICAgIGNvbHM6IHtsZzogMTIsIG1kOiAxMCwgc206IDYsIHhzOiA0LCB4eHM6IDJ9XG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxheW91dHM6IHtsZzogdGhpcy5nZW5lcmF0ZUxheW91dCgpfSxcbiAgICAgIGN1cnJlbnRMYXlvdXQ6IFtdLFxuICAgICAgY3VycmVudEJyZWFrcG9pbnQ6ICdsZydcbiAgICB9O1xuICB9LFxuXG4gIGdlbmVyYXRlRE9NKCkge1xuICAgIHJldHVybiBfLm1hcCh0aGlzLnN0YXRlLmxheW91dHMubGcsIGZ1bmN0aW9uKGwsIGkpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9e2wuc3RhdGljID8gJ3N0YXRpYycgOiAnJ30+XG4gICAgICAgICAge2wuc3RhdGljID8gXG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0XCIgdGl0bGU9XCJUaGlzIGl0ZW0gaXMgc3RhdGljIGFuZCBjYW5ub3QgYmUgcmVtb3ZlZCBvciByZXNpemVkLlwiPlN0YXRpYyAtIHtpfTwvc3Bhbj5cbiAgICAgICAgICAgIDogPHNwYW4gY2xhc3NOYW1lPVwidGV4dFwiPntpfTwvc3Bhbj5cbiAgICAgICAgICB9XG4gICAgICAgIDwvZGl2Pik7XG4gICAgfSk7XG4gIH0sXG5cbiAgZ2VuZXJhdGVMYXlvdXQoKSB7XG4gICAgdmFyIHAgPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiBfLm1hcChfLnJhbmdlKDAsIDI1KSwgZnVuY3Rpb24oaXRlbSwgaSkge1xuICAgICAgdmFyIHkgPSBfLnJlc3VsdChwLCAneScpIHx8IE1hdGguY2VpbChNYXRoLnJhbmRvbSgpICogNCkgKyAxO1xuICAgICAgcmV0dXJuIHt4OiBfLnJhbmRvbSgwLCA1KSAqIDIgJSAxMiwgeTogTWF0aC5mbG9vcihpIC8gNikgKiB5LCB3OiAyLCBoOiB5LCBpOiBpLCBzdGF0aWM6IE1hdGgucmFuZG9tKCkgPCAwLjA1fTtcbiAgICB9KTtcbiAgfSxcblxuICBvbkJyZWFrcG9pbnRDaGFuZ2UoYnJlYWtwb2ludCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY3VycmVudEJyZWFrcG9pbnQ6IGJyZWFrcG9pbnRcbiAgICB9KTtcbiAgfSxcblxuICBvbkxheW91dENoYW5nZShsYXlvdXQpIHtcbiAgICB0aGlzLnByb3BzLm9uTGF5b3V0Q2hhbmdlKGxheW91dCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjdXJyZW50TGF5b3V0OiBsYXlvdXRcbiAgICB9KTtcbiAgfSxcblxuICBvbk5ld0xheW91dCgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGxheW91dHM6IHtsZzogdGhpcy5nZW5lcmF0ZUxheW91dCgpfVxuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGRpdj5DdXJyZW50IEJyZWFrcG9pbnQ6IHt0aGlzLnN0YXRlLmN1cnJlbnRCcmVha3BvaW50fSAoe3RoaXMucHJvcHMuY29sc1t0aGlzLnN0YXRlLmN1cnJlbnRCcmVha3BvaW50XX0gY29sdW1ucyk8L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uTmV3TGF5b3V0fT5HZW5lcmF0ZSBOZXcgTGF5b3V0PC9idXR0b24+XG4gICAgICAgIDxSZXNwb25zaXZlUmVhY3RHcmlkTGF5b3V0IFxuICAgICAgICAgICAgbGF5b3V0cz17dGhpcy5zdGF0ZS5sYXlvdXRzfVxuICAgICAgICAgICAgb25CcmVha3BvaW50Q2hhbmdlPXt0aGlzLm9uQnJlYWtwb2ludENoYW5nZX1cbiAgICAgICAgICAgIG9uTGF5b3V0Q2hhbmdlPXt0aGlzLm9uTGF5b3V0Q2hhbmdlfVxuICAgICAgICAgICAgdXNlQ1NTVHJhbnNmb3Jtcz17dHJ1ZX1cbiAgICAgICAgICAgIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICB7dGhpcy5nZW5lcmF0ZURPTSgpfVxuICAgICAgICA8L1Jlc3BvbnNpdmVSZWFjdEdyaWRMYXlvdXQ+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNpY0xheW91dDtcblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIHJlcXVpcmUoJy4uL3Rlc3QtaG9vay5qc3gnKShtb2R1bGUuZXhwb3J0cyk7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3Rlc3QvZXhhbXBsZXMvMC1zaG93Y2FzZS5qc3hcbiAqKi8iXSwic291cmNlUm9vdCI6IiIsImZpbGUiOiIwLXNob3djYXNlLmJ1bmRsZS5qcyJ9