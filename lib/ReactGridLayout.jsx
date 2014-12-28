'use strict';
var React = require('react/addons');
var _ = require('lodash');
var GridItem = require('./GridItem.jsx');
var utils = require('./utils');

var ReactGridLayout = module.exports = React.createClass({
  displayName: 'ReactGridLayout',
  mixins: [React.addons.PureRenderMixin],

  propTypes: {
    // If true, the container height swells and contracts to fit contents
    autoSize: React.PropTypes.bool,
    // {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
    breakpoints: React.PropTypes.object,
    // # of cols
    cols: React.PropTypes.number,
    // A selector for the draggable handler
    handle: React.PropTypes.string,
    // Layout is an array of object with the format:
    // {x: Number, y: Number, w: Number, h: Number}
    initialLayout: React.PropTypes.array,
    // This allows setting this on the server side
    initialWidth: React.PropTypes.number,
    // margin between items (x, y) in px
    margin: React.PropTypes.array,
    // Rows have a static height, but you can change this based on breakpoints if you like
    rowHeight: React.PropTypes.number,

    // Flags
    isDraggable: React.PropTypes.bool,
    isResizable: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      autoSize: true,
      breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0},
      cols: 10, 
      rowHeight: 150,
      initialWidth: 1280,
      margin: [10, 10],
      isDraggable: true,
      isResizable: true
    };
  },

  getInitialState() {
    return {
      layout: this.generateLayout(this.props.initialLayout),
      breakpoint: this.getBreakpointFromWidth(this.props.initialWidth),
      width: this.props.initialWidth,
      activeDrag: null
    };
  },

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize);
    this.onWindowResize();
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  },

  /**
   * Calculates a pixel value for the container.
   * @return {String} Container height in pixels.
   */
  containerHeight() {
    if (!this.props.autoSize) return;
    // Calculate container height
    var bottom = _.max(this.state.layout, function(l) {
      return l.y + l.h;
    });
    return (bottom.y + bottom.h) * this.props.rowHeight + this.props.margin[1] + 'px';
  },

  /**
   * Generate a layout using the initialLayout as a template.
   * Missing entries will be added, extraneous ones will be truncated.
   * @param  {Array} initialLayout Layout passed in through props.
   * @return {Array}                Working layout.
   */
  generateLayout(initialLayout) {
    var layout = [].concat(initialLayout || []);
    layout = layout.map(function(l, i) {
      l.i = i;
      return l;
    });
    if (layout.length !== this.props.children.length) {
      // Fill in the blanks
    }
    return utils.compact(layout);
  },

  getBreakpointFromWidth(width) {
    return _(this.props.breakpoints)
    .pairs()
    .sortBy(function(val) { return -val[1];})
    .find(function(val) {return width > val[1];})[0];
  },

  /**
   * On window resize, work through breakpoints and reset state with the new width & breakpoint.
   */
  onWindowResize() {
    // Set breakpoint
    var width = this.getDOMNode().offsetWidth;
    this.setState({width: width, breakpoint: this.getBreakpointFromWidth(width)});
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

  onResize(e, {element, position}) {
    console.log('resizing');
  },

  onResizeStop(e, {element, position}) {

  },

  /**
   * Create a placeholder object.
   * @return {Element} Placeholder div.
   */
  placeholder() {
    if (!this.state.activeDrag) return null;

    return (
      <GridItem
        {...this.state.activeDrag}
        className="react-grid-placeholder"
        containerWidth={this.state.width}
        cols={this.props.cols}
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
  processGridItem(child, i) {
    var l = utils.getLayoutItem(this.state.layout, i);

    // watchStart property tells Draggable to react to changes in the start param
    // Must be turned off on the item we're dragging as the changes in `activeDrag` cause rerenders
    var drag = this.state.activeDrag;
    var moveOnStartChange = drag && drag.i === i ? false : true;
    return (
      <GridItem 
        {...l}
        containerWidth={this.state.width}
        cols={this.props.cols}
        margin={this.props.margin}
        rowHeight={this.props.rowHeight}
        moveOnStartChange={moveOnStartChange}
        handle={this.props.handle}
        onDragStop={this.onDragStop}
        onDragStart={this.onDragStart}
        onDrag={this.onDrag}
        onResize={this.onResize}
        onResizeStop={this.onResizeStop}
        isDraggable={this.props.isDraggable}
        isResizable={this.props.isResizable}
        >
        {child}
      </GridItem>
    );
  },

  render() {
    // Calculate classname
    var {className, initialLayout, ...props} = this.props;
    className = 'react-grid-layout ' + (className || '');

    return (
      <div {...props} className={className} style={{height: this.containerHeight()}}>
        {React.Children.map(this.props.children, this.processGridItem)}
        {this.placeholder()}
      </div>
    );
  }
});

