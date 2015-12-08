// @flow

import assign from 'object-assign';

/*global ReactElement*/
export type LayoutItem = {w: number, h: number, x: number, y: number, i: string, placeholder?: boolean, moved?: boolean};
export type Layout = Array<LayoutItem>;
export type Position = {left: number, top: number, width: number, height: number};
export type Size = {width: number, height: number};
export type DragEvent = {e: Event, element: Node, position: Position};
export type ResizeEvent = {e: Event, element: Node, size: Size};

/**
 * Return the bottom coordinate of the layout.
 *
 * @param  {Array} layout Layout array.
 * @return {Number}       Bottom coordinate.
 */
export function bottom(layout: Layout): number {
  let max = 0, bottomY;
  for (let i = 0, len = layout.length; i < len; i++) {
    bottomY = layout[i].y + layout[i].h;
    if (bottomY > max) max = bottomY;
  }
  return max;
}

/**
 * Clones a shallow object.
 * @param  {Object} obj Object to clone.
 * @return {Object}   Cloned object.
 */
export function clone(obj: Object): Object {
  return assign({}, obj);
}

/**
 * Given two layoutitems, check if they collide.
 *
 * @return {Boolean}   True if colliding.
 */
export function collides(l1: LayoutItem, l2: LayoutItem): boolean {
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
 *
 * @param  {Array} layout Layout.
 * @param  {Boolean} verticalCompact Whether or not to compact the layout
 *   vertically.
 * @return {Array}       Compacted Layout.
 */
export function compact(layout: Layout, verticalCompact: boolean): Layout {
  // Statics go in the compareWith array right away so items flow around them.
  let compareWith = getStatics(layout), out = [];
  // We go through the items by row and column.
  let sorted = sortLayoutItemsByRowCol(layout);

  for (let i = 0, len = sorted.length; i < len; i++) {
    let l = sorted[i];

    // Don't move static elements
    if (!l.static) {
      l = compactItem(compareWith, l, verticalCompact);

      // Add to comparison array. We only collide with items before this one.
      // Statics are already in this array.
      compareWith.push(l);
    }

    // Add to output array to make sure they still come out in the right order.
    out[layout.indexOf(l)] = l;

    // Clear moved flag, if it exists.
    l.moved = false;
  }

  return out;
}

/**
 * Compact an item in the layout.
 */
export function compactItem(compareWith: Layout, l: LayoutItem, verticalCompact: boolean): LayoutItem {
  if (verticalCompact) {
    // Move the element up as far as it can go without colliding.
    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      l.y--;
    }
  }

  // Move it down, and keep moving it down if it's colliding.
  let collides;
  while((collides = getFirstCollision(compareWith, l))) {
    l.y = collides.y + collides.h;
  }
  return l;
}

/**
 * Given a layout, make sure all elements fit within its bounds.
 *
 * @param  {Array} layout Layout array.
 * @param  {Number} bounds Number of columns.
 */
export function correctBounds(layout: Layout, bounds: {cols: number}): Layout {
  let collidesWith = getStatics(layout);
  for (let i = 0, len = layout.length; i < len; i++) {
    let l = layout[i];
    // Overflows right
    if (l.x + l.w > bounds.cols) l.x = bounds.cols - l.w;
    // Overflows left
    if (l.x < 0) {
      l.x = 0;
      l.w = bounds.cols;
    }
    if (!l.static) collidesWith.push(l);
    else {
      // If this is static and collides with other statics, we must move it down.
      // We have to do something nicer than just letting them overlap.
      while(getFirstCollision(collidesWith, l)) {
        l.y++;
      }
    }

  }
  return layout;
}

/**
 * Get a layout item by ID. Used so we can override later on if necessary.
 *
 * @param  {Array}  layout Layout array.
 * @param  {String} id     ID
 * @return {LayoutItem}    Item at ID.
 */
export function getLayoutItem(layout: Layout, id: string): ?LayoutItem {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (layout[i].i === id) return layout[i];
  }
}

/**
 * Returns the first item this layout collides with.
 * It doesn't appear to matter which order we approach this from, although
 * perhaps that is the wrong thing to do.
 *
 * @param  {Object} layoutItem Layout item.
 * @return {Object|undefined}  A colliding layout item, or undefined.
 */
export function getFirstCollision(layout: Layout, layoutItem: LayoutItem): ?LayoutItem {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (collides(layout[i], layoutItem)) return layout[i];
  }
}

export function getAllCollisions(layout: Layout, layoutItem: LayoutItem): Array<LayoutItem> {
  let out = [];
  for (let i = 0, len = layout.length; i < len; i++) {
    if (collides(layout[i], layoutItem)) out.push(layout[i]);
  }
  return out;
}

/**
 * Get all static elements.
 * @param  {Array} layout Array of layout objects.
 * @return {Array}        Array of static layout items..
 */
export function getStatics(layout: Layout): Array<LayoutItem> {
  let out = [];
  for (let i = 0, len = layout.length; i < len; i++) {
    if (layout[i].static) out.push(layout[i]);
  }
  return out;
}

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
export function moveElement(layout: Layout, l: LayoutItem, x: ?number, y: ?number, isUserAction: ?boolean): Layout {
  if (l.static) return layout;

  // Short-circuit if nothing to do.
  if (l.y === y && l.x === x) return layout;

  let movingUp = y && l.y > y;
  // This is quite a bit faster than extending the object
  if (x != null) l.x = x;
  if (y != null) l.y = y;
  l.moved = true;

  // If this collides with anything, move it.
  // When doing this comparison, we have to sort the items we compare with
  // to ensure, in the case of multiple collisions, that we're getting the
  // nearest collision.
  let sorted = sortLayoutItemsByRowCol(layout);
  if (movingUp) sorted = sorted.reverse();
  let collisions = getAllCollisions(sorted, l);

  // Move each item that collides away from this element.
  for (let i = 0, len = collisions.length; i < len; i++) {
    let collision = collisions[i];
    // console.log('resolving collision between', l.i, 'at', l.y, 'and', collision.i, 'at', collision.y);

    // Short circuit so we can't infinite loop
    if (collision.moved) continue;

    // This makes it feel a bit more precise by waiting to swap for just a bit when moving up.
    if (l.y > collision.y && l.y - collision.y > collision.h / 4) continue;

    // Don't move static items - we have to move *this* element away
    if (collision.static) {
      layout = moveElementAwayFromCollision(layout, collision, l, isUserAction);
    } else {
      layout = moveElementAwayFromCollision(layout, l, collision, isUserAction);
    }
  }

  return layout;
}

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
export function moveElementAwayFromCollision(layout: Layout, collidesWith: LayoutItem,
                                             itemToMove: LayoutItem, isUserAction: ?boolean): Layout {

  // If there is enough space above the collision to put this element, move it there.
  // We only do this on the main collision as this can get funky in cascades and cause
  // unwanted swapping behavior.
  if (isUserAction) {
    // Make a mock item so we don't modify the item here, only modify in moveElement.
    let fakeItem = {
      x: itemToMove.x,
      y: itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
      i: -1
    };
    fakeItem.y = Math.max(collidesWith.y - itemToMove.h, 0);
    if (!getFirstCollision(layout, fakeItem)) {
      return moveElement(layout, itemToMove, undefined, fakeItem.y);
    }
  }

  // Previously this was optimized to move below the collision directly, but this can cause problems
  // with cascading moves, as an item may actually leapflog a collision and cause a reversal in order.
  return moveElement(layout, itemToMove, undefined, itemToMove.y + 1);
}

/**
 * Helper to convert a number to a percentage string.
 *
 * @param  {Number} num Any number
 * @return {String}     That number as a percentage.
 */
export function perc(num: number): string {
  return num * 100 + '%';
}

export function setTransform(style: Object, coords: [number, number]): Object {
  // Replace unitless items with px
  let x = ('' + coords[0]).replace(/(\d)$/, '$1px');
  let y = ('' + coords[1]).replace(/(\d)$/, '$1px');
  style.transform = "translate(" + x + "," + y + ")";
  style.WebkitTransform = "translate(" + x + "," + y + ")";
  style.MozTransform = "translate(" + x + "," + y + ")";
  style.msTransform = "translate(" + x + "," + y + ")";
  style.OTransform = "translate(" + x + "," + y + ")";
  return style;
}

/**
 * Get layout items sorted from top left to right and down.
 *
 * @return {Array} Array of layout objects.
 * @return {Array}        Layout, sorted static items first.
 */
export function sortLayoutItemsByRowCol(layout: Layout): Layout {
  return [].concat(layout).sort(function(a, b) {
    if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
      return 1;
    }
    return -1;
  });
}

/**
 * Generate a layout using the initialLayout and children as a template.
 * Missing entries will be added, extraneous ones will be truncated.
 *
 * @param  {Array}  initialLayout Layout passed in through props.
 * @param  {String} breakpoint    Current responsive breakpoint.
 * @param  {Boolean} verticalCompact Whether or not to compact the layout
 *   vertically.
 * @return {Array}                Working layout.
 */
export function synchronizeLayoutWithChildren(initialLayout: Layout, children: Array<ReactElement>|ReactElement,
                                              cols: number, verticalCompact: boolean): Layout {
  // ensure 'children' is always an array
  if (!Array.isArray(children)) {
    children = [children];
  }
  initialLayout = initialLayout || [];

  // Generate one layout item per child.
  let layout = [];
  for (let i = 0, len = children.length; i < len; i++) {
    let child = children[i];
    // Don't overwrite if it already exists.
    let exists = getLayoutItem(initialLayout, child.key || "1" /* FIXME satisfies Flow */);
    if (exists) {
      layout.push(exists);
      continue;
    }
    // New item: attempt to use a layout item from the child, if it exists.
    let g = child.props._grid;
    if (g) {
      validateLayout([g], 'ReactGridLayout.child');
      // Validated; add it to the layout. Bottom 'y' possible is the bottom of the layout.
      // This allows you to do nice stuff like specify {y: Infinity}
      if (verticalCompact) {
        layout.push(assign({}, g, {y: Math.min(bottom(layout), g.y), i: child.key}));
      } else {
        layout.push(assign({}, g, {y: g.y, i: child.key}));
      }
    } else {
      // Nothing provided: ensure this is added to the bottom
      layout.push({w: 1, h: 1, x: 0, y: bottom(layout), i: child.key || "1"});
    }
  }

  // Correct the layout.
  layout = correctBounds(layout, {cols: cols});
  layout = compact(layout, verticalCompact);

  return layout;
}

/**
 * Validate a layout. Throws errors.
 *
 * @param  {Array}  layout        Array of layout items.
 * @param  {String} [contextName] Context name for errors.
 * @throw  {Error}                Validation error.
 */
export function validateLayout(layout:Layout, contextName: string): void {
  contextName = contextName || "Layout";
  let subProps = ['x', 'y', 'w', 'h'];
  if (!Array.isArray(layout)) throw new Error(contextName + " must be an array!");
  for (let i = 0, len = layout.length; i < len; i++) {
    for (let j = 0; j < subProps.length; j++) {
      if (typeof layout[i][subProps[j]] !== 'number') {
        throw new Error('ReactGridLayout: ' + contextName + '[' + i + '].' + subProps[j] + ' must be a Number!');
      }
    }
    if (layout[i].static !== undefined && typeof layout[i].static !== 'boolean') {
      throw new Error('ReactGridLayout: ' + contextName + '[' + i + '].static must be a Boolean!');
    }
  }
}
