'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp, _initialiseProps;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _utils = require('./utils');

var _GridItem = require('./GridItem');

var _GridItem2 = _interopRequireDefault(_GridItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var noop = function noop() {};

/**
 * A reactive, fluid grid layout with draggable, resizable components.
 */
var ReactGridLayout = (_temp = _class = function (_React$Component) {
    _inherits(ReactGridLayout, _React$Component);

    function ReactGridLayout(props, context) {
        _classCallCheck(this, ReactGridLayout);

        var _this = _possibleConstructorReturn(this, (ReactGridLayout.__proto__ || Object.getPrototypeOf(ReactGridLayout)).call(this, props, context));

        _initialiseProps.call(_this);

        (0, _utils.autoBindHandlers)(_this, ['onDragStart', 'onDrag', 'onDragStop', 'onResizeStart', 'onResize', 'onResizeStop']);
        return _this;
    }

    _createClass(ReactGridLayout, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.setState({ mounted: true });
            // Possibly call back with layout on mount. This should be done after correcting the layout width
            // to ensure we don't rerender with the wrong width.
            this.onLayoutMaybeChanged(this.state.layout, this.props.layout);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var newLayoutBase = void 0;
            // Allow parent to set layout directly.
            if (!(0, _lodash2.default)(nextProps.layout, this.props.layout)) {
                newLayoutBase = nextProps.layout;
            }

            // If children change, also regenerate the layout. Use our state
            // as the base in case because it may be more up to date than
            // what is in props.
            else if (!(0, _utils.childrenEqual)(this.props.children, nextProps.children)) {
                    newLayoutBase = this.state.layout;
                }

            // We need to regenerate the layout.
            if (newLayoutBase) {
                var newLayout = (0, _utils.synchronizeLayoutWithChildren)(newLayoutBase, nextProps.children, nextProps.cols, nextProps.verticalCompact, this.props.breakpoint);
                var oldLayout = this.state.layout;
                this.setState({ layout: newLayout });
                this.onLayoutMaybeChanged(newLayout, oldLayout);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                className = _props.className,
                style = _props.style;


            var mergedStyle = _extends({
                height: this.containerHeight()
            }, style);

            return _jsx('div', {
                className: (0, _classnames2.default)('react-grid-layout', className),
                style: mergedStyle
            }, void 0, _react2.default.Children.map(this.props.children, function (child) {
                return _this2.processGridItem(child);
            }), this.placeholder());
        }

        /**
         * Calculates a pixel value for the container.
         * @return {String} Container height in pixels.
         */

    }, {
        key: 'containerHeight',
        value: function containerHeight() {
            if (!this.props.autoSize) {
                return;
            }
            var nbRow = (0, _utils.bottom)(this.state.layout);
            var containerPaddingY = this.props.containerPadding ? this.props.containerPadding[1] : this.props.margin[1];
            return nbRow * this.props.rowHeight + (nbRow - 1) * this.props.margin[1] + containerPaddingY * 2 + 'px';
        }

        /**
         * When dragging starts
         * @param {String} i Id of the child
         * @param {Number} x X position of the move
         * @param {Number} y Y position of the move
         * @param {Event} e The mousedown event
         * @param {Element} node The current dragging DOM element
         */

    }, {
        key: 'onDragStart',
        value: function onDragStart(i, x, y, _ref) {
            var e = _ref.e,
                node = _ref.node;
            var layout = this.state.layout;

            var l = (0, _utils.getLayoutItem)(layout, i);
            if (!l) {
                return;
            }

            this.setState({ oldDragItem: (0, _utils.cloneLayoutItem)(l), oldLayout: this.state.layout });

            this.props.onDragStart(layout, l, l, null, e, node);
        }

        /**
         * Each drag movement create a new dragelement and move the element to the dragged location
         * @param {String} i Id of the child
         * @param {Number} x X position of the move
         * @param {Number} y Y position of the move
         * @param {Event} e The mousedown event
         * @param {Element} node The current dragging DOM element
         */

    }, {
        key: 'onDrag',
        value: function onDrag(i, x, y, _ref2) {
            var e = _ref2.e,
                node = _ref2.node;
            var oldDragItem = this.state.oldDragItem;
            var layout = this.state.layout;

            var l = (0, _utils.getLayoutItem)(layout, i);
            if (!l) {
                return;
            }

            // Create placeholder (display only)
            var placeholder = {
                w: l.w, h: l.h, x: l.x, y: l.y, placeholder: true, i: i

                // Move the element to the dragged location.
            };layout = (0, _utils.moveElement)(layout, l, x, y, true /* isUserAction */);

            this.props.onDrag(layout, oldDragItem, l, placeholder, e, node);

            this.setState({
                layout: (0, _utils.compact)(layout, this.props.verticalCompact),
                activeDrag: placeholder
            });
        }

        /**
         * When dragging stops, figure out which position the element is closest to and update its x and y.
         * @param  {String} i Index of the child.
         * @param {Number} x X position of the move
         * @param {Number} y Y position of the move
         * @param {Event} e The mousedown event
         * @param {Element} node The current dragging DOM element
         */

    }, {
        key: 'onDragStop',
        value: function onDragStop(i, x, y, _ref3) {
            var e = _ref3.e,
                node = _ref3.node;
            var oldDragItem = this.state.oldDragItem;
            var layout = this.state.layout;

            var l = (0, _utils.getLayoutItem)(layout, i);
            if (!l) {
                return;
            }

            // Move the element here
            layout = (0, _utils.moveElement)(layout, l, x, y, true /* isUserAction */);

            this.props.onDragStop(layout, oldDragItem, l, null, e, node);

            // Set state
            var newLayout = (0, _utils.compact)(layout, this.props.verticalCompact);
            var oldLayout = this.state.oldLayout;

            this.setState({
                activeDrag: null,
                layout: newLayout,
                oldDragItem: null,
                oldLayout: null
            });

            this.onLayoutMaybeChanged(newLayout, oldLayout);
        }
    }, {
        key: 'onLayoutMaybeChanged',
        value: function onLayoutMaybeChanged(newLayout, oldLayout) {
            if (!oldLayout) {
                oldLayout = this.state.layout;
            }
            if (!(0, _lodash2.default)(oldLayout, newLayout)) {
                this.props.onLayoutChange(newLayout);
            }
        }
    }, {
        key: 'onResizeStart',
        value: function onResizeStart(i, w, h, _ref4) {
            var e = _ref4.e,
                node = _ref4.node;
            var layout = this.state.layout;

            var l = (0, _utils.getLayoutItem)(layout, i);
            if (!l) {
                return;
            }

            this.setState({
                oldResizeItem: (0, _utils.cloneLayoutItem)(l),
                oldLayout: this.state.layout
            });

            this.props.onResizeStart(layout, l, l, null, e, node);
        }
    }, {
        key: 'onResize',
        value: function onResize(i, w, h, _ref5) {
            var e = _ref5.e,
                node = _ref5.node;
            var _state = this.state,
                layout = _state.layout,
                oldResizeItem = _state.oldResizeItem;

            var l = (0, _utils.getLayoutItem)(layout, i);
            if (!l) {
                return;
            }

            // Set new width and height.
            l.w = w;
            l.h = h;

            // Create placeholder element (display only)
            var placeholder = {
                w: w, h: h, x: l.x, y: l.y, static: true, i: i
            };

            this.props.onResize(layout, oldResizeItem, l, placeholder, e, node);

            // Re-compact the layout and set the drag placeholder.
            var newLayout = (0, _utils.compact)(layout, this.props.verticalCompact);
            this.setState({
                layout: newLayout,
                activeDrag: placeholder
            });
        }
    }, {
        key: 'onResizeStop',
        value: function onResizeStop(i, w, h, _ref6) {
            var e = _ref6.e,
                node = _ref6.node;
            var _state2 = this.state,
                layout = _state2.layout,
                oldResizeItem = _state2.oldResizeItem;

            var l = (0, _utils.getLayoutItem)(layout, i);

            this.props.onResizeStop(layout, oldResizeItem, l, null, e, node);

            // Set state
            var newLayout = (0, _utils.compact)(layout, this.props.verticalCompact);
            var oldLayout = this.state.oldLayout;

            this.setState({
                activeDrag: null,
                layout: newLayout,
                oldResizeItem: null,
                oldLayout: null
            });

            this.onLayoutMaybeChanged(newLayout, oldLayout);
        }

        /**
         * Create a placeholder object.
         * @return {Element} Placeholder div.
         */

    }, {
        key: 'placeholder',
        value: function placeholder() {
            var activeDrag = this.state.activeDrag;

            if (!activeDrag) {
                return null;
            }
            var _props2 = this.props,
                width = _props2.width,
                cols = _props2.cols,
                margin = _props2.margin,
                containerPadding = _props2.containerPadding,
                rowHeight = _props2.rowHeight,
                maxRows = _props2.maxRows,
                useCSSTransforms = _props2.useCSSTransforms;

            // {...this.state.activeDrag} is pretty slow, actually

            return _jsx(_GridItem2.default, {
                w: activeDrag.w,
                h: activeDrag.h,
                x: activeDrag.x,
                y: activeDrag.y,
                i: activeDrag.i,
                className: 'react-grid-placeholder',
                containerWidth: width,
                cols: cols,
                margin: margin,
                containerPadding: containerPadding || margin,
                maxRows: maxRows,
                rowHeight: rowHeight,
                isDraggable: false,
                isResizable: false,
                useCSSTransforms: useCSSTransforms
            }, void 0, _jsx('div', {}));
        }

        /**
         * Given a grid item, set its style attributes & surround in a <Draggable>.
         * @param  {Element} child React element.
         * @return {Element}       Element wrapped in draggable and properly placed.
         */

    }, {
        key: 'processGridItem',
        value: function processGridItem(child) {
            if (!child.key) {
                return;
            }
            var l = (0, _utils.getLayoutItem)(this.state.layout, child.key);
            if (!l) {
                return null;
            }
            var _props3 = this.props,
                width = _props3.width,
                cols = _props3.cols,
                margin = _props3.margin,
                containerPadding = _props3.containerPadding,
                rowHeight = _props3.rowHeight,
                maxRows = _props3.maxRows,
                isDraggable = _props3.isDraggable,
                isResizable = _props3.isResizable,
                useCSSTransforms = _props3.useCSSTransforms,
                draggableCancel = _props3.draggableCancel,
                draggableHandle = _props3.draggableHandle;
            var mounted = this.state.mounted;

            console.log('reactgridlayout width', width);

            // Parse 'static'. Any properties defined directly on the grid item will take precedence.
            var draggable = Boolean(!l.static && isDraggable && (l.isDraggable || l.isDraggable == null));
            var resizable = Boolean(!l.static && isResizable && (l.isResizable || l.isResizable == null));

            return _jsx(_GridItem2.default, {
                containerWidth: width,
                cols: cols,
                margin: margin,
                containerPadding: containerPadding || margin,
                maxRows: maxRows,
                rowHeight: rowHeight,
                cancel: draggableCancel,
                handle: draggableHandle,
                onDragStop: this.onDragStop,
                onDragStart: this.onDragStart,
                onDrag: this.onDrag,
                onResizeStart: this.onResizeStart,
                onResize: this.onResize,
                onResizeStop: this.onResizeStop,
                isDraggable: draggable && !this.props.static,
                isResizable: resizable && !this.props.static,
                useCSSTransforms: useCSSTransforms && mounted,
                usePercentages: !mounted,
                w: l.w,
                h: l.h,
                x: l.x,
                y: l.y,
                i: l.i,
                minH: l.minH,
                minW: l.minW,
                maxH: l.maxH,
                maxW: l.maxW,
                'static': l.static && this.props.static
            }, void 0, child);
        }
    }]);

    return ReactGridLayout;
}(_react2.default.Component), _class.propTypes = {
    //
    // Basic props
    //
    className: _propTypes2.default.string,
    style: _propTypes2.default.object,

    // This can be set explicitly. If it is not set, it will automatically
    // be set to the container width. Note that resizes will *not* cause this to adjust.
    // If you need that behavior, use AutoSizeLayout.
    width: _propTypes2.default.number,
    breakpoint: _propTypes2.default.string,

    // If true, the container height swells and contracts to fit contents
    autoSize: _propTypes2.default.bool,
    // # of cols.
    cols: _propTypes2.default.number,

    // A selector that will not be draggable.
    draggableCancel: _propTypes2.default.string,
    // A selector for the draggable handler
    draggableHandle: _propTypes2.default.string,

    // If true, the layout will compact vertically
    verticalCompact: _propTypes2.default.bool,

    // layout is an array of object with the format:
    // {x, y, w, h, i}
    layout: function layout(props) {
        var layout = props.layout;
        // I hope you're setting the data-grid property on the grid items
        if (layout === undefined) {
            return;
        }
        (0, _utils.validateLayout)(layout, 'layout');
    },

    //
    // Grid Dimensions
    //

    // Margin between items [x, y] in px
    margin: _propTypes2.default.arrayOf(_propTypes2.default.number),
    // Padding inside the container [x, y] in px
    containerPadding: _propTypes2.default.arrayOf(_propTypes2.default.number),
    // Rows have a static height, but you can change this based on breakpoints if you like
    rowHeight: _propTypes2.default.number,
    // Default Infinity, but you can specify a max here if you like.
    // Note that this isn't fully fleshed out and won't error if you specify a layout that
    // extends beyond the row capacity. It will, however, not allow users to drag/resize
    // an item past the barrier. They can push items beyond the barrier, though.
    // Intentionally not documented for this reason.
    maxRows: _propTypes2.default.number,

    //
    // Flags
    //
    isDraggable: _propTypes2.default.bool,
    isResizable: _propTypes2.default.bool,
    static: _propTypes2.default.bool,
    // Use CSS transforms instead of top/left
    useCSSTransforms: _propTypes2.default.bool,

    //
    // Callbacks
    //

    // Callback so you can save the layout. Calls after each drag & resize stops.
    onLayoutChange: _propTypes2.default.func,

    // Calls when drag starts. Callback is of the signature (layout, oldItem, newItem, placeholder, e).
    // All callbacks below have the same signature. 'start' and 'stop' callbacks omit the 'placeholder'.
    onDragStart: _propTypes2.default.func,
    // Calls on each drag movement.
    onDrag: _propTypes2.default.func,
    // Calls when drag is complete.
    onDragStop: _propTypes2.default.func,
    //Calls when resize starts.
    onResizeStart: _propTypes2.default.func,
    // Calls when resize movement happens.
    onResize: _propTypes2.default.func,
    // Calls when resize is complete.
    onResizeStop: _propTypes2.default.func,

    //
    // Other validations
    //

    // Children must not have duplicate keys.
    children: function children(props, propName, _componentName) {
        var children = props[propName];

        // Check children keys for duplicates. Throw if found.
        var keys = {};
        _react2.default.Children.forEach(children, function (child) {
            if (keys[child.key]) {
                throw new Error("Duplicate child key found! This will cause problems in ReactGridLayout.");
            }
            keys[child.key] = true;
        });
    }
}, _class.defaultProps = {
    autoSize: true,
    breakpoint: '',
    cols: 12,
    className: '',
    rowHeight: 150,
    maxRows: Infinity, // infinite vertical growth
    layout: [],
    margin: [10, 10],
    isDraggable: true,
    isResizable: true,
    static: false,
    useCSSTransforms: true,
    verticalCompact: true,
    onLayoutChange: noop,
    onDragStart: noop,
    onDrag: noop,
    onDragStop: noop,
    onResizeStart: noop,
    onResize: noop,
    onResizeStop: noop
}, _initialiseProps = function _initialiseProps() {
    this.state = {
        activeDrag: null,
        layout: (0, _utils.synchronizeLayoutWithChildren)(this.props.layout, this.props.children, this.props.cols, this.props.verticalCompact, this.props.breakpoint),
        mounted: false,
        oldDragItem: null,
        oldLayout: null,
        oldResizeItem: null
    };
}, _temp);
exports.default = ReactGridLayout;