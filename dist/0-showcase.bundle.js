webpackJsonp([13],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

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
	      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
	      initialLayout: generateLayout()
	    };
	  },
	  getInitialState: function getInitialState() {
	    return {
	      layouts: { lg: this.props.initialLayout },
	      currentBreakpoint: 'lg'
	    };
	  },
	  generateDOM: function generateDOM() {
	    return _.map(this.state.layouts.lg, function (l, i) {
	      return _jsx('div', {
	        className: l.static ? 'static' : ''
	      }, i, l.static ? _jsx('span', {
	        className: 'text',
	        title: 'This item is static and cannot be removed or resized.'
	      }, void 0, 'Static - ', i) : _jsx('span', {
	        className: 'text'
	      }, void 0, i));
	    });
	  },
	  onBreakpointChange: function onBreakpointChange(breakpoint) {
	    this.setState({
	      currentBreakpoint: breakpoint
	    });
	  },
	  onLayoutChange: function onLayoutChange(layout, layouts) {
	    this.props.onLayoutChange(layout, layouts);
	  },
	  onNewLayout: function onNewLayout() {
	    this.setState({
	      layouts: { lg: generateLayout() }
	    });
	  },
	  render: function render() {
	    return _jsx('div', {}, void 0, _jsx('div', {}, void 0, 'Current Breakpoint: ', this.state.currentBreakpoint, ' (', this.props.cols[this.state.currentBreakpoint], ' columns)'), _jsx('button', {
	      onClick: this.onNewLayout
	    }, void 0, 'Generate New Layout'), React.createElement(
	      ResponsiveReactGridLayout,
	      _extends({}, this.props, {
	        layouts: this.state.layouts,
	        onBreakpointChange: this.onBreakpointChange,
	        onLayoutChange: this.onLayoutChange,
	        useCSSTransforms: true }),
	      this.generateDOM()
	    ));
	  }
	});

	function generateLayout() {
	  return _.map(_.range(0, 25), function (item, i) {
	    var y = Math.ceil(Math.random() * 4) + 1;
	    return {
	      x: _.random(0, 5) * 2 % 12,
	      y: Math.floor(i / 6) * y,
	      w: 2,
	      h: y,
	      i: i.toString(),
	      static: Math.random() < 0.05
	    };
	  });
	}

	module.exports = BasicLayout;

	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(9)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)(module)))

/***/ }
]);