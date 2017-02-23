webpackJsonp([0],{

/***/ 203:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

var React = __webpack_require__(2);
var PureRenderMixin = __webpack_require__(3);
var _ = __webpack_require__(11);
var WidthProvider = __webpack_require__(0).WidthProvider;
var ReactGridLayout = __webpack_require__(0);
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
      onLayoutChange: function onLayoutChange() {},
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
      return _jsx('div', {
        'data-grid': l
      }, l.i, _jsx('span', {
        className: 'text'
      }, void 0, l.i), _jsx('div', {
        className: 'minMax'
      }, void 0, 'min:' + mins + ' - max:' + maxes));
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

},[203]);