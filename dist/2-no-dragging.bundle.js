webpackJsonp([7],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(6);
	var _ = __webpack_require__(17);
	var ReactGridLayout = __webpack_require__(15);

	var NoDraggingLayout = module.exports = React.createClass({
	  displayName: "NoDraggingLayout",
	  mixins: [React.addons.PureRenderMixin],

	  propTypes: {
	    onLayoutChange: React.PropTypes.func.isRequired
	  },

	  getDefaultProps: function () {
	    return {
	      className: "layout",
	      isDraggable: false,
	      isResizable: false,
	      items: 50,
	      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
	      rowHeight: 30
	    };
	  },

	  getInitialState: function () {
	    var layout = this.generateLayout();
	    return {
	      layout: layout,
	      initialLayout: layout
	    };
	  },

	  generateDOM: function () {
	    return _.map(_.range(this.props.items), function (i) {
	      return React.createElement("div", {
	        key: i
	      }, React.createElement("span", {
	        className: "text"
	      }, i));
	    });
	  },

	  generateLayout: function () {
	    var p = this.props;
	    return _.map(new Array(p.items), function (item, i) {
	      var y = _.result(p, "y") || Math.ceil(Math.random() * 4) + 1;
	      return { x: i * 2 % 12, y: Math.floor(i / 6) * y, w: 2, h: y, i: i };
	    });
	  },

	  onLayoutChange: function (layout) {
	    this.props.onLayoutChange(layout);
	    this.setState({ layout: layout });
	  },

	  render: function () {
	    return React.createElement(ReactGridLayout, React.__spread({
	      initialLayout: this.state.initialLayout,
	      onLayoutChange: this.onLayoutChange
	    }, this.props), this.generateDOM());
	  }
	});

	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(16)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(14)(module)))

/***/ }
]);