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

  onResize() {
    // Set breakpoint
    var width = this.refs.layout.getDOMNode().offsetWidth;
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

  perc(num) {
    return num * 100 + '%';
  },

  processGridItem(child, i) {
    var l = this.state.layout[i];
    var cols = this.props.cols;

    // We can set the width and height on the child, but unfortunately we can't set the position
    child.props.style = {
      width: this.perc(l.w / cols),
      height: l.h * this.props.rowHeight + 'px',
      position: 'absolute'
    };

    // We calculate the x and y every pass, even though it's only actually used the first time.
    var x = this.state.width * (l.x / cols);
    var y = this.props.rowHeight * l.y;

    // If the width has changed, we need to change the x position.
    if (this.state.width !== this.props.initialWidth) {
      // This is what the x position would be without resizing.
      var originalX = this.props.initialWidth * (l.x / cols);
      
      // If the item has been dragged, we need to take that into account.
      var widthMult = this.state.width / this.props.initialWidth;
      x += (this.state.dragOffsets[i] * widthMult);
      originalX += this.state.dragOffsets[i];
      
      // Margin the child over by the difference. Draggable doesn't mess with the margin so this is
      // safe to set.
      child.props.style.marginLeft = x - originalX + 'px';
    }

    return (
      <Draggable
        grid={[25, 25]} 
        start={{x: x, y: y}}
        onStop={this.onDragStop.bind(this, i)}>
        {child}
      </Draggable>
    );
  },

  /**
   * When dragging stops, record the new position of the element in dragOffsets. This is as an x offset
   * from its original position.
   * @param  {Number} i Index of the child.
   * @param  {Event}  e DOM Event.
   */
  onDragStop(i, e) {
    var widthMult = this.state.width / this.props.initialWidth;
    // Calculate the new position by using the existing left + marginLeft, and multiplying by the reciprocal
    // of the width difference (so a 50px move at 1/2 screen size = 100px)
    var newPosition = parseInt(e.target.style.left, 10) + parseInt(e.target.style.marginLeft, 10) * (1 / widthMult);
    // Calculate the offset - this is the new position minus the expected position. The offset needs to be
    // modulated by the width multiple
    var offset = (newPosition - this.getSimpleAbsolutePosition(i).x) * widthMult;

    // Make the change. We use the immutability helpers for this so we can do a simple shouldComponentUpdate
    var change = {};
    change[i] = {$set: offset};
    var offsets = React.addons.update(this.state.dragOffsets, change);
    this.setState({dragOffsets: offsets});
  },

  render() {
    var {className, initialLayout, ...props} = this.props;
    className = (className || "") + " reactGridLayout";
    var children = React.Children.map(this.props.children, this.processGridItem);
    return (
      <div {...props} className={className} style={{position: 'relative', height: '100%'}} ref="layout">
        {children}
      </div>
    );
  }
});
