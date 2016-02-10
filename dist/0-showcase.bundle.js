webpackJsonp([13],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var React = __webpack_require__(5);
	var PureRenderMixin = __webpack_require__(10);
	var _ = __webpack_require__(15);
	var WidthProvider = __webpack_require__(4).WidthProvider;
	var ResponsiveReactGridLayout = __webpack_require__(4).Responsive;
	ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

	var BasicLayout = React.createClass({
	  displayName: 'BasicLayout',

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
	      currentBreakpoint: 'lg'
	    };
	  },
	  generateDOM: function generateDOM() {
	    return _.map(this.state.layouts.lg, function (l, i) {
	      return React.createElement(
	        'div',
	        { key: i, className: l.static ? 'static' : '' },
	        l.static ? React.createElement(
	          'span',
	          { className: 'text', title: 'This item is static and cannot be removed or resized.' },
	          'Static - ',
	          i
	        ) : React.createElement(
	          'span',
	          { className: 'text' },
	          i
	        )
	      );
	    });
	  },
	  generateLayout: function generateLayout() {
	    var p = this.props;
	    return _.map(_.range(0, 25), function (item, i) {
	      var y = _.result(p, 'y') || Math.ceil(Math.random() * 4) + 1;
	      return {
	        x: _.random(0, 5) * 2 % 12,
	        y: Math.floor(i / 6) * y,
	        w: 2,
	        h: y,
	        i: i.toString(),
	        static: Math.random() < 0.05
	      };
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
	      'div',
	      null,
	      React.createElement(
	        'div',
	        null,
	        'Current Breakpoint: ',
	        this.state.currentBreakpoint,
	        ' (',
	        this.props.cols[this.state.currentBreakpoint],
	        'columns)'
	      ),
	      React.createElement(
	        'button',
	        { onClick: this.onNewLayout },
	        'Generate New Layout'
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
	  __webpack_require__(9)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)(module)))

/***/ }
]);