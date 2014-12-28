'use strict';
var React = require('react/addons');
var _ = require('lodash');
var GridItem = require('./GridItem.jsx');

var ReactGridLayout = module.exports = React.createClass({
  displayName: 'ReactGridLayout',
  mixins: [React.addons.PureRenderMixin],

  propTypes: {
    // If true, the container swells and contracts to fit contents
    autoSize: React.PropTypes.bool,
    // {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
    breakpoints: React.PropTypes.object,
    // # of cols
    cols: React.PropTypes.number,
    // Layout is an array of object with the format:
    // {x: Number, y: Number, w: Number, h: Number}
    initialLayout: React.PropTypes.array,
    // This allows setting this on the server side
    initialWidth: React.PropTypes.number,
    // margin between items (x, y) in px
    margin: React.PropTypes.array,
    // Rows have a static height, but you can change this based on breakpoints if you like
    rowHeight: React.PropTypes.number
  },

  getDefaultProps() {
    return {
      autoSize: true,
      breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0},
      cols: 10, 
      rowHeight: 150,
      initialWidth: 1280,
      margin: [10, 10]
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
    window.addEventListener('resize', this.onResize);
    this.onResize();
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
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
    return compact(layout);
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
  onResize() {
    // Set breakpoint
    var width = this.getDOMNode().offsetWidth;
    this.setState({width: width, breakpoint: this.getBreakpointFromWidth(width)});
  },

  onDragStart(i, e, {element, position}) {
    // nothing
  },

  onDrag(i, x, y) {
    var layout = this.state.layout;
    var l = getLayoutItem(layout, i);

    // Create drag element (display only)
    var activeDrag = {
      w: l.w, h: l.h, x: l.x, y: l.y, placeholder: true, i: i
    };
    
    // Move the element to the dragged location.
    layout = moveElement(layout, l, x, y);

    this.setState({
      layout: compact(layout),
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
    var l = getLayoutItem(layout, i);

    // Move the element here
    layout = moveElement(layout, l, x, y);
    // Set state
    this.setState({layout: compact(layout), activeDrag: null});
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
    var l = getLayoutItem(this.state.layout, i);

    // watchStart property tells Draggable to react to changes in the start param
    // Must be turned off on the item we're dragging as the changes in `activeDrag` cause rerenders
    var drag = this.state.activeDrag;
    var watchStart = drag && drag.i === i ? false : true;
    return (
      <GridItem 
        {...l}
        containerWidth={this.state.width}
        cols={this.props.cols}
        margin={this.props.margin}
        rowHeight={this.props.rowHeight}
        watchStart={watchStart}
        onDragStop={this.onDragStop}
        onDragStart={this.onDragStart}
        onDrag={this.onDrag}>
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

/**
 * Given two layouts, check if they collide.
 * @param  {Object} l1 Layout object.
 * @param  {Object} l2 Layout object.
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
 * @param  {Array} layout Layout.
 * @return {Array}       Compacted Layout.
 */
function compact(layout) {
  // We go through the items by row and column.
  var sorted = getLayoutItemsByRowCol(layout);
  var out = _.map(getLayoutItemsByRowCol(layout), function(l, i) {
    // Only collide with elements before this one.
    var ls = sorted.slice(0, i);
    // Move the element up as far as it can go without colliding.
    do {
      l.y--;
    }
    while (l.y > -1 && !layoutItemCollidesWith(ls, l).length);

    // Move it down, and keep moving it down if it's colliding.
    do {
      l.y++;
    } while(layoutItemCollidesWith(ls, l).length);

    delete l.moved;
    return l;
  });
  return _.sortBy(out, 'i');
}

/**
 * Get a layout item by index. Used so we can override later on if necessary.
 *
 * @param  {Array} layout Layout array.
 * @param  {Number} i      Index
 * @return {LayoutItem}        Item at index.
 */
function getLayoutItem(layout, i) {
  return layout[i];
}

/**
 * Get layout items sorted from top left to right and down.
 * @return {Array} Array of layout objects.
 */
function getLayoutItemsByRowCol(layout) {
  return [].concat(layout).sort(function(a, b) {
    if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
      return 1;
    }
    return -1;
  });
}

/**
 * Get layout items sorted from top left to down.
 * @return {Array} Array of layout objects.
 */
function getLayoutItemsByColRow(layout) {
  return [].concat(layout).sort(function(a, b) {
    if (a.x > b.x || a.x === b.x && a.y > b.y) {
      return 1;
    }
    return -1;
  });
}

/**
 * Returns an array of items this layout item collides with.
 * @param  {Object} layoutItem Layout item.
 * @return {Array}             Array of colliding layout objects.
 */
function layoutItemCollidesWith(layout, layoutItem) {
  return _.filter(layout, collides.bind(null, layoutItem));
}

/**
 * Move / resize an element. Responsible for doing cascading movements of other elements.
 * @param  {Array}  layout Full layout to modify.
 * @param  {LayoutItem} l element to move.
 * @param  {Number} [x] X position in grid units.
 * @param  {Number} [y] Y position in grid units.
 * @param  {Number} [w] Width in grid units.
 * @param  {Number} [h] Height in grid units.
 */
function moveElement(layout, l, x, y, w, h) {
  // _.pick trickery removes undefined values from the object so we don't overwrite
  // the object with attrs we didn't pass
  _.extend(l, _.pick({x: x, y: y, w: w, h: h, moved: 1}, _.isNumber));

  // Get all items this box collides with.
  var collisions = layoutItemCollidesWith(layout, l);

  // Move each item that collides away from this element.
  _.each(collisions, function(coll) {
    if (coll.moved) return; // short circuit so we don't re-move items
    layout = moveElementAwayFromCollision(layout, l, coll);
  });

  return layout;
}

/**
 * This is where the magic needs to happen - given a collision, move an element away from the collision.
 * It's okay to cascade movements here, but be careful to not have a move b move c move a.
 * @param  {Array} layout            Full layout to modify.
 * @param  {LayoutItem} collidesWith Layout item we're colliding with.
 * @param  {LayoutItem} itemToMove   Layout item we're moving.
 */
function moveElementAwayFromCollision(layout, collidesWith, itemToMove) {
  var fakeItem = _.extend({}, itemToMove, {y: 0});

  var sorted = getLayoutItemsByRowCol(layout);
  var itemsBefore = sorted.slice(0, sorted.indexOf(itemToMove)).concat(collidesWith);

  // While the item collides with any of the items before it, move it down.
  var collisions;
  do {
    collisions = layoutItemCollidesWith(itemsBefore, fakeItem);
    if (collisions.length) fakeItem.y = collisions[0].y + collisions[0].h;
  } while(collisions.length);

  return moveElement(layout, itemToMove, undefined, fakeItem.y);
}
