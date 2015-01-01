'use strict';
var React = require('react/addons');
var GridItem = require('./GridItem');
var utils = require('./utils');
var PureDeepRenderMixin = require('./PureDeepRenderMixin');

/**
 * A reactive, fluid, responsive grid layout with draggable, resizable components.
 */
var ReactGridLayout = React.createClass({
  mixins: [PureDeepRenderMixin],

  propTypes: {
    // 
    // Basic props
    //

    // If true, the container height swells and contracts to fit contents
    autoSize: React.PropTypes.bool,
    // {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
    breakpoints: React.PropTypes.object,
    // # of cols. Can be specified as a single number, or a breakpoint -> cols map
    cols: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.number
    ]),
    // A selector for the draggable handler
    handle: React.PropTypes.string,

    // initialLayout is an array of object with the format:
    // {x: Number, y: Number, w: Number, h: Number}
    initialLayout: function(props, propName, componentName) {
      var layout = props.initialLayout;
      // I hope you're setting the on the grid items
      if (layout === undefined) return; 
      utils.validateLayout(layout, 'initialLayout');
    },

    // initialLayouts is an object mapping breakpoints to layouts.
    // e.g. {lg: Layout, md: Layout, ...}
    initialLayouts: function(props, propName, componentName) {
      var layouts = props.initialLayouts;
      if (layouts === undefined) return;
      Object.keys(layouts).map(function(k) {
        utils.validateLayout(layouts[k], 'initialLayouts.' + k);
      });
    },

    // This allows setting this on the server side
    initialWidth: React.PropTypes.number,
    // margin between items [x, y] in px
    margin: React.PropTypes.array,
    // Rows have a static height, but you can change this based on breakpoints if you like
    rowHeight: React.PropTypes.number,

    //
    // Flags
    //
    isDraggable: React.PropTypes.bool,
    isResizable: React.PropTypes.bool,

    // If false, you should supply width yourself. Good if you want to debounce resize events
    // or reuse a handler from somewhere else.
    listenToWindowResize: React.PropTypes.bool,

    // 
    // Callbacks
    // 

    // Calls back with breakpoint and new # cols
    onBreakpointChange: React.PropTypes.func,

    // Callback so you can save the layout.
    // Calls back with (currentLayout, allLayouts). allLayouts are keyed by breakpoint.
    onLayoutChange: React.PropTypes.func,


    //
    // Other validations
    //

    // Children must not have duplicate keys.
    children: function(props, propName, componentName) {
      React.PropTypes.node.apply(this, arguments);
      var children = props[propName];

      // Check children keys for duplicates. Throw if found.
      var keys = children.map(function(child, i, list) {
        return child.key;
      });
      for (var i = 0, len = keys.length; i < len; i++) {
        if (keys[i] === keys[i + 1]) {
          throw new Error("Duplicate child key found! This will cause problems in ReactGridLayout.");
        }
      }
    }
  },

  getDefaultProps() {
    return {
      autoSize: true,
      breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0},
      cols: 12, 
      rowHeight: 150,
      initialLayout: [],
      initialLayouts: {},
      initialWidth: 1280,
      margin: [10, 10],
      isDraggable: true,
      isResizable: true,
      listenToWindowResize: true,
      onBreakpointChange: function(){},
      onLayoutChange: function(){}
    };
  },

  getInitialState() {
    var breakpoint = utils.getBreakpointFromWidth(this.props.breakpoints, this.props.initialWidth);
    var cols = this.getColsFromBreakpoint(breakpoint);
    var initialLayout = this.props.initialLayout;
    if (this.props.initialLayouts && this.props.initialLayouts[breakpoint]) {
      initialLayout = this.props.initialLayouts[breakpoint];
    }
    return {
      layout: utils.synchronizeLayoutWithChildren(initialLayout, this.props.children, cols),
      // storage for layouts obsoleted by breakpoints
      layouts: this.props.initialLayouts || {},
      breakpoint: breakpoint,
      cols: cols,
      width: this.props.initialWidth,
      activeDrag: null
    };
  },

  componentDidMount() {
    if (this.props.listenToWindowResize) {
      window.addEventListener('resize', this.onWindowResize);
    }
    // This is intentional. Once to properly set the breakpoint and resize the elements,
    // and again to compensate for any scrollbar that appeared because of the first step.
    this.onWindowResize();
    this.onWindowResize();

    // Call back with layout on mount. This should be done after correcting the layout width
    // to ensure we don't rerender with the wrong width.
    this.props.onLayoutChange(this.state.layout, this.state.layouts);
  },

  componentWillReceiveProps(nextProps) {
    // This allows you to set the width manually if you like.
    // Use manual width changes in combination with `listenToWindowResize: false`
    if (nextProps.width) this.onWidthChange(nextProps.width);

    // If children change, regenerate the layout.
    if (nextProps.children.length !== this.props.children.length) {
      this.setState({
        layout: utils.synchronizeLayoutWithChildren(this.state.layout, nextProps.children, this.state.cols)
      });
    }

    // Allow parent to set layout directly.
    if (nextProps.layout && nextProps.layout !== this.state.layout) {
      this.setState({
        layout: utils.synchronizeLayoutWithChildren(nextProps.layout, nextProps.children, this.state.cols)
      });
    }
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  },

  componentDidUpdate(prevProps, prevState) {
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
  containerHeight() {
    if (!this.props.autoSize) return;
    return utils.bottom(this.state.layout) * this.props.rowHeight + this.props.margin[1] + 'px';
  },

  getColsFromBreakpoint(breakpoint) {
    var cols = this.props.cols;
    if (typeof cols === "number") return cols;
    if (!cols[breakpoint]) {
      throw new Error("ReactGridLayout: `cols` entry for breakpoint " + breakpoint + " is missing!");
    }
    return cols[breakpoint];
  },

  /**
   * On window resize, update width.
   */
  onWindowResize() {
    this.onWidthChange(this.getDOMNode().offsetWidth);
  },

  /**
   * When the width changes work through breakpoints and reset state with the new width & breakpoint.
   * Width changes are necessary to figure out the widget widths.
   */
  onWidthChange(width) {
    // Set new breakpoint
    var newState = {width: width};
    newState.breakpoint = utils.getBreakpointFromWidth(this.props.breakpoints, newState.width);
    newState.cols = this.getColsFromBreakpoint(newState.breakpoint);
    
    // Breakpoint change
    if (newState.cols !== this.state.cols) {

      // Store the current layout
      newState.layouts = this.state.layouts;
      newState.layouts[this.state.breakpoint] = JSON.parse(JSON.stringify(this.state.layout));

      // Find or generate a new one.
      newState.layout = newState.layouts[newState.breakpoint];
      if (!newState.layout) {
        newState.layout = utils.newResponsiveLayout(
          newState.layouts, this.props.breakpoints, newState.breakpoint, this.state.breakpoint, newState.cols);
      }

      // This adds missing items.
      newState.layout = utils.synchronizeLayoutWithChildren(newState.layout, this.props.children, newState.cols);

      // Store this new layout as well.
      newState.layouts[newState.breakpoint] = newState.layout;
    }

    if (newState.cols !== this.state.cols) {
      this.props.onBreakpointChange(newState.breakpoint, newState.cols);
    }

    this.setState(newState);
  },

  onDragStart(i, e, {element, position}) {
    // nothing
  },

  onDrag(i, x, y) {
    var layout = this.state.layout;
    var l = utils.getLayoutItem(layout, i);

    // Create drag element (display only)
    var activeDrag = {
      w: l.w, h: l.h, x: l.x, y: l.y, placeholder: true, i: i
    };
    
    // Move the element to the dragged location.
    layout = utils.moveElement(layout, l, x, y);

    this.setState({
      layout: utils.compact(layout),
      activeDrag: activeDrag
    });
  },

  /**
   * When dragging stops, figure out which position the element is closest to and update its x and y.
   * @param  {Number} i Index of the child.
   * @param  {Event}  e DOM Event.
   */
  onDragStop(i, x, y) {
    var layout = this.state.layout;
    var l = utils.getLayoutItem(layout, i);

    // Move the element here
    layout = utils.moveElement(layout, l, x, y);
    // Set state
    this.setState({layout: utils.compact(layout), activeDrag: null});
  },

  onResize(i, w, h) {
    var layout = this.state.layout;
    var l = utils.getLayoutItem(layout, i);

    // Set new width and height.
    l.w = w;
    l.h = h;
    
    // Create drag element (display only)
    var activeDrag = {
      w: w, h: h, x: l.x, y: l.y, placeholder: true, i: i
    };
    
    // Re-compact the layout and set the drag placeholder.
    this.setState({layout: utils.compact(layout), activeDrag: activeDrag});
  },

  onResizeStop(e, {element, position}) {
    this.setState({activeDrag: null, layout: utils.compact(this.state.layout)});
  },

  /**
   * Create a placeholder object.
   * @return {Element} Placeholder div.
   */
  placeholder() {
    if (!this.state.activeDrag) return '';

    // {...this.state.activeDrag} is pretty slow, actually
    return (
      <GridItem
        w={this.state.activeDrag.w}
        h={this.state.activeDrag.h}
        x={this.state.activeDrag.x}
        y={this.state.activeDrag.y}
        i={this.state.activeDrag.i}
        placeholder={true}
        className="react-grid-placeholder"
        containerWidth={this.state.width}
        cols={this.state.cols}
        margin={this.props.margin}
        rowHeight={this.props.rowHeight}
        isDraggable={false}
        isResizable={false}
        >
        <div />
      </GridItem>
    );
  },

  /**
   * Given a grid item, set its style attributes & surround in a <Draggable>.
   * @param  {Element} child React element.
   * @param  {Number}  i     Index of element.
   * @return {Element}       Element wrapped in draggable and properly placed.
   */
  processGridItem(child) {
    var i = child.key;
    var l = utils.getLayoutItem(this.state.layout, i);

    // watchStart property tells Draggable to react to changes in the start param
    // Must be turned off on the item we're dragging as the changes in `activeDrag` cause rerenders
    var drag = this.state.activeDrag;
    var moveOnStartChange = drag && drag.i === i ? false : true;
    return (
      <GridItem 
        w={l.w}
        h={l.h}
        x={l.x}
        y={l.y}
        i={l.i}
        containerWidth={this.state.width}
        cols={this.state.cols}
        margin={this.props.margin}
        rowHeight={this.props.rowHeight}
        moveOnStartChange={moveOnStartChange}
        handle={this.props.handle}
        onDragStop={this.onDragStop}
        onDragStart={this.onDragStart}
        onDrag={this.onDrag}
        onResize={this.onResize}
        onResizeStop={this.onResizeStop}
        isDraggable={l.static ? false : this.props.isDraggable}
        isResizable={l.static ? false : this.props.isResizable}
        >
        {child}
      </GridItem>
    );
  },

  render() {
    // Calculate classname
    var {className, ...props} = this.props;
    className = 'react-grid-layout ' + (className || '');

    return (
      <div {...props} className={className} style={{height: this.containerHeight()}}>
        {React.Children.map(this.props.children, this.processGridItem)}
        {this.placeholder()}
      </div>
    );
  }
});

module.exports = ReactGridLayout;
