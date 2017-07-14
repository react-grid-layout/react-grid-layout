webpackJsonp([4],{

/***/ 105:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

var React = __webpack_require__(2);
var PureRenderMixin = __webpack_require__(3);
var WidthProvider = __webpack_require__(0).WidthProvider;
var ReactGridLayout = __webpack_require__(0);
ReactGridLayout = WidthProvider(ReactGridLayout);

/**
 * This layout demonstrates how to use static grid elements.
 * Static elements are not draggable or resizable, and cannot be moved.
 */
var StaticElementsLayout = React.createClass({
  displayName: 'StaticElementsLayout',

  mixins: [PureRenderMixin],

  getInitialState: function getInitialState() {
    return {};
  },


  onLayoutChange: function onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
  },

  render: function render() {
    return _jsx(ReactGridLayout, {
      className: 'layout',
      onLayoutChange: this.onLayoutChange,
      rowHeight: 30
    }, void 0, _jsx('div', {
      'data-grid': { x: 0, y: 0, w: 2, h: 3 }
    }, '1', _jsx('span', {
      className: 'text'
    }, void 0, '1')), _jsx('div', {
      'data-grid': { x: 2, y: 0, w: 4, h: 3, static: true }
    }, '2', _jsx('span', {
      className: 'text'
    }, void 0, '2 - Static')), _jsx('div', {
      'data-grid': { x: 6, y: 0, w: 2, h: 3 }
    }, '3', _jsx('span', {
      className: 'text'
    }, void 0, '3')), _jsx('div', {
      'data-grid': { x: 8, y: 0, w: 4, h: 3, draggableHandle: '.react-grid-dragHandleExample' }
    }, '4', _jsx('span', {
      className: 'text'
    }, void 0, '4 - Draggable with Handle', _jsx('hr', {}), _jsx('hr', {}), _jsx('span', {
      className: 'react-grid-dragHandleExample'
    }, void 0, '[DRAG HERE]'), _jsx('hr', {}), _jsx('hr', {}))));
  }
});

module.exports = StaticElementsLayout;

if (__webpack_require__.c[__webpack_require__.s] === module) {
  __webpack_require__(7)(module.exports);
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)(module)))

/***/ }),

/***/ 3:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */



var shallowCompare = __webpack_require__(8);

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

/***/ }),

/***/ 8:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */



var shallowEqual = __webpack_require__(12);

/**
 * Does a shallow comparison for props and state.
 * See ReactComponentWithPureRenderMixin
 * See also https://facebook.github.io/react/docs/shallow-compare.html
 */
function shallowCompare(instance, nextProps, nextState) {
  return !shallowEqual(instance.props, nextProps) || !shallowEqual(instance.state, nextState);
}

module.exports = shallowCompare;

/***/ })

},[105]);