'use strict';

var utils = module.exports = {

  /**
   * Given two layouts, check if they collide.
   * @param  {Object} l1 Layout object.
   * @param  {Object} l2 Layout object.
   * @return {Boolean}   True if colliding.
   */
  collides(l1, l2) {
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
  compact(layout) {
    // We go through the items by row and column.
    var compareWith = [], out = [];
    var sorted = utils.getLayoutItemsByRowCol(layout);

    for (var i = 0, len = sorted.length; i < len; i++) {
      var l = sorted[i];

      // Don't move static elements
      if (!l.static) {
        l = utils.compactItem(compareWith, l);
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

  compactItem(compareWith, l) {
    // Move the element up as far as it can go without colliding.
    while (l.y > 0 && !utils.getFirstCollision(compareWith, l)) {
      l.y--;
    }

    // Move it down, and keep moving it down if it's colliding.
    var collides;
    while((collides = utils.getFirstCollision(compareWith, l))) {
      l.y = collides.y + collides.h;
    }
    return l;
  },

  correctBounds(layout, bounds) {
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
  getLayoutItem(layout, i) {
    return layout[i];
  },

  /**
   * Get layout items sorted from top left to right and down.
   * @return {Array} Array of layout objects.
   */
  getLayoutItemsByRowCol(layout) {
    return [].concat(layout).sort(function(a, b) {
      if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
        return 1;
      }
      return -1;
    });
  },

  /**
   * Returns the first item this layout collides with.
   * It doesn't appear to matter which order we approach this from, although
   * perhaps that is the wrong thing to do.
   * @param  {Object} layoutItem Layout item.
   * @return {Object|undefined}  A colliding layout item, or undefined.
   */
  getFirstCollision(layout, layoutItem) {
    for (var i = 0, len = layout.length; i < len; i++) {
      if (utils.collides(layout[i], layoutItem)) return layout[i];
    }
  },

  getAllCollisions(layout, layoutItem) {
    var out = [];
    for (var i = 0, len = layout.length; i < len; i++) {
      if (utils.collides(layout[i], layoutItem)) out.push(layout[i]);
    }
    return out;
  },

  /**
   * Move an element. Responsible for doing cascading movements of other elements.
   * @param  {Array}  layout Full layout to modify.
   * @param  {LayoutItem} l element to move.
   * @param  {Number} [x] X position in grid units.
   * @param  {Number} [y] Y position in grid units.
   */
  moveElement(layout, l, x, y) {
    if (l.static) return layout;

    // Short-circuit if nothing to do.
    // if (l.y === y && l.x === x) return layout;

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
      if (collision.static) {
        layout = utils.moveElementAwayFromCollision(layout, collision, l);
      } else {
        layout = utils.moveElementAwayFromCollision(layout, l, collision);
      }
    }
    return layout;
  },

  /**
   * This is where the magic needs to happen - given a collision, move an element away from the collision.
   * We attempt to move it up if there's room, otherwise it goes below.
   * @param  {Array} layout            Full layout to modify.
   * @param  {LayoutItem} collidesWith Layout item we're colliding with.
   * @param  {LayoutItem} itemToMove   Layout item we're moving.
   */
  moveElementAwayFromCollision(layout, collidesWith, itemToMove) {
    // Make a mock item so we don't modify the item here, only modify in moveElement.
    var fakeItem = {
      x: itemToMove.x,
      y: itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
    };

    // If there is enough space above the collision to put this element, move it there.
    fakeItem.y = Math.max(collidesWith.y - itemToMove.h, 0);
    if (!utils.getFirstCollision(layout, fakeItem)) {
      return utils.moveElement(layout, itemToMove, undefined, fakeItem.y);
    }

    // Didn't work, move below collision.
    return utils.moveElement(layout, itemToMove, undefined, collidesWith.y + collidesWith.h);
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
   * Validate a layout. Throws errors.
   * @param  {Array}  layout        Array of layout items.
   * @param  {String} [contextName] Context name for errors.
   * @throw  {Error}                Validation error.
   */
  validateLayout(layout, contextName) {
    contextName = contextName || "Layout";
    var subProps = ['x', 'y', 'w', 'h'];
    if (!Array.isArray(layout)) throw new Error(contextName + " must be an array!");
    for (var i = 0, len = layout.length; i < len; i++) {
      for (var j = 0; j < subProps.length; j++) {
        if (typeof layout[i][subProps[j]] !== 'number') {
          throw new Error('ReactGridLayout: ' + contextName + '[' + i + '].' + subProps[j] + ' must be a Number!');
        }
      }
      if (layout[i].static !== undefined && typeof layout[i].static !== 'boolean') {
        throw new Error('ReactGridLayout: ' + contextName + '[' + i + '].static must be a Boolean!');
      }
    }
  }
};
