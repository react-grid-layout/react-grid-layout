"use strict";
var _objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var React = require("react");
var GridItem = require("./GridItem");
var utils = require("./utils");
var PureDeepRenderMixin = require("./mixins/PureDeepRenderMixin");
var WidthListeningMixin = require("./mixins/WidthListeningMixin");

/**
 * A reactive, fluid grid layout with draggable, resizable components.
 */
var ReactGridLayout = React.createClass({
  displayName: "ReactGridLayout",
  mixins: [PureDeepRenderMixin, WidthListeningMixin],

  propTypes: {
    //
    // Basic props
    //

    // If true, the container height swells and contracts to fit contents
    autoSize: React.PropTypes.bool,
    // # of cols.
    cols: React.PropTypes.number,

    // A selector that will not be draggable.
    draggableCancel: React.PropTypes.string,
    // A selector for the draggable handler
    draggableHandle: React.PropTypes.string,

    // layout is an array of object with the format:
    // {x: Number, y: Number, w: Number, h: Number}
    layout: function (props, propName, componentName) {
      var layout = props.layout;
      // I hope you're setting the _grid property on the grid items
      if (layout === undefined) return;
      utils.validateLayout(layout, "layout");
    },

    layouts: function (props, propName, componentName) {
      if (props.layouts) {
        throw new Error("ReactGridLayout does not use `layouts`: Use ReactGridLayout.Responsive.");
      }
    },

    // margin between items [x, y] in px
    margin: React.PropTypes.array,
    // Rows have a static height, but you can change this based on breakpoints if you like
    rowHeight: React.PropTypes.number,

    //
    // Flags
    //
    isDraggable: React.PropTypes.bool,
    isResizable: React.PropTypes.bool,
    // Use CSS transforms instead of top/left
    useCSSTransforms: React.PropTypes.bool,

    //
    // Callbacks
    //

    // Callback so you can save the layout.
    // Calls back with (currentLayout, allLayouts). allLayouts are keyed by breakpoint.
    onLayoutChange: React.PropTypes.func,
    // Calls when drag starts, allows for canceling/restricting drag
    onDragStart: React.PropTypes.func,
    // Calls on each drag movement, allows for modifying current drag layout, or preventing layout modificaiton
    onDrag: React.PropTypes.func,
    // Calls when drag is complete
    onDragStop: React.PropTypes.func,
    //Calls when resize starts, allows for canceling
    onResizeStart: React.PropTypes.func,
    // Calls when resize movement happens, restrict resize
    onResize: React.PropTypes.func,
    // Calls when resize is complete
    onResizeStop: React.PropTypes.func,

    //
    // Other validations
    //

    // Children must not have duplicate keys.
    children: function (props, propName, componentName) {
      React.PropTypes.node.apply(this, arguments);
      var children = props[propName];

      // Check children keys for duplicates. Throw if found.
      var keys = {};
      React.Children.forEach(children, function (child, i, list) {
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
      onLayoutChange: function () {},
      onDragStart: function () {},
      onDrag: function () {},
      onDragStop: function () {},
      onResizeStart: function () {},
      onResize: function () {},
      onResizeStop: function () {}
    };
  },

  getInitialState: function getInitialState() {
    return {
      layout: utils.synchronizeLayoutWithChildren(this.props.layout, this.props.children, this.props.cols),
      width: this.props.initialWidth,
      activeDrag: null
    };
  },

  componentDidMount: function componentDidMount() {
    // Call back with layout on mount. This should be done after correcting the layout width
    // to ensure we don't rerender with the wrong width.
    this.props.onLayoutChange(this.state.layout);
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    // This allows you to set the width manually if you like.
    // Use manual width changes in combination with `listenToWindowResize: false`
    if (nextProps.width !== this.props.width) this.onWidthChange(nextProps.width);

    // If children change, regenerate the layout.
    if (nextProps.children.length !== this.props.children.length) {
      this.setState({
        layout: utils.synchronizeLayoutWithChildren(this.state.layout, nextProps.children, nextProps.cols)
      });
    }

    // Allow parent to set layout directly.
    if (nextProps.layout && JSON.stringify(nextProps.layout) !== JSON.stringify(this.state.layout)) {
      this.setState({
        layout: utils.synchronizeLayoutWithChildren(nextProps.layout, nextProps.children, nextProps.cols)
      });
    }
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    // Call back so we can store the layout
    // Do it only when a resize/drag is not active, otherwise there are way too many callbacks
    if (this.state.layout !== prevState.layout && !this.state.activeDrag) {
      this.props.onLayoutChange(this.state.layout, this.state.layouts);
    }
  },

  /**
   * Calculates a pixel value for the container.
   * @return {String} Container height in pixels.
   */
  containerHeight: function containerHeight() {
    if (!this.props.autoSize) return;
    return utils.bottom(this.state.layout) * this.props.rowHeight + this.props.margin[1] + "px";
  },

  /**
   * When the width changes, save it to state. This helps with left/width calculations.
   */
  onWidthChange: function onWidthChange(width) {
    this.setState({ width: width });
  },

  /**
   * When dragging starts
   * @param {Number} i Index of the child
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} element The current dragging DOM element
   * @param {Object} position Drag information
   */
  onDragStart: function onDragStart(i, x, y, _ref) {
    var e = _ref.e;
    var element = _ref.element;
    var position = _ref.position;
    var layout = this.state.layout;
    var l = utils.getLayoutItem(layout, i);

    this.props.onDragStart(layout, this.state.layout, l, null, { e: e, element: element, position: position });
  },
  /**
   * Each drag movement create a new dragelement and move the element to the dragged location
   * @param {Number} i Index of the child
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} element The current dragging DOM element
   * @param {Object} position Drag information   
   */
  onDrag: function onDrag(i, x, y, _ref2) {
    var e = _ref2.e;
    var element = _ref2.element;
    var position = _ref2.position;
    var layout = this.state.layout;
    var l = utils.getLayoutItem(layout, i);

    // Create drag element (display only)
    var activeDrag = {
      w: l.w, h: l.h, x: l.x, y: l.y, placeholder: true, i: i
    };

    // Move the element to the dragged location.
    layout = utils.moveElement(layout, l, x, y, true /* isUserAction */);

    //Ask users for a new layout if they need to process
    layout = this.props.onDrag(layout, this.state.layout, l, activeDrag, { e: e, element: element, position: position }) || layout;


    this.setState({
      layout: utils.compact(layout),
      activeDrag: activeDrag
    });
  },

  /**
   * When dragging stops, figure out which position the element is closest to and update its x and y.
   * @param  {Number} i Index of the child.
   * @param {Number} i Index of the child
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} element The current dragging DOM element
   * @param {Object} position Drag information
   */
  onDragStop: function onDragStop(i, x, y, _ref3) {
    var e = _ref3.e;
    var element = _ref3.element;
    var position = _ref3.position;
    var layout = this.state.layout;
    var l = utils.getLayoutItem(layout, i);

    // Move the element here
    layout = utils.moveElement(layout, l, x, y, true /* isUserAction */);

    //Ask users for a new layout if they need to process
    layout = this.props.onDragStop(layout, this.state.layout, l, null, { e: e, element: element, position: position }) || layout;

    // Set state
    this.setState({ layout: utils.compact(layout), activeDrag: null });
  },

  onResizeStart: function onResizeStart(i, w, h, _ref4) {
    var e = _ref4.e;
    var element = _ref4.element;
    var size = _ref4.size;
    var layout = this.state.layout;
    var l = utils.getLayoutItem(layout, i);

    this.props.onResizeStart(layout, layout, l, null, { e: e, element: element, size: size });
  },

  onResize: function onResize(i, w, h, _ref5) {
    var e = _ref5.e;
    var element = _ref5.element;
    var size = _ref5.size;
    var layout = this.state.layout;
    var l = utils.getLayoutItem(layout, i);

    // Set new width and height.
    l.w = w;
    l.h = h;

    // Create drag element (display only)
    var activeDrag = {
      w: w, h: h, x: l.x, y: l.y, placeholder: true, i: i
    };

    activeDrag = this.props.onResize(layout, layout, l, activeDrag, { e: e, element: element, size: size }) || activeDrag;

    // Re-compact the layout and set the drag placeholder.
    this.setState({ layout: utils.compact(layout), activeDrag: activeDrag });
  },

  onResizeStop: function onResizeStop(i, x, y, _ref6) {
    var e = _ref6.e;
    var element = _ref6.element;
    var size = _ref6.size;
    var layout = this.state.layout;
    var l = utils.getLayoutItem(layout, i);

    layout = this.props.onResizeStop(layout, layout, l, null, { e: e, element: element, size: size }) || layout;

    this.setState({ activeDrag: null, layout: utils.compact(layout) });
  },

  /**
   * Create a placeholder object.
   * @return {Element} Placeholder div.
   */
  placeholder: function placeholder() {
    if (!this.state.activeDrag) return "";

    // {...this.state.activeDrag} is pretty slow, actually
    return React.createElement(
      GridItem,
      {
        w: this.state.activeDrag.w,
        h: this.state.activeDrag.h,
        x: this.state.activeDrag.x,
        y: this.state.activeDrag.y,
        i: this.state.activeDrag.i,
        isPlaceholder: true,
        className: "react-grid-placeholder",
        containerWidth: this.state.width,
        cols: this.props.cols,
        margin: this.props.margin,
        rowHeight: this.props.rowHeight,
        isDraggable: false,
        isResizable: false,
        useCSSTransforms: this.props.useCSSTransforms
      },
      React.createElement("div", null)
    );
  },

  /**
   * Given a grid item, set its style attributes & surround in a <Draggable>.
   * @param  {Element} child React element.
   * @param  {Number}  i     Index of element.
   * @return {Element}       Element wrapped in draggable and properly placed.
   */
  processGridItem: function processGridItem(child) {
    var i = child.key;
    var l = utils.getLayoutItem(this.state.layout, i);

    // watchStart property tells Draggable to react to changes in the start param
    // Must be turned off on the item we're dragging as the changes in `activeDrag` cause rerenders
    var drag = this.state.activeDrag;
    var moveOnStartChange = drag && drag.i === i ? false : true;

    // Parse 'static'. Any properties defined directly on the grid item will take precedence.
    var draggable, resizable;
    if (l["static"] || this.props.isDraggable === false) draggable = false;
    if (l["static"] || this.props.isResizable === false) resizable = false;

    return React.createElement(
      GridItem,
      React.__spread({
        containerWidth: this.state.width,
        cols: this.props.cols,
        margin: this.props.margin,
        rowHeight: this.props.rowHeight,
        moveOnStartChange: moveOnStartChange,
        cancel: this.props.draggableCancel,
        handle: this.props.draggableHandle,
        onDragStop: this.onDragStop,
        onDragStart: this.onDragStart,
        onDrag: this.onDrag,
        onResizeStart: this.onResizeStart,
        onResize: this.onResize,
        onResizeStop: this.onResizeStop,
        isDraggable: draggable,
        isResizable: resizable,
        useCSSTransforms: this.props.useCSSTransforms && this.isMounted(),
        usePercentages: !this.isMounted()
      }, l),
      child
    );
  },

  render: function render() {
    // Calculate classname
    var className = this.props.className;
    var props = _objectWithoutProperties(this.props, ["className"]);

    className = "react-grid-layout " + (className || "");

    return React.createElement(
      "div",
      React.__spread({}, props, { className: className, style: { height: this.containerHeight() } }),
      React.Children.map(this.props.children, this.processGridItem),
      this.placeholder()
    );
  }
});

module.exports = ReactGridLayout;