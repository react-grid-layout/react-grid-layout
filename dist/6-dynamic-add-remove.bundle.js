webpackJsonp([4],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var React = __webpack_require__(4);
	var PureRenderMixin = __webpack_require__(10);
	var _ = __webpack_require__(15);
	var ResponsiveReactGridLayout = __webpack_require__(8).Responsive;

	/**
	 * This layout demonstrates how to use a grid with a dynamic number of elements.
	 */
	var AddRemoveLayout = React.createClass({
	  displayName: 'AddRemoveLayout',

	  mixins: [PureRenderMixin],

	  getDefaultProps: function getDefaultProps() {
	    return {
	      className: "layout",
	      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
	      rowHeight: 100
	    };
	  },
	  getInitialState: function getInitialState() {
	    return {
	      items: [0, 1, 2, 3, 4].map(function (i, key, list) {
	        return { i: i, x: i * 2, y: 0, w: 2, h: 2, add: i === list.length - 1 };
	      }),
	      newCounter: 0
	    };
	  },
	  createElement: function createElement(el) {
	    var removeStyle = {
	      position: 'absolute',
	      right: '2px',
	      top: 0,
	      cursor: 'pointer'
	    };
	    var i = el.add ? '+' : el.i;
	    return React.createElement(
	      'div',
	      { key: i, _grid: el },
	      el.add ? React.createElement(
	        'span',
	        { className: 'add text', onClick: this.onAddItem, title: 'You can add an item by clicking here, too.' },
	        'Add +'
	      ) : React.createElement(
	        'span',
	        { className: 'text' },
	        i
	      ),
	      React.createElement(
	        'span',
	        { className: 'remove', style: removeStyle, onClick: this.onRemoveItem.bind(this, i) },
	        'x'
	      )
	    );
	  },
	  onAddItem: function onAddItem() {
	    /*eslint no-console: 0*/
	    console.log('adding', 'n' + this.state.newCounter);
	    this.setState({
	      // Add a new item. It must have a unique key!
	      items: this.state.items.concat({
	        i: 'n' + this.state.newCounter,
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
	  onBreakpointChange: function onBreakpointChange(breakpoint, cols) {
	    this.setState({
	      breakpoint: breakpoint,
	      cols: cols
	    });
	  },
	  onLayoutChange: function onLayoutChange(layout) {
	    this.props.onLayoutChange(layout);
	    this.setState({ layout: layout });
	  },
	  onRemoveItem: function onRemoveItem(i) {
	    console.log('removing', i);
	    this.setState({ items: _.reject(this.state.items, { i: i }) });
	  },
	  render: function render() {
	    return React.createElement(
	      'div',
	      null,
	      React.createElement(
	        'button',
	        { onClick: this.onAddItem },
	        'Add Item'
	      ),
	      React.createElement(
	        ResponsiveReactGridLayout,
	        _extends({ onLayoutChange: this.onLayoutChange, onBreakpointChange: this.onBreakpointChange
	        }, this.props),
	        _.map(this.state.items, this.createElement)
	      )
	    );
	  }
	});

	module.exports = AddRemoveLayout;

	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(9)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)(module)))

/***/ }
]);