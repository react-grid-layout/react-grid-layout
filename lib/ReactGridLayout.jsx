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
   * @param  {Object}  l             Layout object.
   * @return {Object}                Object containing coords.
   */
  calcPosition(l, usePercentage) {
    var cols = this.props.cols;
    var out = {
      x: this.state.width * (l.x / cols),
      y: this.props.rowHeight * l.y,
      width: (this.state.width * l.w / cols) - ((l.w - 1) * this.props.margin[0]) + 'px',
      height: l.h * this.props.rowHeight - this.props.margin[1] + 'px'
    };
    // If we're not mounted yet, use percentages; otherwise items won't fit the window properly
    // because this.state.width hasn't actually been populated with a real value
    if (!this.isMounted()) {
      out.x = this.perc(out.x / this.state.width);
      out.width = this.perc(out.width / this.state.width);
    }
    return out;
  },

  /**
   * Given two layouts, check if they collide.
   * @param  {Object} l1 Layout object.
   * @param  {Object} l2 Layout object.
   * @return {Boolean}   True if colliding.
   */
  collides(l1, l2) {
    if (l1.x + l1.w <= l2.x) return false; // l1 is left of l2
    if (l1.x >= l2.x + l2.w) return false; // l1 is right of l2
    if (l1.y + l1.h <= l2.y) return false; // l1 is above l2
    if (l1.y >= l2.y + l2.h) return false; // l1 is below l2
    return true; // boxes overlap
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
   * Generate a layout using the initialLayout as a template.
   * Missing entries will be added, extraneous ones will be truncated.
   * @param  {Array} initialLayout Layout passed in through props.
   * @return {Array}                Working layout.
   */
  generateLayout(initialLayout) {
    var layout = [].concat(initialLayout || []);
    layout = layout.map(function(l, i) {
      l.index = i;
      return l;
    });
    if (layout.length !== this.props.children.length) {
      // Fill in the blanks
    }
    return layout;
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
   * Get layout items sorted from top right down.
   * @return {Array} Array of layout objects.
   */
  getLayoutsByRowCol(layouts) {
    return _.sortBy(layouts || this.props.layout, function(a, b) {
      if (a.y > b.y || a.y === b.y && a.x > b.x) {
        return 1;
      }
      return -1;
    });
  },

  /**
   * Returns an array of items this layout collides with.
   * @param  {Object} layoutItem Layout item.
   * @return {Array}             Array of colliding layout objects.
   */
  layoutCollidesWith(layoutItem, layout) {
    var sorted = this.getLayoutsByRowCol(_.without(layout, layoutItem));
    return _.filter(sorted, this.collides.bind(this, layoutItem));
  },

  /**
   * Move / resize an element. Responsible for doing cascading movements of other elements.
   * @param  {Array}  layout Layout to modify.
   * @param  {Number} i Index of element.
   * @param  {Number} [x] X position in grid units.
   * @param  {Number} [y] Y position in grid units.
   * @param  {Number} [w] Width in grid units.
   * @param  {Number} [h] Height in grid units.
   */
  moveElement(layout, i, x, y, w, h) {
    // _.pick trickery removes undefined values from the object so we don't overwrite
    // the object with attrs we didn't pass
    var l = _.extend(layout[i], _.pick({x: x, y: y, w: w, h: h}, _.isNumber));
    layout[i] = l;

    var collisions = this.layoutCollidesWith(l, layout);
    collisions = _.map(collisions, function(c) { return _.extend(c, {causedBy: l}); });

    if (collisions.length) {  
      _.each(collisions, function(collision) {
        this.moveElement(layout, collision.index, undefined, l.y + l.h);
      }.bind(this));
    }

    return layout;
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
    x = Math.max(Math.min(x, this.props.cols), 0);
    y = Math.max(y, 0);

    var layout = this.moveElement(this.state.layout, i, x, y);
    console.log('moving to', x, y);
    this.setState({layout: [].concat(layout)}); // use concat to make simple shouldComponentUpdate
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
