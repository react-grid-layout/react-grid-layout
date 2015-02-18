webpackJsonp([11],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(4);
	var PureRenderMixin = __webpack_require__(6);
	var _ = __webpack_require__(15);
	var ReactGridLayout = __webpack_require__(9);
	
	var BasicLayout = React.createClass({
	  displayName: "BasicLayout",
	  mixins: [PureRenderMixin],
	
	  propTypes: {
	    onLayoutChange: React.PropTypes.func.isRequired
	  },
	
	  getDefaultProps: function getDefaultProps() {
	    return {
	      className: "layout",
	      items: 20,
	      rowHeight: 30,
	      cols: 12
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
	
	module.exports = BasicLayout;
	
	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(10)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)(module)))

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzEtYmFzaWMuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQU9FLFNBQU0sRUFBRSxDQUFDLGVBQWUsQ0FBQzs7QUFFekIsWUFBUyxFQUFFO0FBQ1QsbUJBQWMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0lBQ2hEOztBQUVELGtCQUFlLDZCQUFHO0FBQ2hCLFlBQU87QUFDTCxnQkFBUyxFQUFFLFFBQVE7QUFDbkIsWUFBSyxFQUFFLEVBQUU7QUFDVCxnQkFBUyxFQUFFLEVBQUU7QUFDYixXQUFJLEVBQUUsRUFBRTtNQUNULENBQUM7SUFDSDs7QUFFRCxrQkFBZSw2QkFBRztBQUNoQixTQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDbkMsWUFBTztBQUNMLGFBQU0sRUFBRSxNQUFNO01BQ2YsQ0FBQztJQUNIOztBQUVELGNBQVcseUJBQUc7QUFDWixZQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVMsQ0FBQyxFQUFFO0FBQ2xELGNBQVE7O1dBQUssR0FBRyxFQUFFLENBQUU7U0FBQzs7YUFBTSxTQUFTLEVBQUMsTUFBTTtXQUFFLENBQUM7VUFBUTtRQUFNLENBQUU7TUFDL0QsQ0FBQyxDQUFDO0lBQ0o7O0FBRUQsaUJBQWMsNEJBQUc7QUFDZixTQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ25CLFlBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBUyxJQUFJLEVBQUUsQ0FBQyxFQUFFO0FBQ2pELFdBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3RCxjQUFPLEVBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQztNQUNwRSxDQUFDLENBQUM7SUFDSjs7QUFFRCxpQkFBYyxFQUFFLFVBQVMsTUFBTSxFQUFFO0FBQy9CLFNBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ25DOztBQUVELFNBQU0sb0JBQUc7QUFDUCxZQUNFO0FBQUMsc0JBQWU7d0JBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTyxFQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBZTtVQUN4RSxJQUFJLENBQUMsS0FBSztPQUNmLElBQUksQ0FBQyxXQUFXLEVBQUU7TUFFSCxDQUNsQjtJQUNIO0VBQ0YsQ0FBQyxDQUFDOztBQUVILE9BQU0sQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDOztBQUU3QixLQUFJLHdCQUFZLEtBQUssTUFBTSxFQUFFO0FBQzNCLHNCQUFPLENBQUMsRUFBa0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUHVyZVJlbmRlck1peGluID0gcmVxdWlyZSgncmVhY3QvbGliL1JlYWN0Q29tcG9uZW50V2l0aFB1cmVSZW5kZXJNaXhpbicpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBSZWFjdEdyaWRMYXlvdXQgPSByZXF1aXJlKCdyZWFjdC1ncmlkLWxheW91dCcpO1xuXG52YXIgQmFzaWNMYXlvdXQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIG1peGluczogW1B1cmVSZW5kZXJNaXhpbl0sXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgb25MYXlvdXRDaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNsYXNzTmFtZTogXCJsYXlvdXRcIixcbiAgICAgIGl0ZW1zOiAyMCxcbiAgICAgIHJvd0hlaWdodDogMzAsXG4gICAgICBjb2xzOiAxMlxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHZhciBsYXlvdXQgPSB0aGlzLmdlbmVyYXRlTGF5b3V0KCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxheW91dDogbGF5b3V0XG4gICAgfTtcbiAgfSxcblxuICBnZW5lcmF0ZURPTSgpIHtcbiAgICByZXR1cm4gXy5tYXAoXy5yYW5nZSh0aGlzLnByb3BzLml0ZW1zKSwgZnVuY3Rpb24oaSkge1xuICAgICAgcmV0dXJuICg8ZGl2IGtleT17aX0+PHNwYW4gY2xhc3NOYW1lPVwidGV4dFwiPntpfTwvc3Bhbj48L2Rpdj4pO1xuICAgIH0pO1xuICB9LFxuXG4gIGdlbmVyYXRlTGF5b3V0KCkge1xuICAgIHZhciBwID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gXy5tYXAobmV3IEFycmF5KHAuaXRlbXMpLCBmdW5jdGlvbihpdGVtLCBpKSB7XG4gICAgICB2YXIgeSA9IF8ucmVzdWx0KHAsICd5JykgfHwgTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiA0KSArIDE7XG4gICAgICByZXR1cm4ge3g6IGkgKiAyICUgMTIsIHk6IE1hdGguZmxvb3IoaSAvIDYpICogeSwgdzogMiwgaDogeSwgaTogaX07XG4gICAgfSk7XG4gIH0sXG5cbiAgb25MYXlvdXRDaGFuZ2U6IGZ1bmN0aW9uKGxheW91dCkge1xuICAgIHRoaXMucHJvcHMub25MYXlvdXRDaGFuZ2UobGF5b3V0KTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxSZWFjdEdyaWRMYXlvdXQgbGF5b3V0PXt0aGlzLnN0YXRlLmxheW91dH0gb25MYXlvdXRDaGFuZ2U9e3RoaXMub25MYXlvdXRDaGFuZ2V9XG4gICAgICAgICAgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICB7dGhpcy5nZW5lcmF0ZURPTSgpfVxuICAgICAgPC9SZWFjdEdyaWRMYXlvdXQ+XG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzaWNMYXlvdXQ7XG5cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICByZXF1aXJlKCcuLi90ZXN0LWhvb2suanN4JykobW9kdWxlLmV4cG9ydHMpO1xufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi90ZXN0L2V4YW1wbGVzLzEtYmFzaWMuanN4XG4gKiovIl0sInNvdXJjZVJvb3QiOiIiLCJmaWxlIjoiMS1iYXNpYy5idW5kbGUuanMifQ==