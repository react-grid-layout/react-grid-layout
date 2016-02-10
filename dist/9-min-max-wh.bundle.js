webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var React = __webpack_require__(5);
	var PureRenderMixin = __webpack_require__(10);
	var _ = __webpack_require__(15);
	var WidthProvider = __webpack_require__(4).WidthProvider;
	var ReactGridLayout = __webpack_require__(4);
	ReactGridLayout = WidthProvider(ReactGridLayout);

	var MinMaxLayout = React.createClass({
	  displayName: 'MinMaxLayout',

	  mixins: [PureRenderMixin],

	  getDefaultProps: function getDefaultProps() {
	    return {
	      isDraggable: true,
	      isResizable: true,
	      items: 20,
	      rowHeight: 30,
	      cols: 12
	    };
	  },
	  getInitialState: function getInitialState() {
	    return {};
	  },
	  generateDOM: function generateDOM() {
	    // Generate items with properties from the layout, rather than pass the layout directly
	    var layout = this.generateLayout();
	    return _.map(layout, function (l) {
	      var mins = [l.minW, l.minH],
	          maxes = [l.maxW, l.maxH];
	      return React.createElement(
	        'div',
	        { key: l.i, _grid: l },
	        React.createElement(
	          'span',
	          { className: 'text' },
	          l.i
	        ),
	        React.createElement(
	          'div',
	          { className: 'minMax' },
	          'min:' + mins + ' - max:' + maxes
	        )
	      );
	    });
	  },
	  generateLayout: function generateLayout() {
	    var p = this.props;
	    return _.map(new Array(p.items), function (item, i) {
	      var minW = _.random(1, 6),
	          minH = _.random(1, 6);
	      var maxW = _.random(minW, 6),
	          maxH = _.random(minH, 6);
	      var w = _.random(minW, maxW);
	      var y = _.random(minH, maxH);
	      return {
	        x: i * 2 % 12, y: Math.floor(i / 6) * y, w: w, h: y, i: i.toString(),
	        minW: minW, maxW: maxW, minH: minH, maxH: maxH
	      };
	    });
	  },


	  onLayoutChange: function onLayoutChange(layout) {
	    this.props.onLayoutChange(layout);
	  },

	  render: function render() {
	    return React.createElement(
	      ReactGridLayout,
	      _extends({ onLayoutChange: this.onLayoutChange
	      }, this.props),
	      this.generateDOM()
	    );
	  }
	});

	module.exports = MinMaxLayout;

	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(9)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)(module)))

/***/ }
]);