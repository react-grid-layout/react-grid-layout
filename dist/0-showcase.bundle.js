webpackJsonp([11],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(4);
	var _ = __webpack_require__(17);
	var ResponsiveReactGridLayout = __webpack_require__(10).Responsive;
	
	var BasicLayout = React.createClass({
	  displayName: "BasicLayout",
	  mixins: [React.addons.PureRenderMixin],
	
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzAtc2hvd2Nhc2UuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBTUUsU0FBTSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUM7O0FBRXRDLFlBQVMsRUFBRTtBQUNULG1CQUFjLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtJQUNoRDs7QUFFRCxrQkFBZSw2QkFBRztBQUNoQixZQUFPO0FBQ0wsZ0JBQVMsRUFBRSxRQUFRO0FBQ25CLGdCQUFTLEVBQUUsRUFBRTtBQUNiLFdBQUksRUFBRSxFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBQztNQUM3QyxDQUFDO0lBQ0g7O0FBRUQsa0JBQWUsNkJBQUc7QUFDaEIsWUFBTztBQUNMLGNBQU8sRUFBRSxFQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUM7QUFDcEMsb0JBQWEsRUFBRSxFQUFFO0FBQ2pCLHdCQUFpQixFQUFFLElBQUk7TUFDeEIsQ0FBQztJQUNIOztBQUVELGNBQVcseUJBQUc7QUFDWixZQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNqRCxjQUNFOztXQUFLLEdBQUcsRUFBRSxDQUFFLEVBQUMsU0FBUyxFQUFFLENBQUMsVUFBTyxHQUFHLFFBQVEsR0FBRyxFQUFHO1NBQzlDLENBQUMsVUFBTyxHQUNQOzthQUFNLFNBQVMsRUFBQyxNQUFNLEVBQUMsS0FBSyxFQUFDLHVEQUF1RDs7V0FBVyxDQUFDO1VBQVEsR0FDdEc7O2FBQU0sU0FBUyxFQUFDLE1BQU07V0FBRSxDQUFDO1VBQVE7UUFHakMsQ0FBRTtNQUNYLENBQUMsQ0FBQztJQUNKOztBQUVELGlCQUFjLDRCQUFHO0FBQ2YsU0FBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNuQixZQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsVUFBUyxJQUFJLEVBQUUsQ0FBQyxFQUFFO0FBQzdDLFdBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3RCxjQUFPLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxVQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLEVBQUMsQ0FBQztNQUMvRyxDQUFDLENBQUM7SUFDSjs7QUFFRCxxQkFBa0IsOEJBQUMsVUFBVSxFQUFFO0FBQzdCLFNBQUksQ0FBQyxRQUFRLENBQUM7QUFDWix3QkFBaUIsRUFBRSxVQUFVO01BQzlCLENBQUMsQ0FBQztJQUNKOztBQUVELGlCQUFjLDBCQUFDLE1BQU0sRUFBRTtBQUNyQixTQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsQyxTQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osb0JBQWEsRUFBRSxNQUFNO01BQ3RCLENBQUMsQ0FBQztJQUNKOztBQUVELGNBQVcseUJBQUc7QUFDWixTQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osY0FBTyxFQUFFLEVBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBQztNQUNyQyxDQUFDLENBQUM7SUFDSjs7QUFFRCxTQUFNLG9CQUFHO0FBQ1AsWUFDRTs7O09BQ0U7Ozs7U0FBMEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUI7O1NBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQzs7UUFBZ0I7T0FFdkg7O1dBQVEsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFZOztRQUE2QjtPQUUvRDtBQUFDLGtDQUF5Qjs7QUFDdEIsa0JBQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVE7QUFDNUIsNkJBQWtCLEVBQUUsSUFBSSxDQUFDLGtCQUFtQjtBQUM1Qyx5QkFBYyxFQUFFLElBQUksQ0FBQyxjQUFlO0FBQ3BDLDJCQUFnQixFQUFFLElBQUs7WUFDbkIsSUFBSSxDQUFDLEtBQUs7U0FDZixJQUFJLENBQUMsV0FBVyxFQUFFO1FBRU87TUFFeEIsQ0FDTjtJQUNIO0VBQ0YsQ0FBQyxDQUFDOztBQUVILE9BQU0sQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDOztBQUU3QixLQUFJLHdCQUFZLEtBQUssTUFBTSxFQUFFO0FBQzNCLHNCQUFPLENBQUMsRUFBa0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBSZXNwb25zaXZlUmVhY3RHcmlkTGF5b3V0ID0gcmVxdWlyZSgncmVhY3QtZ3JpZC1sYXlvdXQnKS5SZXNwb25zaXZlO1xuXG52YXIgQmFzaWNMYXlvdXQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIG1peGluczogW1JlYWN0LmFkZG9ucy5QdXJlUmVuZGVyTWl4aW5dLFxuXG4gIHByb3BUeXBlczoge1xuICAgIG9uTGF5b3V0Q2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkXG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjbGFzc05hbWU6IFwibGF5b3V0XCIsXG4gICAgICByb3dIZWlnaHQ6IDMwLFxuICAgICAgY29sczoge2xnOiAxMiwgbWQ6IDEwLCBzbTogNiwgeHM6IDQsIHh4czogMn1cbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGF5b3V0czoge2xnOiB0aGlzLmdlbmVyYXRlTGF5b3V0KCl9LFxuICAgICAgY3VycmVudExheW91dDogW10sXG4gICAgICBjdXJyZW50QnJlYWtwb2ludDogJ2xnJ1xuICAgIH07XG4gIH0sXG5cbiAgZ2VuZXJhdGVET00oKSB7XG4gICAgcmV0dXJuIF8ubWFwKHRoaXMuc3RhdGUubGF5b3V0cy5sZywgZnVuY3Rpb24obCwgaSkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBrZXk9e2l9IGNsYXNzTmFtZT17bC5zdGF0aWMgPyAnc3RhdGljJyA6ICcnfT5cbiAgICAgICAgICB7bC5zdGF0aWMgPyBcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHRcIiB0aXRsZT1cIlRoaXMgaXRlbSBpcyBzdGF0aWMgYW5kIGNhbm5vdCBiZSByZW1vdmVkIG9yIHJlc2l6ZWQuXCI+U3RhdGljIC0ge2l9PC9zcGFuPlxuICAgICAgICAgICAgOiA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0XCI+e2l9PC9zcGFuPlxuICAgICAgICAgIH1cbiAgICAgICAgPC9kaXY+KTtcbiAgICB9KTtcbiAgfSxcblxuICBnZW5lcmF0ZUxheW91dCgpIHtcbiAgICB2YXIgcCA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIF8ubWFwKF8ucmFuZ2UoMCwgMjUpLCBmdW5jdGlvbihpdGVtLCBpKSB7XG4gICAgICB2YXIgeSA9IF8ucmVzdWx0KHAsICd5JykgfHwgTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiA0KSArIDE7XG4gICAgICByZXR1cm4ge3g6IF8ucmFuZG9tKDAsIDUpICogMiAlIDEyLCB5OiBNYXRoLmZsb29yKGkgLyA2KSAqIHksIHc6IDIsIGg6IHksIGk6IGksIHN0YXRpYzogTWF0aC5yYW5kb20oKSA8IDAuMDV9O1xuICAgIH0pO1xuICB9LFxuXG4gIG9uQnJlYWtwb2ludENoYW5nZShicmVha3BvaW50KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjdXJyZW50QnJlYWtwb2ludDogYnJlYWtwb2ludFxuICAgIH0pO1xuICB9LFxuXG4gIG9uTGF5b3V0Q2hhbmdlKGxheW91dCkge1xuICAgIHRoaXMucHJvcHMub25MYXlvdXRDaGFuZ2UobGF5b3V0KTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGN1cnJlbnRMYXlvdXQ6IGxheW91dFxuICAgIH0pO1xuICB9LFxuXG4gIG9uTmV3TGF5b3V0KCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbGF5b3V0czoge2xnOiB0aGlzLmdlbmVyYXRlTGF5b3V0KCl9XG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8ZGl2PkN1cnJlbnQgQnJlYWtwb2ludDoge3RoaXMuc3RhdGUuY3VycmVudEJyZWFrcG9pbnR9ICh7dGhpcy5wcm9wcy5jb2xzW3RoaXMuc3RhdGUuY3VycmVudEJyZWFrcG9pbnRdfSBjb2x1bW5zKTwvZGl2PlxuICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMub25OZXdMYXlvdXR9PkdlbmVyYXRlIE5ldyBMYXlvdXQ8L2J1dHRvbj5cbiAgICAgICAgPFJlc3BvbnNpdmVSZWFjdEdyaWRMYXlvdXQgXG4gICAgICAgICAgICBsYXlvdXRzPXt0aGlzLnN0YXRlLmxheW91dHN9XG4gICAgICAgICAgICBvbkJyZWFrcG9pbnRDaGFuZ2U9e3RoaXMub25CcmVha3BvaW50Q2hhbmdlfVxuICAgICAgICAgICAgb25MYXlvdXRDaGFuZ2U9e3RoaXMub25MYXlvdXRDaGFuZ2V9XG4gICAgICAgICAgICB1c2VDU1NUcmFuc2Zvcm1zPXt0cnVlfVxuICAgICAgICAgICAgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgIHt0aGlzLmdlbmVyYXRlRE9NKCl9XG4gICAgICAgIDwvUmVzcG9uc2l2ZVJlYWN0R3JpZExheW91dD5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljTGF5b3V0O1xuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgcmVxdWlyZSgnLi4vdGVzdC1ob29rLmpzeCcpKG1vZHVsZS5leHBvcnRzKTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vdGVzdC9leGFtcGxlcy8wLXNob3djYXNlLmpzeFxuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6IjAtc2hvd2Nhc2UuYnVuZGxlLmpzIn0=