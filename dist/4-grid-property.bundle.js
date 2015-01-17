webpackJsonp([6],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(4);
	var _ = __webpack_require__(17);
	var ReactGridLayout = __webpack_require__(10);
	
	var GridPropertyLayout = React.createClass({
	  displayName: "GridPropertyLayout",
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
	  __webpack_require__(11)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)(module)))

/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2V4YW1wbGVzLzQtZ3JpZC1wcm9wZXJ0eS5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFNRSxTQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQzs7QUFFdEMsa0JBQWUsNkJBQUc7QUFDaEIsWUFBTztBQUNMLGtCQUFXLEVBQUUsSUFBSTtBQUNqQixrQkFBVyxFQUFFLElBQUk7QUFDakIsWUFBSyxFQUFFLEVBQUU7QUFDVCxnQkFBUyxFQUFFLEVBQUU7QUFDYixXQUFJLEVBQUUsRUFBRSxFQUNULENBQUM7OztBQUdKLG9CQUFlLDJCQUFHO0FBQ2hCLGNBQ0MsQ0FBQztJQUNIOztBQUVELGNBQVcseUJBQUc7O0FBRVosU0FBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ25DLFlBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBUyxDQUFDLEVBQUU7QUFDbEQsY0FBUTs7V0FBSyxHQUFHLEVBQUUsQ0FBRSxFQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFFO1NBQUM7O2FBQU0sU0FBUyxFQUFDLE1BQU07V0FBRSxDQUFDO1VBQVE7UUFBTSxDQUFFO01BQ2pGLENBQUMsQ0FBQztJQUNKOztBQUVELGlCQUFjLDRCQUFHO0FBQ2YsU0FBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNuQixZQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVMsSUFBSSxFQUFFLENBQUMsRUFBRTtBQUNqRCxXQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6RCxXQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0QsY0FBTyxFQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUM7TUFDcEUsQ0FBQyxDQUFDO0lBQ0o7O0FBRUQsaUJBQWMsRUFBRSxVQUFTLE1BQU0sRUFBRTtBQUMvQixTQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuQzs7QUFFRCxTQUFNLG9CQUFHO0FBQ1AsWUFDRTtBQUFDLHNCQUFlO3dCQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBZTtVQUM3QyxJQUFJLENBQUMsS0FBSztPQUNmLElBQUksQ0FBQyxXQUFXLEVBQUU7TUFFSCxDQUNsQjtJQUNIO0VBQ0YsQ0FBQyxDQUFDOztBQUVILE9BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUM7O0FBRXBDLEtBQUksd0JBQVksS0FBSyxNQUFNLEVBQUU7QUFDM0Isc0JBQU8sQ0FBQyxFQUFrQixDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xudmFyIFJlYWN0R3JpZExheW91dCA9IHJlcXVpcmUoJ3JlYWN0LWdyaWQtbGF5b3V0Jyk7XG5cbnZhciBHcmlkUHJvcGVydHlMYXlvdXQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIG1peGluczogW1JlYWN0LmFkZG9ucy5QdXJlUmVuZGVyTWl4aW5dLFxuXG4gIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNEcmFnZ2FibGU6IHRydWUsXG4gICAgICBpc1Jlc2l6YWJsZTogdHJ1ZSxcbiAgICAgIGl0ZW1zOiAyMCxcbiAgICAgIHJvd0hlaWdodDogMzAsXG4gICAgICBjb2xzOiAxMixcbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgIH07XG4gIH0sXG5cbiAgZ2VuZXJhdGVET00oKSB7XG4gICAgLy8gR2VuZXJhdGUgaXRlbXMgd2l0aCBwcm9wZXJ0aWVzIGZyb20gdGhlIGxheW91dCwgcmF0aGVyIHRoYW4gcGFzcyB0aGUgbGF5b3V0IGRpcmVjdGx5XG4gICAgdmFyIGxheW91dCA9IHRoaXMuZ2VuZXJhdGVMYXlvdXQoKTtcbiAgICByZXR1cm4gXy5tYXAoXy5yYW5nZSh0aGlzLnByb3BzLml0ZW1zKSwgZnVuY3Rpb24oaSkge1xuICAgICAgcmV0dXJuICg8ZGl2IGtleT17aX0gX2dyaWQ9e2xheW91dFtpXX0+PHNwYW4gY2xhc3NOYW1lPVwidGV4dFwiPntpfTwvc3Bhbj48L2Rpdj4pO1xuICAgIH0pO1xuICB9LFxuXG4gIGdlbmVyYXRlTGF5b3V0KCkge1xuICAgIHZhciBwID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gXy5tYXAobmV3IEFycmF5KHAuaXRlbXMpLCBmdW5jdGlvbihpdGVtLCBpKSB7XG4gICAgICB2YXIgdyA9IF8ucmVzdWx0KHAsICd3JykgfHwgTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiA0KTtcbiAgICAgIHZhciB5ID0gXy5yZXN1bHQocCwgJ3knKSB8fCBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIDQpICsgMTtcbiAgICAgIHJldHVybiB7eDogaSAqIDIgJSAxMiwgeTogTWF0aC5mbG9vcihpIC8gNikgKiB5LCB3OiB3LCBoOiB5LCBpOiBpfTtcbiAgICB9KTtcbiAgfSxcblxuICBvbkxheW91dENoYW5nZTogZnVuY3Rpb24obGF5b3V0KSB7XG4gICAgdGhpcy5wcm9wcy5vbkxheW91dENoYW5nZShsYXlvdXQpO1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFJlYWN0R3JpZExheW91dCBvbkxheW91dENoYW5nZT17dGhpcy5vbkxheW91dENoYW5nZX1cbiAgICAgICAgICB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgIHt0aGlzLmdlbmVyYXRlRE9NKCl9XG4gICAgICA8L1JlYWN0R3JpZExheW91dD5cbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBHcmlkUHJvcGVydHlMYXlvdXQ7XG5cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICByZXF1aXJlKCcuLi90ZXN0LWhvb2suanN4JykobW9kdWxlLmV4cG9ydHMpO1xufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi90ZXN0L2V4YW1wbGVzLzQtZ3JpZC1wcm9wZXJ0eS5qc3hcbiAqKi8iXSwic291cmNlUm9vdCI6IiIsImZpbGUiOiI0LWdyaWQtcHJvcGVydHkuYnVuZGxlLmpzIn0=