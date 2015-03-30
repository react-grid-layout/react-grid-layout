webpackJsonp([12],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	
	var _extends = __webpack_require__(8)["default"];
	
	var React = __webpack_require__(4);
	var PureRenderMixin = __webpack_require__(6);
	var _ = __webpack_require__(16);
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
	        _extends({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzAtc2hvd2Nhc2UuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSwyREFBWSxDQUFDOzs7O0FBQ2IsS0FBSSxLQUFLLEdBQUcsbUJBQU8sQ0FBQyxDQUFPLENBQUMsQ0FBQztBQUM3QixLQUFJLGVBQWUsR0FBRyxtQkFBTyxDQUFDLENBQTZDLENBQUMsQ0FBQztBQUM3RSxLQUFJLENBQUMsR0FBRyxtQkFBTyxDQUFDLEVBQVEsQ0FBQyxDQUFDO0FBQzFCLEtBQUkseUJBQXlCLEdBQUcsbUJBQU8sQ0FBQyxFQUFtQixDQUFDLENBQUMsVUFBVSxDQUFDOztBQUV4RSxLQUFJLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFDbEMsU0FBTSxFQUFFLENBQUMsZUFBZSxDQUFDOztBQUV6QixZQUFTLEVBQUU7QUFDVCxtQkFBYyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7SUFDaEQ7O0FBRUQsa0JBQWUsNkJBQUc7QUFDaEIsWUFBTztBQUNMLGdCQUFTLEVBQUUsUUFBUTtBQUNuQixnQkFBUyxFQUFFLEVBQUU7QUFDYixXQUFJLEVBQUUsRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUM7TUFDN0MsQ0FBQztJQUNIOztBQUVELGtCQUFlLDZCQUFHO0FBQ2hCLFlBQU87QUFDTCxjQUFPLEVBQUUsRUFBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFDO0FBQ3BDLHdCQUFpQixFQUFFLElBQUk7TUFDeEIsQ0FBQztJQUNIOztBQUVELGNBQVcseUJBQUc7QUFDWixZQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNqRCxjQUNFOztXQUFLLEdBQUcsRUFBRSxDQUFFLEVBQUMsU0FBUyxFQUFFLENBQUMsVUFBTyxHQUFHLFFBQVEsR0FBRyxFQUFHO1NBQzlDLENBQUMsVUFBTyxHQUNQOzthQUFNLFNBQVMsRUFBQyxNQUFNLEVBQUMsS0FBSyxFQUFDLHVEQUF1RDs7V0FBVyxDQUFDO1VBQVEsR0FDdEc7O2FBQU0sU0FBUyxFQUFDLE1BQU07V0FBRSxDQUFDO1VBQVE7UUFFakMsQ0FBRTtNQUNYLENBQUMsQ0FBQztJQUNKOztBQUVELGlCQUFjLDRCQUFHO0FBQ2YsU0FBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNuQixZQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsVUFBUyxJQUFJLEVBQUUsQ0FBQyxFQUFFO0FBQzdDLFdBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3RCxjQUFPLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxVQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLEVBQUMsQ0FBQztNQUMvRyxDQUFDLENBQUM7SUFDSjs7QUFFRCxxQkFBa0IsOEJBQUMsVUFBVSxFQUFFO0FBQzdCLFNBQUksQ0FBQyxRQUFRLENBQUM7QUFDWix3QkFBaUIsRUFBRSxVQUFVO01BQzlCLENBQUMsQ0FBQztJQUNKOztBQUVELGlCQUFjLDBCQUFDLE1BQU0sRUFBRTtBQUNyQixTQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuQzs7QUFFRCxjQUFXLHlCQUFHO0FBQ1osU0FBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLGNBQU8sRUFBRSxFQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUM7TUFDckMsQ0FBQyxDQUFDO0lBQ0o7O0FBRUQsU0FBTSxvQkFBRztBQUNQLFlBQ0U7OztPQUNFOzs7O1NBQTBCLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCOztTQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUM7O1FBQWdCO09BQ3ZIOztXQUFRLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBWTs7UUFBNkI7T0FDL0Q7QUFBQyxrQ0FBeUI7O0FBQ3RCLGtCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFRO0FBQzVCLDZCQUFrQixFQUFFLElBQUksQ0FBQyxrQkFBbUI7QUFDNUMseUJBQWMsRUFBRSxJQUFJLENBQUMsY0FBZTtBQUNwQywyQkFBZ0IsRUFBRSxJQUFLO1lBQ25CLElBQUksQ0FBQyxLQUFLO1NBQ2YsSUFBSSxDQUFDLFdBQVcsRUFBRTtRQUNPO01BQ3hCLENBQ047SUFDSDtFQUNGLENBQUMsQ0FBQzs7QUFFSCxPQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQzs7QUFFN0IsS0FBSSx3QkFBWSxLQUFLLE1BQU0sRUFBRTtBQUMzQixzQkFBTyxDQUFDLEVBQWtCLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFB1cmVSZW5kZXJNaXhpbiA9IHJlcXVpcmUoJ3JlYWN0L2xpYi9SZWFjdENvbXBvbmVudFdpdGhQdXJlUmVuZGVyTWl4aW4nKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgUmVzcG9uc2l2ZVJlYWN0R3JpZExheW91dCA9IHJlcXVpcmUoJ3JlYWN0LWdyaWQtbGF5b3V0JykuUmVzcG9uc2l2ZTtcblxudmFyIEJhc2ljTGF5b3V0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBtaXhpbnM6IFtQdXJlUmVuZGVyTWl4aW5dLFxuXG4gIHByb3BUeXBlczoge1xuICAgIG9uTGF5b3V0Q2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkXG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjbGFzc05hbWU6IFwibGF5b3V0XCIsXG4gICAgICByb3dIZWlnaHQ6IDMwLFxuICAgICAgY29sczoge2xnOiAxMiwgbWQ6IDEwLCBzbTogNiwgeHM6IDQsIHh4czogMn1cbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGF5b3V0czoge2xnOiB0aGlzLmdlbmVyYXRlTGF5b3V0KCl9LFxuICAgICAgY3VycmVudEJyZWFrcG9pbnQ6ICdsZydcbiAgICB9O1xuICB9LFxuXG4gIGdlbmVyYXRlRE9NKCkge1xuICAgIHJldHVybiBfLm1hcCh0aGlzLnN0YXRlLmxheW91dHMubGcsIGZ1bmN0aW9uKGwsIGkpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9e2wuc3RhdGljID8gJ3N0YXRpYycgOiAnJ30+XG4gICAgICAgICAge2wuc3RhdGljID9cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHRcIiB0aXRsZT1cIlRoaXMgaXRlbSBpcyBzdGF0aWMgYW5kIGNhbm5vdCBiZSByZW1vdmVkIG9yIHJlc2l6ZWQuXCI+U3RhdGljIC0ge2l9PC9zcGFuPlxuICAgICAgICAgICAgOiA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0XCI+e2l9PC9zcGFuPlxuICAgICAgICAgIH1cbiAgICAgICAgPC9kaXY+KTtcbiAgICB9KTtcbiAgfSxcblxuICBnZW5lcmF0ZUxheW91dCgpIHtcbiAgICB2YXIgcCA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIF8ubWFwKF8ucmFuZ2UoMCwgMjUpLCBmdW5jdGlvbihpdGVtLCBpKSB7XG4gICAgICB2YXIgeSA9IF8ucmVzdWx0KHAsICd5JykgfHwgTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiA0KSArIDE7XG4gICAgICByZXR1cm4ge3g6IF8ucmFuZG9tKDAsIDUpICogMiAlIDEyLCB5OiBNYXRoLmZsb29yKGkgLyA2KSAqIHksIHc6IDIsIGg6IHksIGk6IGksIHN0YXRpYzogTWF0aC5yYW5kb20oKSA8IDAuMDV9O1xuICAgIH0pO1xuICB9LFxuXG4gIG9uQnJlYWtwb2ludENoYW5nZShicmVha3BvaW50KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjdXJyZW50QnJlYWtwb2ludDogYnJlYWtwb2ludFxuICAgIH0pO1xuICB9LFxuXG4gIG9uTGF5b3V0Q2hhbmdlKGxheW91dCkge1xuICAgIHRoaXMucHJvcHMub25MYXlvdXRDaGFuZ2UobGF5b3V0KTtcbiAgfSxcblxuICBvbk5ld0xheW91dCgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGxheW91dHM6IHtsZzogdGhpcy5nZW5lcmF0ZUxheW91dCgpfVxuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGRpdj5DdXJyZW50IEJyZWFrcG9pbnQ6IHt0aGlzLnN0YXRlLmN1cnJlbnRCcmVha3BvaW50fSAoe3RoaXMucHJvcHMuY29sc1t0aGlzLnN0YXRlLmN1cnJlbnRCcmVha3BvaW50XX0gY29sdW1ucyk8L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uTmV3TGF5b3V0fT5HZW5lcmF0ZSBOZXcgTGF5b3V0PC9idXR0b24+XG4gICAgICAgIDxSZXNwb25zaXZlUmVhY3RHcmlkTGF5b3V0XG4gICAgICAgICAgICBsYXlvdXRzPXt0aGlzLnN0YXRlLmxheW91dHN9XG4gICAgICAgICAgICBvbkJyZWFrcG9pbnRDaGFuZ2U9e3RoaXMub25CcmVha3BvaW50Q2hhbmdlfVxuICAgICAgICAgICAgb25MYXlvdXRDaGFuZ2U9e3RoaXMub25MYXlvdXRDaGFuZ2V9XG4gICAgICAgICAgICB1c2VDU1NUcmFuc2Zvcm1zPXt0cnVlfVxuICAgICAgICAgICAgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgIHt0aGlzLmdlbmVyYXRlRE9NKCl9XG4gICAgICAgIDwvUmVzcG9uc2l2ZVJlYWN0R3JpZExheW91dD5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljTGF5b3V0O1xuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgcmVxdWlyZSgnLi4vdGVzdC1ob29rLmpzeCcpKG1vZHVsZS5leHBvcnRzKTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vdGVzdC9leGFtcGxlcy8wLXNob3djYXNlLmpzeFxuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6IjAtc2hvd2Nhc2UuYnVuZGxlLmpzIn0=