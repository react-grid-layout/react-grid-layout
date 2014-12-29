'use strict';
var _ = require('lodash');
var utils = module.exports = {

  /**
   * Given two layouts, check if they collide.
   * @param  {Object} l1 Layout object.
   * @param  {Object} l2 Layout object.
   * @return {Boolean}   True if colliding.
   */
  collides: function collides(l1, l2) {
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
  compact: function compact(layout, bounds) {
    // We go through the items by row and column.
    var out = _.map(utils.getLayoutItemsByRowCol(layout), function(l, i, list) {
      // Only collide with elements before this one.
      var ls = list.slice(0, i);
      // Move the element up as far as it can go without colliding.
      do {
        l.y--;
      }
      while (l.y > -1 && !utils.layoutItemCollidesWith(ls, l).length);

      // Move it down, and keep moving it down if it's colliding.
      do {
        l.y++;
      } while(utils.layoutItemCollidesWith(ls, l).length);

      delete l.moved;
      return l;
    });
    // Make sure they come out the other side in the right order.
    return _.sortBy(out, 'i');
  },

  correctBounds: function(layout, bounds) {
    return _.map(layout, function(l) {
      if (l.x + l.w > bounds.w) l.x = bounds.w - l.w;
      return l;
    });
  },

  /**
   * Get a layout item by index. Used so we can override later on if necessary.
   *
   * @param  {Array} layout Layout array.
   * @param  {Number} i      Index
   * @return {LayoutItem}        Item at index.
   */
  getLayoutItem: function getLayoutItem(layout, i) {
    return layout[i];
  },

  /**
   * Get layout items sorted from top left to right and down.
   * @return {Array} Array of layout objects.
   */
  getLayoutItemsByRowCol: function getLayoutItemsByRowCol(layout) {
    return [].concat(layout).sort(function(a, b) {
      if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
        return 1;
      }
      return -1;
    });
  },

  /**
   * Get layout items sorted from top left to down.
   * @return {Array} Array of layout objects.
   */
  getLayoutItemsByColRow: function getLayoutItemsByColRow(layout) {
    return [].concat(layout).sort(function(a, b) {
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
  layoutItemCollidesWith: function layoutItemCollidesWith(layout, layoutItem) {
    return _.filter(layout, utils.collides.bind(null, layoutItem));
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
  moveElement: function moveElement(layout, l, x, y, w, h) {
    // _.pick trickery removes undefined values from the object so we don't overwrite
    // the object with attrs we didn't pass
    _.extend(l, _.pick({x: x, y: y, w: w, h: h, moved: 1}, _.isNumber));

    // Get all items this box collides with.
    var collisions = utils.layoutItemCollidesWith(layout, l);

    // Move each item that collides away from this element.
    _.each(collisions, function(coll) {
      if (coll.moved) return; // short circuit so we don't re-move items
      layout = utils.moveElementAwayFromCollision(layout, l, coll);
    });

    return layout;
  },

  /**
   * This is where the magic needs to happen - given a collision, move an element away from the collision.
   * It's okay to cascade movements here, but be careful to not have a move b move c move a.
   * @param  {Array} layout            Full layout to modify.
   * @param  {LayoutItem} collidesWith Layout item we're colliding with.
   * @param  {LayoutItem} itemToMove   Layout item we're moving.
   */
  moveElementAwayFromCollision: function moveElementAwayFromCollision(layout, collidesWith, itemToMove) {
    var fakeItem = _.extend({}, itemToMove, {y: 0});

    var sorted = utils.getLayoutItemsByRowCol(layout);
    var itemsBefore = sorted.slice(0, sorted.indexOf(itemToMove)).concat(collidesWith);

    // While the item collides with any of the items before it, move it down.
    var collisions;
    do {
      collisions = utils.layoutItemCollidesWith(itemsBefore, fakeItem);
      if (collisions.length) fakeItem.y = collisions[0].y + collisions[0].h;
    } while(collisions.length);

    return utils.moveElement(layout, itemToMove, undefined, fakeItem.y);
  },

  /**
   * Helper to convert a number to a percentage string.
   * @param  {Number} num Any number
   * @return {String}     That number as a percentage.
   */
  perc: function perc(num) {
    return num * 100 + '%';
  }
};
