webpackJsonp([4],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

	var React = __webpack_require__(8);
	var PureRenderMixin = __webpack_require__(6);
	var _ = __webpack_require__(16);
	var WidthProvider = __webpack_require__(4).WidthProvider;
	var ResponsiveReactGridLayout = __webpack_require__(4).Responsive;
	ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

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
	        return { i: i.toString(), x: i * 2, y: 0, w: 2, h: 2, add: i === (list.length - 1).toString() };
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
	    return _jsx('div', {
	      'data-grid': el
	    }, i, el.add ? _jsx('span', {
	      className: 'add text',
	      onClick: this.onAddItem,
	      title: 'You can add an item by clicking here, too.'
	    }, void 0, 'Add +') : _jsx('span', {
	      className: 'text'
	    }, void 0, i), _jsx('span', {
	      className: 'remove',
	      style: removeStyle,
	      onClick: this.onRemoveItem.bind(this, i)
	    }, void 0, 'x'));
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
	    return _jsx('div', {}, void 0, _jsx('button', {
	      onClick: this.onAddItem
	    }, void 0, 'Add Item'), React.createElement(
	      ResponsiveReactGridLayout,
	      _extends({ onLayoutChange: this.onLayoutChange, onBreakpointChange: this.onBreakpointChange
	      }, this.props),
	      _.map(this.state.items, this.createElement)
	    ));
	  }
	});

	module.exports = AddRemoveLayout;

	if (__webpack_require__.c[0] === module) {
	  __webpack_require__(13)(module.exports);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)(module)))

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var shallowCompare = __webpack_require__(7);

	/**
	 * If your React component's render function is "pure", e.g. it will render the
	 * same result given the same props and state, provide this mixin for a
	 * considerable performance boost.
	 *
	 * Most React components have pure render functions.
	 *
	 * Example:
	 *
	 *   var ReactComponentWithPureRenderMixin =
	 *     require('ReactComponentWithPureRenderMixin');
	 *   React.createClass({
	 *     mixins: [ReactComponentWithPureRenderMixin],
	 *
	 *     render: function() {
	 *       return <div className={this.props.className}>foo</div>;
	 *     }
	 *   });
	 *
	 * Note: This only checks shallow equality for props and state. If these contain
	 * complex data structures this mixin may have false-negatives for deeper
	 * differences. Only mixin to components which have simple props and state, or
	 * use `forceUpdate()` when you know deep data structures have changed.
	 *
	 * See https://facebook.github.io/react/docs/pure-render-mixin.html
	 */
	var ReactComponentWithPureRenderMixin = {
	  shouldComponentUpdate: function (nextProps, nextState) {
	    return shallowCompare(this, nextProps, nextState);
	  }
	};

	module.exports = ReactComponentWithPureRenderMixin;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var shallowEqual = __webpack_require__(10);

	/**
	 * Does a shallow comparison for props and state.
	 * See ReactComponentWithPureRenderMixin
	 * See also https://facebook.github.io/react/docs/shallow-compare.html
	 */
	function shallowCompare(instance, nextProps, nextState) {
	  return !shallowEqual(instance.props, nextProps) || !shallowEqual(instance.state, nextState);
	}

	module.exports = shallowCompare;

/***/ }
]);