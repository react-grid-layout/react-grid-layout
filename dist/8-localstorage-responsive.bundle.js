webpackJsonp([1],{

/***/ 202:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global, module) {

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

var React = __webpack_require__(2);
var PureRenderMixin = __webpack_require__(3);
var WidthProvider = __webpack_require__(0).WidthProvider;
var ResponsiveReactGridLayout = __webpack_require__(0).Responsive;
ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

var originalLayouts = getFromLS('layouts') || {};
/**
 * This layout demonstrates how to sync multiple responsive layouts to localstorage.
 */
var ResponsiveLocalStorageLayout = React.createClass({
  displayName: 'ResponsiveLocalStorageLayout',

  mixins: [PureRenderMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      className: "layout",
      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      rowHeight: 30,
      onLayoutChange: function onLayoutChange() {}
    };
  },
  getInitialState: function getInitialState() {
    return {
      layouts: JSON.parse(JSON.stringify(originalLayouts))
    };
  },
  resetLayout: function resetLayout() {
    this.setState({ layouts: {} });
  },
  onLayoutChange: function onLayoutChange(layout, layouts) {
    saveToLS('layouts', layouts);
    this.setState({ layouts: layouts });
    this.props.onLayoutChange(layout, layouts);
  },
  render: function render() {
    return _jsx('div', {}, void 0, _jsx('button', {
      onClick: this.resetLayout
    }, void 0, 'Reset Layout'), React.createElement(
      ResponsiveReactGridLayout,
      _extends({
        ref: 'rrgl'
      }, this.props, {
        layouts: this.state.layouts,
        onLayoutChange: this.onLayoutChange }),
      _jsx('div', {
        'data-grid': { w: 2, h: 3, x: 0, y: 0 }
      }, '1', _jsx('span', {
        className: 'text'
      }, void 0, '1')),
      _jsx('div', {
        'data-grid': { w: 2, h: 3, x: 2, y: 0 }
      }, '2', _jsx('span', {
        className: 'text'
      }, void 0, '2')),
      _jsx('div', {
        'data-grid': { w: 2, h: 3, x: 4, y: 0 }
      }, '3', _jsx('span', {
        className: 'text'
      }, void 0, '3')),
      _jsx('div', {
        'data-grid': { w: 2, h: 3, x: 6, y: 0 }
      }, '4', _jsx('span', {
        className: 'text'
      }, void 0, '4')),
      _jsx('div', {
        'data-grid': { w: 2, h: 3, x: 8, y: 0 }
      }, '5', _jsx('span', {
        className: 'text'
      }, void 0, '5'))
    ));
  }
});

module.exports = ResponsiveLocalStorageLayout;

function getFromLS(key) {
  var ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem('rgl-8')) || {};
    } catch (e) {/*Ignore*/}
  }
  return ls[key];
}

function saveToLS(key, value) {
  if (global.localStorage) {
    var _JSON$stringify;

    global.localStorage.setItem('rgl-8', JSON.stringify((_JSON$stringify = {}, _JSON$stringify[key] = value, _JSON$stringify)));
  }
}

if (__webpack_require__.c[__webpack_require__.s] === module) {
  __webpack_require__(7)(module.exports);
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(26), __webpack_require__(6)(module)))

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

},[202]);