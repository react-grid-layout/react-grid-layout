"use strict";

exports.__esModule = true;
exports.noop = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.bottom = bottom;
exports.cloneLayout = cloneLayout;
exports.cloneLayoutItem = cloneLayoutItem;
exports.childrenEqual = childrenEqual;
exports.collides = collides;
exports.compact = compact;
exports.compactItem = compactItem;
exports.correctBounds = correctBounds;
exports.getLayoutItem = getLayoutItem;
exports.getFirstCollision = getFirstCollision;
exports.getAllCollisions = getAllCollisions;
exports.getStatics = getStatics;
exports.moveElement = moveElement;
exports.moveElementAwayFromCollision = moveElementAwayFromCollision;
exports.perc = perc;
exports.setTransform = setTransform;
exports.setTopLeft = setTopLeft;
exports.sortLayoutItems = sortLayoutItems;
exports.sortLayoutItemsByRowCol = sortLayoutItemsByRowCol;
exports.sortLayoutItemsByColRow = sortLayoutItemsByColRow;
exports.synchronizeLayoutWithChildren = synchronizeLayoutWithChildren;
exports.validateLayout = validateLayout;
exports.filterOutGaps = filterOutGaps;
exports.getOnlyGaps = getOnlyGaps;
exports.fillInGaps = fillInGaps;
exports.autoBindHandlers = autoBindHandlers;

var _lodash = require("lodash.isequal");

var _lodash2 = _interopRequireDefault(_lodash);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// All callbacks are of the signature (layout, oldItem, newItem, placeholder, e).
var isProduction = process.env.NODE_ENV === "production";
var DEBUG = false;

/**
 * Return the bottom coordinate of the layout.
 *
 * @param  {Array} layout Layout array.
 * @return {Number}       Bottom coordinate.
 */
function bottom(layout) {
  var max = 0,
      bottomY = void 0;
  for (var _i = 0, len = layout.length; _i < len; _i++) {
    bottomY = layout[_i].y + layout[_i].h;
    if (bottomY > max) max = bottomY;
  }
  return max;
}

function cloneLayout(layout) {
  var newLayout = Array(layout.length);
  for (var _i2 = 0, len = layout.length; _i2 < len; _i2++) {
    newLayout[_i2] = cloneLayoutItem(layout[_i2]);
  }
  return newLayout;
}

// Fast path to cloning, since this is monomorphic
function cloneLayoutItem(layoutItem) {
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
    // These can be null
    isDraggable: layoutItem.isDraggable,
    isResizable: layoutItem.isResizable
  };
}

/**
 * Comparing React `children` is a bit difficult. This is a good way to compare them.
 * This will catch differences in keys, order, and length.
 */
function childrenEqual(a, b) {
  return (0, _lodash2.default)(_react2.default.Children.map(a, function (c) {
    return c.key;
  }), _react2.default.Children.map(b, function (c) {
    return c.key;
  }));
}

/**
 * Given two layoutitems, check if they collide.
 */
function collides(l1, l2) {
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
 * @param  {Array} layout Layout.
 * @param  {Boolean} verticalCompact Whether or not to compact the layout
 *   vertically.
 * @return {Array}       Compacted Layout.
 */
function compact(layout, compactType, cols) {
  // Statics go in the compareWith array right away so items flow around them.
  var compareWith = getStatics(layout);
  // We go through the items by row and column.
  var sorted = sortLayoutItems(layout, compactType);
  // Holding for new items.
  var out = Array(layout.length);

  for (var _i3 = 0, len = sorted.length; _i3 < len; _i3++) {
    var l = cloneLayoutItem(sorted[_i3]);

    // Don't move static elements
    if (!l.static) {
      l = compactItem(compareWith, l, compactType, cols, sorted);

      // Add to comparison array. We only collide with items before this one.
      // Statics are already in this array.
      compareWith.push(l);
    }

    // Add to output array to make sure they still come out in the right order.
    out[layout.indexOf(sorted[_i3])] = l;

    // Clear moved flag, if it exists.
    l.moved = false;
  }

  return out;
}

var heightWidth = { x: "w", y: "h" };
/**
 * Before moving item down, it will check if the movement will cause collisions and move those items down before.
 */
function resolveCompactionCollision(layout, item, moveToCoord, axis) {
  var sizeProp = heightWidth[axis];
  item[axis] += 1;
  var itemIndex = layout.map(function (layoutItem) {
    return layoutItem.i;
  }).indexOf(item.i);

  // Go through each item we collide with.
  for (var _i4 = itemIndex + 1; _i4 < layout.length; _i4++) {
    var otherItem = layout[_i4];
    // Ignore static items
    if (otherItem.static) continue;

    // Optimization: we can break early if we know we're past this el
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
 */
function compactItem(compareWith, l, compactType, cols, fullLayout) {
  var compactV = compactType === "vertical";
  var compactH = compactType === "horizontal";
  if (compactV) {
    // Bottom 'y' possible is the bottom of the layout.
    // This allows you to do nice stuff like specify {y: Infinity}
    // This is here because the layout must be sorted in order to get the correct bottom `y`.
    l.y = Math.min(bottom(compareWith), l.y);
    // Move the element up as far as it can go without colliding.
    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      l.y--;
    }
  } else if (compactH) {
    l.y = Math.min(bottom(compareWith), l.y);
    // Move the element left as far as it can go without colliding.
    while (l.x > 0 && !getFirstCollision(compareWith, l)) {
      l.x--;
    }
  }

  // Move it down, and keep moving it down if it's colliding.
  var collides = void 0;
  while (collides = getFirstCollision(compareWith, l)) {
    if (compactH) {
      resolveCompactionCollision(fullLayout, l, collides.x + collides.w, "x");
    } else {
      resolveCompactionCollision(fullLayout, l, collides.y + collides.h, "y");
    }
    // Since we can't grow without bounds horizontally, if we've overflown, let's move it down and try again.
    if (compactH && l.x + l.w > cols) {
      l.x = cols - l.w;
      l.y++;
    }
  }
  return l;
}

/**
 * Given a layout, make sure all elements fit within its bounds.
 *
 * @param  {Array} layout Layout array.
 * @param  {Number} bounds Number of columns.
 */
function correctBounds(layout, bounds) {
  var collidesWith = getStatics(layout);
  for (var _i5 = 0, len = layout.length; _i5 < len; _i5++) {
    var l = layout[_i5];
    // Overflows right
    if (l.x + l.w > bounds.cols) l.x = bounds.cols - l.w;
    // Overflows left
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
function getLayoutItem(layout, id) {
  for (var _i6 = 0, len = layout.length; _i6 < len; _i6++) {
    if (layout[_i6].i === id) return layout[_i6];
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
function getFirstCollision(layout, layoutItem) {
  for (var _i7 = 0, len = layout.length; _i7 < len; _i7++) {
    if (collides(layout[_i7], layoutItem)) return layout[_i7];
  }
}

function getAllCollisions(layout, layoutItem) {
  return layout.filter(function (l) {
    return collides(l, layoutItem);
  });
}

/**
 * Get all static elements.
 * @param  {Array} layout Array of layout objects.
 * @return {Array}        Array of static layout items..
 */
function getStatics(layout) {
  return layout.filter(function (l) {
    return l.static;
  });
}

/**
 * Move an element. Responsible for doing cascading movements of other elements.
 *
 * @param  {Array}      layout            Full layout to modify.
 * @param  {LayoutItem} l                 element to move.
 * @param  {Number}     [x]               X position in grid units.
 * @param  {Number}     [y]               Y position in grid units.
 */
function moveElement(layout, l, x, y, isUserAction, preventCollision, compactType, cols) {
  if (l.static) return layout;

  // Short-circuit if nothing to do.
  if (l.y === y && l.x === x) return layout;

  log("Moving element " + l.i + " to [" + String(x) + "," + String(y) + "] from [" + l.x + "," + l.y + "]");
  var oldX = l.x;
  var oldY = l.y;

  // This is quite a bit faster than extending the object
  if (typeof x === 'number') l.x = x;
  if (typeof y === 'number') l.y = y;
  l.moved = true;

  // If this collides with anything, move it.
  // When doing this comparison, we have to sort the items we compare with
  // to ensure, in the case of multiple collisions, that we're getting the
  // nearest collision.
  var sorted = sortLayoutItems(layout, compactType);
  var movingUp = compactType === "vertical" && typeof y === 'number' ? oldY >= y : compactType === "horizontal" && typeof x === 'number' ? oldX >= x : false;
  if (movingUp) sorted = sorted.reverse();
  var collisions = getAllCollisions(sorted, l);
  // There was a collision; abort
  if (preventCollision && collisions.length) {
    log("Collision prevented on " + l.i + ", reverting.");
    l.x = oldX;
    l.y = oldY;
    l.moved = false;
    return layout;
  }

  // Move each item that collides away from this element.
  for (var _i8 = 0, len = collisions.length; _i8 < len; _i8++) {
    var collision = collisions[_i8];
    log("Resolving collision between " + l.i + " at [" + l.x + "," + l.y + "] and " + collision.i + " at [" + collision.x + "," + collision.y + "]");
    // Short circuit so we can't infinite loop
    if (collision.moved) continue;

    // Don't move static items - we have to move *this* element away
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
function moveElementAwayFromCollision(layout, collidesWith, itemToMove, isUserAction, compactType, cols) {
  var compactH = compactType === "horizontal";
  // Compact vertically if not set to horizontal
  var compactV = compactType !== "horizontal";
  var preventCollision = false; // we're already colliding

  // If there is enough space above the collision to put this element, move it there.
  // We only do this on the main collision as this can get funky in cascades and cause
  // unwanted swapping behavior.
  if (isUserAction) {
    // Reset isUserAction flag because we're not in the main collision anymore.
    isUserAction = false;

    // Make a mock item so we don't modify the item here, only modify in moveElement.
    var fakeItem = {
      x: compactH ? Math.max(collidesWith.x - itemToMove.w, 0) : itemToMove.x,
      y: compactV ? Math.max(collidesWith.y - itemToMove.h, 0) : itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
      i: "-1"
    };

    // No collision? If so, we can go up there; otherwise, we'll end up moving down as normal
    if (!getFirstCollision(layout, fakeItem)) {
      log("Doing reverse collision on " + itemToMove.i + " up to [" + fakeItem.x + "," + fakeItem.y + "].");
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
function perc(num) {
  return num * 100 + "%";
}

function setTransform(_ref) {
  var top = _ref.top,
      left = _ref.left,
      width = _ref.width,
      height = _ref.height;

  // Replace unitless items with px
  var translate = "translate(" + left + "px," + top + "px)";
  return {
    transform: translate,
    WebkitTransform: translate,
    MozTransform: translate,
    msTransform: translate,
    OTransform: translate,
    width: width + "px",
    height: height + "px",
    position: "absolute"
  };
}

function setTopLeft(_ref2) {
  var top = _ref2.top,
      left = _ref2.left,
      width = _ref2.width,
      height = _ref2.height;

  return {
    top: top + "px",
    left: left + "px",
    width: width + "px",
    height: height + "px",
    position: "absolute"
  };
}

/**
 * Get layout items sorted from top left to right and down.
 *
 * @return {Array} Array of layout objects.
 * @return {Array}        Layout, sorted static items first.
 */
function sortLayoutItems(layout, compactType) {
  if (compactType === "horizontal") return sortLayoutItemsByColRow(layout);else return sortLayoutItemsByRowCol(layout);
}

function sortLayoutItemsByRowCol(layout) {
  return [].concat(layout).sort(function (a, b) {
    if (a.y > b.y || a.y === b.y && a.x > b.x) {
      return 1;
    } else if (a.y === b.y && a.x === b.x) {
      // Without this, we can get different sort results in IE vs. Chrome/FF
      return 0;
    }
    return -1;
  });
}

function sortLayoutItemsByColRow(layout) {
  return [].concat(layout).sort(function (a, b) {
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
 * @param  {Array}  initialLayout Layout passed in through props.
 * @param  {String} breakpoint    Current responsive breakpoint.
 * @param  {?String} compact      Compaction option.
 * @return {Array}                Working layout.
 */
function synchronizeLayoutWithChildren(initialLayout, children, cols, compactType) {
  initialLayout = initialLayout || [];

  // Generate one layout item per child.
  var layout = [];
  _react2.default.Children.forEach(children, function (child, i) {
    // Don't overwrite if it already exists.
    var exists = getLayoutItem(initialLayout, String(child.key));
    if (exists) {
      layout[i] = cloneLayoutItem(exists);
    } else {
      if (!isProduction && child.props._grid) {
        console.warn("`_grid` properties on children have been deprecated as of React 15.2. " + // eslint-disable-line
        "Please use `data-grid` or add your properties directly to the `layout`.");
      }
      var g = child.props["data-grid"] || child.props._grid;

      // Hey, this item has a data-grid property, use it.
      if (g) {
        if (!isProduction) {
          validateLayout([g], "ReactGridLayout.children");
        }
        layout[i] = cloneLayoutItem(_extends({}, g, { i: child.key }));
      } else {
        // Nothing provided: ensure this is added to the bottom
        layout[i] = cloneLayoutItem({
          w: 1,
          h: 1,
          x: 0,
          y: bottom(layout),
          i: String(child.key)
        });
      }
    }
  });

  // Correct the layout.
  layout = correctBounds(layout, { cols: cols });
  layout = compact(layout, compactType, cols);

  return layout;
}

/**
 * Validate a layout. Throws errors.
 *
 * @param  {Array}  layout        Array of layout items.
 * @param  {String} [contextName] Context name for errors.
 * @throw  {Error}                Validation error.
 */
function validateLayout(layout) {
  var contextName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Layout";

  var subProps = ["x", "y", "w", "h"];
  if (!Array.isArray(layout)) throw new Error(contextName + " must be an array!");
  for (var _i9 = 0, len = layout.length; _i9 < len; _i9++) {
    var item = layout[_i9];
    for (var j = 0; j < subProps.length; j++) {
      if (typeof item[subProps[j]] !== "number") {
        throw new Error("ReactGridLayout: " + contextName + "[" + _i9 + "]." + subProps[j] + " must be a number!");
      }
    }
    if (item.i && typeof item.i !== "string") {
      throw new Error("ReactGridLayout: " + contextName + "[" + _i9 + "].i must be a string!");
    }
    if (item.static !== undefined && typeof item.static !== "boolean") {
      throw new Error("ReactGridLayout: " + contextName + "[" + _i9 + "].static must be a boolean!");
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
  for (var _i10 = 0; _i10 < y; _i10++) {
    matrix[_i10] = [];
    for (var j = 0; j < x; j++) {
      matrix[_i10][j] = null;
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

function printMatrix(matrix) {
  matrix.forEach(function (row) {
    console.log(row.map(function (cell) {
      return cell;
    }));
  });
}
function generateGaps(matrix) {
  var gapDict = {};
  for (var _h = 0; _h < matrix.length; _h++) {
    // *  Row section
    for (var _w = 0; _w < matrix[_h].length; _w++) {
      // * Cell loop -- Go through all cells in the row
      if (matrix[_h][_w].includes('gap-')) {
        if (!gapDict[matrix[_h][_w]]) {
          gapDict[matrix[_h][_w]] = {
            i: matrix[_h][_w],
            x: _w,
            y: _h,
            w: 1,
            h: 1,
            gap: true
          };
        }
        var gap = gapDict[matrix[_h][_w]];
        gap.w = _w - gap.x + 1;
        gap.h = _h - gap.y + 1;
        gapDict[matrix[_h][_w]] = gap;
      }
    }
  }
  return Object.values(gapDict);
}

function agrees(cell, gapId) {
  if (cell === undefined) return false; // if the cell is undefined
  // if the adjacent cell is null or matches the gapId
  if (cell === gapId || cell === null) return true;
  return false;
}

function shouldFillCell(matrix, gap, x, y, nextX, nextY, prevX, prevY, endX, startY, endY) {
  var id = gap.i;
  var hasPrevX = prevX !== null;
  var hasPrevY = prevY !== null;
  var hasNextX = nextX !== null;
  var hasNextY = nextY !== null;
  // * 1. Get adjacent cells
  // tl t tr
  //  l _ r
  // bl b br
  var tl = void 0,
      t = void 0,
      tr = void 0,
      r = void 0,
      br = void 0,
      b = void 0,
      bl = void 0,
      l = void 0,
      shouldFill = void 0;
  if (hasPrevY && hasPrevX) tl = matrix[prevY][prevX];
  if (hasPrevY) t = matrix[prevY][x];
  if (hasPrevY && hasNextX) tr = matrix[prevY][nextX];
  if (hasNextX) r = matrix[y][nextX];
  if (hasNextY && hasNextX) br = matrix[nextY][nextX];
  if (hasNextY) b = matrix[nextY][x];
  if (hasNextY && prevX) bl = matrix[nextY][prevX];
  if (hasPrevX) l = matrix[y][prevX];
  // * 2. Check the rules to maintain right angle corners
  if (y === startY) {
    // if we are at the top of the section
    //  -----      -----       -----
    //  | _ r      l _ r       l _ |
    //  | b br    bl b br     bl b |
    return shouldFill = true;
  } else if (y === endY) {
    // if we are at the bottom of the section
    //  | t tr
    //  | _ r
    //  -----
    if (!hasPrevX && hasNextX) {
      if (agrees(t, id) && agrees(tr, id) && !agrees(r, id)) {
        return shouldFill = false;
      }
      return shouldFill = true;
    } else if (!hasNextX && hasPrevX) {
      // tl t |
      //  l _ |
      //  -----
      if (agrees(tl, id) && !agrees(t, id) && agrees(l, id)) {
        return shouldFill = false;
      } else if (agrees(tl, id) && agrees(t, id) && !agrees(l, id)) {
        return shouldFill = false;
      }
      return shouldFill = true;
    } else if (hasPrevX && hasNextX) {
      // tl t tr
      //  l _ r
      //  -----
      if (agrees(tl, id) && !agrees(t, id) && agrees(l, id)) {
        return shouldFill = false;
      } else if (agrees(t, id) && agrees(tr, id) && !agrees(r, id)) {
        return shouldFill = false;
      }
      return shouldFill = true;
    }
  } else if (x === 0) {
    // if we are at the left of the section
    // | t tr
    // | _ r
    // | b br
    if (agrees(t, id) && agrees(tr, id) && !agrees(r, id)) {
      return shouldFill = false;
    } else if (agrees(t, id) && agrees(r, id) && !agrees(tr, id)) {
      return shouldFill = false;
    }
    return shouldFill = true;
  } else if (x === endX - 1) {
    // if we are at the right of the section
    // tl t |
    //  l _ |
    // bl b |
    if (agrees(tl, id) && !agrees(l, id)) {
      return shouldFill = false;
    } else if (agrees(tl, id) && agrees(t, id) && !agrees(l, id)) {
      return shouldFill = false;
    } else if (agrees(tl, id) && !agrees(t, id) && agrees(l, id)) {
      return shouldFill = false;
    } else if (!agrees(tl, id) && agrees(t, id) && agrees(l, id)) {
      return shouldFill = false;
    }
    return shouldFill = true;
  } else {
    // if we are in some middle area
    // tl t tr
    //  l _ r
    // bl b br
    if (agrees(l, id) && agrees(tl, id) && agrees(t, id)) {
      return shouldFill = true;
    } else if (agrees(l, id) && agrees(bl, id) && agrees(b, id) && !agrees(tl, id)) {
      return shouldFill = true;
    }
    if (!agrees(t, id) && agrees(l, id) && agrees(tl, id)) {
      return shouldFill = false;
    } else if (agrees(l, id) && agrees(bl, id) && !agrees(b, id)) {
      return shouldFill = false;
    } else if (agrees(tl, id) && agrees(t, id)) {
      return shouldFill = false;
    }
    shouldFill = true;
  }
  return shouldFill;
}

function scan(matrix, gap, x, y, endX, startY, endY, heightUnits) {
  if (x < endX && y <= endY && y - gap.y < heightUnits && matrix[y][x] === null) {
    // * if the current cell is a gap
    var prevX = x !== 0 ? x - 1 : null;
    var prevY = y !== 0 ? y - 1 : null;
    var nextX = x < endX ? x + 1 : null;
    var nextY = y < endY ? y + 1 : null;
    if (shouldFillCell(matrix, gap, x, y, nextX, nextY, prevX, prevY, endX, startY, endY)) {
      //
      matrix[y][x] = gap.i;
      if (nextY !== null) {
        // if we can keep doing down
        scan(matrix, gap, x, nextY, endX, startY, endY, heightUnits); // scan down
      }
      if (nextX !== null) {
        // if we can keep going right
        scan(matrix, gap, nextX, y, endX, startY, endY, heightUnits); // scan right
      }
      return gap;
    }
  }
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

    // * 1. Get mxY
  };var maxY = 0;
  var cardsInLayout = layout.filter(function (l) {
    return !l.gap;
  }).map(function (card) {
    var cardMaxCoord = card.y + card.h;
    maxY = cardMaxCoord > maxY ? card.y + card.h : maxY;
    return card;
  });
  var matrix = generateMatrix(layout, { x: columnCount, y: maxY }); // * 2. Create a new matrix with a Y of maxY and an X of columnCount
  // * 3. Fill matrix gaps
  var gaps = [];
  for (var _y = 0; _y < matrix.length; _y++) {
    // *  Row section
    for (var _x5 = 0; _x5 < matrix[_y].length; _x5++) {
      // * Cell loop -- Go through all cells in the row
      if (matrix[_y][_x5] === null) {
        // If the cell is empty
        gaps.push(scan(matrix, { i: "gap-" + gaps.length, x: _x5, y: _y, w: 1, h: 1 }, _x5, _y, columnCount, 0, maxY - 1, heightUnits)); // Recursively grow into the largest shape
      }
    }
  }
  // printMatrix(matrix)
  gaps = generateGaps(matrix);
  // If lastRow is true, add lastRow
  lastRow && gaps.push(_extends({ w: columnCount, x: 0, y: matrix.length, h: heightUnits, i: 'gap-last-row', lastRow: true }, gapConfig));
  return [].concat(cardsInLayout, gaps); // Merge the layouts
}

// Flow can't really figure this out, so we just use Object
function autoBindHandlers(el, fns) {
  fns.forEach(function (key) {
    return el[key] = el[key].bind(el);
  });
}

function log() {
  var _console;

  if (!DEBUG) return;
  // eslint-disable-next-line no-console
  (_console = console).log.apply(_console, arguments);
}

var noop = exports.noop = function noop() {};