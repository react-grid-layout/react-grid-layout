webpackJsonp([2],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';
	var React = __webpack_require__(9);
	var _ = __webpack_require__(32);
	var ReactGridLayout = __webpack_require__(31);

	var MessyLayout = module.exports = React.createClass({
	  displayName: 'MessyLayout',
	  mixins: [React.addons.PureRenderMixin],

	  getDefaultProps:function() {
	    return {
	      isDraggable: true,
	      isResizable: true,
	      items: 20
	    };
	  },

	  getInitialState:function() {
	    var layout = this.props.layout || this.generateLayout();
	    return {
	      layout: layout,
	      initialLayout: layout
	    };
	  },

	  generateDOM:function() {
	    return _.map(_.range(this.props.items), function(i) {
	      return (React.createElement("div", {key: i}, React.createElement("span", {className: "text"}, i)));
	    });
	  },

	  generateLayout:function() {
	    var p = this.props;
	    return _.map(new Array(p.items), function(item, i) {
	      var w = _.result(p, 'w') || Math.ceil(Math.random() * 4);
	      var y = _.result(p, 'y') || Math.ceil(Math.random() * 4) + 1;
	      return {x: i * 2 % 12, y: Math.floor(i / 6) * y, w: w, h: y, i: i};
	    });
	  },

	  onLayoutChange: function(layout) {
	    this.setState({layout: layout});
	  },

	  stringifyLayout:function() {
	    return _.map(this.state.layout, function(l) {
	      return React.createElement("div", {className: "layoutItem", key: l.i}, React.createElement("b", null, l.i), ": [", l.x, ", ", l.y, ", ", l.w, ", ", l.h, "]");
	    });
	  },

	  render:function() {
	    var $__0=   this.props,layout=$__0.layout,gridProps=(function(source, exclusion) {var rest = {};var hasOwn = Object.prototype.hasOwnProperty;if (source == null) {throw new TypeError();}for (var key in source) {if (hasOwn.call(source, key) && !hasOwn.call(exclusion, key)) {rest[key] = source[key];}}return rest;})($__0,{layout:1});
	    return (
	      React.createElement("div", null, 
	        React.createElement("div", {className: "layoutJSON"}, 
	          "Displayed as ", React.createElement("code", null, "[x, y, w, h]"), ":", 
	          React.createElement("div", {className: "columns"}, 
	            this.stringifyLayout()
	          )
	        ), 
	        React.createElement(ReactGridLayout, React.__spread({className: "layout", initialLayout: this.state.initialLayout, cols: 12, onLayoutChange: this.onLayoutChange, 
	            rowHeight: 30},  gridProps), 
	          this.generateDOM()
	        )
	      )
	    );
	  }
	});

	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(39)(module.exports);
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(30)(module)))

/***/ }
]);