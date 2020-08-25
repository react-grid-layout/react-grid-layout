/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"14-toolbox": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// script path function
/******/ 	function jsonpScriptSrc(chunkId) {
/******/ 		return __webpack_require__.p + "" + ({}[chunkId]||chunkId) + ".js"
/******/ 	}
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId) {
/******/ 		var promises = [];
/******/
/******/
/******/ 		// JSONP chunk loading for javascript
/******/
/******/ 		var installedChunkData = installedChunks[chunkId];
/******/ 		if(installedChunkData !== 0) { // 0 means "already installed".
/******/
/******/ 			// a Promise means "currently loading".
/******/ 			if(installedChunkData) {
/******/ 				promises.push(installedChunkData[2]);
/******/ 			} else {
/******/ 				// setup Promise in chunk cache
/******/ 				var promise = new Promise(function(resolve, reject) {
/******/ 					installedChunkData = installedChunks[chunkId] = [resolve, reject];
/******/ 				});
/******/ 				promises.push(installedChunkData[2] = promise);
/******/
/******/ 				// start chunk loading
/******/ 				var script = document.createElement('script');
/******/ 				var onScriptComplete;
/******/
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.src = jsonpScriptSrc(chunkId);
/******/
/******/ 				// create error before stack unwound to get useful stacktrace later
/******/ 				var error = new Error();
/******/ 				onScriptComplete = function (event) {
/******/ 					// avoid mem leaks in IE.
/******/ 					script.onerror = script.onload = null;
/******/ 					clearTimeout(timeout);
/******/ 					var chunk = installedChunks[chunkId];
/******/ 					if(chunk !== 0) {
/******/ 						if(chunk) {
/******/ 							var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 							var realSrc = event && event.target && event.target.src;
/******/ 							error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 							error.name = 'ChunkLoadError';
/******/ 							error.type = errorType;
/******/ 							error.request = realSrc;
/******/ 							chunk[1](error);
/******/ 						}
/******/ 						installedChunks[chunkId] = undefined;
/******/ 					}
/******/ 				};
/******/ 				var timeout = setTimeout(function(){
/******/ 					onScriptComplete({ type: 'timeout', target: script });
/******/ 				}, 120000);
/******/ 				script.onerror = script.onload = onScriptComplete;
/******/ 				document.head.appendChild(script);
/******/ 			}
/******/ 		}
/******/ 		return Promise.all(promises);
/******/ 	};
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// on error function for async loading
/******/ 	__webpack_require__.oe = function(err) { console.error(err); throw err; };
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push(["./test/examples/14-toolbox.jsx","commons"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./test/examples/14-toolbox.jsx":
/*!**************************************!*\
  !*** ./test/examples/14-toolbox.jsx ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return ToolboxLayout; });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ \"./node_modules/lodash/lodash.js\");\n/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var react_grid_layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-grid-layout */ \"./index-dev.js\");\n/* harmony import */ var react_grid_layout__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_grid_layout__WEBPACK_IMPORTED_MODULE_2__);\nfunction _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }\n\nfunction _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }\n\nfunction _nonIterableSpread() { throw new TypeError(\"Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\"); }\n\nfunction _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === \"string\") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === \"Object\" && o.constructor) n = o.constructor.name; if (n === \"Map\" || n === \"Set\") return Array.from(o); if (n === \"Arguments\" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }\n\nfunction _iterableToArray(iter) { if (typeof Symbol !== \"undefined\" && Symbol.iterator in Object(iter)) return Array.from(iter); }\n\nfunction _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }\n\nfunction _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }\n\nfunction ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }\n\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\nfunction _typeof(obj) { \"@babel/helpers - typeof\"; if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }\n\nfunction _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }\n\nfunction _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }\n\nfunction _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \"object\" || typeof call === \"function\")) { return call; } return _assertThisInitialized(self); }\n\nfunction _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return self; }\n\nfunction _isNativeReflectConstruct() { if (typeof Reflect === \"undefined\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \"function\") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }\n\nfunction _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }\n\n\n\n\nvar ResponsiveReactGridLayout = Object(react_grid_layout__WEBPACK_IMPORTED_MODULE_2__[\"WidthProvider\"])(react_grid_layout__WEBPACK_IMPORTED_MODULE_2__[\"Responsive\"]);\n\nvar ToolBoxItem = /*#__PURE__*/function (_React$Component) {\n  _inherits(ToolBoxItem, _React$Component);\n\n  var _super = _createSuper(ToolBoxItem);\n\n  function ToolBoxItem() {\n    _classCallCheck(this, ToolBoxItem);\n\n    return _super.apply(this, arguments);\n  }\n\n  _createClass(ToolBoxItem, [{\n    key: \"render\",\n    value: function render() {\n      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: \"toolbox__items__item\",\n        onClick: this.props.onTakeItem.bind(undefined, this.props.item)\n      }, this.props.item.i);\n    }\n  }]);\n\n  return ToolBoxItem;\n}(react__WEBPACK_IMPORTED_MODULE_0___default.a.Component);\n\nvar ToolBox = /*#__PURE__*/function (_React$Component2) {\n  _inherits(ToolBox, _React$Component2);\n\n  var _super2 = _createSuper(ToolBox);\n\n  function ToolBox() {\n    _classCallCheck(this, ToolBox);\n\n    return _super2.apply(this, arguments);\n  }\n\n  _createClass(ToolBox, [{\n    key: \"render\",\n    value: function render() {\n      var _this = this;\n\n      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: \"toolbox\"\n      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"span\", {\n        className: \"toolbox__title\"\n      }, \"Toolbox\"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: \"toolbox__items\"\n      }, this.props.items.map(function (item) {\n        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(ToolBoxItem, {\n          key: item.i,\n          item: item,\n          onTakeItem: _this.props.onTakeItem\n        });\n      })));\n    }\n  }]);\n\n  return ToolBox;\n}(react__WEBPACK_IMPORTED_MODULE_0___default.a.Component);\n\nvar ToolboxLayout = /*#__PURE__*/function (_React$Component3) {\n  _inherits(ToolboxLayout, _React$Component3);\n\n  var _super3 = _createSuper(ToolboxLayout);\n\n  function ToolboxLayout() {\n    var _this2;\n\n    _classCallCheck(this, ToolboxLayout);\n\n    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {\n      args[_key] = arguments[_key];\n    }\n\n    _this2 = _super3.call.apply(_super3, [this].concat(args));\n\n    _defineProperty(_assertThisInitialized(_this2), \"state\", {\n      currentBreakpoint: \"lg\",\n      compactType: \"vertical\",\n      mounted: false,\n      layouts: {\n        lg: _this2.props.initialLayout\n      },\n      toolbox: {\n        lg: []\n      }\n    });\n\n    _defineProperty(_assertThisInitialized(_this2), \"onBreakpointChange\", function (breakpoint) {\n      _this2.setState(function (prevState) {\n        return {\n          currentBreakpoint: breakpoint,\n          toolbox: _objectSpread(_objectSpread({}, prevState.toolbox), {}, _defineProperty({}, breakpoint, prevState.toolbox[breakpoint] || prevState.toolbox[prevState.currentBreakpoint] || []))\n        };\n      });\n    });\n\n    _defineProperty(_assertThisInitialized(_this2), \"onCompactTypeChange\", function () {\n      var oldCompactType = _this2.state.compactType;\n      var compactType = oldCompactType === \"horizontal\" ? \"vertical\" : oldCompactType === \"vertical\" ? null : \"horizontal\";\n\n      _this2.setState({\n        compactType: compactType\n      });\n    });\n\n    _defineProperty(_assertThisInitialized(_this2), \"onTakeItem\", function (item) {\n      _this2.setState(function (prevState) {\n        return {\n          toolbox: _objectSpread(_objectSpread({}, prevState.toolbox), {}, _defineProperty({}, prevState.currentBreakpoint, prevState.toolbox[prevState.currentBreakpoint].filter(function (_ref) {\n            var i = _ref.i;\n            return i !== item.i;\n          }))),\n          layouts: _objectSpread(_objectSpread({}, prevState.layouts), {}, _defineProperty({}, prevState.currentBreakpoint, [].concat(_toConsumableArray(prevState.layouts[prevState.currentBreakpoint]), [item])))\n        };\n      });\n    });\n\n    _defineProperty(_assertThisInitialized(_this2), \"onPutItem\", function (item) {\n      _this2.setState(function (prevState) {\n        return {\n          toolbox: _objectSpread(_objectSpread({}, prevState.toolbox), {}, _defineProperty({}, prevState.currentBreakpoint, [].concat(_toConsumableArray(prevState.toolbox[prevState.currentBreakpoint] || []), [item]))),\n          layouts: _objectSpread(_objectSpread({}, prevState.layouts), {}, _defineProperty({}, prevState.currentBreakpoint, prevState.layouts[prevState.currentBreakpoint].filter(function (_ref2) {\n            var i = _ref2.i;\n            return i !== item.i;\n          })))\n        };\n      });\n    });\n\n    _defineProperty(_assertThisInitialized(_this2), \"onLayoutChange\", function (layout, layouts) {\n      _this2.props.onLayoutChange(layout, layouts);\n\n      _this2.setState({\n        layouts: layouts\n      });\n    });\n\n    _defineProperty(_assertThisInitialized(_this2), \"onNewLayout\", function () {\n      _this2.setState({\n        layouts: {\n          lg: generateLayout()\n        }\n      });\n    });\n\n    return _this2;\n  }\n\n  _createClass(ToolboxLayout, [{\n    key: \"componentDidMount\",\n    value: function componentDidMount() {\n      this.setState({\n        mounted: true\n      });\n    }\n  }, {\n    key: \"generateDOM\",\n    value: function generateDOM() {\n      var _this3 = this;\n\n      return lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(this.state.layouts[this.state.currentBreakpoint], function (l) {\n        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n          key: l.i,\n          className: l.static ? \"static\" : \"\"\n        }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n          className: \"hide-button\",\n          onClick: _this3.onPutItem.bind(_this3, l)\n        }, \"\\xD7\"), l.static ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"span\", {\n          className: \"text\",\n          title: \"This item is static and cannot be removed or resized.\"\n        }, \"Static - \", l.i) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"span\", {\n          className: \"text\"\n        }, l.i));\n      });\n    }\n  }, {\n    key: \"render\",\n    value: function render() {\n      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", null, \"Current Breakpoint: \", this.state.currentBreakpoint, \" (\", this.props.cols[this.state.currentBreakpoint], \" columns)\"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", null, \"Compaction type:\", \" \", lodash__WEBPACK_IMPORTED_MODULE_1___default.a.capitalize(this.state.compactType) || \"No Compaction\"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"button\", {\n        onClick: this.onNewLayout\n      }, \"Generate New Layout\"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"button\", {\n        onClick: this.onCompactTypeChange\n      }, \"Change Compaction Type\"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(ToolBox, {\n        items: this.state.toolbox[this.state.currentBreakpoint] || [],\n        onTakeItem: this.onTakeItem\n      }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(ResponsiveReactGridLayout, _extends({}, this.props, {\n        layouts: this.state.layouts,\n        onBreakpointChange: this.onBreakpointChange,\n        onLayoutChange: this.onLayoutChange // WidthProvider option\n        ,\n        measureBeforeMount: false // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)\n        // and set `measureBeforeMount={true}`.\n        ,\n        useCSSTransforms: this.state.mounted,\n        compactType: this.state.compactType,\n        preventCollision: !this.state.compactType\n      }), this.generateDOM()));\n    }\n  }]);\n\n  return ToolboxLayout;\n}(react__WEBPACK_IMPORTED_MODULE_0___default.a.Component);\n\n_defineProperty(ToolboxLayout, \"defaultProps\", {\n  className: \"layout\",\n  rowHeight: 30,\n  onLayoutChange: function onLayoutChange() {},\n  cols: {\n    lg: 12,\n    md: 10,\n    sm: 6,\n    xs: 4,\n    xxs: 2\n  },\n  initialLayout: generateLayout()\n});\n\n\n\nfunction generateLayout() {\n  return lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.range(0, 25), function (item, i) {\n    var y = Math.ceil(Math.random() * 4) + 1;\n    return {\n      x: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.random(0, 5) * 2 % 12,\n      y: Math.floor(i / 6) * y,\n      w: 2,\n      h: y,\n      i: i.toString(),\n      static: Math.random() < 0.05\n    };\n  });\n}\n\nif (true) {\n  __webpack_require__.e(/*! import() */ 0).then(__webpack_require__.bind(null, /*! ../test-hook.jsx */ \"./test/test-hook.jsx\")).then(function (fn) {\n    return fn.default(ToolboxLayout);\n  });\n}\n\n//# sourceURL=webpack:///./test/examples/14-toolbox.jsx?");

/***/ })

/******/ });