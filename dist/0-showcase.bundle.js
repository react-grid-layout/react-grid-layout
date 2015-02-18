webpackJsonp([12],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(4);
	var PureRenderMixin = __webpack_require__(6);
	var _ = __webpack_require__(15);
	var ResponsiveReactGridLayout = __webpack_require__(9).Responsive;
	
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
	  __webpack_require__(10)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)(module)))

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzAtc2hvd2Nhc2UuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQU9FLFNBQU0sRUFBRSxDQUFDLGVBQWUsQ0FBQzs7QUFFekIsWUFBUyxFQUFFO0FBQ1QsbUJBQWMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0lBQ2hEOztBQUVELGtCQUFlLDZCQUFHO0FBQ2hCLFlBQU87QUFDTCxnQkFBUyxFQUFFLFFBQVE7QUFDbkIsZ0JBQVMsRUFBRSxFQUFFO0FBQ2IsV0FBSSxFQUFFLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFDO01BQzdDLENBQUM7SUFDSDs7QUFFRCxrQkFBZSw2QkFBRztBQUNoQixZQUFPO0FBQ0wsY0FBTyxFQUFFLEVBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBQztBQUNwQyx3QkFBaUIsRUFBRSxJQUFJO01BQ3hCLENBQUM7SUFDSDs7QUFFRCxjQUFXLHlCQUFHO0FBQ1osWUFBTyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDakQsY0FDRTs7V0FBSyxHQUFHLEVBQUUsQ0FBRSxFQUFDLFNBQVMsRUFBRSxDQUFDLFVBQU8sR0FBRyxRQUFRLEdBQUcsRUFBRztTQUM5QyxDQUFDLFVBQU8sR0FDUDs7YUFBTSxTQUFTLEVBQUMsTUFBTSxFQUFDLEtBQUssRUFBQyx1REFBdUQ7O1dBQVcsQ0FBQztVQUFRLEdBQ3RHOzthQUFNLFNBQVMsRUFBQyxNQUFNO1dBQUUsQ0FBQztVQUFRO1FBR2pDLENBQUU7TUFDWCxDQUFDLENBQUM7SUFDSjs7QUFFRCxpQkFBYyw0QkFBRztBQUNmLFNBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDbkIsWUFBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLFVBQVMsSUFBSSxFQUFFLENBQUMsRUFBRTtBQUM3QyxXQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0QsY0FBTyxFQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsVUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxFQUFDLENBQUM7TUFDL0csQ0FBQyxDQUFDO0lBQ0o7O0FBRUQscUJBQWtCLDhCQUFDLFVBQVUsRUFBRTtBQUM3QixTQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osd0JBQWlCLEVBQUUsVUFBVTtNQUM5QixDQUFDLENBQUM7SUFDSjs7QUFFRCxpQkFBYywwQkFBQyxNQUFNLEVBQUU7QUFDckIsU0FBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkM7O0FBRUQsY0FBVyx5QkFBRztBQUNaLFNBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixjQUFPLEVBQUUsRUFBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFDO01BQ3JDLENBQUMsQ0FBQztJQUNKOztBQUVELFNBQU0sb0JBQUc7QUFDUCxZQUNFOzs7T0FDRTs7OztTQUEwQixJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQjs7U0FBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDOztRQUFnQjtPQUV2SDs7V0FBUSxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVk7O1FBQTZCO09BRS9EO0FBQUMsa0NBQXlCOztBQUN0QixrQkFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBUTtBQUM1Qiw2QkFBa0IsRUFBRSxJQUFJLENBQUMsa0JBQW1CO0FBQzVDLHlCQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWU7QUFDcEMsMkJBQWdCLEVBQUUsSUFBSztZQUNuQixJQUFJLENBQUMsS0FBSztTQUNmLElBQUksQ0FBQyxXQUFXLEVBQUU7UUFFTztNQUV4QixDQUNOO0lBQ0g7RUFDRixDQUFDLENBQUM7O0FBRUgsT0FBTSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUM7O0FBRTdCLEtBQUksd0JBQVksS0FBSyxNQUFNLEVBQUU7QUFDM0Isc0JBQU8sQ0FBQyxFQUFrQixDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBQdXJlUmVuZGVyTWl4aW4gPSByZXF1aXJlKCdyZWFjdC9saWIvUmVhY3RDb21wb25lbnRXaXRoUHVyZVJlbmRlck1peGluJyk7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xudmFyIFJlc3BvbnNpdmVSZWFjdEdyaWRMYXlvdXQgPSByZXF1aXJlKCdyZWFjdC1ncmlkLWxheW91dCcpLlJlc3BvbnNpdmU7XG5cbnZhciBCYXNpY0xheW91dCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgbWl4aW5zOiBbUHVyZVJlbmRlck1peGluXSxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBvbkxheW91dENoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2xhc3NOYW1lOiBcImxheW91dFwiLFxuICAgICAgcm93SGVpZ2h0OiAzMCxcbiAgICAgIGNvbHM6IHtsZzogMTIsIG1kOiAxMCwgc206IDYsIHhzOiA0LCB4eHM6IDJ9XG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxheW91dHM6IHtsZzogdGhpcy5nZW5lcmF0ZUxheW91dCgpfSxcbiAgICAgIGN1cnJlbnRCcmVha3BvaW50OiAnbGcnXG4gICAgfTtcbiAgfSxcblxuICBnZW5lcmF0ZURPTSgpIHtcbiAgICByZXR1cm4gXy5tYXAodGhpcy5zdGF0ZS5sYXlvdXRzLmxnLCBmdW5jdGlvbihsLCBpKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPXtsLnN0YXRpYyA/ICdzdGF0aWMnIDogJyd9PlxuICAgICAgICAgIHtsLnN0YXRpYyA/IFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dFwiIHRpdGxlPVwiVGhpcyBpdGVtIGlzIHN0YXRpYyBhbmQgY2Fubm90IGJlIHJlbW92ZWQgb3IgcmVzaXplZC5cIj5TdGF0aWMgLSB7aX08L3NwYW4+XG4gICAgICAgICAgICA6IDxzcGFuIGNsYXNzTmFtZT1cInRleHRcIj57aX08L3NwYW4+XG4gICAgICAgICAgfVxuICAgICAgICA8L2Rpdj4pO1xuICAgIH0pO1xuICB9LFxuXG4gIGdlbmVyYXRlTGF5b3V0KCkge1xuICAgIHZhciBwID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gXy5tYXAoXy5yYW5nZSgwLCAyNSksIGZ1bmN0aW9uKGl0ZW0sIGkpIHtcbiAgICAgIHZhciB5ID0gXy5yZXN1bHQocCwgJ3knKSB8fCBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIDQpICsgMTtcbiAgICAgIHJldHVybiB7eDogXy5yYW5kb20oMCwgNSkgKiAyICUgMTIsIHk6IE1hdGguZmxvb3IoaSAvIDYpICogeSwgdzogMiwgaDogeSwgaTogaSwgc3RhdGljOiBNYXRoLnJhbmRvbSgpIDwgMC4wNX07XG4gICAgfSk7XG4gIH0sXG5cbiAgb25CcmVha3BvaW50Q2hhbmdlKGJyZWFrcG9pbnQpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGN1cnJlbnRCcmVha3BvaW50OiBicmVha3BvaW50XG4gICAgfSk7XG4gIH0sXG5cbiAgb25MYXlvdXRDaGFuZ2UobGF5b3V0KSB7XG4gICAgdGhpcy5wcm9wcy5vbkxheW91dENoYW5nZShsYXlvdXQpO1xuICB9LFxuXG4gIG9uTmV3TGF5b3V0KCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbGF5b3V0czoge2xnOiB0aGlzLmdlbmVyYXRlTGF5b3V0KCl9XG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8ZGl2PkN1cnJlbnQgQnJlYWtwb2ludDoge3RoaXMuc3RhdGUuY3VycmVudEJyZWFrcG9pbnR9ICh7dGhpcy5wcm9wcy5jb2xzW3RoaXMuc3RhdGUuY3VycmVudEJyZWFrcG9pbnRdfSBjb2x1bW5zKTwvZGl2PlxuICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMub25OZXdMYXlvdXR9PkdlbmVyYXRlIE5ldyBMYXlvdXQ8L2J1dHRvbj5cbiAgICAgICAgPFJlc3BvbnNpdmVSZWFjdEdyaWRMYXlvdXQgXG4gICAgICAgICAgICBsYXlvdXRzPXt0aGlzLnN0YXRlLmxheW91dHN9XG4gICAgICAgICAgICBvbkJyZWFrcG9pbnRDaGFuZ2U9e3RoaXMub25CcmVha3BvaW50Q2hhbmdlfVxuICAgICAgICAgICAgb25MYXlvdXRDaGFuZ2U9e3RoaXMub25MYXlvdXRDaGFuZ2V9XG4gICAgICAgICAgICB1c2VDU1NUcmFuc2Zvcm1zPXt0cnVlfVxuICAgICAgICAgICAgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgIHt0aGlzLmdlbmVyYXRlRE9NKCl9XG4gICAgICAgIDwvUmVzcG9uc2l2ZVJlYWN0R3JpZExheW91dD5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljTGF5b3V0O1xuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgcmVxdWlyZSgnLi4vdGVzdC1ob29rLmpzeCcpKG1vZHVsZS5leHBvcnRzKTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vdGVzdC9leGFtcGxlcy8wLXNob3djYXNlLmpzeFxuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6IjAtc2hvd2Nhc2UuYnVuZGxlLmpzIn0=