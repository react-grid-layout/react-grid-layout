"use strict";

var utils = module.exports = {

  /**
   * Given two layouts, check if they collide.
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
   * @param  {Array} layout Layout.
   * @return {Array}       Compacted Layout.
   */
  compact: function (layout, bounds) {
    // We go through the items by row and column.
    var compareWith = [], out = [];
    var sorted = utils.getLayoutItemsByRowCol(layout);

    for (var i = 0, len = sorted.length; i < len; i++) {
      var l = sorted[i];

      // Don't move static elements
      if (!l["static"]) {
        // Move the element up as far as it can go without colliding.
        while (l.y > 0 && !utils.layoutItemCollidesWith(compareWith, l).length) {
          l.y--;
        }

        // Move it down, and keep moving it down if it's colliding.
        var collides = utils.layoutItemCollidesWith(compareWith, l);
        while (collides.length) {
          l.y = collides[0].y + collides[0].h;
          collides = utils.layoutItemCollidesWith(compareWith, l);
        }
      }

      // Add to comparison array. We only collide with items before this one.
      compareWith.push(l);

      // Add to output array to make sure they still come out in the right order.
      out[l.i] = l;

      // Clear moved flag, if it exists.
      delete l.moved;
    }

    return out;
  },

  correctBounds: function (layout, bounds) {
    for (var i = 0, len = layout.length; i < len; i++) {
      var l = layout[i];
      if (l.x + l.w > bounds.cols) l.x = bounds.cols - l.w;
    }
    return layout;
  },

  /**
   * Get a layout item by index. Used so we can override later on if necessary.
   *
   * @param  {Array} layout Layout array.
   * @param  {Number} i      Index
   * @return {LayoutItem}        Item at index.
   */
  getLayoutItem: function (layout, i) {
    return layout[i];
  },

  /**
   * Get layout items sorted from top left to right and down.
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
   * Get layout items sorted from top left to down.
   * @return {Array} Array of layout objects.
   */
  getLayoutItemsByColRow: function (layout) {
    return [].concat(layout).sort(function (a, b) {
      if (a.x > b.x || a.x === b.x && a.y > b.y) {
        return 1;
      }
      return -1;
    });
  },

  /**
   * Returns an array of items this layout item collides with.
   * @param  {Object} layoutItem Layout item.
   * @return {Array}             Array of colliding layout objects.
   */
  layoutItemCollidesWith: function (layout, layoutItem) {
    var out = [];
    for (var i = 0, len = layout.length; i < len; i++) {
      if (utils.collides(layout[i], layoutItem)) out.push(layout[i]);
    }
    return out;
  },

  /**
   * Move / resize an element. Responsible for doing cascading movements of other elements.
   * @param  {Array}  layout Full layout to modify.
   * @param  {LayoutItem} l element to move.
   * @param  {Number} [x] X position in grid units.
   * @param  {Number} [y] Y position in grid units.
   * @param  {Number} [w] Width in grid units.
   * @param  {Number} [h] Height in grid units.
   */
  moveElement: function (layout, l, x, y, w, h) {
    if (l["static"]) return layout;
    // This is quite a bit faster than extending the object
    if (x !== undefined) l.x = x;
    if (y !== undefined) l.y = y;
    if (w !== undefined) l.w = w;
    if (h !== undefined) l.h = h;
    l.moved = true;

    // Get all items this box collides with.
    var collisions = utils.layoutItemCollidesWith(layout, l);

    // Move each item that collides away from this element.
    for (var i = 0, len = collisions.length; i < len; i++) {
      if (collisions[i].moved) continue; // short circuit so we don't re-move items

      // Don't move static items - we have to move *this* element away
      if (collisions[i]["static"]) {
        layout = utils.moveElementAwayFromCollision(layout, collisions[i], l);
      } else {
        layout = utils.moveElementAwayFromCollision(layout, l, collisions[i]);
      }
    }

    return layout;
  },

  /**
   * This is where the magic needs to happen - given a collision, move an element away from the collision.
   * It's okay to cascade movements here, but be careful to not have a move b move c move a.
   * @param  {Array} layout            Full layout to modify.
   * @param  {LayoutItem} collidesWith Layout item we're colliding with.
   * @param  {LayoutItem} itemToMove   Layout item we're moving.
   */
  moveElementAwayFromCollision: function (layout, collidesWith, itemToMove) {
    var sorted = utils.getLayoutItemsByRowCol(layout);
    var itemsBefore = sorted.slice(0, sorted.indexOf(itemToMove)).concat(collidesWith);

    // While the item collides with any of the items before it, move it down.
    itemToMove.y = 0;
    var collisions;
    do {
      collisions = utils.layoutItemCollidesWith(itemsBefore, itemToMove);
      if (collisions.length) itemToMove.y = collisions[0].y + collisions[0].h;
    } while (collisions.length);

    return utils.moveElement(layout, itemToMove, undefined, itemToMove.y);
  },

  /**
   * Helper to convert a number to a percentage string.
   * @param  {Number} num Any number
   * @return {String}     That number as a percentage.
   */
  perc: function (num) {
    return num * 100 + "%";
  },

  /**
   * Validate a layout. Throws errors.
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