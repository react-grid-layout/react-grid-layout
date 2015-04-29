webpackJsonp([11],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	var _extends = __webpack_require__(10)['default'];

	var React = __webpack_require__(7);
	var PureRenderMixin = __webpack_require__(9);
	var _ = __webpack_require__(21);
	var ReactGridLayout = __webpack_require__(13);

	/**
	 * This layout demonstrates how to use the `onResize` handler to enforce a min/max width and height.
	 *
	 * In this grid, all elements are allowed a max width of 2 if the height < 3,
	 * and a min width of 2 if the height >= 3.
	 */
	var DynamicMinMaxLayout = React.createClass({
	  displayName: 'DynamicMinMaxLayout',

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
	        'div',
	        { key: l.i, _grid: l },
	        React.createElement(
	          'span',
	          { className: 'text' },
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

	  onLayoutChange: function onLayoutChange(layout) {
	    this.props.onLayoutChange(layout);
	  },

	  onResize: function onResize(layout, oldLayoutItem, layoutItem, placeholder, e) {
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
	      _extends({ onLayoutChange: this.onLayoutChange, onResize: this.onResize
	      }, this.props),
	      this.generateDOM()
	    );
	  }
	});

	module.exports = DynamicMinMaxLayout;

	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(14)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(12)(module)))

/***/ }
]);