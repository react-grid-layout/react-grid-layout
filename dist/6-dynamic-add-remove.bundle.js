webpackJsonp([3],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";
	var React = __webpack_require__(6);
	var _ = __webpack_require__(17);
	var ReactGridLayout = __webpack_require__(15);

	/**
	 * This layout demonstrates how to use a grid with a dynamic number of elements.
	 */
	var AddRemoveLayout = module.exports = React.createClass({
	  displayName: "AddRemoveLayout",
	  mixins: [React.addons.PureRenderMixin],

	  getDefaultProps: function () {
	    return {
	      className: "layout",
	      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
	      rowHeight: 100
	    };
	  },

	  getInitialState: function () {
	    return {
	      items: [0, 1, 2, 3, 4].map(function (i, key, list) {
	        return { i: i, x: i * 2, y: 0, w: 2, h: 2, add: i === list.length - 1 };
	      }),
	      newCounter: 0
	    };
	  },

	  createElement: function (el) {
	    var removeStyle = {
	      position: "absolute",
	      right: "2px",
	      top: 0,
	      cursor: "pointer"
	    };
	    var i = el.add ? "+" : el.i;
	    return React.createElement("div", {
	      key: i,
	      _grid: el
	    }, el.add ? React.createElement("span", {
	      className: "add text",
	      onClick: this.onAddItem,
	      title: "You can add an item by clicking here, too."
	    }, "Add +") : React.createElement("span", {
	      className: "text"
	    }, i), React.createElement("span", {
	      className: "remove",
	      style: removeStyle,
	      onClick: this.onRemoveItem.bind(this, i)
	    }, "x"));
	  },

	  onAddItem: function () {
	    console.log("adding", "n" + this.state.newCounter);
	    this.setState({
	      // Add a new item. It must have a unique key!
	      items: this.state.items.concat({
	        i: "n" + this.state.newCounter,
	        x: this.state.items.length * 2 % (this.state.cols || 12),
	        y: Infinity, // puts it at the bottom
	        w: 2,
	        h: 2
	      }),
	      // Increment the counter to ensure key is always unique.
	      newCounter: this.state.newCounter + 1
	    });
	  },

	  // We're using the cols coming back from this to calculate where to add new items.
	  onBreakpointChange: function (breakpoint, cols) {
	    this.setState({
	      breakpoint: breakpoint,
	      cols: cols
	    });
	  },

	  onLayoutChange: function (layout) {
	    this.props.onLayoutChange(layout);
	    this.setState({ layout: layout });
	  },

	  onRemoveItem: function (i) {
	    console.log("removing", i);
	    this.setState({ items: _.reject(this.state.items, { i: i }) });
	  },

	  render: function () {
	    return React.createElement("div", null, React.createElement("button", {
	      onClick: this.onAddItem
	    }, "Add Item"), React.createElement(ReactGridLayout, React.__spread({
	      onLayoutChange: this.onLayoutChange,
	      onBreakpointChange: this.onBreakpointChange
	    }, this.props), _.map(this.state.items, this.createElement)));
	  }
	});

	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(16)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(14)(module)))

/***/ }
]);