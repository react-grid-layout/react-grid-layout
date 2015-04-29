webpackJsonp([12],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	var _extends = __webpack_require__(10)['default'];

	var React = __webpack_require__(7);
	var PureRenderMixin = __webpack_require__(9);
	var _ = __webpack_require__(21);
	var ReactGridLayout = __webpack_require__(13);

	var BasicLayout = React.createClass({
	  displayName: 'BasicLayout',

	  mixins: [PureRenderMixin],

	  propTypes: {
	    onLayoutChange: React.PropTypes.func.isRequired
	  },

	  getDefaultProps: function getDefaultProps() {
	    return {
	      className: 'layout',
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
	        'div',
	        { key: i },
	        React.createElement(
	          'span',
	          { className: 'text' },
	          i
	        )
	      );
	    });
	  },

	  generateLayout: function generateLayout() {
	    var p = this.props;
	    return _.map(new Array(p.items), function (item, i) {
	      var y = _.result(p, 'y') || Math.ceil(Math.random() * 4) + 1;
	      return { x: i * 2 % 12, y: Math.floor(i / 6) * y, w: 2, h: y, i: i };
	    });
	  },

	  onLayoutChange: function onLayoutChange(layout) {
	    this.props.onLayoutChange(layout);
	  },

	  render: function render() {
	    return React.createElement(
	      ReactGridLayout,
	      _extends({ layout: this.state.layout, onLayoutChange: this.onLayoutChange
	      }, this.props),
	      this.generateDOM()
	    );
	  }
	});

	module.exports = BasicLayout;

	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(14)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(12)(module)))

/***/ }
]);