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
   * Return position on the page given an x, y, w, h.
   * left, top, width, height are all in pixels.
   * @param  {Object}  l             Layout object.
   * @return {Object}                Object containing coords.
   */
  calcPosition(l) {
    var cols = this.props.cols;
    var out = {
      left: this.state.width * (l.x / cols),
      top: this.props.rowHeight * l.y,
      width: (this.state.width * l.w / cols) - ((l.w - 1) * this.props.margin[0]) + 'px',
      height: l.h * this.props.rowHeight - this.props.margin[1] + 'px'
    };
    // If we're not mounted yet, use percentages; otherwise items won't fit the window properly
    // because this.state.width hasn't actually been populated with a real value
    if (!this.isMounted()) {
      out.left = perc(out.x / this.state.width);
      out.width = perc(out.width / this.state.width);
    }
    return out;
  },

  /**
   * Given an element, inspect its styles and generate new x,y coordinates.
   * @param  {DOMElement} element DOM Element.
   * @return {Object}             x and y coordinates.
   */
  calcXY(element) {
    var newX = parseInt(element.style.left, 10);
    var newY = parseInt(element.style.top, 10);

    var x = Math.round((newX / this.state.width) * this.props.cols);
    var y = Math.round(newY / this.props.rowHeight);
    x = Math.max(Math.min(x, this.props.cols), 0);
    y = Math.max(y, 0);
    return {x, y};
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

  /**
   * Get the absolute position of a child by index. This does not include drag offsets or window resizing.
   * @param  {Number} i Index of the child.
   * @return {Object}   X and Y coordinates, in px.
   */
  getSimpleAbsolutePosition(i) {
    var s = this.state, p = this.props;
    var l = getLayoutItem(this.state.layout, i);
    return {
      x: (l.x / p.cols) * s.width,
      y: l.y * p.rowHeight
    };
  },

  /**
   * On window resize, work through breakpoints and reset state with the new width & breakpoint.
   */
  onResize() {
    // Set breakpoint
    var width = this.getDOMNode().offsetWidth;
    var breakpoint = _(this.props.breakpoints)
    .pairs()
    .sortBy(function(val) { return -val[1];})
    .find(function(val) {return width > val[1];})[0];

    this.setState({width: width, breakpoint: breakpoint});
  },

  /**
   * Create a placeholder object.
   * @return {Element} Placeholder div.
   */
  placeholder() {
    if (!this.state.activeDrag) return null;
    var {left, top, width, height} = this.calcPosition(this.state.activeDrag);

    return (
      <div style={{width: width, height: height, left: left, top: top, position: 'absolute'}} 
        className="placeholder" />
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

    var {left, top, width, height} = this.calcPosition(l);

    // We can set the width and height on the child, but unfortunately we can't set the position
    child.props.style = {
      width: width,
      height: height,
      position: 'absolute'
    };

    // watchStart property tells Draggable to react to changes in the start param
    // Must be turned off on the item we're dragging as the changes in `activeDrag` cause rerenders
    var drag = this.state.activeDrag;
    var watchStart = drag && drag.i === i ? false : true;
    return (
      <Draggable
        start={{x: left, y: top}}
        watchStart={watchStart} 
        onStop={this.onDragStop.bind(this, i)}
        onStart={this.onDragStart.bind(this, i)}
        onDrag={this.onDrag.bind(this, i)}>
        {child}
      </Draggable>
    );
  },

  onDragStart(i, e, {element, position}) {
    // nothing
  },

  onDrag(i, e, {element, position}) {
    var layout = this.state.layout;
    var l = getLayoutItem(layout, i);

    // Get new XY
    var {x, y} = this.calcXY(element);

    // Cap x at numCols
    if (x + l.w > this.props.cols) {
      x = this.props.cols - l.w;
    }

    // Create drag element (display only)
    var activeDrag = {
      w: l.w, h: l.h, x: x, y: y, placeholder: true, i: i
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
  onDragStop(i, e, {element, position}) {
    var layout = this.state.layout;
    var l = getLayoutItem(layout, i);

    // Get new XY
    var {x, y} = this.calcXY(element);

    // Cap x at numCols
    if (x + l.w > this.props.cols) {
      x = this.props.cols - l.w;
    }

    // Move the element here
    layout = moveElement(layout, l, x, y);
    // Set state
    this.setState({layout: compact(layout), activeDrag: null});
  },

  render() {
    // Calculate classname
    var {className, initialLayout, ...props} = this.props;
    className = (className || "") + " reactGridLayout";

    var children = React.Children.map(this.props.children, this.processGridItem);

    return (
      <div {...props} className={className} style={{position: 'relative', height: '100%'}}>
        {children}
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
  while (layoutItemCollidesWith(itemsBefore, fakeItem).length) {
    fakeItem.y++;
  }
  return moveElement(layout, itemToMove, undefined, fakeItem.y);
}

/**
 * Helper to convert a number to a percentage string.
 * @param  {Number} num Any number
 * @return {String}     That number as a percentage.
 */
function perc(num) {
  return num * 100 + '%';
}
