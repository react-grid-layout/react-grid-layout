"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bottom = bottom;
exports.childrenEqual = childrenEqual;
exports.cloneLayout = cloneLayout;
exports.cloneLayoutItem = cloneLayoutItem;
exports.collides = collides;
exports.compact = compact;
exports.compactItem = compactItem;
exports.compactType = compactType;
exports.correctBounds = correctBounds;
exports.fastPositionEqual = fastPositionEqual;
exports.fastRGLPropsEqual = void 0;
exports.fillInGaps = fillInGaps;
exports.filterOutGaps = filterOutGaps;
exports.getAllCollisions = getAllCollisions;
exports.getFirstCollision = getFirstCollision;
exports.getLayoutItem = getLayoutItem;
exports.getOnlyGaps = getOnlyGaps;
exports.getStatics = getStatics;
exports.modifyLayout = modifyLayout;
exports.moveElement = moveElement;
exports.moveElementAwayFromCollision = moveElementAwayFromCollision;
exports.noop = void 0;
exports.perc = perc;
exports.setTopLeft = setTopLeft;
exports.setTransform = setTransform;
exports.sortLayoutItems = sortLayoutItems;
exports.sortLayoutItemsByColRow = sortLayoutItemsByColRow;
exports.sortLayoutItemsByRowCol = sortLayoutItemsByRowCol;
exports.synchronizeLayoutWithChildren = synchronizeLayoutWithChildren;
exports.validateLayout = validateLayout;
exports.withLayoutItem = withLayoutItem;

var _lodash = _interopRequireDefault(require("lodash.isequal"));

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var isProduction = process.env.NODE_ENV === "production";
var DEBUG = false;
/**
 * Return the bottom coordinate of the layout.
 *
 * @param  {Array} layout Layout array.
 * @return {Number}       Bottom coordinate.
 */

function bottom(layout
/*: Layout*/
)
/*: number*/
{
  var max = 0,
      bottomY;

  for (var i = 0, len = layout.length; i < len; i++) {
    bottomY = layout[i].y + layout[i].h;
    if (bottomY > max) max = bottomY;
  }

  return max;
}

function cloneLayout(layout
/*: Layout*/
)
/*: Layout*/
{
  var newLayout = Array(layout.length);

  for (var i = 0, len = layout.length; i < len; i++) {
    newLayout[i] = cloneLayoutItem(layout[i]);
  }

  return newLayout;
} // Modify a layoutItem inside a layout. Returns a new Layout,
// does not mutate. Carries over all other LayoutItems unmodified.


function modifyLayout(layout
/*: Layout*/
, layoutItem
/*: LayoutItem*/
)
/*: Layout*/
{
  var newLayout = Array(layout.length);

  for (var i = 0, len = layout.length; i < len; i++) {
    if (layoutItem.i === layout[i].i) {
      newLayout[i] = layoutItem;
    } else {
      newLayout[i] = layout[i];
    }
  }

  return newLayout;
} // Function to be called to modify a layout item.
// Does defensive clones to ensure the layout is not modified.


function withLayoutItem(layout
/*: Layout*/
, itemKey
/*: string*/
, cb
/*: LayoutItem => LayoutItem*/
)
/*: [Layout, ?LayoutItem]*/
{
  var item = getLayoutItem(layout, itemKey);
  if (!item) return [layout, null];
  item = cb(cloneLayoutItem(item)); // defensive clone then modify
  // FIXME could do this faster if we already knew the index

  layout = modifyLayout(layout, item);
  return [layout, item];
} // Fast path to cloning, since this is monomorphic


function cloneLayoutItem(layoutItem
/*: LayoutItem*/
)
/*: LayoutItem*/
{
  return {
    w: layoutItem.w,
    h: layoutItem.h,
    x: layoutItem.x,
    y: layoutItem.y,
    i: layoutItem.i,
    minW: layoutItem.minW,
    maxW: layoutItem.maxW,
    minH: layoutItem.minH,
    maxH: layoutItem.maxH,
    moved: Boolean(layoutItem.moved),
    static: Boolean(layoutItem.static),
    // Gap config
    gap: layoutItem.gap,
    lastRow: layoutItem.lastRow,
    // These can be null/undefined
    isDraggable: layoutItem.isDraggable,
    isResizable: layoutItem.isResizable,
    resizeHandles: layoutItem.resizeHandles,
    isBounded: layoutItem.isBounded
  };
}
/**
 * Comparing React `children` is a bit difficult. This is a good way to compare them.
 * This will catch differences in keys, order, and length.
 */


function childrenEqual(a
/*: ReactChildren*/
, b
/*: ReactChildren*/
)
/*: boolean*/
{
  return (0, _lodash.default)(_react.default.Children.map(a, function (c) {
    return c === null || c === void 0 ? void 0 : c.key;
  }), _react.default.Children.map(b, function (c) {
    return c === null || c === void 0 ? void 0 : c.key;
  }));
}
/**
 * See `fastRGLPropsEqual.js`.
 * We want this to run as fast as possible - it is called often - and to be
 * resilient to new props that we add. So rather than call lodash.isEqual,
 * which isn't suited to comparing props very well, we use this specialized
 * function in conjunction with preval to generate the fastest possible comparison
 * function, tuned for exactly our props.
 */

/*:: type FastRGLPropsEqual = (Object, Object, Function) => boolean;*/


var fastRGLPropsEqual
/*: FastRGLPropsEqual*/
= require("./fastRGLPropsEqual"); // Like the above, but a lot simpler.


exports.fastRGLPropsEqual = fastRGLPropsEqual;

function fastPositionEqual(a
/*: Position*/
, b
/*: Position*/
)
/*: boolean*/
{
  return a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height;
}
/**
 * Given two layoutitems, check if they collide.
 */


function collides(l1
/*: LayoutItem*/
, l2
/*: LayoutItem*/
)
/*: boolean*/
{
  if (l1.i === l2.i) return false; // same element

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
 * Does not modify layout items (clones). Creates a new layout array.
 *
 * @param  {Array} layout Layout.
 * @param  {Boolean} verticalCompact Whether or not to compact the layout
 *   vertically.
 * @return {Array}       Compacted Layout.
 */


function compact(layout
/*: Layout*/
, compactType
/*: CompactType*/
, cols
/*: number*/
)
/*: Layout*/
{
  // Statics go in the compareWith array right away so items flow around them.
  var compareWith = getStatics(layout); // We go through the items by row and column.

  var sorted = sortLayoutItems(layout, compactType); // Holding for new items.

  var out = Array(layout.length);

  for (var i = 0, len = sorted.length; i < len; i++) {
    var l = cloneLayoutItem(sorted[i]); // Don't move static elements

    if (!l.static) {
      l = compactItem(compareWith, l, compactType, cols, sorted); // Add to comparison array. We only collide with items before this one.
      // Statics are already in this array.

      compareWith.push(l);
    } // Add to output array to make sure they still come out in the right order.


    out[layout.indexOf(sorted[i])] = l; // Clear moved flag, if it exists.

    l.moved = false;
  }

  return out;
}

var heightWidth = {
  x: "w",
  y: "h"
};
/**
 * Before moving item down, it will check if the movement will cause collisions and move those items down before.
 */

function resolveCompactionCollision(layout
/*: Layout*/
, item
/*: LayoutItem*/
, moveToCoord
/*: number*/
, axis
/*: "x" | "y"*/
) {
  var sizeProp = heightWidth[axis];
  item[axis] += 1;
  var itemIndex = layout.map(function (layoutItem) {
    return layoutItem.i;
  }).indexOf(item.i); // Go through each item we collide with.

  for (var i = itemIndex + 1; i < layout.length; i++) {
    var otherItem = layout[i]; // Ignore static items

    if (otherItem.static) continue; // Optimization: we can break early if we know we're past this el
    // We can do this b/c it's a sorted layout

    if (otherItem.y > item.y + item.h) break;

    if (collides(item, otherItem)) {
      resolveCompactionCollision(layout, otherItem, moveToCoord + item[sizeProp], axis);
    }
  }

  item[axis] = moveToCoord;
}
/**
 * Compact an item in the layout.
 *
 * Modifies item.
 *
 */


function compactItem(compareWith
/*: Layout*/
, l
/*: LayoutItem*/
, compactType
/*: CompactType*/
, cols
/*: number*/
, fullLayout
/*: Layout*/
)
/*: LayoutItem*/
{
  var compactV = compactType === "vertical";
  var compactH = compactType === "horizontal";

  if (compactV) {
    // Bottom 'y' possible is the bottom of the layout.
    // This allows you to do nice stuff like specify {y: Infinity}
    // This is here because the layout must be sorted in order to get the correct bottom `y`.
    l.y = Math.min(bottom(compareWith), l.y); // Move the element up as far as it can go without colliding.

    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      l.y--;
    }
  } else if (compactH) {
    // Move the element left as far as it can go without colliding.
    while (l.x > 0 && !getFirstCollision(compareWith, l)) {
      l.x--;
    }
  } // Move it down, and keep moving it down if it's colliding.


  var collides;

  while (collides = getFirstCollision(compareWith, l)) {
    if (compactH) {
      resolveCompactionCollision(fullLayout, l, collides.x + collides.w, "x");
    } else {
      resolveCompactionCollision(fullLayout, l, collides.y + collides.h, "y");
    } // Since we can't grow without bounds horizontally, if we've overflown, let's move it down and try again.


    if (compactH && l.x + l.w > cols) {
      l.x = cols - l.w;
      l.y++;
    }
  } // Ensure that there are no negative positions


  l.y = Math.max(l.y, 0);
  l.x = Math.max(l.x, 0);
  return l;
}
/**
 * Given a layout, make sure all elements fit within its bounds.
 *
 * Modifies layout items.
 *
 * @param  {Array} layout Layout array.
 * @param  {Number} bounds Number of columns.
 */


function correctBounds(layout
/*: Layout*/
, bounds
/*: { cols: number }*/
)
/*: Layout*/
{
  var collidesWith = getStatics(layout);

  for (var i = 0, len = layout.length; i < len; i++) {
    var l = layout[i]; // Overflows right

    if (l.x + l.w > bounds.cols) l.x = bounds.cols - l.w; // Overflows left

    if (l.x < 0) {
      l.x = 0;
      l.w = bounds.cols;
    }

    if (!l.static) collidesWith.push(l);else {
      // If this is static and collides with other statics, we must move it down.
      // We have to do something nicer than just letting them overlap.
      while (getFirstCollision(collidesWith, l)) {
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


function getLayoutItem(layout
/*: Layout*/
, id
/*: string*/
)
/*: ?LayoutItem*/
{
  for (var i = 0, len = layout.length; i < len; i++) {
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


function getFirstCollision(layout
/*: Layout*/
, layoutItem
/*: LayoutItem*/
)
/*: ?LayoutItem*/
{
  for (var i = 0, len = layout.length; i < len; i++) {
    if (collides(layout[i], layoutItem)) return layout[i];
  }
}

function getAllCollisions(layout
/*: Layout*/
, layoutItem
/*: LayoutItem*/
)
/*: Array<LayoutItem>*/
{
  return layout.filter(function (l) {
    return collides(l, layoutItem);
  });
}
/**
 * Get all static elements.
 * @param  {Array} layout Array of layout objects.
 * @return {Array}        Array of static layout items..
 */


function getStatics(layout
/*: Layout*/
)
/*: Array<LayoutItem>*/
{
  return layout.filter(function (l) {
    return l.static;
  });
}
/**
 * Move an element. Responsible for doing cascading movements of other elements.
 *
 * Modifies layout items.
 *
 * @param  {Array}      layout            Full layout to modify.
 * @param  {LayoutItem} l                 element to move.
 * @param  {Number}     [x]               X position in grid units.
 * @param  {Number}     [y]               Y position in grid units.
 */


function moveElement(layout
/*: Layout*/
, l
/*: LayoutItem*/
, x
/*: ?number*/
, y
/*: ?number*/
, isUserAction
/*: ?boolean*/
, preventCollision
/*: ?boolean*/
, compactType
/*: CompactType*/
, cols
/*: number*/
, allowOverlap
/*: ?boolean*/
)
/*: Layout*/
{
  // If this is static and not explicitly enabled as draggable,
  // no move is possible, so we can short-circuit this immediately.
  if (l.static && l.isDraggable !== true) return layout; // Short-circuit if nothing to do.

  if (l.y === y && l.x === x) return layout;
  log("Moving element ".concat(l.i, " to [").concat(String(x), ",").concat(String(y), "] from [").concat(l.x, ",").concat(l.y, "]"));
  var oldX = l.x;
  var oldY = l.y; // This is quite a bit faster than extending the object

  if (typeof x === "number") l.x = x;
  if (typeof y === "number") l.y = y;
  l.moved = true; // If this collides with anything, move it.
  // When doing this comparison, we have to sort the items we compare with
  // to ensure, in the case of multiple collisions, that we're getting the
  // nearest collision.

  var sorted = sortLayoutItems(layout, compactType);
  var movingUp = compactType === "vertical" && typeof y === "number" ? oldY >= y : compactType === "horizontal" && typeof x === "number" ? oldX >= x : false; // $FlowIgnore acceptable modification of read-only array as it was recently cloned

  if (movingUp) sorted = sorted.reverse();
  var collisions = getAllCollisions(sorted, l);
  var hasCollisions = collisions.length > 0; // We may have collisions. We can short-circuit if we've turned off collisions or
  // allowed overlap.

  if (hasCollisions && allowOverlap) {
    // Easy, we don't need to resolve collisions. But we *did* change the layout,
    // so clone it on the way out.
    return cloneLayout(layout);
  } else if (hasCollisions && preventCollision) {
    // If we are preventing collision but not allowing overlap, we need to
    // revert the position of this element so it goes to where it came from, rather
    // than the user's desired location.
    log("Collision prevented on ".concat(l.i, ", reverting."));
    l.x = oldX;
    l.y = oldY;
    l.moved = false;
    return layout; // did not change so don't clone
  } // Move each item that collides away from this element.


  for (var i = 0, len = collisions.length; i < len; i++) {
    var collision = collisions[i];
    log("Resolving collision between ".concat(l.i, " at [").concat(l.x, ",").concat(l.y, "] and ").concat(collision.i, " at [").concat(collision.x, ",").concat(collision.y, "]")); // Short circuit so we can't infinite loop

    if (collision.moved) continue; // Don't move static items - we have to move *this* element away

    if (collision.static) {
      layout = moveElementAwayFromCollision(layout, collision, l, isUserAction, compactType, cols);
    } else {
      layout = moveElementAwayFromCollision(layout, l, collision, isUserAction, compactType, cols);
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
 */


function moveElementAwayFromCollision(layout
/*: Layout*/
, collidesWith
/*: LayoutItem*/
, itemToMove
/*: LayoutItem*/
, isUserAction
/*: ?boolean*/
, compactType
/*: CompactType*/
, cols
/*: number*/
)
/*: Layout*/
{
  var compactH = compactType === "horizontal"; // Compact vertically if not set to horizontal

  var compactV = compactType !== "horizontal";
  var preventCollision = collidesWith.static; // we're already colliding (not for static items)
  // If there is enough space above the collision to put this element, move it there.
  // We only do this on the main collision as this can get funky in cascades and cause
  // unwanted swapping behavior.

  if (isUserAction) {
    // Reset isUserAction flag because we're not in the main collision anymore.
    isUserAction = false; // Make a mock item so we don't modify the item here, only modify in moveElement.

    var fakeItem
    /*: LayoutItem*/
    = {
      x: compactH ? Math.max(collidesWith.x - itemToMove.w, 0) : itemToMove.x,
      y: compactV ? Math.max(collidesWith.y - itemToMove.h, 0) : itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
      i: "-1"
    }; // No collision? If so, we can go up there; otherwise, we'll end up moving down as normal

    if (!getFirstCollision(layout, fakeItem)) {
      log("Doing reverse collision on ".concat(itemToMove.i, " up to [").concat(fakeItem.x, ",").concat(fakeItem.y, "]."));
      return moveElement(layout, itemToMove, compactH ? fakeItem.x : undefined, compactV ? fakeItem.y : undefined, isUserAction, preventCollision, compactType, cols);
    }
  }

  return moveElement(layout, itemToMove, compactH ? itemToMove.x + 1 : undefined, compactV ? itemToMove.y + 1 : undefined, isUserAction, preventCollision, compactType, cols);
}
/**
 * Helper to convert a number to a percentage string.
 *
 * @param  {Number} num Any number
 * @return {String}     That number as a percentage.
 */


function perc(num
/*: number*/
)
/*: string*/
{
  return num * 100 + "%";
}

function setTransform(_ref)
/*: Object*/
{
  var top = _ref.top,
      left = _ref.left,
      width = _ref.width,
      height = _ref.height;
  // Replace unitless items with px
  var translate = "translate(".concat(left, "px,").concat(top, "px)");
  return {
    transform: translate,
    WebkitTransform: translate,
    MozTransform: translate,
    msTransform: translate,
    OTransform: translate,
    width: "".concat(width, "px"),
    height: "".concat(height, "px"),
    position: "absolute"
  };
}

function setTopLeft(_ref2)
/*: Object*/
{
  var top = _ref2.top,
      left = _ref2.left,
      width = _ref2.width,
      height = _ref2.height;
  return {
    top: "".concat(top, "px"),
    left: "".concat(left, "px"),
    width: "".concat(width, "px"),
    height: "".concat(height, "px"),
    position: "absolute"
  };
}
/**
 * Get layout items sorted from top left to right and down.
 *
 * @return {Array} Array of layout objects.
 * @return {Array}        Layout, sorted static items first.
 */


function sortLayoutItems(layout
/*: Layout*/
, compactType
/*: CompactType*/
)
/*: Layout*/
{
  if (compactType === "horizontal") return sortLayoutItemsByColRow(layout);
  if (compactType === "vertical") return sortLayoutItemsByRowCol(layout);else return layout;
}
/**
 * Sort layout items by row ascending and column ascending.
 *
 * Does not modify Layout.
 */


function sortLayoutItemsByRowCol(layout
/*: Layout*/
)
/*: Layout*/
{
  // Slice to clone array as sort modifies
  return layout.slice(0).sort(function (a, b) {
    if (a.y > b.y || a.y === b.y && a.x > b.x) {
      return 1;
    } else if (a.y === b.y && a.x === b.x) {
      // Without this, we can get different sort results in IE vs. Chrome/FF
      return 0;
    }

    return -1;
  });
}
/**
 * Sort layout items by column ascending then row ascending.
 *
 * Does not modify Layout.
 */


function sortLayoutItemsByColRow(layout
/*: Layout*/
)
/*: Layout*/
{
  return layout.slice(0).sort(function (a, b) {
    if (a.x > b.x || a.x === b.x && a.y > b.y) {
      return 1;
    }

    return -1;
  });
}
/**
 * Generate a layout using the initialLayout and children as a template.
 * Missing entries will be added, extraneous ones will be truncated.
 *
 * Does not modify initialLayout.
 *
 * @param  {Array}  initialLayout Layout passed in through props.
 * @param  {String} breakpoint    Current responsive breakpoint.
 * @param  {?String} compact      Compaction option.
 * @return {Array}                Working layout.
 */


function synchronizeLayoutWithChildren(initialLayout
/*: Layout*/
, children
/*: ReactChildren*/
, cols
/*: number*/
, compactType
/*: CompactType*/
, allowOverlap
/*: ?boolean*/
)
/*: Layout*/
{
  initialLayout = initialLayout || []; // Generate one layout item per child.

  var layout
  /*: LayoutItem[]*/
  = [];

  _react.default.Children.forEach(children, function (child
  /*: ReactElement<any>*/
  ) {
    // Child may not exist
    if ((child === null || child === void 0 ? void 0 : child.key) == null) return; // Don't overwrite if it already exists.

    var exists = getLayoutItem(initialLayout, String(child.key));

    if (exists) {
      layout.push(cloneLayoutItem(exists));
    } else {
      if (!isProduction && child.props._grid) {
        console.warn("`_grid` properties on children have been deprecated as of React 15.2. " + "Please use `data-grid` or add your properties directly to the `layout`.");
      }

      var g = child.props["data-grid"] || child.props._grid; // Hey, this item has a data-grid property, use it.

      if (g) {
        if (!isProduction) {
          validateLayout([g], "ReactGridLayout.children");
        } // FIXME clone not really necessary here


        layout.push(cloneLayoutItem(_objectSpread(_objectSpread({}, g), {}, {
          i: child.key
        })));
      } else {
        // Nothing provided: ensure this is added to the bottom
        // FIXME clone not really necessary here
        layout.push(cloneLayoutItem({
          w: 1,
          h: 1,
          x: 0,
          y: bottom(layout),
          i: String(child.key)
        }));
      }
    }
  }); // Correct the layout.


  var correctedLayout = correctBounds(layout, {
    cols: cols
  });
  return allowOverlap ? correctedLayout : compact(correctedLayout, compactType, cols);
}
/**
 * Validate a layout. Throws errors.
 *
 * @param  {Array}  layout        Array of layout items.
 * @param  {String} [contextName] Context name for errors.
 * @throw  {Error}                Validation error.
 */


function validateLayout(layout
/*: Layout*/
)
/*: void*/
{
  var contextName
  /*: string*/
  = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Layout";
  var subProps = ["x", "y", "w", "h"];
  if (!Array.isArray(layout)) throw new Error(contextName + " must be an array!");

  for (var i = 0, len = layout.length; i < len; i++) {
    var item = layout[i];

    for (var j = 0; j < subProps.length; j++) {
      if (typeof item[subProps[j]] !== "number") {
        throw new Error("ReactGridLayout: " + contextName + "[" + i + "]." + subProps[j] + " must be a number!");
      }
    }
  }
}
/**
 * Filters out the gap items
 *
 * @param  {Array}  layout              Array of layout items.
 * @param  {Boolean} ignoreLastRow      Do you want to ignore the lastRow when filtering
 * @throw  {Array}                      The gap-less layout
 */


function filterOutGaps(layout) {
  var ignoreLastRow = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (ignoreLastRow) return layout.filter(function (item) {
    return !item.gap || item.lastRow;
  });
  return layout.filter(function (item) {
    return !item.gap || !item.gap && !item.lastRow;
  });
}
/**
 * Filters the list for just the gaps
 *
 * @param  {Array}  layout        Array of layout items.
 * @param  {Boolean} lastRow      Do you want to only get the lastRow
 * @throw  {Array}                The gap-only layout
 */


function getOnlyGaps(layout) {
  var lastRowOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (lastRowOnly) return layout.filter(function (item) {
    return item.lastRow;
  });
  return layout.filter(function (item) {
    return item.gap || item.gap && item.lastRow;
  });
}

var generateMatrix = function generateMatrix(layout, _ref3) {
  var x = _ref3.x,
      y = _ref3.y;
  var matrix = [];

  for (var i = 0; i < y; i++) {
    matrix[i] = [];

    for (var j = 0; j < x; j++) {
      matrix[i][j] = null;
    }
  }

  layout.filter(function (l) {
    return !l.gap;
  }).forEach(function (l) {
    var x = l.x,
        y = l.y,
        w = l.w,
        h = l.h,
        i = l.i;
    var endX = x + w;
    var endY = y + h;

    for (var vert = y; vert < endY; vert++) {
      for (var horiz = x; horiz < endX; horiz++) {
        matrix[vert][horiz] = i;
      }
    }
  });
  return matrix;
};

Object.size = function (obj) {
  var size = 0,
      key;

  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }

  return size;
};

function calculateHeightScore(matrix, initialX, y, dx) {
  var hScore = 1;

  if (initialX === 0) {// if (y === matrix.length - 1) hScore++;
  } else {
    if (y === matrix.length - 1) {
      if (!(matrix[y][initialX - 1] === null || matrix[y][initialX - 1].includes('gap'))) hScore++;
    } else {
      if (matrix[y][initialX - 1] !== matrix[y + 1][initialX - 1]) hScore++;
    }
  }

  if (initialX + dx === matrix[y].length) {// if (y === matrix.length - 1) hScore++;
  } else {
    if (y === matrix.length - 1) {
      if (!(matrix[y][initialX + dx] === null || matrix[y][initialX + dx].includes('gap'))) hScore++;
    } else {
      if (matrix[y][initialX + dx] !== matrix[y + 1][initialX + dx]) hScore++;
    }
  }

  return hScore;
}

function generateGap(matrix, initialY, initialX, i, heightUnits) {
  var h = 0;
  var heightScores = [0];
  var w = 1;
  var dx;

  for (var y = initialY; y < matrix.length; y++) {
    for (dx = 0; dx < w; dx++) {
      if (y === initialY) {
        if (initialX + dx + 1 < matrix[y].length && matrix[y][initialX + dx + 1] === null) w++;
      } else {
        if (matrix[y][initialX + dx] !== null) break;
      }
    }

    if (dx === w) {
      h++; // calculate a 'score' for this height (for an intelligentish algorithm)

      heightScores.push(calculateHeightScore(matrix, initialX, y, dx));
    } else break;

    if (h === heightUnits) break;
  } // use the 'best' height that we calculated


  h = heightScores.reduce(function (bestIndex, cur, i) {
    return heightScores[bestIndex] > cur ? bestIndex : i;
  });

  for (var _y = initialY; _y < initialY + h; _y++) {
    for (var x = initialX; x < initialX + w; x++) {
      matrix[_y][x] = i;
    }
  }

  return {
    i: i,
    x: initialX,
    y: initialY,
    w: w,
    h: h,
    gap: true
  };
}
/**
 * Fills in all gaps (empty spaces) in the grid layout
 *
 * @param  {Array}  layout        Array of layout items.
 * @param  {Number} cols          The number of columns, needed for filling
 * @param  {Boolean} lastRow      Do you want to insert a lastRow gap
 * @throw  {Array}                The new layout
 */


function fillInGaps(layout, columnCount, lastRow) {
  var heightUnits = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 4;
  var gapConfig = {
    gap: true,
    isDraggable: false,
    isResizable: false
  }; // * 1. Get mxY

  var maxY = 0;
  var cardsInLayout = layout.filter(function (l) {
    return !l.gap;
  }).map(function (card) {
    var cardMaxCoord = card.y + card.h;
    maxY = cardMaxCoord > maxY ? card.y + card.h : maxY;
    return card;
  });
  var matrix = generateMatrix(layout, {
    x: columnCount,
    y: maxY
  }); // * 2. Create a new matrix with a Y of maxY and an X of columnCount

  var gaps = [];

  for (var y = 0; y < matrix.length; y++) {
    // *  Row section
    for (var x = 0; x < matrix[y].length; x++) {
      // * Cell loop -- Go through all cells in the row
      if (matrix[y][x] === null) {
        gaps.push(generateGap(matrix, y, x, "gap-".concat(gaps.length), heightUnits));
      }
    }
  } // If lastRow is true, add lastRow


  lastRow && gaps.push(_objectSpread({
    w: columnCount,
    x: 0,
    y: matrix.length,
    h: heightUnits,
    i: 'gap-last-row',
    lastRow: true
  }, gapConfig));
  return [].concat(_toConsumableArray(cardsInLayout), gaps); // Merge the layouts
} // Legacy support for verticalCompact: false


function compactType(props
/*: ?{ verticalCompact: boolean, compactType: CompactType }*/
)
/*: CompactType*/
{
  var _ref4 = props || {},
      verticalCompact = _ref4.verticalCompact,
      compactType = _ref4.compactType;

  return verticalCompact === false ? null : compactType;
}

function log() {
  var _console;

  if (!DEBUG) return; // eslint-disable-next-line no-console

  (_console = console).log.apply(_console, arguments);
}

var noop = function noop() {};

exports.noop = noop;