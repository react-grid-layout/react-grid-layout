'use strict';
var React = require('react/addons');
var _ = require('lodash');
var Draggable = require('react-draggable');

var ReactGridLayout = module.exports = React.createClass({
  displayName: 'ReactGridLayout',
  mixins: [React.addons.PureRenderMixin],

  propTypes: {
    // Layout is an array of object with the format:
    // {x: Number, y: Number, w: Number, h: Number}
    initialLayout: React.PropTypes.array,
    bounds: React.PropTypes.array,
    margin: React.PropTypes.array,
    // {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
    breakpoints: React.PropTypes.object
  },

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
    this.onResize();
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  },

  /**
   * Return position on the page given an x, y, w, h.
   * x, y, w, h are all in pixels.
   * @param  {Object} l Layout object.
   * @return {Object}   Object containing coords.
   */
  calcPosition(l) {
    var cols = this.props.cols;
    return {
      x: this.state.width * (l.x / cols),
      y: this.props.rowHeight * l.y,
      width: (this.state.width * l.w / cols) - ((l.w - 1) * this.props.margin[0]) + 'px',
      height: l.h * this.props.rowHeight - this.props.margin[1] + 'px'
    };
  },

  onResize() {
    // Set breakpoint
    var width = this.getDOMNode().offsetWidth;
    var breakpoint = _(this.props.breakpoints)
    .pairs()
    .sortBy(function(val) { return -val[1];})
    .find(function(val) {return width > val[1];})[0];

    this.setState({width: width, lastWidth: this.state.width, breakpoint: breakpoint});
  },

  getDefaultProps() {
    return {
      cols: 10, // # of cols, rows
      rowHeight: 150, // Rows have a static height, but you can change this based on breakpoints if you like
      initialWidth: 1280, // This allows setting this on the server side
      margin: [10, 10],  // margin between items (x, y) in px
      initialBreakpoint: 'lg',
      breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}
    };
  },

  getInitialState() {
    return {
      layout: this.generateLayout(this.props.initialLayout),
      breakpoint: this.props.initialBreakpoint,
      width: this.props.initialWidth,
      // Fills it full of zeroes
      dragOffsets: _.range(0, this.props.children.length, 0)
    };
  },

  /**
   * Get the absolute position of a child by index. This does not include drag offsets or window resizing.
   * @param  {Number} i Index of the child.
   * @return {Object}   X and Y coordinates, in px.
   */
  getSimpleAbsolutePosition(i) {
    var s = this.state, p = this.props;
    return {
      x: (s.layout[i].x / p.cols) * s.width,
      y: s.layout[i].y * p.rowHeight
    };
  },

  /**
   * Generate a layout using the initialLayout as a template.
   * Missing entries will be added, extraneous ones will be truncated.
   * @param  {Array} initialLayout Layout passed in through props.
   * @return {Array}                Working layout.
   */
  generateLayout(initialLayout) {
    var layout = [].concat(initialLayout || []);
    if (layout.length !== this.props.children.length) {
      // Fill in the blanks
    }
    return layout;
  },

  /**
   * Move / resize an element. Responsible for doing cascading movements of other elements.
   * @param  {Number} i Index of element.
   * @param  {Number} x X position in grid units.
   * @param  {Number} y Y position in grid units.
   * @param  {Number} w Width in grid units.
   * @param  {Number} h Height in grid units.
   */
  moveElement(i, x, y, w, h) {
    var change = {};
    change[i] = {$merge: {x: x, y: y, w: w, h: h}};
    this.setState({layout: React.addons.update(this.state.layout, change)});
  },

  /**
   * Helper to convert a number to a percentage string.
   * @param  {Number} num Any number
   * @return {String}     That number as a percentage.
   */
  perc(num) {
    return num * 100 + '%';
  },

  /**
   * Given a grid item, set its style attributes & surround in a <Draggable>.
   * @param  {Element} child React element.
   * @param  {Number}  i     Index of element.
   * @return {Element}       Element wrapped in draggable and properly placed.
   */
  processGridItem(child, i) {
    var l = this.state.layout[i];

    // We calculate the x and y every pass, even though it's only actually used the first time.
    var {x, y, width, height} = this.calcPosition(l);

    // We can set the width and height on the child, but unfortunately we can't set the position
    child.props.style = {
      width: width,
      height: height,
      position: 'absolute'
    };

    // watchStart property tells Draggable to react to changes in the start param
    return (
      <Draggable
        start={{x: x, y: y}}
        watchStart={true} 
        onStop={this.onDragStop.bind(this, i)}>
        {child}
      </Draggable>
    );
  },

  /**
   * When dragging stops, figure out which position the element is closest to and update its x and y.
   * @param  {Number} i Index of the child.
   * @param  {Event}  e DOM Event.
   */
  onDragStop(i, e, {element, position}) {
    var newX = parseInt(element.style.left, 10);
    var newY = parseInt(element.style.top, 10);

    var x = Math.round((newX / this.state.width) * this.props.cols);
    var y = Math.round(newY / this.props.rowHeight);

    // Make the change. We use the immutability helpers for this so we can do a simple shouldComponentUpdate
    this.moveElement(i, x, y);
  },

  render() {
    // Calculate classname
    var {className, initialLayout, ...props} = this.props;
    className = (className || "") + " reactGridLayout";

    var children = React.Children.map(this.props.children, this.processGridItem);
    return (
      <div {...props} className={className} style={{position: 'relative', height: '100%'}}>
        {children}
      </div>
    );
  }
});
