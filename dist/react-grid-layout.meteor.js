(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"), require("react-dom"));
	else if(typeof define === 'function' && define.amd)
		define(["react", "react-dom"], factory);
	else if(typeof exports === 'object')
		exports["ReactGridLayout"] = factory(require("react"), require("react-dom"));
	else
		root["ReactGridLayout"] = factory(root["React"], root["ReactDOM"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_18__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	ReactGridLayout = __webpack_require__(1);
	ReactGridLayout.utils = __webpack_require__(10);
	ReactGridLayout.Responsive = __webpack_require__(24);
	ReactGridLayout.Responsive.utils = __webpack_require__(27);
	ReactGridLayout.WidthProvider = __webpack_require__(28);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	
	// End Types

	/**
	 * A reactive, fluid grid layout with draggable, resizable components.
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _lodashIsequal = __webpack_require__(3);

	var _lodashIsequal2 = _interopRequireDefault(_lodashIsequal);

	var _utils = __webpack_require__(10);

	var _GridItem = __webpack_require__(16);

	var _GridItem2 = _interopRequireDefault(_GridItem);

	// Types
	var ReactGridLayout = _react2['default'].createClass({
	  displayName: 'ReactGridLayout',

	  propTypes: {
	    //
	    // Basic props
	    //
	    layouts: _react2['default'].PropTypes.object,
	    className: _react2['default'].PropTypes.string,
	    style: _react2['default'].PropTypes.object,
	    width: _react2['default'].PropTypes.number.isRequired,
	    offsetY: _react2['default'].PropTypes.number.isRequired,
	    offsetX: _react2['default'].PropTypes.number.isRequired,

	    // If true, the container height swells and contracts to fit contents
	    autoSize: _react2['default'].PropTypes.bool,
	    // # of cols.
	    cols: _react2['default'].PropTypes.number,

	    // A selector that will not be draggable.
	    draggableCancel: _react2['default'].PropTypes.string,
	    // A selector for the draggable handler
	    draggableHandle: _react2['default'].PropTypes.string,

	    // If true, the layout will compact vertically
	    verticalCompact: _react2['default'].PropTypes.bool,

	    // layout is an array of object with the format:
	    // {x: Number, y: Number, w: Number, h: Number, i: Number}
	    layout: function layout(props) {
	      var layout = props.layout;
	      // I hope you're setting the _grid property on the grid items
	      if (layout === undefined) return;
	      (0, _utils.validateLayout)(layout, 'layout');
	    },

	    // margin between items [x, y] in px
	    margin: _react2['default'].PropTypes.array,
	    // Rows have a static height, but you can change this based on breakpoints if you like
	    rowHeight: _react2['default'].PropTypes.number,

	    //
	    // Flags
	    //
	    isDraggable: _react2['default'].PropTypes.bool,
	    isResizable: _react2['default'].PropTypes.bool,
	    // Use CSS transforms instead of top/left
	    useCSSTransforms: _react2['default'].PropTypes.bool,

	    //
	    // Callbacks
	    //

	    // Callback so you can save the layout.
	    // Calls back with (currentLayout, allLayouts). allLayouts are keyed by breakpoint.
	    onLayoutChange: _react2['default'].PropTypes.func,

	    // Calls when drag starts. Callback is of the signature (layout, oldItem, newItem, placeholder, e).
	    // All callbacks below have the same signature. 'start' and 'stop' callbacks omit the 'placeholder'.
	    onDragStart: _react2['default'].PropTypes.func,
	    // Calls on each drag movement.
	    onDrag: _react2['default'].PropTypes.func,
	    // Calls when drag is complete.
	    onDragStop: _react2['default'].PropTypes.func,
	    //Calls when resize starts.
	    onResizeStart: _react2['default'].PropTypes.func,
	    // Calls when resize movement happens.
	    onResize: _react2['default'].PropTypes.func,
	    // Calls when resize is complete.
	    onResizeStop: _react2['default'].PropTypes.func,

	    //
	    // Other validations
	    //

	    // Children must not have duplicate keys.
	    children: function children(props, propName, _componentName) {
	      _react2['default'].PropTypes.node.apply(this, arguments);
	      var children = props[propName];

	      // Check children keys for duplicates. Throw if found.
	      var keys = {};
	      _react2['default'].Children.forEach(children, function (child) {
	        if (keys[child.key]) {
	          throw new Error("Duplicate child key found! This will cause problems in ReactGridLayout.");
	        }
	        keys[child.key] = true;
	      });
	    }
	  },

	  getDefaultProps: function getDefaultProps() {
	    return {
	      autoSize: true,
	      cols: 12,
	      rowHeight: 150,
	      layout: [],
	      margin: [10, 10],
	      isDraggable: true,
	      isResizable: true,
	      useCSSTransforms: true,
	      verticalCompact: true,
	      onLayoutChange: function onLayoutChange() {},
	      onDragStart: function onDragStart() {},
	      onDrag: function onDrag() {},
	      onDragStop: function onDragStop() {},
	      onResizeStart: function onResizeStart() {},
	      onResize: function onResize() {},
	      onResizeStop: function onResizeStop() {}
	    };
	  },

	  getInitialState: function getInitialState() {
	    return {
	      activeDrag: null,
	      isMounted: false,
	      layout: (0, _utils.synchronizeLayoutWithChildren)(this.props.layout, this.props.children, this.props.cols, this.props.verticalCompact),
	      oldDragItem: null,
	      oldResizeItem: null
	    };
	  },

	  componentDidMount: function componentDidMount() {
	    // Call back with layout on mount. This should be done after correcting the layout width
	    // to ensure we don't rerender with the wrong width.
	    this.props.onLayoutChange(this.state.layout, this.props.layouts);
	    this.setState({ isMounted: true });
	  },

	  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
	    // Allow parent to set layout directly.
	    if (!(0, _lodashIsequal2['default'])(nextProps.layout, this.state.layout)) {
	      this.setState({
	        layout: (0, _utils.synchronizeLayoutWithChildren)(nextProps.layout, nextProps.children, nextProps.cols, nextProps.verticalCompact)
	      });
	      // Call back so we can store the layout
	      // Do it only when a resize/drag is not active, otherwise there are way too many callbacks
	      if (!this.state.activeDrag) this.props.onLayoutChange(this.state.layout, this.props.layouts);
	    }
	    // If children change, regenerate the layout.
	    if (nextProps.children.length !== this.props.children.length) {
	      this.setState({
	        layout: (0, _utils.synchronizeLayoutWithChildren)(this.state.layout, nextProps.children, nextProps.cols, nextProps.verticalCompact)
	      });
	    }
	  },

	  /**
	   * Calculates a pixel value for the container.
	   * @return {String} Container height in pixels.
	   */
	  containerHeight: function containerHeight() {
	    if (!this.props.autoSize) return;
	    return (0, _utils.bottom)(this.state.layout) * this.props.rowHeight + this.props.margin[1] + 'px';
	  },

	  /**
	   * When dragging starts
	   * @param {String} i Id of the child
	   * @param {Number} x X position of the move
	   * @param {Number} y Y position of the move
	   * @param {Event} e The mousedown event
	   * @param {Element} node The current dragging DOM element
	   */
	  onDragStart: function onDragStart(i, x, y, _ref) {
	    var e = _ref.e;
	    var node = _ref.node;
	    var layout = this.state.layout;

	    var l = (0, _utils.getLayoutItem)(layout, i);
	    if (!l) return;

	    this.setState({ oldDragItem: (0, _utils.clone)(l) });

	    this.props.onDragStart(layout, l, l, null, e, node);
	  },
	  /**
	   * Each drag movement create a new dragelement and move the element to the dragged location
	   * @param {String} i Id of the child
	   * @param {Number} x X position of the move
	   * @param {Number} y Y position of the move
	   * @param {Event} e The mousedown event
	   * @param {Element} node The current dragging DOM element
	   */
	  onDrag: function onDrag(i, x, y, _ref2) {
	    var e = _ref2.e;
	    var node = _ref2.node;
	    var oldDragItem = this.state.oldDragItem;
	    var layout = this.state.layout;

	    var l = (0, _utils.getLayoutItem)(layout, i);
	    if (!l) return;

	    // Create placeholder (display only)
	    var placeholder = {
	      w: l.w, h: l.h, x: l.x, y: l.y, placeholder: true, i: i
	    };

	    // Move the element to the dragged location.
	    layout = (0, _utils.moveElement)(layout, l, x, y, true /* isUserAction */);

	    this.props.onDrag(layout, oldDragItem, l, placeholder, e, node);

	    this.setState({
	      layout: (0, _utils.compact)(layout, this.props.verticalCompact),
	      activeDrag: placeholder
	    });
	  },

	  /**
	   * When dragging stops, figure out which position the element is closest to and update its x and y.
	   * @param  {String} i Index of the child.
	   * @param {Number} x X position of the move
	   * @param {Number} y Y position of the move
	   * @param {Event} e The mousedown event
	   * @param {Element} node The current dragging DOM element
	   */
	  onDragStop: function onDragStop(i, x, y, _ref3) {
	    var e = _ref3.e;
	    var node = _ref3.node;
	    var oldDragItem = this.state.oldDragItem;
	    var layout = this.state.layout;

	    var l = (0, _utils.getLayoutItem)(layout, i);
	    if (!l) return;

	    // Move the element here
	    layout = (0, _utils.moveElement)(layout, l, x, y, true /* isUserAction */);

	    this.props.onDragStop(layout, oldDragItem, l, null, e, node);

	    // Set state
	    this.setState({
	      layout: (0, _utils.compact)(layout, this.props.verticalCompact),
	      activeDrag: null,
	      oldDragItem: null
	    });
	  },

	  onResizeStart: function onResizeStart(i, w, h, _ref4) {
	    var e = _ref4.e;
	    var element = _ref4.element;
	    var layout = this.state.layout;

	    var l = (0, _utils.getLayoutItem)(layout, i);
	    if (!l) return;

	    this.setState({ oldResizeItem: (0, _utils.clone)(l) });

	    this.props.onResizeStart(layout, l, l, null, e, element);
	  },

	  onResize: function onResize(i, w, h, _ref5) {
	    var e = _ref5.e;
	    var element = _ref5.element;
	    var _state = this.state;
	    var layout = _state.layout;
	    var oldResizeItem = _state.oldResizeItem;

	    var l = (0, _utils.getLayoutItem)(layout, i);
	    if (!l) return;

	    // Set new width and height.
	    l.w = w;
	    l.h = h;

	    // Create placeholder element (display only)
	    var placeholder = {
	      w: w, h: h, x: l.x, y: l.y, placeholder: true, i: i
	    };

	    this.props.onResize(layout, oldResizeItem, l, placeholder, e, element);

	    // Re-compact the layout and set the drag placeholder.
	    this.setState({ layout: (0, _utils.compact)(layout, this.props.verticalCompact), activeDrag: placeholder });
	  },

	  onResizeStop: function onResizeStop(i, w, h, _ref6) {
	    var e = _ref6.e;
	    var element = _ref6.element;
	    var _state2 = this.state;
	    var layout = _state2.layout;
	    var oldResizeItem = _state2.oldResizeItem;

	    var l = (0, _utils.getLayoutItem)(layout, i);

	    this.props.onResizeStop(layout, oldResizeItem, l, null, e, element);

	    this.setState({
	      layout: (0, _utils.compact)(layout, this.props.verticalCompact),
	      activeDrag: null,
	      oldResizeItem: null
	    });
	  },

	  /**
	   * Create a placeholder object.
	   * @return {Element} Placeholder div.
	   */
	  placeholder: function placeholder() {
	    var activeDrag = this.state.activeDrag;

	    if (!activeDrag) return null;
	    var _props = this.props;
	    var width = _props.width;
	    var offsetX = _props.offsetX;
	    var offsetY = _props.offsetY;
	    var cols = _props.cols;
	    var margin = _props.margin;
	    var rowHeight = _props.rowHeight;
	    var useCSSTransforms = _props.useCSSTransforms;

	    // {...this.state.activeDrag} is pretty slow, actually
	    return _react2['default'].createElement(
	      _GridItem2['default'],
	      {
	        w: activeDrag.w,
	        h: activeDrag.h,
	        x: activeDrag.x,
	        y: activeDrag.y,
	        i: activeDrag.i,
	        isPlaceholder: true,
	        className: 'react-grid-placeholder',
	        containerWidth: width,
	        offsetX: offsetX,
	        offsetY: offsetY,
	        cols: cols,
	        margin: margin,
	        rowHeight: rowHeight,
	        isDraggable: false,
	        isResizable: false,
	        useCSSTransforms: useCSSTransforms },
	      _react2['default'].createElement('div', null)
	    );
	  },

	  /**
	   * Given a grid item, set its style attributes & surround in a <Draggable>.
	   * @param  {Element} child React element.
	   * @return {Element}       Element wrapped in draggable and properly placed.
	   */
	  processGridItem: function processGridItem(child) {
	    if (!child.key) return;
	    var l = (0, _utils.getLayoutItem)(this.state.layout, child.key);
	    if (!l) return;
	    var _props2 = this.props;
	    var width = _props2.width;
	    var offsetX = _props2.offsetX;
	    var offsetY = _props2.offsetY;
	    var cols = _props2.cols;
	    var margin = _props2.margin;
	    var rowHeight = _props2.rowHeight;
	    var useCSSTransforms = _props2.useCSSTransforms;
	    var draggableCancel = _props2.draggableCancel;
	    var draggableHandle = _props2.draggableHandle;

	    // Parse 'static'. Any properties defined directly on the grid item will take precedence.
	    var draggable = l['static'] || !this.props.isDraggable ? false : true;
	    var resizable = l['static'] || !this.props.isResizable ? false : true;

	    return _react2['default'].createElement(
	      _GridItem2['default'],
	      _extends({
	        containerWidth: width,
	        offsetX: offsetX,
	        offsetY: offsetY,
	        cols: cols,
	        margin: margin,
	        rowHeight: rowHeight,
	        cancel: draggableCancel,
	        handle: draggableHandle,
	        onDragStop: this.onDragStop,
	        onDragStart: this.onDragStart,
	        onDrag: this.onDrag,
	        onResizeStart: this.onResizeStart,
	        onResize: this.onResize,
	        onResizeStop: this.onResizeStop,
	        isDraggable: draggable,
	        isResizable: resizable,
	        useCSSTransforms: useCSSTransforms && this.state.isMounted,
	        usePercentages: !this.state.isMounted
	      }, l),
	      child
	    );
	  },

	  render: function render() {
	    var _props3 = this.props;
	    var className = _props3.className;
	    var style = _props3.style;

	    var mergedClassName = 'react-grid-layout ' + className;
	    var mergedStyle = _extends({
	      height: this.containerHeight()
	    }, style);

	    return _react2['default'].createElement(
	      'div',
	      { className: mergedClassName, style: mergedStyle },
	      _react2['default'].Children.map(this.props.children, this.processGridItem),
	      this.placeholder()
	    );
	  }
	});

	exports['default'] = ReactGridLayout;
	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * lodash 4.0.0 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	var baseIsEqual = __webpack_require__(4);

	/**
	 * Performs a deep comparison between two values to determine if they are
	 * equivalent.
	 *
	 * **Note:** This method supports comparing arrays, array buffers, booleans,
	 * date objects, error objects, maps, numbers, `Object` objects, regexes,
	 * sets, strings, symbols, and typed arrays. `Object` objects are compared
	 * by their own, not inherited, enumerable properties. Functions and DOM
	 * nodes are **not** supported.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 * var other = { 'user': 'fred' };
	 *
	 * _.isEqual(object, other);
	 * // => true
	 *
	 * object === other;
	 * // => false
	 */
	function isEqual(value, other) {
	  return baseIsEqual(value, other);
	}

	module.exports = isEqual;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * lodash 4.1.0 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	var Stack = __webpack_require__(5),
	    keys = __webpack_require__(9),
	    root = __webpack_require__(7);

	/** Used to compose bitmasks for comparison styles. */
	var UNORDERED_COMPARE_FLAG = 1,
	    PARTIAL_COMPARE_FLAG = 2;

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]',
	    weakMapTag = '[object WeakMap]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/** Used to match `RegExp` [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns). */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to detect host constructors (Safari > 5). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dateTag] = typedArrayTags[errorTag] =
	typedArrayTags[funcTag] = typedArrayTags[mapTag] =
	typedArrayTags[numberTag] = typedArrayTags[objectTag] =
	typedArrayTags[regexpTag] = typedArrayTags[setTag] =
	typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check, else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array.length;

	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}

	/**
	 * Converts `map` to an array.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the converted array.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);

	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}

	/**
	 * Converts `set` to an array.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the converted array.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);

	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/** Built-in value references. */
	var Symbol = root.Symbol,
	    Uint8Array = root.Uint8Array,
	    getPrototypeOf = Object.getPrototypeOf;

	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map'),
	    Set = getNative(root, 'Set');

	/** Used to detect maps and sets. */
	var mapCtorString = Map ? funcToString.call(Map) : '',
	    setCtorString = Set ? funcToString.call(Set) : '';

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolValueOf = Symbol ? symbolProto.valueOf : undefined;

	/**
	 * The base implementation of `_.has` without support for deep paths.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHas(object, key) {
	  // Avoid a bug in IE 10-11 where objects with a [[Prototype]] of `null`,
	  // that are composed entirely of index properties, return `false` for
	  // `hasOwnProperty` checks of them.
	  return hasOwnProperty.call(object, key) ||
	    (typeof object == 'object' && key in object && getPrototypeOf(object) === null);
	}

	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {boolean} [bitmask] The bitmask of comparison flags.
	 *  The bitmask may be composed of the following flags:
	 *     1 - Unordered comparison
	 *     2 - Partial comparison
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, customizer, bitmask, stack) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
	}

	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual` for more details.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
	  var objIsArr = isArray(object),
	      othIsArr = isArray(other),
	      objTag = arrayTag,
	      othTag = arrayTag;

	  if (!objIsArr) {
	    objTag = getTag(object);
	    if (objTag == argsTag) {
	      objTag = objectTag;
	    } else if (objTag != objectTag) {
	      objIsArr = isTypedArray(object);
	    }
	  }
	  if (!othIsArr) {
	    othTag = getTag(other);
	    if (othTag == argsTag) {
	      othTag = objectTag;
	    } else if (othTag != objectTag) {
	      othIsArr = isTypedArray(other);
	    }
	  }
	  var objIsObj = objTag == objectTag && !isHostObject(object),
	      othIsObj = othTag == objectTag && !isHostObject(other),
	      isSameTag = objTag == othTag;

	  if (isSameTag && !(objIsArr || objIsObj)) {
	    return equalByTag(object, other, objTag, equalFunc, customizer, bitmask);
	  }
	  var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
	  if (!isPartial) {
	    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

	    if (objIsWrapped || othIsWrapped) {
	      return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, bitmask, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new Stack);
	  return (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, bitmask, stack);
	}

	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual` for more details.
	 * @param {Object} [stack] Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
	  var index = -1,
	      isPartial = bitmask & PARTIAL_COMPARE_FLAG,
	      isUnordered = bitmask & UNORDERED_COMPARE_FLAG,
	      arrLength = array.length,
	      othLength = other.length;

	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(array);
	  if (stacked) {
	    return stacked == other;
	  }
	  var result = true;
	  stack.set(array, other);

	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, arrValue, index, other, array, stack)
	        : customizer(arrValue, othValue, index, array, other, stack);
	    }
	    if (compared !== undefined) {
	      if (compared) {
	        continue;
	      }
	      result = false;
	      break;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (isUnordered) {
	      if (!arraySome(other, function(othValue) {
	            return arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack);
	          })) {
	        result = false;
	        break;
	      }
	    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  return result;
	}

	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual` for more details.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag, equalFunc, customizer, bitmask) {
	  switch (tag) {
	    case arrayBufferTag:
	      if ((object.byteLength != other.byteLength) ||
	          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
	        return false;
	      }
	      return true;

	    case boolTag:
	    case dateTag:
	      // Coerce dates and booleans to numbers, dates to milliseconds and booleans
	      // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
	      return +object == +other;

	    case errorTag:
	      return object.name == other.name && object.message == other.message;

	    case numberTag:
	      // Treat `NaN` vs. `NaN` as equal.
	      return (object != +object) ? other != +other : object == +other;

	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings primitives and string
	      // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
	      return object == (other + '');

	    case mapTag:
	      var convert = mapToArray;

	    case setTag:
	      var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
	      convert || (convert = setToArray);

	      // Recursively compare objects (susceptible to call stack limits).
	      return (isPartial || object.size == other.size) &&
	        equalFunc(convert(object), convert(other), customizer, bitmask | UNORDERED_COMPARE_FLAG);

	    case symbolTag:
	      return !!Symbol && (symbolValueOf.call(object) == symbolValueOf.call(other));
	  }
	  return false;
	}

	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual` for more details.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
	  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
	      objProps = keys(object),
	      objLength = objProps.length,
	      othProps = keys(other),
	      othLength = othProps.length;

	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : baseHas(other, key))) {
	      return false;
	    }
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(object);
	  if (stacked) {
	    return stacked == other;
	  }
	  var result = true;
	  stack.set(object, other);

	  var skipCtor = isPartial;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, objValue, key, other, object, stack)
	        : customizer(objValue, othValue, key, object, other, stack);
	    }
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(compared === undefined
	          ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
	          : compared
	        )) {
	      result = false;
	      break;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;

	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }
	  stack['delete'](object);
	  return result;
	}

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object == null ? undefined : object[key];
	  return isNative(value) ? value : undefined;
	}

	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function getTag(value) {
	  return objectToString.call(value);
	}

	// Fallback for IE 11 providing `toStringTag` values for maps and sets.
	if ((Map && getTag(new Map) != mapTag) || (Set && getTag(new Set) != setTag)) {
	  getTag = function(value) {
	    var result = objectToString.call(value),
	        Ctor = result == objectTag ? value.constructor : null,
	        ctorString = typeof Ctor == 'function' ? funcToString.call(Ctor) : '';

	    if (ctorString) {
	      if (ctorString == mapCtorString) {
	        return mapTag;
	      }
	      if (ctorString == setCtorString) {
	        return setTag;
	      }
	    }
	    return result;
	  };
	}

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @type Function
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8 which returns 'object' for typed array constructors, and
	  // PhantomJS 1.9 which returns 'function' for `NodeList` instances.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is loosely based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (value == null) {
	    return false;
	  }
	  if (isFunction(value)) {
	    return reIsNative.test(funcToString.call(value));
	  }
	  return isObjectLike(value) &&
	    (isHostObject(value) ? reIsNative : reIsHostCtor).test(value);
	}

	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	function isTypedArray(value) {
	  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
	}

	module.exports = baseIsEqual;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * lodash 4.0.2 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	var MapCache = __webpack_require__(6);

	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;

	/** Used for built-in method references. */
	var arrayProto = Array.prototype;

	/** Built-in value references. */
	var splice = arrayProto.splice;

	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @param {Array} [values] The values to cache.
	 */
	function Stack(values) {
	  var index = -1,
	      length = values ? values.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = values[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = { 'array': [], 'map': null };
	}

	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function stackDelete(key) {
	  var data = this.__data__,
	      array = data.array;

	  return array ? assocDelete(array, key) : data.map['delete'](key);
	}

	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function stackGet(key) {
	  var data = this.__data__,
	      array = data.array;

	  return array ? assocGet(array, key) : data.map.get(key);
	}

	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function stackHas(key) {
	  var data = this.__data__,
	      array = data.array;

	  return array ? assocHas(array, key) : data.map.has(key);
	}

	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache object.
	 */
	function stackSet(key, value) {
	  var data = this.__data__,
	      array = data.array;

	  if (array) {
	    if (array.length < (LARGE_ARRAY_SIZE - 1)) {
	      assocSet(array, key, value);
	    } else {
	      data.array = null;
	      data.map = new MapCache(array);
	    }
	  }
	  var map = data.map;
	  if (map) {
	    map.set(key, value);
	  }
	  return this;
	}

	/**
	 * Removes `key` and its value from the associative array.
	 *
	 * @private
	 * @param {Array} array The array to query.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function assocDelete(array, key) {
	  var index = assocIndexOf(array, key);
	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = array.length - 1;
	  if (index == lastIndex) {
	    array.pop();
	  } else {
	    splice.call(array, index, 1);
	  }
	  return true;
	}

	/**
	 * Gets the associative array value for `key`.
	 *
	 * @private
	 * @param {Array} array The array to query.
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function assocGet(array, key) {
	  var index = assocIndexOf(array, key);
	  return index < 0 ? undefined : array[index][1];
	}

	/**
	 * Checks if an associative array value for `key` exists.
	 *
	 * @private
	 * @param {Array} array The array to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function assocHas(array, key) {
	  return assocIndexOf(array, key) > -1;
	}

	/**
	 * Gets the index at which the first occurrence of `key` is found in `array`
	 * of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}

	/**
	 * Sets the associative array `key` to `value`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 */
	function assocSet(array, key, value) {
	  var index = assocIndexOf(array, key);
	  if (index < 0) {
	    array.push([key, value]);
	  } else {
	    array[index][1] = value;
	  }
	}

	/**
	 * Performs a [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 * var other = { 'user': 'fred' };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	// Add functions to the `Stack` cache.
	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;

	module.exports = Stack;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * lodash 4.1.0 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	var root = __webpack_require__(7);

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/** `Object#toString` result references. */
	var funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]';

	/** Used to match `RegExp` [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns). */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to detect host constructors (Safari > 5). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}

	/** Used for built-in method references. */
	var arrayProto = Array.prototype,
	    objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/** Built-in value references. */
	var splice = arrayProto.splice;

	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map'),
	    nativeCreate = getNative(Object, 'create');

	/**
	 * Creates an hash object.
	 *
	 * @private
	 * @returns {Object} Returns the new hash object.
	 */
	function Hash() {}

	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(hash, key) {
	  return hashHas(hash, key) && delete hash[key];
	}

	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @param {Object} hash The hash to query.
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(hash, key) {
	  if (nativeCreate) {
	    var result = hash[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(hash, key) ? hash[key] : undefined;
	}

	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @param {Object} hash The hash to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(hash, key) {
	  return nativeCreate ? hash[key] !== undefined : hasOwnProperty.call(hash, key);
	}

	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 */
	function hashSet(hash, key, value) {
	  hash[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	}

	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @param {Array} [values] The values to cache.
	 */
	function MapCache(values) {
	  var index = -1,
	      length = values ? values.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = values[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapClear() {
	  this.__data__ = { 'hash': new Hash, 'map': Map ? new Map : [], 'string': new Hash };
	}

	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapDelete(key) {
	  var data = this.__data__;
	  if (isKeyable(key)) {
	    return hashDelete(typeof key == 'string' ? data.string : data.hash, key);
	  }
	  return Map ? data.map['delete'](key) : assocDelete(data.map, key);
	}

	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapGet(key) {
	  var data = this.__data__;
	  if (isKeyable(key)) {
	    return hashGet(typeof key == 'string' ? data.string : data.hash, key);
	  }
	  return Map ? data.map.get(key) : assocGet(data.map, key);
	}

	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapHas(key) {
	  var data = this.__data__;
	  if (isKeyable(key)) {
	    return hashHas(typeof key == 'string' ? data.string : data.hash, key);
	  }
	  return Map ? data.map.has(key) : assocHas(data.map, key);
	}

	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache object.
	 */
	function mapSet(key, value) {
	  var data = this.__data__;
	  if (isKeyable(key)) {
	    hashSet(typeof key == 'string' ? data.string : data.hash, key, value);
	  } else if (Map) {
	    data.map.set(key, value);
	  } else {
	    assocSet(data.map, key, value);
	  }
	  return this;
	}

	/**
	 * Removes `key` and its value from the associative array.
	 *
	 * @private
	 * @param {Array} array The array to query.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function assocDelete(array, key) {
	  var index = assocIndexOf(array, key);
	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = array.length - 1;
	  if (index == lastIndex) {
	    array.pop();
	  } else {
	    splice.call(array, index, 1);
	  }
	  return true;
	}

	/**
	 * Gets the associative array value for `key`.
	 *
	 * @private
	 * @param {Array} array The array to query.
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function assocGet(array, key) {
	  var index = assocIndexOf(array, key);
	  return index < 0 ? undefined : array[index][1];
	}

	/**
	 * Checks if an associative array value for `key` exists.
	 *
	 * @private
	 * @param {Array} array The array to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function assocHas(array, key) {
	  return assocIndexOf(array, key) > -1;
	}

	/**
	 * Gets the index at which the first occurrence of `key` is found in `array`
	 * of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}

	/**
	 * Sets the associative array `key` to `value`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 */
	function assocSet(array, key, value) {
	  var index = assocIndexOf(array, key);
	  if (index < 0) {
	    array.push([key, value]);
	  } else {
	    array[index][1] = value;
	  }
	}

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object == null ? undefined : object[key];
	  return isNative(value) ? value : undefined;
	}

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return type == 'number' || type == 'boolean' ||
	    (type == 'string' && value !== '__proto__') || value == null;
	}

	/**
	 * Performs a [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 * var other = { 'user': 'fred' };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8 which returns 'object' for typed array constructors, and
	  // PhantomJS 1.9 which returns 'function' for `NodeList` instances.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (value == null) {
	    return false;
	  }
	  if (isFunction(value)) {
	    return reIsNative.test(funcToString.call(value));
	  }
	  return isObjectLike(value) &&
	    (isHostObject(value) ? reIsNative : reIsHostCtor).test(value);
	}

	// Avoid inheriting from `Object.prototype` when possible.
	Hash.prototype = nativeCreate ? nativeCreate(null) : objectProto;

	// Add functions to the `MapCache`.
	MapCache.prototype.clear = mapClear;
	MapCache.prototype['delete'] = mapDelete;
	MapCache.prototype.get = mapGet;
	MapCache.prototype.has = mapHas;
	MapCache.prototype.set = mapSet;

	module.exports = MapCache;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module, global) {/**
	 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/** Used to determine if values are of the language type `Object`. */
	var objectTypes = {
	  'function': true,
	  'object': true
	};

	/** Detect free variable `exports`. */
	var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType) ? exports : null;

	/** Detect free variable `module`. */
	var freeModule = (objectTypes[typeof module] && module && !module.nodeType) ? module : null;

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);

	/** Detect free variable `self`. */
	var freeSelf = checkGlobal(objectTypes[typeof self] && self);

	/** Detect free variable `window`. */
	var freeWindow = checkGlobal(objectTypes[typeof window] && window);

	/** Detect `this` as the global object. */
	var thisGlobal = checkGlobal(objectTypes[typeof this] && this);

	/**
	 * Used as a reference to the global object.
	 *
	 * The `this` value is used if it's the global object to avoid Greasemonkey's
	 * restricted `window` object, otherwise the `window` object is used.
	 */
	var root = freeGlobal || ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) || freeSelf || thisGlobal || Function('return this')();

	/**
	 * Checks if `value` is a global object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
	 */
	function checkGlobal(value) {
	  return (value && value.Object === Object) ? value : null;
	}

	module.exports = root;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)(module), (function() { return this; }())))

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 9 */
/***/ function(module, exports) {

	/**
	 * lodash 4.0.2 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    stringTag = '[object String]';

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);

	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return value > -1 && value % 1 == 0 && value < length;
	}

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Built-in value references. */
	var getPrototypeOf = Object.getPrototypeOf,
	    propertyIsEnumerable = objectProto.propertyIsEnumerable;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = Object.keys;

	/**
	 * The base implementation of `_.has` without support for deep paths.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHas(object, key) {
	  // Avoid a bug in IE 10-11 where objects with a [[Prototype]] of `null`,
	  // that are composed entirely of index properties, return `false` for
	  // `hasOwnProperty` checks of them.
	  return hasOwnProperty.call(object, key) ||
	    (typeof object == 'object' && key in object && getPrototypeOf(object) === null);
	}

	/**
	 * The base implementation of `_.keys` which doesn't skip the constructor
	 * property of prototypes or treat sparse arrays as dense.
	 *
	 * @private
	 * @type Function
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  return nativeKeys(Object(object));
	}

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');

	/**
	 * Creates an array of index keys for `object` values of arrays,
	 * `arguments` objects, and strings, otherwise `null` is returned.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array|null} Returns index keys, else `null`.
	 */
	function indexKeys(object) {
	  var length = object ? object.length : undefined;
	  if (isLength(length) &&
	      (isArray(object) || isString(object) || isArguments(object))) {
	    return baseTimes(length, String);
	  }
	  return null;
	}

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

	  return value === proto;
	}

	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
	  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
	    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
	}

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @type Function
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @type Function
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null &&
	    !(typeof value == 'function' && isFunction(value)) && isLength(getLength(value));
	}

	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @type Function
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object, else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8 which returns 'object' for typed array constructors, and
	  // PhantomJS 1.9 which returns 'function' for `NodeList` instances.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is loosely based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isString('abc');
	 * // => true
	 *
	 * _.isString(1);
	 * // => false
	 */
	function isString(value) {
	  return typeof value == 'string' ||
	    (!isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag);
	}

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  var isProto = isPrototype(object);
	  if (!(isProto || isArrayLike(object))) {
	    return baseKeys(object);
	  }
	  var indexes = indexKeys(object),
	      skipIndexes = !!indexes,
	      result = indexes || [],
	      length = result.length;

	  for (var key in object) {
	    if (baseHas(object, key) &&
	        !(skipIndexes && (key == 'length' || isIndex(key, length))) &&
	        !(isProto && key == 'constructor')) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = keys;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/*global ReactElement*/
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.bottom = bottom;
	exports.clone = clone;
	exports.collides = collides;
	exports.compact = compact;
	exports.compactItem = compactItem;
	exports.correctBounds = correctBounds;
	exports.getLayoutItem = getLayoutItem;
	exports.getFirstCollision = getFirstCollision;
	exports.getAllCollisions = getAllCollisions;
	exports.getStatics = getStatics;
	exports.moveElement = moveElement;
	exports.moveElementAwayFromCollision = moveElementAwayFromCollision;
	exports.perc = perc;
	exports.setTransform = setTransform;
	exports.sortLayoutItemsByRowCol = sortLayoutItemsByRowCol;
	exports.synchronizeLayoutWithChildren = synchronizeLayoutWithChildren;
	exports.validateLayout = validateLayout;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _lodashClonedeep = __webpack_require__(11);

	var _lodashClonedeep2 = _interopRequireDefault(_lodashClonedeep);

	var _lodashClonedeepwith = __webpack_require__(14);

	var _lodashClonedeepwith2 = _interopRequireDefault(_lodashClonedeepwith);

	var _lodashIsnumber = __webpack_require__(15);

	var _lodashIsnumber2 = _interopRequireDefault(_lodashIsnumber);

	/**
	 * Return the bottom coordinate of the layout.
	 *
	 * @param  {Array} layout Layout array.
	 * @return {Number}       Bottom coordinate.
	 */

	function bottom(layout) {
	  var max = 0,
	      bottomY = undefined;
	  for (var _i = 0, len = layout.length; _i < len; _i++) {
	    bottomY = layout[_i].y + layout[_i].h;
	    if (bottomY > max) max = bottomY;
	  }
	  return max;
	}

	/**
	 * Clones a shallow object.
	 * @param  {Object} obj Object to clone.
	 * @return {Object}   Cloned object.
	 */

	function clone(obj) {
	  return (0, _lodashClonedeep2['default'])(obj);
	}

	/**
	 * Given two layoutitems, check if they collide.
	 *
	 * @return {Boolean}   True if colliding.
	 */

	function collides(l1, l2) {
	  if (l1 === l2) return false; // same element
	  if (l1.x + l1.w <= l2.x) return false; // l1 is left of l2
	  if (l1.x >= l2.x + l2.w) return false; // l1 is right of l2
	  if (l1.y + l1.h <= l2.y) return false; // l1 is above l2
	  if (l1.y >= l2.y + l2.h) return false; // l1 is below l2
	  return true; // boxes overlap
	}

	/**
	 * Given a layout, compact it. This involves going down each y coordinate and removing gaps
	 * between items.
	 *
	 * @param  {Array} layout Layout.
	 * @param  {Boolean} verticalCompact Whether or not to compact the layout
	 *   vertically.
	 * @return {Array}       Compacted Layout.
	 */

	function compact(layout, verticalCompact) {
	  // Statics go in the compareWith array right away so items flow around them.
	  var compareWith = getStatics(layout),
	      out = [];
	  // We go through the items by row and column.
	  var sorted = sortLayoutItemsByRowCol(layout);

	  for (var _i2 = 0, len = sorted.length; _i2 < len; _i2++) {
	    var l = sorted[_i2];

	    // Don't move static elements
	    if (!l['static']) {
	      l = compactItem(compareWith, l, verticalCompact);

	      // Add to comparison array. We only collide with items before this one.
	      // Statics are already in this array.
	      compareWith.push(l);
	    }

	    // Add to output array to make sure they still come out in the right order.
	    out[layout.indexOf(l)] = l;

	    // Clear moved flag, if it exists.
	    l.moved = false;
	  }

	  return out;
	}

	/**
	 * Compact an item in the layout.
	 */

	function compactItem(compareWith, l, verticalCompact) {
	  if (verticalCompact) {
	    // Move the element up as far as it can go without colliding.
	    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
	      l.y--;
	    }
	  }

	  // Move it down, and keep moving it down if it's colliding.
	  var collides = undefined;
	  while (collides = getFirstCollision(compareWith, l)) {
	    l.y = collides.y + collides.h;
	  }
	  return l;
	}

	/**
	 * Given a layout, make sure all elements fit within its bounds.
	 *
	 * @param  {Array} layout Layout array.
	 * @param  {Number} bounds Number of columns.
	 */

	function correctBounds(layout, bounds) {
	  var collidesWith = getStatics(layout);
	  for (var _i3 = 0, len = layout.length; _i3 < len; _i3++) {
	    var l = layout[_i3];
	    // Overflows right
	    if (l.x + l.w > bounds.cols) l.x = bounds.cols - l.w;
	    // Overflows left
	    if (l.x < 0) {
	      l.x = 0;
	      l.w = bounds.cols;
	    }
	    if (!l['static']) collidesWith.push(l);else {
	      // If this is static and collides with other statics, we must move it down.
	      // We have to do something nicer than just letting them overlap.
	      while (getFirstCollision(collidesWith, l)) {
	        l.y++;
	      }
	    }
	  }
	  return layout;
	}

	/**
	 * Get a layout item by ID. Used so we can override later on if necessary.
	 *
	 * @param  {Array}  layout Layout array.
	 * @param  {String} id     ID
	 * @return {LayoutItem}    Item at ID.
	 */

	function getLayoutItem(layout, id) {
	  for (var _i4 = 0, len = layout.length; _i4 < len; _i4++) {
	    if (layout[_i4].i === id) return layout[_i4];
	  }
	}

	/**
	 * Returns the first item this layout collides with.
	 * It doesn't appear to matter which order we approach this from, although
	 * perhaps that is the wrong thing to do.
	 *
	 * @param  {Object} layoutItem Layout item.
	 * @return {Object|undefined}  A colliding layout item, or undefined.
	 */

	function getFirstCollision(layout, layoutItem) {
	  for (var _i5 = 0, len = layout.length; _i5 < len; _i5++) {
	    if (collides(layout[_i5], layoutItem)) return layout[_i5];
	  }
	}

	function getAllCollisions(layout, layoutItem) {
	  var out = [];
	  for (var _i6 = 0, len = layout.length; _i6 < len; _i6++) {
	    if (collides(layout[_i6], layoutItem)) out.push(layout[_i6]);
	  }
	  return out;
	}

	/**
	 * Get all static elements.
	 * @param  {Array} layout Array of layout objects.
	 * @return {Array}        Array of static layout items..
	 */

	function getStatics(layout) {
	  var out = [];
	  for (var _i7 = 0, len = layout.length; _i7 < len; _i7++) {
	    if (layout[_i7]['static']) out.push(layout[_i7]);
	  }
	  return out;
	}

	/**
	 * Move an element. Responsible for doing cascading movements of other elements.
	 *
	 * @param  {Array}      layout Full layout to modify.
	 * @param  {LayoutItem} l      element to move.
	 * @param  {Number}     [x]    X position in grid units.
	 * @param  {Number}     [y]    Y position in grid units.
	 * @param  {Boolean}    [isUserAction] If true, designates that the item we're moving is
	 *                                     being dragged/resized by th euser.
	 */

	function moveElement(layout, l, x, y, isUserAction) {
	  if (l['static']) return layout;

	  // Short-circuit if nothing to do.
	  if (l.y === y && l.x === x) return layout;

	  var movingUp = y && l.y > y;
	  // This is quite a bit faster than extending the object
	  if ((0, _lodashIsnumber2['default'])(x)) l.x = x;
	  if ((0, _lodashIsnumber2['default'])(y)) l.y = y;
	  l.moved = true;

	  // If this collides with anything, move it.
	  // When doing this comparison, we have to sort the items we compare with
	  // to ensure, in the case of multiple collisions, that we're getting the
	  // nearest collision.
	  var sorted = sortLayoutItemsByRowCol(layout);
	  if (movingUp) sorted = sorted.reverse();
	  var collisions = getAllCollisions(sorted, l);

	  // Move each item that collides away from this element.
	  for (var _i8 = 0, len = collisions.length; _i8 < len; _i8++) {
	    var collision = collisions[_i8];
	    // console.log('resolving collision between', l.i, 'at', l.y, 'and', collision.i, 'at', collision.y);

	    // Short circuit so we can't infinite loop
	    if (collision.moved) continue;

	    // This makes it feel a bit more precise by waiting to swap for just a bit when moving up.
	    if (l.y > collision.y && l.y - collision.y > collision.h / 4) continue;

	    // Don't move static items - we have to move *this* element away
	    if (collision['static']) {
	      layout = moveElementAwayFromCollision(layout, collision, l, isUserAction);
	    } else {
	      layout = moveElementAwayFromCollision(layout, l, collision, isUserAction);
	    }
	  }

	  return layout;
	}

	/**
	 * This is where the magic needs to happen - given a collision, move an element away from the collision.
	 * We attempt to move it up if there's room, otherwise it goes below.
	 *
	 * @param  {Array} layout            Full layout to modify.
	 * @param  {LayoutItem} collidesWith Layout item we're colliding with.
	 * @param  {LayoutItem} itemToMove   Layout item we're moving.
	 * @param  {Boolean} [isUserAction]  If true, designates that the item we're moving is being dragged/resized
	 *                                   by the user.
	 */

	function moveElementAwayFromCollision(layout, collidesWith, itemToMove, isUserAction) {

	  // If there is enough space above the collision to put this element, move it there.
	  // We only do this on the main collision as this can get funky in cascades and cause
	  // unwanted swapping behavior.
	  if (isUserAction) {
	    // Make a mock item so we don't modify the item here, only modify in moveElement.
	    var fakeItem = {
	      x: itemToMove.x,
	      y: itemToMove.y,
	      w: itemToMove.w,
	      h: itemToMove.h,
	      i: -1
	    };
	    fakeItem.y = Math.max(collidesWith.y - itemToMove.h, 0);
	    if (!getFirstCollision(layout, fakeItem)) {
	      return moveElement(layout, itemToMove, undefined, fakeItem.y);
	    }
	  }

	  // Previously this was optimized to move below the collision directly, but this can cause problems
	  // with cascading moves, as an item may actually leapflog a collision and cause a reversal in order.
	  return moveElement(layout, itemToMove, undefined, itemToMove.y + 1);
	}

	/**
	 * Helper to convert a number to a percentage string.
	 *
	 * @param  {Number} num Any number
	 * @return {String}     That number as a percentage.
	 */

	function perc(num) {
	  return num * 100 + '%';
	}

	function setTransform(style, coords) {
	  // Replace unitless items with px
	  var x = ('' + coords[0]).replace(/(\d)$/, '$1px');
	  var y = ('' + coords[1]).replace(/(\d)$/, '$1px');
	  style.transform = "translate(" + x + "," + y + ")";
	  style.WebkitTransform = "translate(" + x + "," + y + ")";
	  style.MozTransform = "translate(" + x + "," + y + ")";
	  style.msTransform = "translate(" + x + "," + y + ")";
	  style.OTransform = "translate(" + x + "," + y + ")";
	  return style;
	}

	/**
	 * Get layout items sorted from top left to right and down.
	 *
	 * @return {Array} Array of layout objects.
	 * @return {Array}        Layout, sorted static items first.
	 */

	function sortLayoutItemsByRowCol(layout) {
	  return [].concat(layout).sort(function (a, b) {
	    if (a.y > b.y || a.y === b.y && a.x > b.x) {
	      return 1;
	    }
	    return -1;
	  });
	}

	/**
	 * Generate a layout using the initialLayout and children as a template.
	 * Missing entries will be added, extraneous ones will be truncated.
	 *
	 * @param  {Array}  initialLayout Layout passed in through props.
	 * @param  {String} breakpoint    Current responsive breakpoint.
	 * @param  {Boolean} verticalCompact Whether or not to compact the layout
	 *   vertically.
	 * @return {Array}                Working layout.
	 */

	function synchronizeLayoutWithChildren(initialLayout, children, cols, verticalCompact) {
	  // ensure 'children' is always an array
	  if (!Array.isArray(children)) {
	    children = [children];
	  }
	  initialLayout = initialLayout || [];

	  // Generate one layout item per child.
	  var layout = [];
	  for (var _i9 = 0, len = children.length; _i9 < len; _i9++) {
	    var child = children[_i9];
	    // Don't overwrite if it already exists.
	    var exists = getLayoutItem(initialLayout, child.key || "1" /* FIXME satisfies Flow */);
	    if (exists) {
	      layout.push(exists);
	      continue;
	    }
	    // New item: attempt to use a layout item from the child, if it exists.
	    var g = child.props._grid;
	    if (g) {
	      validateLayout([g], 'ReactGridLayout.child');
	      // Validated; add it to the layout. Bottom 'y' possible is the bottom of the layout.
	      // This allows you to do nice stuff like specify {y: Infinity}
	      if (verticalCompact) {
	        layout.push((0, _lodashClonedeepwith2['default'])(g, { y: Math.min(bottom(layout), g.y), i: child.key }));
	      } else {
	        layout.push((0, _lodashClonedeepwith2['default'])(g, { y: g.y, i: child.key }));
	      }
	    } else {
	      // Nothing provided: ensure this is added to the bottom
	      layout.push({ w: 1, h: 1, x: 0, y: bottom(layout), i: child.key || "1" });
	    }
	  }

	  // Correct the layout.
	  layout = correctBounds(layout, { cols: cols });
	  layout = compact(layout, verticalCompact);

	  return layout;
	}

	/**
	 * Validate a layout. Throws errors.
	 *
	 * @param  {Array}  layout        Array of layout items.
	 * @param  {String} [contextName] Context name for errors.
	 * @throw  {Error}                Validation error.
	 */

	function validateLayout(layout, contextName) {
	  contextName = contextName || "Layout";
	  var subProps = ['x', 'y', 'w', 'h'];
	  if (!Array.isArray(layout)) throw new Error(contextName + " must be an array!");
	  for (var _i10 = 0, len = layout.length; _i10 < len; _i10++) {
	    for (var j = 0; j < subProps.length; j++) {
	      if (typeof layout[_i10][subProps[j]] !== 'number') {
	        throw new Error('ReactGridLayout: ' + contextName + '[' + _i10 + '].' + subProps[j] + ' must be a Number!');
	      }
	    }
	    if (layout[_i10]['static'] !== undefined && typeof layout[_i10]['static'] !== 'boolean') {
	      throw new Error('ReactGridLayout: ' + contextName + '[' + _i10 + '].static must be a Boolean!');
	    }
	  }
	}

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * lodash 4.1.0 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	var Stack = __webpack_require__(5),
	    arrayEach = __webpack_require__(12),
	    baseFor = __webpack_require__(13),
	    keys = __webpack_require__(9),
	    root = __webpack_require__(7);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]',
	    weakMapTag = '[object WeakMap]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/** Used to match `RegExp` [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns). */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to match `RegExp` flags from their coerced string values. */
	var reFlags = /\w*$/;

	/** Used to detect host constructors (Safari > 5). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used to identify `toStringTag` values supported by `_.clone`. */
	var cloneableTags = {};
	cloneableTags[argsTag] = cloneableTags[arrayTag] =
	cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
	cloneableTags[dateTag] = cloneableTags[float32Tag] =
	cloneableTags[float64Tag] = cloneableTags[int8Tag] =
	cloneableTags[int16Tag] = cloneableTags[int32Tag] =
	cloneableTags[mapTag] = cloneableTags[numberTag] =
	cloneableTags[objectTag] = cloneableTags[regexpTag] =
	cloneableTags[setTag] = cloneableTags[stringTag] =
	cloneableTags[symbolTag] = cloneableTags[uint8Tag] =
	cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] =
	cloneableTags[uint32Tag] = true;
	cloneableTags[errorTag] = cloneableTags[funcTag] =
	cloneableTags[weakMapTag] = false;

	/**
	 * Adds the key-value `pair` to `map`.
	 *
	 * @private
	 * @param {Object} map The map to modify.
	 * @param {Array} pair The key-value pair to add.
	 * @returns {Object} Returns `map`.
	 */
	function addMapEntry(map, pair) {
	  map.set(pair[0], pair[1]);
	  return map;
	}

	/**
	 * Adds `value` to `set`.
	 *
	 * @private
	 * @param {Object} set The set to modify.
	 * @param {*} value The value to add.
	 * @returns {Object} Returns `set`.
	 */
	function addSetEntry(set, value) {
	  set.add(value);
	  return set;
	}

	/**
	 * A specialized version of `_.reduce` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {*} [accumulator] The initial value.
	 * @param {boolean} [initAccum] Specify using the first element of `array` as the initial value.
	 * @returns {*} Returns the accumulated value.
	 */
	function arrayReduce(array, iteratee, accumulator, initAccum) {
	  var index = -1,
	      length = array.length;

	  if (initAccum && length) {
	    accumulator = array[++index];
	  }
	  while (++index < length) {
	    accumulator = iteratee(accumulator, array[index], index, array);
	  }
	  return accumulator;
	}

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}

	/**
	 * Converts `map` to an array.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the converted array.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);

	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}

	/**
	 * Converts `set` to an array.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the converted array.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);

	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/** Built-in value references. */
	var Symbol = root.Symbol,
	    Uint8Array = root.Uint8Array,
	    getOwnPropertySymbols = Object.getOwnPropertySymbols;

	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map'),
	    Set = getNative(root, 'Set');

	/** Used to detect maps and sets. */
	var mapCtorString = Map ? funcToString.call(Map) : '',
	    setCtorString = Set ? funcToString.call(Set) : '';

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolValueOf = Symbol ? symbolProto.valueOf : undefined;

	/**
	 * Assigns `value` to `key` of `object` if the existing value is not equivalent
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * for equality comparisons.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function assignValue(object, key, value) {
	  var objValue = object[key];
	  if ((!eq(objValue, value) ||
	        (eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key))) ||
	      (value === undefined && !(key in object))) {
	    object[key] = value;
	  }
	}

	/**
	 * The base implementation of `_.assign` without support for multiple sources
	 * or `customizer` functions.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @returns {Object} Returns `object`.
	 */
	function baseAssign(object, source) {
	  return object && copyObject(source, keys(source), object);
	}

	/**
	 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
	 * traversed objects.
	 *
	 * @private
	 * @param {*} value The value to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @param {Function} [customizer] The function to customize cloning.
	 * @param {string} [key] The key of `value`.
	 * @param {Object} [object] The parent object of `value`.
	 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
	 * @returns {*} Returns the cloned value.
	 */
	function baseClone(value, isDeep, customizer, key, object, stack) {
	  var result;
	  if (customizer) {
	    result = object ? customizer(value, key, object, stack) : customizer(value);
	  }
	  if (result !== undefined) {
	    return result;
	  }
	  if (!isObject(value)) {
	    return value;
	  }
	  var isArr = isArray(value);
	  if (isArr) {
	    result = initCloneArray(value);
	    if (!isDeep) {
	      return copyArray(value, result);
	    }
	  } else {
	    var tag = getTag(value),
	        isFunc = tag == funcTag || tag == genTag;

	    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
	      if (isHostObject(value)) {
	        return object ? value : {};
	      }
	      result = initCloneObject(isFunc ? {} : value);
	      if (!isDeep) {
	        return copySymbols(value, baseAssign(result, value));
	      }
	    } else {
	      return cloneableTags[tag]
	        ? initCloneByTag(value, tag, isDeep)
	        : (object ? value : {});
	    }
	  }
	  // Check for circular references and return its corresponding clone.
	  stack || (stack = new Stack);
	  var stacked = stack.get(value);
	  if (stacked) {
	    return stacked;
	  }
	  stack.set(value, result);

	  // Recursively populate clone (susceptible to call stack limits).
	  (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
	    assignValue(result, key, baseClone(subValue, isDeep, customizer, key, value, stack));
	  });
	  return isArr ? result : copySymbols(value, result);
	}

	/**
	 * The base implementation of `_.create` without support for assigning
	 * properties to the created object.
	 *
	 * @private
	 * @param {Object} prototype The object to inherit from.
	 * @returns {Object} Returns the new object.
	 */
	var baseCreate = (function() {
	  function object() {}
	  return function(prototype) {
	    if (isObject(prototype)) {
	      object.prototype = prototype;
	      var result = new object;
	      object.prototype = undefined;
	    }
	    return result || {};
	  };
	}());

	/**
	 * The base implementation of `_.forOwn` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return object && baseFor(object, iteratee, keys);
	}

	/**
	 * Creates a clone of `buffer`.
	 *
	 * @private
	 * @param {ArrayBuffer} buffer The array buffer to clone.
	 * @returns {ArrayBuffer} Returns the cloned array buffer.
	 */
	function cloneBuffer(buffer) {
	  var Ctor = buffer.constructor,
	      result = new Ctor(buffer.byteLength),
	      view = new Uint8Array(result);

	  view.set(new Uint8Array(buffer));
	  return result;
	}

	/**
	 * Creates a clone of `map`.
	 *
	 * @private
	 * @param {Object} map The map to clone.
	 * @returns {Object} Returns the cloned map.
	 */
	function cloneMap(map) {
	  var Ctor = map.constructor;
	  return arrayReduce(mapToArray(map), addMapEntry, new Ctor);
	}

	/**
	 * Creates a clone of `regexp`.
	 *
	 * @private
	 * @param {Object} regexp The regexp to clone.
	 * @returns {Object} Returns the cloned regexp.
	 */
	function cloneRegExp(regexp) {
	  var Ctor = regexp.constructor,
	      result = new Ctor(regexp.source, reFlags.exec(regexp));

	  result.lastIndex = regexp.lastIndex;
	  return result;
	}

	/**
	 * Creates a clone of `set`.
	 *
	 * @private
	 * @param {Object} set The set to clone.
	 * @returns {Object} Returns the cloned set.
	 */
	function cloneSet(set) {
	  var Ctor = set.constructor;
	  return arrayReduce(setToArray(set), addSetEntry, new Ctor);
	}

	/**
	 * Creates a clone of the `symbol` object.
	 *
	 * @private
	 * @param {Object} symbol The symbol object to clone.
	 * @returns {Object} Returns the cloned symbol object.
	 */
	function cloneSymbol(symbol) {
	  return Symbol ? Object(symbolValueOf.call(symbol)) : {};
	}

	/**
	 * Creates a clone of `typedArray`.
	 *
	 * @private
	 * @param {Object} typedArray The typed array to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned typed array.
	 */
	function cloneTypedArray(typedArray, isDeep) {
	  var buffer = typedArray.buffer,
	      Ctor = typedArray.constructor;

	  return new Ctor(isDeep ? cloneBuffer(buffer) : buffer, typedArray.byteOffset, typedArray.length);
	}

	/**
	 * Copies the values of `source` to `array`.
	 *
	 * @private
	 * @param {Array} source The array to copy values from.
	 * @param {Array} [array=[]] The array to copy values to.
	 * @returns {Array} Returns `array`.
	 */
	function copyArray(source, array) {
	  var index = -1,
	      length = source.length;

	  array || (array = Array(length));
	  while (++index < length) {
	    array[index] = source[index];
	  }
	  return array;
	}

	/**
	 * Copies properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property names to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @returns {Object} Returns `object`.
	 */
	function copyObject(source, props, object) {
	  return copyObjectWith(source, props, object);
	}

	/**
	 * This function is like `copyObject` except that it accepts a function to
	 * customize copied values.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property names to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @param {Function} [customizer] The function to customize copied values.
	 * @returns {Object} Returns `object`.
	 */
	function copyObjectWith(source, props, object, customizer) {
	  object || (object = {});

	  var index = -1,
	      length = props.length;

	  while (++index < length) {
	    var key = props[index],
	        newValue = customizer ? customizer(object[key], source[key], key, object, source) : source[key];

	    assignValue(object, key, newValue);
	  }
	  return object;
	}

	/**
	 * Copies own symbol properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy symbols from.
	 * @param {Object} [object={}] The object to copy symbols to.
	 * @returns {Object} Returns `object`.
	 */
	function copySymbols(source, object) {
	  return copyObject(source, getSymbols(source), object);
	}

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object == null ? undefined : object[key];
	  return isNative(value) ? value : undefined;
	}

	/**
	 * Creates an array of the own symbol properties of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols = getOwnPropertySymbols || function() {
	  return [];
	};

	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function getTag(value) {
	  return objectToString.call(value);
	}

	// Fallback for IE 11 providing `toStringTag` values for maps and sets.
	if ((Map && getTag(new Map) != mapTag) || (Set && getTag(new Set) != setTag)) {
	  getTag = function(value) {
	    var result = objectToString.call(value),
	        Ctor = result == objectTag ? value.constructor : null,
	        ctorString = typeof Ctor == 'function' ? funcToString.call(Ctor) : '';

	    if (ctorString) {
	      if (ctorString == mapCtorString) {
	        return mapTag;
	      }
	      if (ctorString == setCtorString) {
	        return setTag;
	      }
	    }
	    return result;
	  };
	}

	/**
	 * Initializes an array clone.
	 *
	 * @private
	 * @param {Array} array The array to clone.
	 * @returns {Array} Returns the initialized clone.
	 */
	function initCloneArray(array) {
	  var length = array.length,
	      result = array.constructor(length);

	  // Add properties assigned by `RegExp#exec`.
	  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
	    result.index = array.index;
	    result.input = array.input;
	  }
	  return result;
	}

	/**
	 * Initializes an object clone.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneObject(object) {
	  if (isPrototype(object)) {
	    return {};
	  }
	  var Ctor = object.constructor;
	  return baseCreate(isFunction(Ctor) ? Ctor.prototype : undefined);
	}

	/**
	 * Initializes an object clone based on its `toStringTag`.
	 *
	 * **Note:** This function only supports cloning values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @param {string} tag The `toStringTag` of the object to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneByTag(object, tag, isDeep) {
	  var Ctor = object.constructor;
	  switch (tag) {
	    case arrayBufferTag:
	      return cloneBuffer(object);

	    case boolTag:
	    case dateTag:
	      return new Ctor(+object);

	    case float32Tag: case float64Tag:
	    case int8Tag: case int16Tag: case int32Tag:
	    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
	      return cloneTypedArray(object, isDeep);

	    case mapTag:
	      return cloneMap(object);

	    case numberTag:
	    case stringTag:
	      return new Ctor(object);

	    case regexpTag:
	      return cloneRegExp(object);

	    case setTag:
	      return cloneSet(object);

	    case symbolTag:
	      return cloneSymbol(object);
	  }
	}

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

	  return value === proto;
	}

	/**
	 * This method is like `_.clone` except that it recursively clones `value`.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to recursively clone.
	 * @returns {*} Returns the deep cloned value.
	 * @example
	 *
	 * var objects = [{ 'a': 1 }, { 'b': 2 }];
	 *
	 * var deep = _.cloneDeep(objects);
	 * console.log(deep[0] === objects[0]);
	 * // => false
	 */
	function cloneDeep(value) {
	  return baseClone(value, true);
	}

	/**
	 * Performs a [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 * var other = { 'user': 'fred' };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @type Function
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8 which returns 'object' for typed array constructors, and
	  // PhantomJS 1.9 which returns 'function' for `NodeList` instances.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (value == null) {
	    return false;
	  }
	  if (isFunction(value)) {
	    return reIsNative.test(funcToString.call(value));
	  }
	  return isObjectLike(value) &&
	    (isHostObject(value) ? reIsNative : reIsHostCtor).test(value);
	}

	module.exports = cloneDeep;


/***/ },
/* 12 */
/***/ function(module, exports) {

	/**
	 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/**
	 * A specialized version of `_.forEach` for arrays without support for callback
	 * shorthands or `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns `array`.
	 */
	function arrayEach(array, iteratee) {
	  var index = -1,
	      length = array.length;

	  while (++index < length) {
	    if (iteratee(array[index], index, array) === false) {
	      break;
	    }
	  }
	  return array;
	}

	module.exports = arrayEach;


/***/ },
/* 13 */
/***/ function(module, exports) {

	/**
	 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/**
	 * The base implementation of `baseForIn` and `baseForOwn` which iterates
	 * over `object` properties returned by `keysFunc` invoking `iteratee` for
	 * each property. Iteratee functions may exit iteration early by explicitly
	 * returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = createBaseFor();

	/**
	 * Creates a base function for methods like `_.forIn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var index = -1,
	        iterable = Object(object),
	        props = keysFunc(object),
	        length = props.length;

	    while (length--) {
	      var key = props[fromRight ? length : ++index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}

	module.exports = baseFor;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * lodash 4.1.0 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	var Stack = __webpack_require__(5),
	    arrayEach = __webpack_require__(12),
	    baseFor = __webpack_require__(13),
	    keys = __webpack_require__(9),
	    root = __webpack_require__(7);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]',
	    weakMapTag = '[object WeakMap]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/** Used to match `RegExp` [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns). */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to match `RegExp` flags from their coerced string values. */
	var reFlags = /\w*$/;

	/** Used to detect host constructors (Safari > 5). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used to identify `toStringTag` values supported by `_.clone`. */
	var cloneableTags = {};
	cloneableTags[argsTag] = cloneableTags[arrayTag] =
	cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
	cloneableTags[dateTag] = cloneableTags[float32Tag] =
	cloneableTags[float64Tag] = cloneableTags[int8Tag] =
	cloneableTags[int16Tag] = cloneableTags[int32Tag] =
	cloneableTags[mapTag] = cloneableTags[numberTag] =
	cloneableTags[objectTag] = cloneableTags[regexpTag] =
	cloneableTags[setTag] = cloneableTags[stringTag] =
	cloneableTags[symbolTag] = cloneableTags[uint8Tag] =
	cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] =
	cloneableTags[uint32Tag] = true;
	cloneableTags[errorTag] = cloneableTags[funcTag] =
	cloneableTags[weakMapTag] = false;

	/**
	 * Adds the key-value `pair` to `map`.
	 *
	 * @private
	 * @param {Object} map The map to modify.
	 * @param {Array} pair The key-value pair to add.
	 * @returns {Object} Returns `map`.
	 */
	function addMapEntry(map, pair) {
	  map.set(pair[0], pair[1]);
	  return map;
	}

	/**
	 * Adds `value` to `set`.
	 *
	 * @private
	 * @param {Object} set The set to modify.
	 * @param {*} value The value to add.
	 * @returns {Object} Returns `set`.
	 */
	function addSetEntry(set, value) {
	  set.add(value);
	  return set;
	}

	/**
	 * A specialized version of `_.reduce` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {*} [accumulator] The initial value.
	 * @param {boolean} [initAccum] Specify using the first element of `array` as the initial value.
	 * @returns {*} Returns the accumulated value.
	 */
	function arrayReduce(array, iteratee, accumulator, initAccum) {
	  var index = -1,
	      length = array.length;

	  if (initAccum && length) {
	    accumulator = array[++index];
	  }
	  while (++index < length) {
	    accumulator = iteratee(accumulator, array[index], index, array);
	  }
	  return accumulator;
	}

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}

	/**
	 * Converts `map` to an array.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the converted array.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);

	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}

	/**
	 * Converts `set` to an array.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the converted array.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);

	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/** Built-in value references. */
	var Symbol = root.Symbol,
	    Uint8Array = root.Uint8Array,
	    getOwnPropertySymbols = Object.getOwnPropertySymbols;

	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map'),
	    Set = getNative(root, 'Set');

	/** Used to detect maps and sets. */
	var mapCtorString = Map ? funcToString.call(Map) : '',
	    setCtorString = Set ? funcToString.call(Set) : '';

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolValueOf = Symbol ? symbolProto.valueOf : undefined;

	/**
	 * Assigns `value` to `key` of `object` if the existing value is not equivalent
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * for equality comparisons.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function assignValue(object, key, value) {
	  var objValue = object[key];
	  if ((!eq(objValue, value) ||
	        (eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key))) ||
	      (value === undefined && !(key in object))) {
	    object[key] = value;
	  }
	}

	/**
	 * The base implementation of `_.assign` without support for multiple sources
	 * or `customizer` functions.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @returns {Object} Returns `object`.
	 */
	function baseAssign(object, source) {
	  return object && copyObject(source, keys(source), object);
	}

	/**
	 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
	 * traversed objects.
	 *
	 * @private
	 * @param {*} value The value to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @param {Function} [customizer] The function to customize cloning.
	 * @param {string} [key] The key of `value`.
	 * @param {Object} [object] The parent object of `value`.
	 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
	 * @returns {*} Returns the cloned value.
	 */
	function baseClone(value, isDeep, customizer, key, object, stack) {
	  var result;
	  if (customizer) {
	    result = object ? customizer(value, key, object, stack) : customizer(value);
	  }
	  if (result !== undefined) {
	    return result;
	  }
	  if (!isObject(value)) {
	    return value;
	  }
	  var isArr = isArray(value);
	  if (isArr) {
	    result = initCloneArray(value);
	    if (!isDeep) {
	      return copyArray(value, result);
	    }
	  } else {
	    var tag = getTag(value),
	        isFunc = tag == funcTag || tag == genTag;

	    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
	      if (isHostObject(value)) {
	        return object ? value : {};
	      }
	      result = initCloneObject(isFunc ? {} : value);
	      if (!isDeep) {
	        return copySymbols(value, baseAssign(result, value));
	      }
	    } else {
	      return cloneableTags[tag]
	        ? initCloneByTag(value, tag, isDeep)
	        : (object ? value : {});
	    }
	  }
	  // Check for circular references and return its corresponding clone.
	  stack || (stack = new Stack);
	  var stacked = stack.get(value);
	  if (stacked) {
	    return stacked;
	  }
	  stack.set(value, result);

	  // Recursively populate clone (susceptible to call stack limits).
	  (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
	    assignValue(result, key, baseClone(subValue, isDeep, customizer, key, value, stack));
	  });
	  return isArr ? result : copySymbols(value, result);
	}

	/**
	 * The base implementation of `_.create` without support for assigning
	 * properties to the created object.
	 *
	 * @private
	 * @param {Object} prototype The object to inherit from.
	 * @returns {Object} Returns the new object.
	 */
	var baseCreate = (function() {
	  function object() {}
	  return function(prototype) {
	    if (isObject(prototype)) {
	      object.prototype = prototype;
	      var result = new object;
	      object.prototype = undefined;
	    }
	    return result || {};
	  };
	}());

	/**
	 * The base implementation of `_.forOwn` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return object && baseFor(object, iteratee, keys);
	}

	/**
	 * Creates a clone of `buffer`.
	 *
	 * @private
	 * @param {ArrayBuffer} buffer The array buffer to clone.
	 * @returns {ArrayBuffer} Returns the cloned array buffer.
	 */
	function cloneBuffer(buffer) {
	  var Ctor = buffer.constructor,
	      result = new Ctor(buffer.byteLength),
	      view = new Uint8Array(result);

	  view.set(new Uint8Array(buffer));
	  return result;
	}

	/**
	 * Creates a clone of `map`.
	 *
	 * @private
	 * @param {Object} map The map to clone.
	 * @returns {Object} Returns the cloned map.
	 */
	function cloneMap(map) {
	  var Ctor = map.constructor;
	  return arrayReduce(mapToArray(map), addMapEntry, new Ctor);
	}

	/**
	 * Creates a clone of `regexp`.
	 *
	 * @private
	 * @param {Object} regexp The regexp to clone.
	 * @returns {Object} Returns the cloned regexp.
	 */
	function cloneRegExp(regexp) {
	  var Ctor = regexp.constructor,
	      result = new Ctor(regexp.source, reFlags.exec(regexp));

	  result.lastIndex = regexp.lastIndex;
	  return result;
	}

	/**
	 * Creates a clone of `set`.
	 *
	 * @private
	 * @param {Object} set The set to clone.
	 * @returns {Object} Returns the cloned set.
	 */
	function cloneSet(set) {
	  var Ctor = set.constructor;
	  return arrayReduce(setToArray(set), addSetEntry, new Ctor);
	}

	/**
	 * Creates a clone of the `symbol` object.
	 *
	 * @private
	 * @param {Object} symbol The symbol object to clone.
	 * @returns {Object} Returns the cloned symbol object.
	 */
	function cloneSymbol(symbol) {
	  return Symbol ? Object(symbolValueOf.call(symbol)) : {};
	}

	/**
	 * Creates a clone of `typedArray`.
	 *
	 * @private
	 * @param {Object} typedArray The typed array to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned typed array.
	 */
	function cloneTypedArray(typedArray, isDeep) {
	  var buffer = typedArray.buffer,
	      Ctor = typedArray.constructor;

	  return new Ctor(isDeep ? cloneBuffer(buffer) : buffer, typedArray.byteOffset, typedArray.length);
	}

	/**
	 * Copies the values of `source` to `array`.
	 *
	 * @private
	 * @param {Array} source The array to copy values from.
	 * @param {Array} [array=[]] The array to copy values to.
	 * @returns {Array} Returns `array`.
	 */
	function copyArray(source, array) {
	  var index = -1,
	      length = source.length;

	  array || (array = Array(length));
	  while (++index < length) {
	    array[index] = source[index];
	  }
	  return array;
	}

	/**
	 * Copies properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property names to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @returns {Object} Returns `object`.
	 */
	function copyObject(source, props, object) {
	  return copyObjectWith(source, props, object);
	}

	/**
	 * This function is like `copyObject` except that it accepts a function to
	 * customize copied values.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property names to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @param {Function} [customizer] The function to customize copied values.
	 * @returns {Object} Returns `object`.
	 */
	function copyObjectWith(source, props, object, customizer) {
	  object || (object = {});

	  var index = -1,
	      length = props.length;

	  while (++index < length) {
	    var key = props[index],
	        newValue = customizer ? customizer(object[key], source[key], key, object, source) : source[key];

	    assignValue(object, key, newValue);
	  }
	  return object;
	}

	/**
	 * Copies own symbol properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy symbols from.
	 * @param {Object} [object={}] The object to copy symbols to.
	 * @returns {Object} Returns `object`.
	 */
	function copySymbols(source, object) {
	  return copyObject(source, getSymbols(source), object);
	}

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object == null ? undefined : object[key];
	  return isNative(value) ? value : undefined;
	}

	/**
	 * Creates an array of the own symbol properties of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols = getOwnPropertySymbols || function() {
	  return [];
	};

	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function getTag(value) {
	  return objectToString.call(value);
	}

	// Fallback for IE 11 providing `toStringTag` values for maps and sets.
	if ((Map && getTag(new Map) != mapTag) || (Set && getTag(new Set) != setTag)) {
	  getTag = function(value) {
	    var result = objectToString.call(value),
	        Ctor = result == objectTag ? value.constructor : null,
	        ctorString = typeof Ctor == 'function' ? funcToString.call(Ctor) : '';

	    if (ctorString) {
	      if (ctorString == mapCtorString) {
	        return mapTag;
	      }
	      if (ctorString == setCtorString) {
	        return setTag;
	      }
	    }
	    return result;
	  };
	}

	/**
	 * Initializes an array clone.
	 *
	 * @private
	 * @param {Array} array The array to clone.
	 * @returns {Array} Returns the initialized clone.
	 */
	function initCloneArray(array) {
	  var length = array.length,
	      result = array.constructor(length);

	  // Add properties assigned by `RegExp#exec`.
	  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
	    result.index = array.index;
	    result.input = array.input;
	  }
	  return result;
	}

	/**
	 * Initializes an object clone.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneObject(object) {
	  if (isPrototype(object)) {
	    return {};
	  }
	  var Ctor = object.constructor;
	  return baseCreate(isFunction(Ctor) ? Ctor.prototype : undefined);
	}

	/**
	 * Initializes an object clone based on its `toStringTag`.
	 *
	 * **Note:** This function only supports cloning values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @param {string} tag The `toStringTag` of the object to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneByTag(object, tag, isDeep) {
	  var Ctor = object.constructor;
	  switch (tag) {
	    case arrayBufferTag:
	      return cloneBuffer(object);

	    case boolTag:
	    case dateTag:
	      return new Ctor(+object);

	    case float32Tag: case float64Tag:
	    case int8Tag: case int16Tag: case int32Tag:
	    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
	      return cloneTypedArray(object, isDeep);

	    case mapTag:
	      return cloneMap(object);

	    case numberTag:
	    case stringTag:
	      return new Ctor(object);

	    case regexpTag:
	      return cloneRegExp(object);

	    case setTag:
	      return cloneSet(object);

	    case symbolTag:
	      return cloneSymbol(object);
	  }
	}

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

	  return value === proto;
	}

	/**
	 * This method is like `_.cloneWith` except that it recursively clones `value`.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to recursively clone.
	 * @param {Function} [customizer] The function to customize cloning.
	 * @returns {*} Returns the deep cloned value.
	 * @example
	 *
	 * function customizer(value) {
	 *   if (_.isElement(value)) {
	 *     return value.cloneNode(true);
	 *   }
	 * }
	 *
	 * var el = _.cloneDeepWith(document.body, customizer);
	 *
	 * console.log(el === document.body);
	 * // => false
	 * console.log(el.nodeName);
	 * // => 'BODY'
	 * console.log(el.childNodes.length);
	 * // => 20
	 */
	function cloneDeepWith(value, customizer) {
	  return baseClone(value, true, customizer);
	}

	/**
	 * Performs a [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 * var other = { 'user': 'fred' };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @type Function
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8 which returns 'object' for typed array constructors, and
	  // PhantomJS 1.9 which returns 'function' for `NodeList` instances.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (value == null) {
	    return false;
	  }
	  if (isFunction(value)) {
	    return reIsNative.test(funcToString.call(value));
	  }
	  return isObjectLike(value) &&
	    (isHostObject(value) ? reIsNative : reIsHostCtor).test(value);
	}

	module.exports = cloneDeepWith;


/***/ },
/* 15 */
/***/ function(module, exports) {

	/**
	 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/** `Object#toString` result references. */
	var numberTag = '[object Number]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is classified as a `Number` primitive or object.
	 *
	 * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
	 * as numbers, use the `_.isFinite` method.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isNumber(3);
	 * // => true
	 *
	 * _.isNumber(Number.MIN_VALUE);
	 * // => true
	 *
	 * _.isNumber(Infinity);
	 * // => true
	 *
	 * _.isNumber('3');
	 * // => false
	 */
	function isNumber(value) {
	  return typeof value == 'number' ||
	    (isObjectLike(value) && objectToString.call(value) == numberTag);
	}

	module.exports = isNumber;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	

	/**
	 * An individual item within a ReactGridLayout.
	 */
	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _reactDraggable = __webpack_require__(17);

	var _reactDraggable2 = _interopRequireDefault(_reactDraggable);

	var _reactResizable = __webpack_require__(19);

	var _utils = __webpack_require__(10);

	var GridItem = _react2['default'].createClass({
	  displayName: 'GridItem',

	  propTypes: {
	    // Children must be only a single element
	    children: _react2['default'].PropTypes.element,

	    // General grid attributes
	    cols: _react2['default'].PropTypes.number.isRequired,
	    containerWidth: _react2['default'].PropTypes.number.isRequired,
	    rowHeight: _react2['default'].PropTypes.number.isRequired,
	    margin: _react2['default'].PropTypes.array.isRequired,

	    // These are all in grid units
	    x: _react2['default'].PropTypes.number.isRequired,
	    y: _react2['default'].PropTypes.number.isRequired,
	    w: _react2['default'].PropTypes.number.isRequired,
	    h: _react2['default'].PropTypes.number.isRequired,

	    // All optional
	    minW: function minW(props, propName, componentName, location, propFullName) {
	      _react2['default'].PropTypes.number(props, propName, componentName, location, propFullName);
	      var value = props[propName];
	      if (value > props.w || value > props.maxW) return new Error('minWidth bigger than item width/maxWidth');
	    },
	    maxW: function maxW(props, propName, componentName, location, propFullName) {
	      _react2['default'].PropTypes.number(props, propName, componentName, location, propFullName);
	      var value = props[propName];
	      if (value < props.w || value < props.minW) return new Error('maxWidth smaller than item width/minWidth');
	    },
	    minH: function minH(props, propName, componentName, location, propFullName) {
	      _react2['default'].PropTypes.number(props, propName, componentName, location, propFullName);
	      var value = props[propName];
	      if (value > props.h || value > props.maxH) return new Error('minHeight bigger than item height/maxHeight');
	    },
	    maxH: function maxH(props, propName, componentName, location, propFullName) {
	      _react2['default'].PropTypes.number(props, propName, componentName, location, propFullName);
	      var value = props[propName];
	      if (value < props.h || value < props.minH) return new Error('maxHeight smaller than item height/minHeight');
	    },

	    // ID is nice to have for callbacks
	    i: _react2['default'].PropTypes.string.isRequired,

	    // Functions
	    onDragStop: _react2['default'].PropTypes.func,
	    onDragStart: _react2['default'].PropTypes.func,
	    onDrag: _react2['default'].PropTypes.func,
	    onResizeStop: _react2['default'].PropTypes.func,
	    onResizeStart: _react2['default'].PropTypes.func,
	    onResize: _react2['default'].PropTypes.func,

	    // Flags
	    isDraggable: _react2['default'].PropTypes.bool.isRequired,
	    isResizable: _react2['default'].PropTypes.bool.isRequired,

	    // Use CSS transforms instead of top/left
	    useCSSTransforms: _react2['default'].PropTypes.bool.isRequired,
	    isPlaceholder: _react2['default'].PropTypes.bool,

	    // Others
	    className: _react2['default'].PropTypes.string,
	    // Selector for draggable handle
	    handle: _react2['default'].PropTypes.string,
	    // Selector for draggable cancel (see react-draggable)
	    cancel: _react2['default'].PropTypes.string
	  },

	  getDefaultProps: function getDefaultProps() {
	    return {
	      isPlaceholder: false,
	      className: '',
	      cancel: '',
	      minH: 1,
	      minW: 1,
	      maxH: Infinity,
	      maxW: Infinity
	    };
	  },

	  getInitialState: function getInitialState() {
	    return {
	      resizing: null,
	      dragging: null,
	      className: ''
	    };
	  },

	  /**
	   * Return position on the page given an x, y, w, h.
	   * left, top, width, height are all in pixels.
	   * @param  {Number}  x             X coordinate in grid units.
	   * @param  {Number}  y             Y coordinate in grid units.
	   * @param  {Number}  w             W coordinate in grid units.
	   * @param  {Number}  h             H coordinate in grid units.
	   * @return {Object}                Object containing coords.
	   */
	  calcPosition: function calcPosition(x, y, w, h) {
	    var _props = this.props;
	    var margin = _props.margin;
	    var containerWidth = _props.containerWidth;
	    var cols = _props.cols;
	    var rowHeight = _props.rowHeight;

	    var width = containerWidth - margin[0];
	    var out = {
	      left: Math.round(width * (x / cols) + margin[0]),
	      top: Math.round(rowHeight * y + margin[1]),
	      width: Math.round(width * (w / cols) - margin[0]),
	      height: Math.round(h * rowHeight - margin[1])
	    };

	    if (this.state.resizing) {
	      out.width = this.state.resizing.width;
	      out.height = this.state.resizing.height;
	    }

	    if (this.state.dragging) {
	      out.top = this.state.dragging.top;
	      out.left = this.state.dragging.left;
	    }

	    return out;
	  },

	  /**
	   * Translate x and y coordinates from pixels to grid units.
	   * @param  {Number} top  Top position (relative to parent) in pixels.
	   * @param  {Number} left Left position (relative to parent) in pixels.
	   * @return {Object} x and y in grid units.
	   */
	  calcXY: function calcXY(top, left) {
	    var _props2 = this.props;
	    var margin = _props2.margin;
	    var containerWidth = _props2.containerWidth;
	    var cols = _props2.cols;
	    var rowHeight = _props2.rowHeight;
	    var w = _props2.w;

	    left -= margin[0];
	    top -= margin[1];
	    // This is intentional; because so much of the logic on moving boxes up/down relies
	    // on an exact y position, we only round the x, not the y.
	    var x = Math.round(left / containerWidth * cols);
	    var y = Math.floor(top / rowHeight);
	    x = Math.max(Math.min(x, cols), 0);
	    y = Math.max(y, 0);

	    // Cap x at numCols
	    x = Math.min(x, cols - w);

	    return { x: x, y: y };
	  },

	  /**
	   * Given a height and width in pixel values, calculate grid units.
	   * @param  {Number} height Height in pixels.
	   * @param  {Number} width  Width in pixels.
	   * @return {Object} w, h as grid units.
	   */
	  calcWH: function calcWH(_ref) {
	    var height = _ref.height;
	    var width = _ref.width;
	    return (function () {
	      var _props3 = this.props;
	      var margin = _props3.margin;
	      var containerWidth = _props3.containerWidth;
	      var cols = _props3.cols;
	      var rowHeight = _props3.rowHeight;
	      var x = _props3.x;

	      width += margin[0];
	      height += margin[1];
	      var w = Math.round(width / containerWidth * cols);
	      var h = Math.round(height / rowHeight);
	      w = Math.max(Math.min(w, cols - x), 0);
	      h = Math.max(h, 0);
	      return { w: w, h: h };
	    }).apply(this, arguments);
	  },

	  /**
	   * This is where we set the grid item's absolute placement. It gets a little tricky because we want to do it
	   * well when server rendering, and the only way to do that properly is to use percentage width/left because
	   * we don't know exactly what the browser viewport is.
	   * Unfortunately, CSS Transforms, which are great for performance, break in this instance because a percentage
	   * left is relative to the item itself, not its container! So we cannot use them on the server rendering pass.
	   *
	   * @param  {Object} pos Position object with width, height, left, top.
	   * @return {Object}     Style object.
	   */
	  createStyle: function createStyle(pos) {
	    var _props4 = this.props;
	    var usePercentages = _props4.usePercentages;
	    var containerWidth = _props4.containerWidth;
	    var useCSSTransforms = _props4.useCSSTransforms;

	    var style = {
	      width: pos.width + 'px',
	      height: pos.height + 'px',
	      left: pos.left + 'px',
	      top: pos.top + 'px',
	      position: 'absolute'
	    };

	    // This is used for server rendering.
	    if (usePercentages) {
	      style.left = (0, _utils.perc)(pos.left / containerWidth);
	      style.width = (0, _utils.perc)(pos.width / containerWidth);
	    }

	    // CSS Transforms support
	    if (useCSSTransforms) {
	      (0, _utils.setTransform)(style, [pos.left, pos.top]);
	      style.left = null;
	      style.top = null;
	    }

	    return style;
	  },

	  /**
	   * Mix a Draggable instance into a child.
	   * @param  {Element} child    Child element.
	   * @return {Element}          Child wrapped in Draggable.
	   */
	  mixinDraggable: function mixinDraggable(child) {
	    return _react2['default'].createElement(
	      _reactDraggable2['default'].DraggableCore,
	      {
	        onStart: this.onDragHandler('onDragStart'),
	        onDrag: this.onDragHandler('onDrag'),
	        onStop: this.onDragHandler('onDragStop'),
	        handle: this.props.handle,
	        cancel: ".react-resizable-handle " + this.props.cancel },
	      child
	    );
	  },

	  /**
	   * Mix a Resizable instance into a child.
	   * @param  {Element} child    Child element.
	   * @param  {Object} position  Position object (pixel values)
	   * @return {Element}          Child wrapped in Resizable.
	   */
	  mixinResizable: function mixinResizable(child, position) {
	    var _props5 = this.props;
	    var cols = _props5.cols;
	    var x = _props5.x;
	    var minW = _props5.minW;
	    var minH = _props5.minH;
	    var maxW = _props5.maxW;
	    var maxH = _props5.maxH;

	    // This is the max possible width - doesn't go to infinity because of the width of the window
	    var maxWidth = this.calcPosition(0, 0, cols - x, 0).width;

	    // Calculate min/max constraints using our min & maxes
	    var mins = this.calcPosition(0, 0, minW, minH);
	    var maxes = this.calcPosition(0, 0, maxW, maxH);
	    var minConstraints = [mins.width, mins.height];
	    var maxConstraints = [Math.min(maxes.width, maxWidth), Math.min(maxes.height, Infinity)];
	    return _react2['default'].createElement(
	      _reactResizable.Resizable,
	      {
	        width: position.width,
	        height: position.height,
	        minConstraints: minConstraints,
	        maxConstraints: maxConstraints,
	        onResizeStop: this.onResizeHandler('onResizeStop'),
	        onResizeStart: this.onResizeHandler('onResizeStart'),
	        onResize: this.onResizeHandler('onResize') },
	      child
	    );
	  },

	  /**
	   * Wrapper around drag events to provide more useful data.
	   * All drag events call the function with the given handler name,
	   * with the signature (index, x, y).
	   *
	   * @param  {String} handlerName Handler name to wrap.
	   * @return {Function}           Handler function.
	   */
	  onDragHandler: function onDragHandler(handlerName) {
	    var _this = this,
	        _arguments = arguments;

	    return function (e, _ref2) {
	      var node = _ref2.node;
	      var position = _ref2.position;
	      return (function () {
	        if (!this.props[handlerName]) return;

	        // Get new XY
	        switch (handlerName) {
	          case 'onDragStart':
	            // ToDo this wont work on nested parents
	            var parentRect = node.offsetParent.getBoundingClientRect();
	            var clientRect = node.getBoundingClientRect();
	            position.top = clientRect.top - parentRect.top;
	            position.left = clientRect.left - parentRect.left;
	            this.setState({ dragging: position });
	            break;
	          case 'onDrag':
	            position.left = this.state.dragging.left + position.deltaX;
	            position.top = this.state.dragging.top + position.deltaY;
	            this.setState({ dragging: position });
	            break;
	          case 'onDragStop':
	            position.left = this.state.dragging.left;
	            position.top = this.state.dragging.top;
	            this.setState({ dragging: null });
	            break;
	          default:
	            this.setState({ dragging: null });
	        }

	        var _calcXY = this.calcXY(position.top, position.left);

	        var x = _calcXY.x;
	        var y = _calcXY.y;

	        this.props[handlerName](this.props.i, x, y, { e: e, node: node, position: position });
	      }).apply(_this, _arguments);
	    };
	  },

	  /**
	   * Wrapper around drag events to provide more useful data.
	   * All drag events call the function with the given handler name,
	   * with the signature (index, x, y).
	   *
	   * @param  {String} handlerName Handler name to wrap.
	   * @return {Function}           Handler function.
	   */
	  onResizeHandler: function onResizeHandler(handlerName) {
	    var _this2 = this,
	        _arguments2 = arguments;

	    return function (e, _ref3) {
	      var element = _ref3.element;
	      var size = _ref3.size;
	      return (function () {
	        if (!this.props[handlerName]) return;
	        var _props6 = this.props;
	        var cols = _props6.cols;
	        var x = _props6.x;
	        var i = _props6.i;
	        var maxW = _props6.maxW;
	        var minW = _props6.minW;
	        var maxH = _props6.maxH;
	        var minH = _props6.minH;

	        // Get new XY

	        var _calcWH = this.calcWH(size);

	        var w = _calcWH.w;
	        var h = _calcWH.h;

	        // Cap w at numCols
	        w = Math.min(w, cols - x);
	        // Ensure w is at least 1
	        w = Math.max(w, 1);

	        // Min/max capping
	        w = Math.max(Math.min(w, maxW), minW);
	        h = Math.max(Math.min(h, maxH), minH);

	        this.setState({ resizing: handlerName === 'onResizeStop' ? null : size });

	        this.props[handlerName](i, w, h, { e: e, element: element, size: size });
	      }).apply(_this2, _arguments2);
	    };
	  },

	  render: function render() {
	    var _props7 = this.props;
	    var x = _props7.x;
	    var y = _props7.y;
	    var w = _props7.w;
	    var h = _props7.h;
	    var className = _props7.className;
	    var style = _props7.style;
	    var isDraggable = _props7.isDraggable;
	    var isPlaceholder = _props7.isPlaceholder;
	    var isResizable = _props7.isResizable;
	    var useCSSTransforms = _props7.useCSSTransforms;

	    var pos = this.calcPosition(x, y, w, h);
	    var child = _react2['default'].Children.only(this.props.children);

	    // Create the child element. We clone the existing element but modify its className and style.
	    var newChild = _react2['default'].cloneElement(child, {
	      // Munge a classname. Use passed in classnames and resizing.
	      // React with merge the classNames.
	      className: ['react-grid-item', className, isDraggable || isPlaceholder ? '' : 'static', this.state.resizing ? 'resizing' : '', this.state.dragging ? 'react-draggable-dragging' : '', useCSSTransforms ? 'cssTransforms' : ''].join(' '),
	      // We can set the width and height on the child, but unfortunately we can't set the position.
	      style: _extends({ style: style }, this.createStyle(pos))
	    });

	    // Resizable support. This is usually on but the user can toggle it off.
	    if (isResizable) newChild = this.mixinResizable(newChild, pos);

	    // Draggable support. This is always on, except for with placeholders.
	    if (isDraggable) newChild = this.mixinDraggable(newChild);

	    return newChild;
	  }
	});

	exports['default'] = GridItem;
	module.exports = exports['default'];

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	(function webpackUniversalModuleDefinition(root, factory) {
		if(true)
			module.exports = factory(__webpack_require__(2), __webpack_require__(18));
		else if(typeof define === 'function' && define.amd)
			define(["react", "react-dom"], factory);
		else if(typeof exports === 'object')
			exports["ReactDraggable"] = factory(require("react"), require("react-dom"));
		else
			root["ReactDraggable"] = factory(root["React"], root["ReactDOM"]);
	})(this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__) {
	return /******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};
	/******/
	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {
	/******/
	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId])
	/******/ 			return installedModules[moduleId].exports;
	/******/
	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			exports: {},
	/******/ 			id: moduleId,
	/******/ 			loaded: false
	/******/ 		};
	/******/
	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	/******/
	/******/ 		// Flag the module as loaded
	/******/ 		module.loaded = true;
	/******/
	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}
	/******/
	/******/
	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;
	/******/
	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;
	/******/
	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";
	/******/
	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(0);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ function(module, exports, __webpack_require__) {

		'use strict';
		
		module.exports = __webpack_require__(1);
		module.exports.DraggableCore = __webpack_require__(10);

	/***/ },
	/* 1 */
	/***/ function(module, exports, __webpack_require__) {

		'use strict';
		
		Object.defineProperty(exports, '__esModule', {
		  value: true
		});
		
		var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
		
		var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();
		
		var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
		
		var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
		
		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
		
		function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
		
		function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
		
		var _react = __webpack_require__(2);
		
		var _react2 = _interopRequireDefault(_react);
		
		var _reactDom = __webpack_require__(3);
		
		var _reactDom2 = _interopRequireDefault(_reactDom);
		
		var _classnames = __webpack_require__(4);
		
		var _classnames2 = _interopRequireDefault(_classnames);
		
		var _objectAssign = __webpack_require__(5);
		
		var _objectAssign2 = _interopRequireDefault(_objectAssign);
		
		var _utilsDomFns = __webpack_require__(6);
		
		var _utilsPositionFns = __webpack_require__(9);
		
		var _utilsShims = __webpack_require__(7);
		
		var _DraggableCore2 = __webpack_require__(10);
		
		var _DraggableCore3 = _interopRequireDefault(_DraggableCore2);
		
		var _utilsLog = __webpack_require__(11);
		
		var _utilsLog2 = _interopRequireDefault(_utilsLog);
		
		//
		// Define <Draggable>
		//
		
		var Draggable = (function (_DraggableCore) {
		  _inherits(Draggable, _DraggableCore);
		
		  function Draggable() {
		    var _this = this;
		
		    _classCallCheck(this, Draggable);
		
		    _get(Object.getPrototypeOf(Draggable.prototype), 'constructor', this).apply(this, arguments);
		
		    this.state = {
		      // Whether or not we are currently dragging.
		      dragging: false,
		
		      // Current transform x and y.
		      clientX: this.props.start.x, clientY: this.props.start.y,
		
		      // Used for compensating for out-of-bounds drags
		      slackX: 0, slackY: 0,
		
		      // Can only determine if SVG after mounting
		      isElementSVG: false
		    };
		
		    this.onDragStart = function (e, coreEvent) {
		      (0, _utilsLog2['default'])('Draggable: onDragStart: %j', coreEvent.position);
		
		      // Short-circuit if user's callback killed it.
		      var shouldStart = _this.props.onStart(e, (0, _utilsDomFns.createUIEvent)(_this, coreEvent));
		      // Kills start event on core as well, so move handlers are never bound.
		      if (shouldStart === false) return false;
		
		      _this.setState({ dragging: true });
		    };
		
		    this.onDrag = function (e, coreEvent) {
		      if (!_this.state.dragging) return false;
		      (0, _utilsLog2['default'])('Draggable: onDrag: %j', coreEvent.position);
		
		      var uiEvent = (0, _utilsDomFns.createUIEvent)(_this, coreEvent);
		
		      // Short-circuit if user's callback killed it.
		      var shouldUpdate = _this.props.onDrag(e, uiEvent);
		      if (shouldUpdate === false) return false;
		
		      var newState = {
		        clientX: uiEvent.position.left,
		        clientY: uiEvent.position.top
		      };
		
		      // Keep within bounds.
		      if (_this.props.bounds) {
		        // Save original x and y.
		        var clientX = newState.clientX;
		        var clientY = newState.clientY;
		
		        // Add slack to the values used to calculate bound position. This will ensure that if
		        // we start removing slack, the element won't react to it right away until it's been
		        // completely removed.
		        newState.clientX += _this.state.slackX;
		        newState.clientY += _this.state.slackY;
		
		        // Get bound position. This will ceil/floor the x and y within the boundaries.
		
		        // Recalculate slack by noting how much was shaved by the boundPosition handler.
		
		        var _getBoundPosition = (0, _utilsPositionFns.getBoundPosition)(_this, newState.clientX, newState.clientY);
		
		        var _getBoundPosition2 = _slicedToArray(_getBoundPosition, 2);
		
		        newState.clientX = _getBoundPosition2[0];
		        newState.clientY = _getBoundPosition2[1];
		        newState.slackX = _this.state.slackX + (clientX - newState.clientX);
		        newState.slackY = _this.state.slackY + (clientY - newState.clientY);
		      }
		
		      _this.setState(newState);
		    };
		
		    this.onDragStop = function (e, coreEvent) {
		      if (!_this.state.dragging) return false;
		
		      // Short-circuit if user's callback killed it.
		      var shouldStop = _this.props.onStop(e, (0, _utilsDomFns.createUIEvent)(_this, coreEvent));
		      if (shouldStop === false) return false;
		
		      (0, _utilsLog2['default'])('Draggable: onDragStop: %j', coreEvent.position);
		
		      _this.setState({
		        dragging: false,
		        slackX: 0,
		        slackY: 0
		      });
		    };
		  }
		
		  _createClass(Draggable, [{
		    key: 'componentDidMount',
		    value: function componentDidMount() {
		      // Check to see if the element passed is an instanceof SVGElement
		      if (_reactDom2['default'].findDOMNode(this) instanceof SVGElement) {
		        this.setState({ isElementSVG: true });
		      }
		    }
		  }, {
		    key: 'componentWillUnmount',
		    value: function componentWillUnmount() {
		      this.setState({ dragging: false }); // prevents invariant if unmounted while dragging
		    }
		  }, {
		    key: 'render',
		    value: function render() {
		      var style = undefined,
		          svgTransform = null;
		      // Add a CSS transform to move the element around. This allows us to move the element around
		      // without worrying about whether or not it is relatively or absolutely positioned.
		      // If the item you are dragging already has a transform set, wrap it in a <span> so <Draggable>
		      // has a clean slate.
		      style = (0, _utilsDomFns.createTransform)({
		        // Set left if horizontal drag is enabled
		        x: (0, _utilsPositionFns.canDragX)(this) ? this.state.clientX : this.props.start.x,
		
		        // Set top if vertical drag is enabled
		        y: (0, _utilsPositionFns.canDragY)(this) ? this.state.clientY : this.props.start.y
		      }, this.state.isElementSVG);
		
		      // If this element was SVG, we use the `transform` attribute.
		      if (this.state.isElementSVG) {
		        svgTransform = style;
		        style = {};
		      }
		
		      // zIndex option
		      if (this.state.dragging && !isNaN(this.props.zIndex)) {
		        style.zIndex = this.props.zIndex;
		      }
		
		      // Mark with class while dragging
		      var className = (0, _classnames2['default'])(this.props.children.props.className || '', 'react-draggable', {
		        'react-draggable-dragging': this.state.dragging,
		        'react-draggable-dragged': this.state.dragged
		      });
		
		      // Reuse the child provided
		      // This makes it flexible to use whatever element is wanted (div, ul, etc)
		      return _react2['default'].createElement(
		        _DraggableCore3['default'],
		        _extends({}, this.props, { onStart: this.onDragStart, onDrag: this.onDrag, onStop: this.onDragStop }),
		        _react2['default'].cloneElement(_react2['default'].Children.only(this.props.children), {
		          className: className,
		          style: (0, _objectAssign2['default'])({}, this.props.children.props.style, style),
		          transform: svgTransform
		        })
		      );
		    }
		  }], [{
		    key: 'displayName',
		    value: 'Draggable',
		    enumerable: true
		  }, {
		    key: 'propTypes',
		    value: (0, _objectAssign2['default'])({}, _DraggableCore3['default'].propTypes, {
		      /**
		       * `axis` determines which axis the draggable can move.
		       *
		       * 'both' allows movement horizontally and vertically.
		       * 'x' limits movement to horizontal axis.
		       * 'y' limits movement to vertical axis.
		       *
		       * Defaults to 'both'.
		       */
		      axis: _react.PropTypes.oneOf(['both', 'x', 'y']),
		
		      /**
		       * `bounds` determines the range of movement available to the element.
		       * Available values are:
		       *
		       * 'parent' restricts movement within the Draggable's parent node.
		       *
		       * Alternatively, pass an object with the following properties, all of which are optional:
		       *
		       * {left: LEFT_BOUND, right: RIGHT_BOUND, bottom: BOTTOM_BOUND, top: TOP_BOUND}
		       *
		       * All values are in px.
		       *
		       * Example:
		       *
		       * ```jsx
		       *   let App = React.createClass({
		       *       render: function () {
		       *         return (
		       *            <Draggable bounds={{right: 300, bottom: 300}}>
		       *              <div>Content</div>
		       *           </Draggable>
		       *         );
		       *       }
		       *   });
		       * ```
		       */
		      bounds: _react.PropTypes.oneOfType([_react.PropTypes.shape({
		        left: _react.PropTypes.Number,
		        right: _react.PropTypes.Number,
		        top: _react.PropTypes.Number,
		        bottom: _react.PropTypes.Number
		      }), _react.PropTypes.string, _react.PropTypes.oneOf([false])]),
		
		      /**
		       * `start` specifies the x and y that the dragged item should start at
		       *
		       * Example:
		       *
		       * ```jsx
		       *      let App = React.createClass({
		       *          render: function () {
		       *              return (
		       *                  <Draggable start={{x: 25, y: 25}}>
		       *                      <div>I start with transformX: 25px and transformY: 25px;</div>
		       *                  </Draggable>
		       *              );
		       *          }
		       *      });
		       * ```
		       */
		      start: _react.PropTypes.shape({
		        x: _react.PropTypes.number,
		        y: _react.PropTypes.number
		      }),
		
		      /**
		       * `zIndex` specifies the zIndex to use while dragging.
		       *
		       * Example:
		       *
		       * ```jsx
		       *   let App = React.createClass({
		       *       render: function () {
		       *           return (
		       *               <Draggable zIndex={100}>
		       *                   <div>I have a zIndex</div>
		       *               </Draggable>
		       *           );
		       *       }
		       *   });
		       * ```
		       */
		      zIndex: _react.PropTypes.number,
		
		      /**
		       * These properties should be defined on the child, not here.
		       */
		      className: _utilsShims.dontSetMe,
		      style: _utilsShims.dontSetMe,
		      transform: _utilsShims.dontSetMe
		    }),
		    enumerable: true
		  }, {
		    key: 'defaultProps',
		    value: (0, _objectAssign2['default'])({}, _DraggableCore3['default'].defaultProps, {
		      axis: 'both',
		      bounds: false,
		      start: { x: 0, y: 0 },
		      zIndex: NaN
		    }),
		    enumerable: true
		  }]);
		
		  return Draggable;
		})(_DraggableCore3['default']);
		
		exports['default'] = Draggable;
		module.exports = exports['default'];

	/***/ },
	/* 2 */
	/***/ function(module, exports) {

		module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

	/***/ },
	/* 3 */
	/***/ function(module, exports) {

		module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

	/***/ },
	/* 4 */
	/***/ function(module, exports, __webpack_require__) {

		var __WEBPACK_AMD_DEFINE_RESULT__;/*!
		  Copyright (c) 2015 Jed Watson.
		  Licensed under the MIT License (MIT), see
		  http://jedwatson.github.io/classnames
		*/
		/* global define */
		
		(function () {
			'use strict';
		
			var hasOwn = {}.hasOwnProperty;
		
			function classNames () {
				var classes = '';
		
				for (var i = 0; i < arguments.length; i++) {
					var arg = arguments[i];
					if (!arg) continue;
		
					var argType = typeof arg;
		
					if (argType === 'string' || argType === 'number') {
						classes += ' ' + arg;
					} else if (Array.isArray(arg)) {
						classes += ' ' + classNames.apply(null, arg);
					} else if (argType === 'object') {
						for (var key in arg) {
							if (hasOwn.call(arg, key) && arg[key]) {
								classes += ' ' + key;
							}
						}
					}
				}
		
				return classes.substr(1);
			}
		
			if (typeof module !== 'undefined' && module.exports) {
				module.exports = classNames;
			} else if (true) {
				// register as 'classnames', consistent with npm package name
				!(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
					return classNames;
				}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
			} else {
				window.classNames = classNames;
			}
		}());


	/***/ },
	/* 5 */
	/***/ function(module, exports) {

		/* eslint-disable no-unused-vars */
		'use strict';
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		var propIsEnumerable = Object.prototype.propertyIsEnumerable;
		
		function toObject(val) {
			if (val === null || val === undefined) {
				throw new TypeError('Object.assign cannot be called with null or undefined');
			}
		
			return Object(val);
		}
		
		module.exports = Object.assign || function (target, source) {
			var from;
			var to = toObject(target);
			var symbols;
		
			for (var s = 1; s < arguments.length; s++) {
				from = Object(arguments[s]);
		
				for (var key in from) {
					if (hasOwnProperty.call(from, key)) {
						to[key] = from[key];
					}
				}
		
				if (Object.getOwnPropertySymbols) {
					symbols = Object.getOwnPropertySymbols(from);
					for (var i = 0; i < symbols.length; i++) {
						if (propIsEnumerable.call(from, symbols[i])) {
							to[symbols[i]] = from[symbols[i]];
						}
					}
				}
			}
		
			return to;
		};


	/***/ },
	/* 6 */
	/***/ function(module, exports, __webpack_require__) {

		'use strict';
		
		Object.defineProperty(exports, '__esModule', {
		  value: true
		});
		exports.matchesSelector = matchesSelector;
		exports.addEvent = addEvent;
		exports.removeEvent = removeEvent;
		exports.outerHeight = outerHeight;
		exports.outerWidth = outerWidth;
		exports.innerHeight = innerHeight;
		exports.innerWidth = innerWidth;
		exports.createTransform = createTransform;
		exports.createCSSTransform = createCSSTransform;
		exports.createSVGTransform = createSVGTransform;
		exports.addUserSelectStyles = addUserSelectStyles;
		exports.removeUserSelectStyles = removeUserSelectStyles;
		exports.styleHacks = styleHacks;
		exports.createCoreEvent = createCoreEvent;
		exports.createUIEvent = createUIEvent;
		
		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
		
		var _shims = __webpack_require__(7);
		
		var _getPrefix = __webpack_require__(8);
		
		var _getPrefix2 = _interopRequireDefault(_getPrefix);
		
		var _objectAssign = __webpack_require__(5);
		
		var _objectAssign2 = _interopRequireDefault(_objectAssign);
		
		var _reactDom = __webpack_require__(3);
		
		var _reactDom2 = _interopRequireDefault(_reactDom);
		
		var matchesSelectorFunc = '';
		
		function matchesSelector(el, selector) {
		  if (!(el instanceof Node)) throw new TypeError('Value of argument \'el\' violates contract, expected Node got ' + (el === null ? 'null' : el instanceof Object && el.constructor ? el.constructor.name : typeof el));
		  if (typeof selector !== 'string') throw new TypeError('Value of argument \'selector\' violates contract, expected string got ' + (selector === null ? 'null' : selector instanceof Object && selector.constructor ? selector.constructor.name : typeof selector));
		
		  if (!matchesSelectorFunc) {
		    matchesSelectorFunc = (0, _shims.findInArray)(['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'], function (method) {
		      return (0, _shims.isFunction)(el[method]);
		    });
		  }
		
		  return el[matchesSelectorFunc].call(el, selector);
		}
		
		function addEvent(el, event, handler) {
		  if (el != null && !(el instanceof Node)) throw new TypeError('Value of argument \'el\' violates contract, expected null or Node got ' + (el === null ? 'null' : el instanceof Object && el.constructor ? el.constructor.name : typeof el));
		  if (typeof event !== 'string') throw new TypeError('Value of argument \'event\' violates contract, expected string got ' + (event === null ? 'null' : event instanceof Object && event.constructor ? event.constructor.name : typeof event));
		  if (typeof handler !== 'function') throw new TypeError('Value of argument \'handler\' violates contract, expected function got ' + (handler === null ? 'null' : handler instanceof Object && handler.constructor ? handler.constructor.name : typeof handler));
		
		  if (!el) {
		    return;
		  }
		  if (el.attachEvent) {
		    el.attachEvent('on' + event, handler);
		  } else if (el.addEventListener) {
		    el.addEventListener(event, handler, true);
		  } else {
		    el['on' + event] = handler;
		  }
		}
		
		function removeEvent(el, event, handler) {
		  if (el != null && !(el instanceof Node)) throw new TypeError('Value of argument \'el\' violates contract, expected null or Node got ' + (el === null ? 'null' : el instanceof Object && el.constructor ? el.constructor.name : typeof el));
		  if (typeof event !== 'string') throw new TypeError('Value of argument \'event\' violates contract, expected string got ' + (event === null ? 'null' : event instanceof Object && event.constructor ? event.constructor.name : typeof event));
		  if (typeof handler !== 'function') throw new TypeError('Value of argument \'handler\' violates contract, expected function got ' + (handler === null ? 'null' : handler instanceof Object && handler.constructor ? handler.constructor.name : typeof handler));
		
		  if (!el) {
		    return;
		  }
		  if (el.detachEvent) {
		    el.detachEvent('on' + event, handler);
		  } else if (el.removeEventListener) {
		    el.removeEventListener(event, handler, true);
		  } else {
		    el['on' + event] = null;
		  }
		}
		
		function outerHeight(node) {
		  if (!(node instanceof Node)) throw new TypeError('Value of argument \'node\' violates contract, expected Node got ' + (node === null ? 'null' : node instanceof Object && node.constructor ? node.constructor.name : typeof node));
		
		  // This is deliberately excluding margin for our calculations, since we are using
		  // offsetTop which is including margin. See getBoundPosition
		  var height = node.clientHeight;
		  var computedStyle = window.getComputedStyle(node);
		  height += (0, _shims.int)(computedStyle.borderTopWidth);
		  height += (0, _shims.int)(computedStyle.borderBottomWidth);
		  return height;
		}
		
		function outerWidth(node) {
		  if (!(node instanceof Node)) throw new TypeError('Value of argument \'node\' violates contract, expected Node got ' + (node === null ? 'null' : node instanceof Object && node.constructor ? node.constructor.name : typeof node));
		
		  // This is deliberately excluding margin for our calculations, since we are using
		  // offsetLeft which is including margin. See getBoundPosition
		  var width = node.clientWidth;
		  var computedStyle = window.getComputedStyle(node);
		  width += (0, _shims.int)(computedStyle.borderLeftWidth);
		  width += (0, _shims.int)(computedStyle.borderRightWidth);
		  return width;
		}
		
		function innerHeight(node) {
		  if (!(node instanceof Node)) throw new TypeError('Value of argument \'node\' violates contract, expected Node got ' + (node === null ? 'null' : node instanceof Object && node.constructor ? node.constructor.name : typeof node));
		
		  var height = node.clientHeight;
		  var computedStyle = window.getComputedStyle(node);
		  height -= (0, _shims.int)(computedStyle.paddingTop);
		  height -= (0, _shims.int)(computedStyle.paddingBottom);
		  return height;
		}
		
		function innerWidth(node) {
		  if (!(node instanceof Node)) throw new TypeError('Value of argument \'node\' violates contract, expected Node got ' + (node === null ? 'null' : node instanceof Object && node.constructor ? node.constructor.name : typeof node));
		
		  var width = node.clientWidth;
		  var computedStyle = window.getComputedStyle(node);
		  width -= (0, _shims.int)(computedStyle.paddingLeft);
		  width -= (0, _shims.int)(computedStyle.paddingRight);
		  return width;
		}
		
		function createTransform(position, isSVG) {
		  if (typeof position !== 'object') throw new TypeError('Value of argument \'position\' violates contract, expected object got ' + (position === null ? 'null' : position instanceof Object && position.constructor ? position.constructor.name : typeof position));
		  if (isSVG != null && typeof isSVG !== 'boolean') throw new TypeError('Value of argument \'isSVG\' violates contract, expected null or boolean got ' + (isSVG === null ? 'null' : isSVG instanceof Object && isSVG.constructor ? isSVG.constructor.name : typeof isSVG));
		
		  if (isSVG) return createSVGTransform(position);
		  return createCSSTransform(position);
		}
		
		function createCSSTransform(_ref) {
		  var x = _ref.x;
		  var y = _ref.y;
		  return (function () {
		    if ({ x: x, y: y } === null || typeof { x: x, y: y } !== 'object' || typeof { x: x, y: y }.x !== 'number' || typeof { x: x, y: y }.y !== 'number') throw new TypeError('Value of argument \'undefined\' violates contract, expected Object with properties x and y got ' + ({ x: x, y: y } === null ? 'null' : { x: x, y: y } instanceof Object && { x: x, y: y }.constructor ? { x: x, y: y }.constructor.name : typeof { x: x, y: y }));
		
		    // Replace unitless items with px
		    var out = { transform: 'translate(' + x + 'px,' + y + 'px)' };
		    // Add single prefixed property as well
		    if (_getPrefix2['default']) {
		      out[_getPrefix2['default'] + 'Transform'] = out.transform;
		    }
		    return out;
		  })();
		}
		
		function createSVGTransform(_ref2) {
		  var x = _ref2.x;
		  var y = _ref2.y;
		  return (function () {
		    if ({ x: x, y: y } === null || typeof { x: x, y: y } !== 'object' || typeof { x: x, y: y }.x !== 'number' || typeof { x: x, y: y }.y !== 'number') throw new TypeError('Value of argument \'undefined\' violates contract, expected Object with properties x and y got ' + ({ x: x, y: y } === null ? 'null' : { x: x, y: y } instanceof Object && { x: x, y: y }.constructor ? { x: x, y: y }.constructor.name : typeof { x: x, y: y }));
		
		    return 'translate(' + x + ',' + y + ')';
		  })();
		}
		
		// User-select Hacks:
		//
		// Useful for preventing blue highlights all over everything when dragging.
		var userSelectStyle = ';user-select: none;';
		if (_getPrefix2['default']) {
		  userSelectStyle += '-' + _getPrefix2['default'].toLowerCase() + '-user-select: none;';
		}
		
		function addUserSelectStyles() {
		  var style = document.body.getAttribute('style') || '';
		  document.body.setAttribute('style', style + userSelectStyle);
		}
		
		function removeUserSelectStyles() {
		  var style = document.body.getAttribute('style') || '';
		  document.body.setAttribute('style', style.replace(userSelectStyle, ''));
		}
		
		function styleHacks() {
		  var childStyle = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
		
		  // Workaround IE pointer events; see #51
		  // https://github.com/mzabriskie/react-draggable/issues/51#issuecomment-103488278
		  var touchHacks = {
		    touchAction: 'none'
		  };
		
		  return (0, _objectAssign2['default'])(touchHacks, childStyle);
		}
		
		// Create an event exposed by <DraggableCore>
		
		function createCoreEvent(draggable, clientX, clientY) {
		  // State changes are often (but not always!) async. We want the latest value.
		  var state = draggable._pendingState || draggable.state;
		  var isStart = !(0, _shims.isNum)(state.lastX);
		
		  return {
		    node: _reactDom2['default'].findDOMNode(draggable),
		    position: isStart ?
		    // If this is our first move, use the clientX and clientY as last coords.
		    {
		      deltaX: 0, deltaY: 0,
		      lastX: clientX, lastY: clientY,
		      clientX: clientX, clientY: clientY
		    } :
		    // Otherwise calculate proper values.
		    {
		      deltaX: clientX - state.lastX, deltaY: clientY - state.lastY,
		      lastX: state.lastX, lastY: state.lastY,
		      clientX: clientX, clientY: clientY
		    }
		  };
		}
		
		// Create an event exposed by <Draggable>
		
		function createUIEvent(draggable, coreEvent) {
		  return {
		    node: _reactDom2['default'].findDOMNode(draggable),
		    position: {
		      left: draggable.state.clientX + coreEvent.position.deltaX,
		      top: draggable.state.clientY + coreEvent.position.deltaY
		    },
		    deltaX: coreEvent.position.deltaX,
		    deltaY: coreEvent.position.deltaY
		  };
		}

	/***/ },
	/* 7 */
	/***/ function(module, exports) {

		// @credits https://gist.github.com/rogozhnikoff/a43cfed27c41e4e68cdc
		'use strict';
		
		Object.defineProperty(exports, '__esModule', {
		  value: true
		});
		exports.findInArray = findInArray;
		exports.isFunction = isFunction;
		exports.isNum = isNum;
		exports.int = int;
		exports.dontSetMe = dontSetMe;
		
		function findInArray(array, callback) {
		  for (var i = 0, _length = array.length; i < _length; i++) {
		    if (callback.apply(callback, [array[i], i, array])) return array[i];
		  }
		}
		
		function isFunction(func) {
		  return typeof func === 'function' || Object.prototype.toString.call(func) === '[object Function]';
		}
		
		function isNum(num) {
		  return typeof num === 'number' && !isNaN(num);
		}
		
		function int(a) {
		  return parseInt(a, 10);
		}
		
		function dontSetMe(props, propName, componentName) {
		  if (props[propName]) {
		    throw new Error('Invalid prop ' + propName + ' passed to ' + componentName + ' - do not set this, set it on the child.');
		  }
		}

	/***/ },
	/* 8 */
	/***/ function(module, exports) {

		'use strict';
		
		Object.defineProperty(exports, '__esModule', {
		  value: true
		});
		
		exports['default'] = (function () {
		  // Checking specifically for 'window.document' is for pseudo-browser server-side
		  // environments that define 'window' as the global context.
		  // E.g. React-rails (see https://github.com/reactjs/react-rails/pull/84)
		  if (typeof window === 'undefined' || typeof window.document === 'undefined') return '';
		
		  // Thanks David Walsh
		  var styles = window.getComputedStyle(document.documentElement, ''),
		      pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || styles.OLink === '' && ['', 'o'])[1];
		  // 'ms' is not titlecased
		  if (pre === undefined || pre === null) return '';
		  if (pre === 'ms') return pre;
		  if (pre === undefined || pre === null) return '';
		  return pre.slice(0, 1).toUpperCase() + pre.slice(1);
		})();
		
		module.exports = exports['default'];

	/***/ },
	/* 9 */
	/***/ function(module, exports, __webpack_require__) {

		'use strict';
		
		Object.defineProperty(exports, '__esModule', {
		  value: true
		});
		exports.getBoundPosition = getBoundPosition;
		exports.snapToGrid = snapToGrid;
		exports.canDragX = canDragX;
		exports.canDragY = canDragY;
		exports.getControlPosition = getControlPosition;
		
		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
		
		var _shims = __webpack_require__(7);
		
		var _reactDom = __webpack_require__(3);
		
		var _reactDom2 = _interopRequireDefault(_reactDom);
		
		var _domFns = __webpack_require__(6);
		
		function getBoundPosition(draggable, clientX, clientY) {
		  // If no bounds, short-circuit and move on
		  if (!draggable.props.bounds) return [clientX, clientY];
		
		  var bounds = JSON.parse(JSON.stringify(draggable.props.bounds));
		  var node = _reactDom2['default'].findDOMNode(draggable);
		
		  if (typeof bounds === 'string') {
		    var boundNode = undefined;
		    if (bounds === 'parent') {
		      boundNode = node.parentNode;
		    } else {
		      boundNode = document.querySelector(bounds);
		      if (!boundNode) throw new Error('Bounds selector "' + bounds + '" could not find an element.');
		    }
		    var nodeStyle = window.getComputedStyle(node);
		    var boundNodeStyle = window.getComputedStyle(boundNode);
		    // Compute bounds. This is a pain with padding and offsets but this gets it exactly right.
		    bounds = {
		      left: -node.offsetLeft + (0, _shims.int)(boundNodeStyle.paddingLeft) + (0, _shims.int)(nodeStyle.borderLeftWidth) + (0, _shims.int)(nodeStyle.marginLeft),
		      top: -node.offsetTop + (0, _shims.int)(boundNodeStyle.paddingTop) + (0, _shims.int)(nodeStyle.borderTopWidth) + (0, _shims.int)(nodeStyle.marginTop),
		      right: (0, _domFns.innerWidth)(boundNode) - (0, _domFns.outerWidth)(node) - node.offsetLeft,
		      bottom: (0, _domFns.innerHeight)(boundNode) - (0, _domFns.outerHeight)(node) - node.offsetTop
		    };
		  }
		
		  // Keep x and y below right and bottom limits...
		  if ((0, _shims.isNum)(bounds.right)) clientX = Math.min(clientX, bounds.right);
		  if ((0, _shims.isNum)(bounds.bottom)) clientY = Math.min(clientY, bounds.bottom);
		
		  // But above left and top limits.
		  if ((0, _shims.isNum)(bounds.left)) clientX = Math.max(clientX, bounds.left);
		  if ((0, _shims.isNum)(bounds.top)) clientY = Math.max(clientY, bounds.top);
		
		  return [clientX, clientY];
		}
		
		function snapToGrid(grid, pendingX, pendingY) {
		  var x = Math.round(pendingX / grid[0]) * grid[0];
		  var y = Math.round(pendingY / grid[1]) * grid[1];
		  return [x, y];
		}
		
		function canDragX(draggable) {
		  return draggable.props.axis === 'both' || draggable.props.axis === 'x';
		}
		
		function canDragY(draggable) {
		  return draggable.props.axis === 'both' || draggable.props.axis === 'y';
		}
		
		// Get {clientX, clientY} positions from event.
		
		function getControlPosition(e) {
		  var position = e.targetTouches && e.targetTouches[0] || e;
		  return {
		    clientX: position.clientX,
		    clientY: position.clientY
		  };
		}

	/***/ },
	/* 10 */
	/***/ function(module, exports, __webpack_require__) {

		'use strict';
		
		Object.defineProperty(exports, '__esModule', {
		  value: true
		});
		
		var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();
		
		var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
		
		var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
		
		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
		
		function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
		
		function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
		
		var _react = __webpack_require__(2);
		
		var _react2 = _interopRequireDefault(_react);
		
		var _utilsDomFns = __webpack_require__(6);
		
		var _utilsPositionFns = __webpack_require__(9);
		
		var _utilsShims = __webpack_require__(7);
		
		var _utilsLog = __webpack_require__(11);
		
		var _utilsLog2 = _interopRequireDefault(_utilsLog);
		
		// Simple abstraction for dragging events names.
		var eventsFor = {
		  touch: {
		    start: 'touchstart',
		    move: 'touchmove',
		    stop: 'touchend'
		  },
		  mouse: {
		    start: 'mousedown',
		    move: 'mousemove',
		    stop: 'mouseup'
		  }
		};
		
		// Default to mouse events.
		var dragEventFor = eventsFor.mouse;
		
		//
		// Define <DraggableCore>.
		//
		// <DraggableCore> is for advanced usage of <Draggable>. It maintains minimal internal state so it can
		// work well with libraries that require more control over the element.
		//
		
		var DraggableCore = (function (_React$Component) {
		  _inherits(DraggableCore, _React$Component);
		
		  function DraggableCore() {
		    var _this = this;
		
		    _classCallCheck(this, DraggableCore);
		
		    _get(Object.getPrototypeOf(DraggableCore.prototype), 'constructor', this).apply(this, arguments);
		
		    this.state = {
		      dragging: false,
		      // Used while dragging to determine deltas.
		      lastX: null, lastY: null
		    };
		
		    this.handleDragStart = function (e) {
		      // Make it possible to attach event handlers on top of this one.
		      _this.props.onMouseDown(e);
		
		      // Only accept left-clicks.
		      if (!_this.props.allowAnyClick && typeof e.button === 'number' && e.button !== 0) return false;
		
		      // Short circuit if handle or cancel prop was provided and selector doesn't match.
		      if (_this.props.disabled || _this.props.handle && !(0, _utilsDomFns.matchesSelector)(e.target, _this.props.handle) || _this.props.cancel && (0, _utilsDomFns.matchesSelector)(e.target, _this.props.cancel)) {
		        return;
		      }
		
		      // Set touch identifier in component state if this is a touch event. This allows us to
		      // distinguish between individual touches on multitouch screens by identifying which
		      // touchpoint was set to this element.
		      if (e.targetTouches) {
		        _this.setState({ touchIdentifier: e.targetTouches[0].identifier });
		      }
		
		      // Add a style to the body to disable user-select. This prevents text from
		      // being selected all over the page.
		      if (_this.props.enableUserSelectHack) (0, _utilsDomFns.addUserSelectStyles)();
		
		      // Get the current drag point from the event. This is used as the offset.
		
		      var _getControlPosition = (0, _utilsPositionFns.getControlPosition)(e);
		
		      var clientX = _getControlPosition.clientX;
		      var clientY = _getControlPosition.clientY;
		
		      // Create an event object with all the data parents need to make a decision here.
		      var coreEvent = (0, _utilsDomFns.createCoreEvent)(_this, clientX, clientY);
		
		      (0, _utilsLog2['default'])('DraggableCore: handleDragStart: %j', coreEvent.position);
		
		      // Call event handler. If it returns explicit false, cancel.
		      (0, _utilsLog2['default'])('calling', _this.props.onStart);
		      var shouldUpdate = _this.props.onStart(e, coreEvent);
		      if (shouldUpdate === false) return;
		
		      // Initiate dragging. Set the current x and y as offsets
		      // so we know how much we've moved during the drag. This allows us
		      // to drag elements around even if they have been moved, without issue.
		      _this.setState({
		        dragging: true,
		
		        lastX: clientX,
		        lastY: clientY,
		        // Stored so we can adjust our offset if scrolled.
		        scrollX: document.body.scrollLeft,
		        scrollY: document.body.scrollTop
		      });
		
		      // Translate el on page scroll.
		      (0, _utilsDomFns.addEvent)(document, 'scroll', _this.handleScroll);
		      // Add events to the document directly so we catch when the user's mouse/touch moves outside of
		      // this element. We use different events depending on whether or not we have detected that this
		      // is a touch-capable device.
		      (0, _utilsDomFns.addEvent)(document, dragEventFor.move, _this.handleDrag);
		      (0, _utilsDomFns.addEvent)(document, dragEventFor.stop, _this.handleDragStop);
		    };
		
		    this.handleDrag = function (e) {
		      // Return if this is a touch event, but not the correct one for this element
		      if (e.targetTouches && e.targetTouches[0].identifier !== _this.state.touchIdentifier) return;
		
		      var _getControlPosition2 = (0, _utilsPositionFns.getControlPosition)(e);
		
		      var clientX = _getControlPosition2.clientX;
		      var clientY = _getControlPosition2.clientY;
		
		      // Snap to grid if prop has been provided
		      if (Array.isArray(_this.props.grid)) {
		        var deltaX = clientX - _this.state.lastX,
		            deltaY = clientY - _this.state.lastY;
		
		        var _snapToGrid = (0, _utilsPositionFns.snapToGrid)(_this.props.grid, deltaX, deltaY);
		
		        var _snapToGrid2 = _slicedToArray(_snapToGrid, 2);
		
		        deltaX = _snapToGrid2[0];
		        deltaY = _snapToGrid2[1];
		
		        if (!deltaX && !deltaY) return; // skip useless drag
		        clientX = _this.state.lastX + deltaX, clientY = _this.state.lastY + deltaY;
		      }
		
		      var coreEvent = (0, _utilsDomFns.createCoreEvent)(_this, clientX, clientY);
		
		      (0, _utilsLog2['default'])('DraggableCore: handleDrag: %j', coreEvent.position);
		
		      // Call event handler. If it returns explicit false, trigger end.
		      var shouldUpdate = _this.props.onDrag(e, coreEvent);
		      if (shouldUpdate === false) {
		        _this.handleDragStop({});
		        return;
		      }
		
		      _this.setState({
		        lastX: clientX,
		        lastY: clientY
		      });
		    };
		
		    this.handleDragStop = function (e) {
		      if (!_this.state.dragging) return;
		
		      // Short circuit if this is not the correct touch event. `changedTouches` contains all
		      // touch points that have been removed from the surface.
		      if (e.changedTouches && e.changedTouches[0].identifier !== _this.state.touchIdentifier) return;
		
		      // Remove user-select hack
		      if (_this.props.enableUserSelectHack) (0, _utilsDomFns.removeUserSelectStyles)();
		
		      var _getControlPosition3 = (0, _utilsPositionFns.getControlPosition)(e);
		
		      var clientX = _getControlPosition3.clientX;
		      var clientY = _getControlPosition3.clientY;
		
		      var coreEvent = (0, _utilsDomFns.createCoreEvent)(_this, clientX, clientY);
		
		      (0, _utilsLog2['default'])('DraggableCore: handleDragStop: %j', coreEvent.position);
		
		      // Reset the el.
		      _this.setState({
		        dragging: false,
		        lastX: null,
		        lastY: null
		      });
		
		      // Call event handler
		      _this.props.onStop(e, coreEvent);
		
		      // Remove event handlers
		      (0, _utilsLog2['default'])('DraggableCore: Removing handlers');
		      (0, _utilsDomFns.removeEvent)(document, 'scroll', _this.handleScroll);
		      (0, _utilsDomFns.removeEvent)(document, dragEventFor.move, _this.handleDrag);
		      (0, _utilsDomFns.removeEvent)(document, dragEventFor.stop, _this.handleDragStop);
		    };
		
		    this.handleScroll = function (e) {
		      var s = _this.state,
		          x = document.body.scrollLeft,
		          y = document.body.scrollTop;
		
		      // Create the usual event, but make the scroll offset our deltas.
		      var coreEvent = (0, _utilsDomFns.createCoreEvent)(_this);
		      coreEvent.position.deltaX = x - s.scrollX;
		      coreEvent.position.deltaY = y - s.scrollY;
		
		      _this.setState({
		        lastX: s.lastX + coreEvent.position.deltaX,
		        lastY: s.lastY + coreEvent.position.deltaY
		      });
		
		      _this.props.onDrag(e, coreEvent);
		    };
		
		    this.onMouseDown = function (e) {
		      // HACK: Prevent 'ghost click' which happens 300ms after touchstart if the event isn't cancelled.
		      // We don't cancel the event on touchstart because of #37; we might want to make a scrollable item draggable.
		      // More on ghost clicks: http://ariatemplates.com/blog/2014/05/ghost-clicks-in-mobile-browsers/
		      if (dragEventFor === eventsFor.touch) {
		        return e.preventDefault();
		      }
		
		      return _this.handleDragStart(e);
		    };
		
		    this.onTouchStart = function (e) {
		      // We're on a touch device now, so change the event handlers
		      dragEventFor = eventsFor.touch;
		
		      return _this.handleDragStart(e);
		    };
		  }
		
		  _createClass(DraggableCore, [{
		    key: 'componentWillUnmount',
		    value: function componentWillUnmount() {
		      // Remove any leftover event handlers. Remove both touch and mouse handlers in case
		      // some browser quirk caused a touch event to fire during a mouse move, or vice versa.
		      (0, _utilsDomFns.removeEvent)(document, eventsFor.mouse.move, this.handleDrag);
		      (0, _utilsDomFns.removeEvent)(document, eventsFor.touch.move, this.handleDrag);
		      (0, _utilsDomFns.removeEvent)(document, eventsFor.mouse.stop, this.handleDragStop);
		      (0, _utilsDomFns.removeEvent)(document, eventsFor.touch.stop, this.handleDragStop);
		      (0, _utilsDomFns.removeEvent)(document, 'scroll', this.handleScroll);
		      if (this.props.enableUserSelectHack) (0, _utilsDomFns.removeUserSelectStyles)();
		    }
		  }, {
		    key: 'render',
		    value: function render() {
		      // Reuse the child provided
		      // This makes it flexible to use whatever element is wanted (div, ul, etc)
		      return _react2['default'].cloneElement(_react2['default'].Children.only(this.props.children), {
		        style: (0, _utilsDomFns.styleHacks)(this.props.children.props.style),
		
		        // Note: mouseMove handler is attached to document so it will still function
		        // when the user drags quickly and leaves the bounds of the element.
		        onMouseDown: this.onMouseDown,
		        onTouchStart: this.onTouchStart,
		        onMouseUp: this.handleDragStop,
		        onTouchEnd: this.handleDragStop
		      });
		    }
		  }], [{
		    key: 'displayName',
		    value: 'DraggableCore',
		    enumerable: true
		  }, {
		    key: 'propTypes',
		    value: {
		      /**
		       * `allowAnyClick` allows dragging using any mouse button.
		       * By default, we only accept the left button.
		       *
		       * Defaults to `false`.
		       */
		      allowAnyClick: _react.PropTypes.bool,
		
		      /**
		       * `disabled`, if true, stops the <Draggable> from dragging. All handlers,
		       * with the exception of `onMouseDown`, will not fire.
		       *
		       * Example:
		       *
		       * ```jsx
		       *   let App = React.createClass({
		       *       render: function () {
		       *           return (
		       *               <Draggable disabled={true}>
		       *                   <div>I can't be dragged</div>
		       *               </Draggable>
		       *           );
		       *       }
		       *   });
		       * ```
		       */
		      disabled: _react.PropTypes.bool,
		
		      /**
		       * By default, we add 'user-select:none' attributes to the document body
		       * to prevent ugly text selection during drag. If this is causing problems
		       * for your app, set this to `false`.
		       */
		      enableUserSelectHack: _react.PropTypes.bool,
		
		      /**
		       * `grid` specifies the x and y that dragging should snap to.
		       *
		       * Example:
		       *
		       * ```jsx
		       *   let App = React.createClass({
		       *       render: function () {
		       *           return (
		       *               <Draggable grid={[25, 25]}>
		       *                   <div>I snap to a 25 x 25 grid</div>
		       *               </Draggable>
		       *           );
		       *       }
		       *   });
		       * ```
		       */
		      grid: _react.PropTypes.arrayOf(_react.PropTypes.number),
		
		      /**
		       * `handle` specifies a selector to be used as the handle that initiates drag.
		       *
		       * Example:
		       *
		       * ```jsx
		       *   let App = React.createClass({
		       *       render: function () {
		       *         return (
		       *            <Draggable handle=".handle">
		       *              <div>
		       *                  <div className="handle">Click me to drag</div>
		       *                  <div>This is some other content</div>
		       *              </div>
		       *           </Draggable>
		       *         );
		       *       }
		       *   });
		       * ```
		       */
		      handle: _react.PropTypes.string,
		
		      /**
		       * `cancel` specifies a selector to be used to prevent drag initialization.
		       *
		       * Example:
		       *
		       * ```jsx
		       *   let App = React.createClass({
		       *       render: function () {
		       *           return(
		       *               <Draggable cancel=".cancel">
		       *                   <div>
		       *                     <div className="cancel">You can't drag from here</div>
		       *            <div>Dragging here works fine</div>
		       *                   </div>
		       *               </Draggable>
		       *           );
		       *       }
		       *   });
		       * ```
		       */
		      cancel: _react.PropTypes.string,
		
		      /**
		       * Called when dragging starts.
		       * If this function returns the boolean false, dragging will be canceled.
		       *
		       * Example:
		       *
		       * ```js
		       *  function (event, ui) {}
		       * ```
		       *
		       * `event` is the Event that was triggered.
		       * `ui` is an object:
		       *
		       * ```js
		       *  {
		       *    position: {top: 0, left: 0}
		       *  }
		       * ```
		       */
		      onStart: _react.PropTypes.func,
		
		      /**
		       * Called while dragging.
		       * If this function returns the boolean false, dragging will be canceled.
		       *
		       * Example:
		       *
		       * ```js
		       *  function (event, ui) {}
		       * ```
		       *
		       * `event` is the Event that was triggered.
		       * `ui` is an object:
		       *
		       * ```js
		       *  {
		       *    position: {top: 0, left: 0}
		       *  }
		       * ```
		       */
		      onDrag: _react.PropTypes.func,
		
		      /**
		       * Called when dragging stops.
		       *
		       * Example:
		       *
		       * ```js
		       *  function (event, ui) {}
		       * ```
		       *
		       * `event` is the Event that was triggered.
		       * `ui` is an object:
		       *
		       * ```js
		       *  {
		       *    position: {top: 0, left: 0}
		       *  }
		       * ```
		       */
		      onStop: _react.PropTypes.func,
		
		      /**
		       * A workaround option which can be passed if onMouseDown needs to be accessed,
		       * since it'll always be blocked (due to that there's internal use of onMouseDown)
		       */
		      onMouseDown: _react.PropTypes.func,
		
		      /**
		       * These properties should be defined on the child, not here.
		       */
		      className: _utilsShims.dontSetMe,
		      style: _utilsShims.dontSetMe,
		      transform: _utilsShims.dontSetMe
		    },
		    enumerable: true
		  }, {
		    key: 'defaultProps',
		    value: {
		      allowAnyClick: false, // by default only accept left click
		      cancel: null,
		      disabled: false,
		      enableUserSelectHack: true,
		      handle: null,
		      grid: null,
		      transform: null,
		      onStart: function onStart() {},
		      onDrag: function onDrag() {},
		      onStop: function onStop() {},
		      onMouseDown: function onMouseDown() {}
		    },
		    enumerable: true
		  }]);
		
		  return DraggableCore;
		})(_react2['default'].Component);
		
		exports['default'] = DraggableCore;
		module.exports = exports['default'];

		// When the user scrolls, adjust internal state so the draggable moves along the page properly.
		// This only fires when a drag is active.

		// On mousedown, consider the drag started.

		// Same as onMouseDown (start drag), but now consider this a touch device.

	/***/ },
	/* 11 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";
		
		Object.defineProperty(exports, "__esModule", {
		  value: true
		});
		exports["default"] = log;
		
		function log() {
		  if ((undefined)) console.log.apply(console, arguments);
		}
		
		module.exports = exports["default"];

	/***/ }
	/******/ ])
	});
	;
	//# sourceMappingURL=react-draggable.js.map

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_18__;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	module.exports = function() {
	  throw new Error("Don't instantiate Resizable directly! Use require('react-resizable').Resizable");
	};

	module.exports.Resizable = __webpack_require__(20);
	module.exports.ResizableBox = __webpack_require__(23);


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _reactDraggable = __webpack_require__(17);

	var _objectAssign = __webpack_require__(21);

	var _objectAssign2 = _interopRequireDefault(_objectAssign);

	var _cloneElement = __webpack_require__(22);

	var _cloneElement2 = _interopRequireDefault(_cloneElement);

	var Resizable = (function (_React$Component) {
	  _inherits(Resizable, _React$Component);

	  function Resizable() {
	    _classCallCheck(this, Resizable);

	    _get(Object.getPrototypeOf(Resizable.prototype), 'constructor', this).apply(this, arguments);

	    this.state = {
	      bounds: this.constraintsToBounds(),
	      width: this.props.width,
	      height: this.props.height
	    };
	  }

	  _createClass(Resizable, [{
	    key: 'componentWillReceiveProps',
	    value: function componentWillReceiveProps(props) {
	      if (!this.state.resizing) {
	        this.setState({
	          width: props.width,
	          height: props.height,
	          bounds: this.constraintsToBounds()
	        });
	      }
	    }
	  }, {
	    key: 'constraintsToBounds',
	    value: function constraintsToBounds() {
	      var p = this.props;
	      var mins = p.minConstraints || p.handleSize;
	      var maxes = p.maxConstraints || [Infinity, Infinity];
	      return {
	        left: mins[0] - p.width,
	        top: mins[1] - p.height,
	        right: maxes[0] - p.width,
	        bottom: maxes[1] - p.height
	      };
	    }

	    /**
	     * Wrapper around drag events to provide more useful data.
	     *
	     * @param  {String} handlerName Handler name to wrap.
	     * @return {Function}           Handler function.
	     */
	  }, {
	    key: 'resizeHandler',
	    value: function resizeHandler(handlerName) {
	      var _this = this;

	      return function (e, _ref) {
	        var node = _ref.node;
	        var position = _ref.position;

	        var width = _this.state.width + position.deltaX,
	            height = _this.state.height + position.deltaY;
	        _this.props[handlerName] && _this.props[handlerName](e, { node: node, size: { width: width, height: height } });

	        if (handlerName === 'onResizeStart') {
	          _this.setState({ resizing: true });
	        } else if (handlerName === 'onResizeStop') {
	          _this.setState({ resizing: false });
	        } else {
	          _this.setState({ width: width, height: height });
	        }
	      };
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var p = this.props;

	      // What we're doing here is getting the child of this element, and cloning it with this element's props.
	      // We are then defining its children as:
	      // Its original children (resizable's child's children), and
	      // A draggable handle.
	      return (0, _cloneElement2['default'])(p.children, (0, _objectAssign2['default'])({}, p, {
	        children: [p.children.props.children, _react2['default'].createElement(
	          _reactDraggable.DraggableCore,
	          _extends({}, p.draggableOpts, {
	            ref: 'draggable',
	            onStop: this.resizeHandler('onResizeStop'),
	            onStart: this.resizeHandler('onResizeStart'),
	            onDrag: this.resizeHandler('onResize'),
	            bounds: this.state.bounds
	          }),
	          _react2['default'].createElement('span', { className: 'react-resizable-handle' })
	        )]
	      }));
	    }
	  }], [{
	    key: 'propTypes',
	    value: {
	      //
	      // Required Props
	      //

	      // Require that one and only one child be present.
	      children: _react.PropTypes.element.isRequired,

	      // Initial w/h
	      width: _react.PropTypes.number.isRequired,
	      height: _react.PropTypes.number.isRequired,

	      //
	      // Optional props
	      //

	      // If you change this, be sure to update your css
	      handleSize: _react.PropTypes.array,

	      // Min/max size
	      minConstraints: _react.PropTypes.arrayOf(_react.PropTypes.number),
	      maxConstraints: _react.PropTypes.arrayOf(_react.PropTypes.number),

	      // Callbacks
	      onResizeStop: _react.PropTypes.func,
	      onResizeStart: _react.PropTypes.func,
	      onResize: _react.PropTypes.func,

	      // These will be passed wholesale to react-draggable's DraggableCore
	      draggableOpts: _react.PropTypes.object
	    },
	    enumerable: true
	  }, {
	    key: 'defaultProps',
	    value: {
	      handleSize: [20, 20]
	    },
	    enumerable: true
	  }]);

	  return Resizable;
	})(_react2['default'].Component);

	exports['default'] = Resizable;
	module.exports = exports['default'];

/***/ },
/* 21 */
/***/ function(module, exports) {

	/* eslint-disable no-unused-vars */
	'use strict';
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	module.exports = Object.assign || function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _objectAssign = __webpack_require__(21);

	var _objectAssign2 = _interopRequireDefault(_objectAssign);

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	// React.addons.cloneWithProps look-alike that merges style & className.
	module.exports = function cloneElement(element, props) {
	  if (props.style && element.props.style) {
	    props.style = (0, _objectAssign2['default'])({}, element.props.style, props.style);
	  }
	  if (props.className && element.props.className) {
	    props.className = element.props.className + ' ' + props.className;
	  }
	  return _react2['default'].cloneElement(element, props);
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _Resizable = __webpack_require__(20);

	var _Resizable2 = _interopRequireDefault(_Resizable);

	// An example use of Resizable.

	var ResizableBox = (function (_React$Component) {
	  _inherits(ResizableBox, _React$Component);

	  function ResizableBox() {
	    var _this = this;

	    _classCallCheck(this, ResizableBox);

	    _get(Object.getPrototypeOf(ResizableBox.prototype), 'constructor', this).apply(this, arguments);

	    this.state = {
	      width: this.props.width,
	      height: this.props.height,
	      aspectRatio: this.props.width / this.props.height
	    };

	    this.onResize = function (event, data) {
	      var element = data.element;
	      var size = data.size;
	      var width = size.width;
	      var height = size.height;

	      var widthChanged = width !== _this.state.width,
	          heightChanged = height !== _this.state.height;
	      if (!widthChanged && !heightChanged) return;

	      var _runConstraints = _this.runConstraints(width, height);

	      var _runConstraints2 = _slicedToArray(_runConstraints, 2);

	      width = _runConstraints2[0];
	      height = _runConstraints2[1];

	      _this.setState({ width: width, height: height }, function () {
	        if (_this.props.onResize) {
	          _this.props.onResize(event, { element: element, size: { width: width, height: height } });
	        }
	      });
	    };
	  }

	  _createClass(ResizableBox, [{
	    key: 'runConstraints',

	    // If you do this, be careful of constraints
	    value: function runConstraints(width, height) {
	      var min = this.props.minConstraints;
	      var max = this.props.maxConstraints;

	      if (this.props.lockAspectRatio) {
	        height = width / this.state.aspectRatio;
	        width = height * this.state.aspectRatio;
	      }

	      if (min) {
	        width = Math.max(min[0], width);
	        height = Math.max(min[1], height);
	      }
	      if (max) {
	        width = Math.min(max[0], width);
	        height = Math.min(max[1], height);
	      }
	      return [width, height];
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      // Basic wrapper around a Resizable instance.
	      // If you use Resizable directly, you are responsible for updating the component
	      // with a new width and height.
	      var _props = this.props;
	      var handleSize = _props.handleSize;
	      var minConstraints = _props.minConstraints;
	      var maxConstraints = _props.maxConstraints;

	      var props = _objectWithoutProperties(_props, ['handleSize', 'minConstraints', 'maxConstraints']);

	      return _react2['default'].createElement(
	        _Resizable2['default'],
	        {
	          minConstraints: minConstraints,
	          maxConstraints: maxConstraints,
	          handleSize: handleSize,
	          width: this.state.width,
	          height: this.state.height,
	          onResizeStart: this.props.onResizeStart,
	          onResize: this.onResize,
	          onResizeStop: this.props.onResizeStop,
	          draggableOpts: this.props.draggableOpts
	        },
	        _react2['default'].createElement(
	          'div',
	          _extends({ style: { width: this.state.width + 'px', height: this.state.height + 'px' } }, props),
	          this.props.children
	        )
	      );
	    }
	  }], [{
	    key: 'propTypes',
	    value: {
	      lockAspectRatio: _react.PropTypes.bool,
	      minConstraints: _react.PropTypes.arrayOf(_react.PropTypes.number),
	      maxConstraints: _react.PropTypes.arrayOf(_react.PropTypes.number),
	      height: _react.PropTypes.number,
	      width: _react.PropTypes.number
	    },
	    enumerable: true
	  }, {
	    key: 'defaultProps',
	    value: {
	      lockAspectRatio: false,
	      handleSize: [20, 20]
	    },
	    enumerable: true
	  }]);

	  return ResizableBox;
	})(_react2['default'].Component);

	exports['default'] = ResizableBox;
	module.exports = exports['default'];

	// TODO data is ResizeData type, but that doesn't work in babel-typecheck pre-babel6

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _lodashIsequal = __webpack_require__(3);

	var _lodashIsequal2 = _interopRequireDefault(_lodashIsequal);

	var _lodashForeach = __webpack_require__(25);

	var _lodashForeach2 = _interopRequireDefault(_lodashForeach);

	var _utils = __webpack_require__(10);

	var _responsiveUtils = __webpack_require__(27);

	var _ReactGridLayout = __webpack_require__(1);

	var _ReactGridLayout2 = _interopRequireDefault(_ReactGridLayout);

	var ResponsiveReactGridLayout = (function (_React$Component) {
	  _inherits(ResponsiveReactGridLayout, _React$Component);

	  function ResponsiveReactGridLayout() {
	    _classCallCheck(this, ResponsiveReactGridLayout);

	    _get(Object.getPrototypeOf(ResponsiveReactGridLayout.prototype), 'constructor', this).apply(this, arguments);
	  }

	  _createClass(ResponsiveReactGridLayout, [{
	    key: 'componentWillMount',
	    value: function componentWillMount() {
	      var _props = this.props;
	      var width = _props.width;
	      var breakpoints = _props.breakpoints;
	      var layouts = _props.layouts;
	      var verticalCompact = _props.verticalCompact;
	      var cols = _props.cols;

	      var breakpoint = (0, _responsiveUtils.getBreakpointFromWidth)(breakpoints, width);
	      var colNo = (0, _responsiveUtils.getColsFromBreakpoint)(breakpoint, cols);
	      // Get the initial layout. This can tricky; we try to generate one however possible if one doesn't exist
	      // for this layout.
	      var initialLayout = (0, _responsiveUtils.findOrGenerateResponsiveLayout)(layouts, breakpoints, breakpoint, breakpoint, colNo, verticalCompact);

	      this.setState({
	        layout: initialLayout,
	        breakpoint: breakpoint,
	        cols: colNo
	      });
	    }
	  }, {
	    key: 'componentWillReceiveProps',
	    value: function componentWillReceiveProps(nextProps) {

	      if (nextProps.width != this.props.width) {
	        var newBreakpoint = nextProps.breakpoint || (0, _responsiveUtils.getBreakpointFromWidth)(nextProps.breakpoints, nextProps.width);
	        this.onWidthChange(nextProps.width, newBreakpoint);
	      }

	      // Allow parent to set breakpoint directly.
	      if (nextProps.breakpoint !== this.props.breakpoint) {
	        this.onWidthChange(nextProps.width, nextProps.breakpoint);
	      }

	      // Allow parent to set layouts directly.
	      if (!(0, _lodashIsequal2['default'])(nextProps.layouts, this.props.layouts)) {
	        var _state = this.state;
	        var breakpoint = _state.breakpoint;
	        var cols = _state.cols;

	        // Since we're setting an entirely new layout object, we must generate a new responsive layout
	        // if one does not exist.
	        var newLayout = (0, _responsiveUtils.findOrGenerateResponsiveLayout)(nextProps.layouts, nextProps.breakpoints, breakpoint, breakpoint, cols, nextProps.verticalLayout);
	        this.setState({ layout: newLayout });
	      }
	    }

	    /**
	     * When the width changes work through breakpoints and reset state with the new width & breakpoint.
	     * Width changes are necessary to figure out the widget widths.
	     */
	  }, {
	    key: 'onWidthChange',
	    value: function onWidthChange(width, breakpoint) {
	      var _props2 = this.props;
	      var breakpoints = _props2.breakpoints;
	      var verticalLayout = _props2.verticalLayout;
	      var verticalCompact = _props2.verticalCompact;
	      var cols = _props2.cols;

	      var colNo = (0, _responsiveUtils.getColsFromBreakpoint)(breakpoint, cols);

	      // Store the current layout
	      var layouts = this.props.layouts;
	      layouts[breakpoint] = JSON.parse(JSON.stringify(this.state.layout));

	      // Find or generate a new one.
	      var layout = (0, _responsiveUtils.findOrGenerateResponsiveLayout)(layouts, breakpoints, breakpoint, breakpoint, colNo, verticalLayout);

	      // This adds missing items.
	      layout = (0, _utils.synchronizeLayoutWithChildren)(layout, this.props.children, colNo, verticalCompact);

	      // Store this new layout as well.
	      layouts[breakpoint] = layout;

	      // callbacks
	      this.props.onLayoutChange(layout, layouts);
	      this.props.onBreakpointChange(breakpoint, colNo);
	      this.props.onWidthChange(width, this.props.margin, colNo);

	      this.setState({ breakpoint: breakpoint, layout: layout, cols: colNo });
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var _props3 = this.props;
	      var breakpoint = _props3.breakpoint;
	      var breakpoints = _props3.breakpoints;
	      var cols = _props3.cols;
	      var onBreakpointChange = _props3.onBreakpointChange;
	      var onLayoutChange = _props3.onLayoutChange;
	      var onWidthChange = _props3.onWidthChange;

	      var other = _objectWithoutProperties(_props3, ['breakpoint', 'breakpoints', 'cols', 'onBreakpointChange', 'onLayoutChange', 'onWidthChange']);

	      return _react2['default'].createElement(_ReactGridLayout2['default'], _extends({}, other, { layout: this.state.layout, cols: this.state.cols }));
	    }
	  }]);

	  return ResponsiveReactGridLayout;
	})(_react2['default'].Component);

	ResponsiveReactGridLayout.displayName = 'ResponsiveReactGridLayout';

	ResponsiveReactGridLayout.propTypes = {
	  //
	  // Basic props
	  //

	  // Optional, but if you are managing width yourself you may want to set the breakpoint
	  // yourself as well.
	  breakpoint: _react2['default'].PropTypes.string,

	  // {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
	  breakpoints: _react2['default'].PropTypes.object,

	  // # of cols. This is a breakpoint -> cols map
	  cols: _react2['default'].PropTypes.object,

	  // layouts is an object mapping breakpoints to layouts.
	  // e.g. {lg: Layout, md: Layout, ...}
	  layouts: function layouts(props) {
	    _react2['default'].PropTypes.object.isRequired.apply(this, arguments);
	    (0, _lodashForeach2['default'])(props.layouts, function (layout, key) {
	      return (0, _utils.validateLayout)(layout, 'layouts.' + key);
	    });
	  },
	  width: _react2['default'].PropTypes.number.isRequired,
	  offsetY: _react2['default'].PropTypes.number.isRequired,
	  offsetX: _react2['default'].PropTypes.number.isRequired,

	  //
	  // Callbacks
	  //

	  // Calls back with breakpoint and new # cols
	  onBreakpointChange: _react2['default'].PropTypes.func,

	  // Callback so you can save the layout.
	  // Calls back with (currentLayout, allLayouts). allLayouts are keyed by breakpoint.
	  onLayoutChange: _react2['default'].PropTypes.func,

	  // Calls back with (containerWidth, margin, cols)
	  onWidthChange: _react2['default'].PropTypes.func
	};

	ResponsiveReactGridLayout.defaultProps = {
	  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
	  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
	  layouts: {},
	  onBreakpointChange: function onBreakpointChange() {},
	  onLayoutChange: function onLayoutChange() {},
	  onWidthChange: function onWidthChange() {}
	};

	exports['default'] = ResponsiveReactGridLayout;
	module.exports = exports['default'];

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * lodash 4.0.0 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	var arrayEach = __webpack_require__(12),
	    baseEach = __webpack_require__(26);

	/**
	 * Converts `value` to a function if it's not one.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {Function} Returns the function.
	 */
	function toFunction(value) {
	  return typeof value == 'function' ? value : identity;
	}

	/**
	 * Iterates over elements of `collection` invoking `iteratee` for each element.
	 * The iteratee is invoked with three arguments: (value, index|key, collection).
	 * Iteratee functions may exit iteration early by explicitly returning `false`.
	 *
	 * **Note:** As with other "Collections" methods, objects with a "length" property
	 * are iterated like arrays. To avoid this behavior use `_.forIn` or `_.forOwn`
	 * for object iteration.
	 *
	 * @static
	 * @memberOf _
	 * @alias each
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @returns {Array|Object} Returns `collection`.
	 * @example
	 *
	 * _([1, 2]).forEach(function(value) {
	 *   console.log(value);
	 * });
	 * // => logs `1` then `2`
	 *
	 * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
	 *   console.log(key);
	 * });
	 * // => logs 'a' then 'b' (iteration order is not guaranteed)
	 */
	function forEach(collection, iteratee) {
	  return (typeof iteratee == 'function' && isArray(collection))
	    ? arrayEach(collection, iteratee)
	    : baseEach(collection, toFunction(iteratee));
	}

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @type Function
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	/**
	 * This method returns the first argument provided to it.
	 *
	 * @static
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * _.identity(object) === object;
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = forEach;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * lodash 4.0.1 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	var keys = __webpack_require__(9);

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/** `Object#toString` result references. */
	var funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/**
	 * The base implementation of `_.forEach` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object} Returns `collection`.
	 */
	var baseEach = createBaseEach(baseForOwn);

	/**
	 * The base implementation of `baseForIn` and `baseForOwn` which iterates
	 * over `object` properties returned by `keysFunc` invoking `iteratee` for
	 * each property. Iteratee functions may exit iteration early by explicitly
	 * returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = createBaseFor();

	/**
	 * The base implementation of `_.forOwn` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return object && baseFor(object, iteratee, keys);
	}

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	/**
	 * Creates a `baseEach` or `baseEachRight` function.
	 *
	 * @private
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseEach(eachFunc, fromRight) {
	  return function(collection, iteratee) {
	    if (collection == null) {
	      return collection;
	    }
	    if (!isArrayLike(collection)) {
	      return eachFunc(collection, iteratee);
	    }
	    var length = collection.length,
	        index = fromRight ? length : -1,
	        iterable = Object(collection);

	    while ((fromRight ? index-- : ++index < length)) {
	      if (iteratee(iterable[index], index, iterable) === false) {
	        break;
	      }
	    }
	    return collection;
	  };
	}

	/**
	 * Creates a base function for methods like `_.forIn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var index = -1,
	        iterable = Object(object),
	        props = keysFunc(object),
	        length = props.length;

	    while (length--) {
	      var key = props[fromRight ? length : ++index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}

	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @type Function
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null &&
	    !(typeof value == 'function' && isFunction(value)) && isLength(getLength(value));
	}

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8 which returns 'object' for typed array constructors, and
	  // PhantomJS 1.9 which returns 'function' for `NodeList` instances.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is loosely based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	module.exports = baseEach;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.getBreakpointFromWidth = getBreakpointFromWidth;
	exports.getColsFromBreakpoint = getColsFromBreakpoint;
	exports.findOrGenerateResponsiveLayout = findOrGenerateResponsiveLayout;
	exports.sortBreakpoints = sortBreakpoints;

	var _utils = __webpack_require__(10);

	/**
	 * Given a width, find the highest breakpoint that matches is valid for it (width > breakpoint).
	 *
	 * @param  {Object} breakpoints Breakpoints object (e.g. {lg: 1200, md: 960, ...})
	 * @param  {Number} width Screen width.
	 * @return {String}       Highest breakpoint that is less than width.
	 */

	function getBreakpointFromWidth(breakpoints, width) {
	  var sorted = sortBreakpoints(breakpoints);
	  var matching = sorted[0];
	  for (var i = 1, len = sorted.length; i < len; i++) {
	    var breakpointName = sorted[i];
	    if (width > breakpoints[breakpointName]) matching = breakpointName;
	  }
	  return matching;
	}

	/**
	 * Given a breakpoint, get the # of cols set for it.
	 * @param  {String} breakpoint Breakpoint name.
	 * @param  {Object} cols       Map of breakpoints to cols.
	 * @return {Number}            Number of cols.
	 */

	function getColsFromBreakpoint(breakpoint, cols) {
	  if (!cols[breakpoint]) {
	    throw new Error("ResponsiveReactGridLayout: `cols` entry for breakpoint " + breakpoint + " is missing!");
	  }
	  return cols[breakpoint];
	}

	/**
	 * Given existing layouts and a new breakpoint, find or generate a new layout.
	 *
	 * This finds the layout above the new one and generates from it, if it exists.
	 *
	 * @param  {Object} layouts     Existing layouts.
	 * @param  {Array} breakpoints All breakpoints.
	 * @param  {String} breakpoint New breakpoint.
	 * @param  {String} breakpoint Last breakpoint (for fallback).
	 * @param  {Number} cols       Column count at new breakpoint.
	 * @param  {Boolean} verticalCompact Whether or not to compact the layout
	 *   vertically.
	 * @return {Array}             New layout.
	 */

	function findOrGenerateResponsiveLayout(layouts, breakpoints, breakpoint, lastBreakpoint, cols, verticalCompact) {
	  // If it already exists, just return it.
	  if (layouts[breakpoint]) return layouts[breakpoint];
	  // Find or generate the next layout
	  var layout = layouts[lastBreakpoint];
	  var breakpointsSorted = sortBreakpoints(breakpoints);
	  var breakpointsAbove = breakpointsSorted.slice(breakpointsSorted.indexOf(breakpoint));
	  for (var i = 0, len = breakpointsAbove.length; i < len; i++) {
	    var b = breakpointsAbove[i];
	    if (layouts[b]) {
	      layout = layouts[b];
	      break;
	    }
	  }
	  layout = JSON.parse(JSON.stringify(layout || [])); // clone layout so we don't modify existing items
	  return (0, _utils.compact)((0, _utils.correctBounds)(layout, { cols: cols }), verticalCompact);
	}

	/**
	 * Given breakpoints, return an array of breakpoints sorted by width. This is usually
	 * e.g. ['xxs', 'xs', 'sm', ...]
	 *
	 * @param  {Object} breakpoints Key/value pair of breakpoint names to widths.
	 * @return {Array}              Sorted breakpoints.
	 */

	function sortBreakpoints(breakpoints) {
	  var keys = Object.keys(breakpoints);
	  return keys.sort(function (a, b) {
	    return breakpoints[a] - breakpoints[b];
	  });
	}

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(18);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	/*
	 * A simple HOC that provides facility for listening to container resizes.
	 */

	exports['default'] = function (ComposedComponent) {
	  return (function (_React$Component) {
	    _inherits(_class, _React$Component);

	    function _class() {
	      _classCallCheck(this, _class);

	      _get(Object.getPrototypeOf(_class.prototype), 'constructor', this).call(this);
	      this.state = {
	        width: 1280,
	        offsetY: 0,
	        offsetX: 0
	      };
	    }

	    _createClass(_class, [{
	      key: 'componentDidMount',
	      value: function componentDidMount() {
	        var _this = this;

	        var node = _reactDom2['default'].findDOMNode(this);
	        window.addEventListener('resize', function () {
	          return _this.onWindowResize(node);
	        });
	        // This is intentional. Once to properly set the breakpoint and resize the elements,
	        // and again to compensate for any scrollbar that appeared because of the first step.
	        this.onWindowResize(node);
	        this.onWindowResize(node);
	      }
	    }, {
	      key: 'componentWillUnmount',
	      value: function componentWillUnmount() {
	        window.removeEventListener('resize', this.onWindowResize);
	      }
	    }, {
	      key: 'onWindowResize',
	      value: function onWindowResize(node) {
	        var _node$getBoundingClientRect = node.getBoundingClientRect();

	        var top = _node$getBoundingClientRect.top;
	        var left = _node$getBoundingClientRect.left;
	        var width = _node$getBoundingClientRect.width;

	        this.setState({ offsetY: top, offsetX: left, width: width });
	      }
	    }, {
	      key: 'render',
	      value: function render() {
	        return _react2['default'].createElement(ComposedComponent, _extends({}, this.props, this.state));
	      }
	    }]);

	    return _class;
	  })(_react2['default'].Component);
	};

	module.exports = exports['default'];

/***/ }
/******/ ])
});
;