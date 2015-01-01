"use strict";

var utils = module.exports = {

  /**
   * Return the bottom coordinate of the layout.
   * 
   * @param  {Array} layout Layout array.
   * @return {Number}       Bottom coordinate.
   */
  bottom: function (layout) {
    var max = 0, bottomY;
    for (var i = 0, len = layout.length; i < len; i++) {
      bottomY = layout[i].y + layout[i].h;
      if (bottomY > max) max = bottomY;
    }
    return max;
  },

  /**
   * Given two layouts, check if they collide.
   * 
   * @param  {Object} l1 Layout object.
   * @param  {Object} l2 Layout object.
   * @return {Boolean}   True if colliding.
   */
  collides: function (l1, l2) {
    if (l1 === l2) return false; // same element
    if (l1.x + l1.w <= l2.x) return false; // l1 is left of l2
    if (l1.x >= l2.x + l2.w) return false; // l1 is right of l2
    if (l1.y + l1.h <= l2.y) return false; // l1 is above l2
    if (l1.y >= l2.y + l2.h) return false; // l1 is below l2
    return true; // boxes overlap
  },

  /**
   * Given a layout, compact it. This involves going down each y coordinate and removing gaps
   * between items.
   * 
   * @param  {Array} layout Layout.
   * @return {Array}       Compacted Layout.
   */
  compact: function (layout) {
    // We go through the items by row and column.
    var compareWith = [], out = [];
    var sorted = utils.getLayoutItemsByRowCol(layout);

    for (var i = 0, len = sorted.length; i < len; i++) {
      var l = sorted[i];

      // Don't move static elements
      if (!l["static"]) {
        l = utils.compactItem(compareWith, l);
      }

      // Add to comparison array. We only collide with items before this one.
      compareWith.push(l);

      // Add to output array to make sure they still come out in the right order.
      out[layout.indexOf(l)] = l;

      // Clear moved flag, if it exists.
      delete l.moved;
    }

    return out;
  },

  compactItem: function (compareWith, l) {
    // Move the element up as far as it can go without colliding.
    while (l.y > 0 && !utils.getFirstCollision(compareWith, l)) {
      l.y--;
    }

    // Move it down, and keep moving it down if it's colliding.
    var collides;
    while (collides = utils.getFirstCollision(compareWith, l)) {
      l.y = collides.y + collides.h;
    }
    return l;
  },

  /**
   * Given a layout, make sure all elements fit within its bounds.
   * 
   * @param  {Array} layout Layout array.
   * @param  {Number} bounds Number of columns.
   * @return {[type]}        [description]
   */
  correctBounds: function (layout, bounds) {
    for (var i = 0, len = layout.length; i < len; i++) {
      var l = layout[i];
      // Overflows right
      if (l.x + l.w > bounds.cols) l.x = bounds.cols - l.w;
      // Overflows left
      if (l.x < 0) {
        l.x = 0;
        l.w = bounds.cols;
      }
    }
    return layout;
  },

  /**
   * Given a width, find the highest breakpoint that matches is valid for it (width > breakpoint).
   * 
   * @param  {Object} breakpoints Breakpoints object (e.g. {lg: 1200, md: 960, ...})
   * @param  {Number} width Screen width.
   * @return {String}       Highest breakpoint that is less than width.
   */
  getBreakpointFromWidth: function (breakpoints, width) {
    var sorted = utils.sortBreakpoints(breakpoints);
    var matching = sorted[0];
    for (var i = 1, len = sorted.length; i < len; i++) {
      var breakpointName = sorted[i];
      if (width > breakpoints[breakpointName]) matching = breakpointName;
    }
    return matching;
  },

  /**
   * Get a layout item by ID. Used so we can override later on if necessary.
   *
   * @param  {Array}  layout Layout array.
   * @param  {Number} id     ID
   * @return {LayoutItem}    Item at ID.
   */
  getLayoutItem: function (layout, id) {
    id = "" + id;
    for (var i = 0, len = layout.length; i < len; i++) {
      if ("" + layout[i].i === id) return layout[i];
    }
  },

  /**
   * Get layout items sorted from top left to right and down.
   * 
   * @return {Array} Array of layout objects.
   */
  getLayoutItemsByRowCol: function (layout) {
    return [].concat(layout).sort(function (a, b) {
      if (a.y > b.y || a.y === b.y && a.x > b.x) {
        return 1;
      }
      return -1;
    });
  },

  /**
   * Returns the first item this layout collides with.
   * It doesn't appear to matter which order we approach this from, although
   * perhaps that is the wrong thing to do.
   * 
   * @param  {Object} layoutItem Layout item.
   * @return {Object|undefined}  A colliding layout item, or undefined.
   */
  getFirstCollision: function (layout, layoutItem) {
    for (var i = 0, len = layout.length; i < len; i++) {
      if (utils.collides(layout[i], layoutItem)) return layout[i];
    }
  },

  getAllCollisions: function (layout, layoutItem) {
    var out = [];
    for (var i = 0, len = layout.length; i < len; i++) {
      if (utils.collides(layout[i], layoutItem)) out.push(layout[i]);
    }
    return out;
  },

  /**
   * Move an element. Responsible for doing cascading movements of other elements.
   * 
   * @param  {Array}      layout Full layout to modify.
   * @param  {LayoutItem} l      element to move.
   * @param  {Number}     [x]    X position in grid units.
   * @param  {Number}     [y]    Y position in grid units.
   * @param  {Boolean}    [isUserAction] If true, designates that the item we're moving is
   *                                     being dragged/resized by th euser.
   */
  moveElement: function (layout, l, x, y, isUserAction) {
    if (l["static"]) return layout;

    // Short-circuit if nothing to do.
    if (l.y === y && l.x === x) return layout;

    var movingUp = l.y > y;
    // This is quite a bit faster than extending the object
    if (x !== undefined) l.x = x;
    if (y !== undefined) l.y = y;
    l.moved = true;

    // If this collides with anything, move it.
    // When doing this comparison, we have to sort the items we compare with
    // to ensure, in the case of multiple collisions, that we're getting the
    // nearest collision.
    var sorted = utils.getLayoutItemsByRowCol(layout);
    if (movingUp) sorted = sorted.reverse();
    var collisions = utils.getAllCollisions(sorted, l);

    // Move each item that collides away from this element.
    for (var i = 0, len = collisions.length; i < len; i++) {
      var collision = collisions[i];
      // console.log('resolving collision between', l.i, 'at', l.y, 'and', collision.i, 'at', collision.y);

      // Short circuit so we can't infinite loop
      if (collision.moved) continue;

      // This makes it feel a bit more precise by waiting to swap for just a bit when moving up.
      if (l.y > collision.y && l.y - collision.y > collision.h / 4) continue;

      // Don't move static items - we have to move *this* element away
      if (collision["static"]) {
        layout = utils.moveElementAwayFromCollision(layout, collision, l, isUserAction);
      } else {
        layout = utils.moveElementAwayFromCollision(layout, l, collision, isUserAction);
      }
    }

    return layout;
  },

  /**
   * This is where the magic needs to happen - given a collision, move an element away from the collision.
   * We attempt to move it up if there's room, otherwise it goes below.
   * 
   * @param  {Array} layout            Full layout to modify.
   * @param  {LayoutItem} collidesWith Layout item we're colliding with.
   * @param  {LayoutItem} itemToMove   Layout item we're moving.
   * @param  {Boolean} [isUserAction]  If true, designates that the item we're moving is being dragged/resized
   *                                   by the user.
   */
  moveElementAwayFromCollision: function (layout, collidesWith, itemToMove, isUserAction) {
    // If there is enough space above the collision to put this element, move it there.
    // We only do this on the main collision as this can get funky in cascades and cause
    // unwanted swapping behavior.
    if (isUserAction) {
      // Make a mock item so we don't modify the item here, only modify in moveElement.
      var fakeItem = {
        x: itemToMove.x,
        y: itemToMove.y,
        w: itemToMove.w,
        h: itemToMove.h };
      fakeItem.y = Math.max(collidesWith.y - itemToMove.h, 0);
      if (!utils.getFirstCollision(layout, fakeItem)) {
        return utils.moveElement(layout, itemToMove, undefined, fakeItem.y);
      }
    }

    // Previously this was optimized to move below the collision directly, but this can cause problems
    // with cascading moves, as an item may actually leapflog a collision and cause a reversal in order.
    return utils.moveElement(layout, itemToMove, undefined, itemToMove.y + 1);
  },

  /**
   * Given existing layouts and a new breakpoint, generate a new layout.
   * This finds the layout above the new one and generates from it, if it exists.
   * 
   * @param  {Array} layouts     Existing layouts.
   * @param  {Array} breakpoints All breakpoints.
   * @param  {String} breakpoint New breakpoint.
   * @param  {String} breakpoint Last breakpoint (for fallback).
   * @param  {Number} cols       Column count at new breakpoint.
   * @return {Array}             New layout.
   */
  newResponsiveLayout: function (layouts, breakpoints, breakpoint, lastBreakpoint, cols) {
    // Find or generate the next layout
    var layout = layouts[lastBreakpoint];
    var breakpointsSorted = utils.sortBreakpoints(breakpoints);
    var breakpointsAbove = breakpointsSorted.slice(breakpointsSorted.indexOf(breakpoint));
    for (var i = 0, len = breakpointsAbove.length; i < len; i++) {
      var b = breakpointsAbove[i];
      if (layouts[b]) {
        layout = layouts[b];
        break;
      }
    }
    layout = JSON.parse(JSON.stringify(layout)); // clone layout so we don't modify existing items
    return utils.compact(utils.correctBounds(layout, { cols: cols }));
  },

  /**
   * Helper to convert a number to a percentage string.
   * 
   * @param  {Number} num Any number
   * @return {String}     That number as a percentage.
   */
  perc: function (num) {
    return num * 100 + "%";
  },

  /**
   * Given breakpoints, return an array of breakpoints sorted by width. This is usually
   * e.g. ['xxs', 'xs', 'sm', ...]
   * 
   * @param  {Object} breakpoints Key/value pair of breakpoint names to widths.
   * @return {Array}              Sorted breakpoints.
   */
  sortBreakpoints: function (breakpoints) {
    var keys = Object.keys(breakpoints);
    return keys.sort(function (a, b) {
      return breakpoints[a] - breakpoints[b];
    });
  },

  /**
   * Generate a layout using the initialLayout an children as a template.
   * Missing entries will be added, extraneous ones will be truncated.
   * 
   * @param  {Array}  initialLayout Layout passed in through props.
   * @param  {String} breakpoint    Current responsive breakpoint.
   * @return {Array}                Working layout.
   */
  synchronizeLayoutWithChildren: function (initialLayout, children, cols) {
    initialLayout = initialLayout || [];

    // Generate one layout item per child.
    var layout = [];
    for (var i = 0, len = children.length; i < len; i++) {
      var child = children[i];
      // Don't overwrite if it already exists.
      var exists = utils.getLayoutItem(initialLayout, child.key);
      if (exists) {
        // Ensure 'i' is always a string
        exists.i = "" + exists.i;
        layout.push(exists);
        continue;
      }
      // New item: attempt to use a layout item from the child, if it exists.
      var g = child.props._grid;
      if (g) {
        utils.validateLayout([g], "ReactGridLayout.child");
        // Validated; add it to the layout. Bottom 'y' possible is the bottom of the layout.
        // This allows you to do nice stuff like specify {y: Infinity}
        layout.push({
          w: g.w, h: g.h, x: g.x, y: Math.min(utils.bottom(layout), g.y), "static": g["static"], i: child.key
        });
      } else {
        // Nothing provided: ensure this is added to the bottom
        layout.push({ w: 1, h: 1, x: 0, y: utils.bottom(layout), i: child.key });
      }
    }

    // Correct the layout.
    layout = utils.correctBounds(layout, { cols: cols });
    layout = utils.compact(layout);

    return layout;
  },

  /**
   * Validate a layout. Throws errors.
   * 
   * @param  {Array}  layout        Array of layout items.
   * @param  {String} [contextName] Context name for errors.
   * @throw  {Error}                Validation error.
   */
  validateLayout: function (layout, contextName) {
    contextName = contextName || "Layout";
    var subProps = ["x", "y", "w", "h"];
    if (!Array.isArray(layout)) throw new Error(contextName + " must be an array!");
    for (var i = 0, len = layout.length; i < len; i++) {
      for (var j = 0; j < subProps.length; j++) {
        if (typeof layout[i][subProps[j]] !== "number") {
          throw new Error("ReactGridLayout: " + contextName + "[" + i + "]." + subProps[j] + " must be a Number!");
        }
      }
      if (layout[i]["static"] !== undefined && typeof layout[i]["static"] !== "boolean") {
        throw new Error("ReactGridLayout: " + contextName + "[" + i + "].static must be a Boolean!");
      }
    }
  }
};