/**
 * Layout compaction algorithms.
 *
 * Compaction removes gaps between grid items by moving them
 * towards the origin (top-left for vertical, left for horizontal).
 */

import type { CompactType, Layout, LayoutItem, Mutable } from "./types.js";
import { collides, getFirstCollision } from "./collision.js";
import { sortLayoutItems } from "./sort.js";
import { bottom, cloneLayoutItem, getStatics } from "./layout.js";

// ============================================================================
// Main Compaction Function
// ============================================================================

/**
 * Compact a layout by removing gaps between items.
 *
 * Items are moved towards the origin based on the compaction type:
 * - 'vertical': Items move up
 * - 'horizontal': Items move left
 * - null: No compaction (items stay in place, unless they overlap)
 *
 * Static items are not moved, but other items flow around them.
 *
 * Does not modify the original layout.
 *
 * @param layout - Layout to compact
 * @param compactType - Type of compaction
 * @param cols - Number of columns in the grid
 * @param allowOverlap - If true, overlapping is allowed (no collision resolution)
 * @returns Compacted layout
 */
export function compact(
  layout: Layout,
  compactType: CompactType,
  cols: number,
  allowOverlap?: boolean
): LayoutItem[] {
  // Static items go in compareWith immediately so items flow around them
  const compareWith = getStatics(layout);
  let b = bottom(compareWith);

  // Sort items for proper compaction order
  const sorted = sortLayoutItems(layout, compactType);

  // Output array, maintaining original order
  const out: LayoutItem[] = new Array(layout.length);

  for (let i = 0; i < sorted.length; i++) {
    const sortedItem = sorted[i];
    if (sortedItem === undefined) continue;

    let l = cloneLayoutItem(sortedItem);

    // Don't move static elements
    if (!l.static) {
      l = compactItem(
        compareWith,
        l,
        compactType,
        cols,
        sorted,
        allowOverlap,
        b
      );
      b = Math.max(b, l.y + l.h);

      // Add to comparison array for future items
      compareWith.push(l);
    }

    // Find original index to maintain order
    const originalIndex = layout.indexOf(sortedItem);
    out[originalIndex] = l;

    // Clear moved flag
    l.moved = false;
  }

  return out;
}

// ============================================================================
// Item Compaction
// ============================================================================

/**
 * Compact a single item within the layout.
 *
 * Moves the item as far up (vertical) or left (horizontal) as possible
 * without colliding with other items.
 *
 * Modifies the item in place for performance.
 *
 * @param compareWith - Items to check for collisions (typically statics + already compacted)
 * @param l - Item to compact (will be mutated)
 * @param compactType - Type of compaction
 * @param cols - Number of columns
 * @param fullLayout - Full layout (for resolving cascading collisions)
 * @param allowOverlap - If true, don't resolve collisions
 * @param maxY - Maximum Y value (optimization for vertical compaction)
 * @returns The compacted item (same reference as l)
 */
export function compactItem(
  compareWith: Layout,
  l: LayoutItem,
  compactType: CompactType,
  cols: number,
  fullLayout: Layout,
  allowOverlap: boolean | undefined,
  maxY: number | undefined
): LayoutItem {
  const compactV = compactType === "vertical";
  const compactH = compactType === "horizontal";

  if (compactV) {
    // Limit Y to the current bottom of the layout
    // This allows specifying { y: Infinity } to add items at the bottom
    if (typeof maxY === "number") {
      (l as Mutable<LayoutItem>).y = Math.min(maxY, l.y);
    } else {
      (l as Mutable<LayoutItem>).y = Math.min(bottom(compareWith), l.y);
    }

    // Move up as far as possible without collision
    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      (l as Mutable<LayoutItem>).y--;
    }
  } else if (compactH) {
    // Move left as far as possible without collision
    while (l.x > 0 && !getFirstCollision(compareWith, l)) {
      (l as Mutable<LayoutItem>).x--;
    }
  }

  // Resolve any remaining collisions
  let collision: LayoutItem | undefined;
  while (
    (collision = getFirstCollision(compareWith, l)) !== undefined &&
    !(compactType === null && allowOverlap)
  ) {
    if (compactH) {
      resolveCompactionCollision(fullLayout, l, collision.x + collision.w, "x");
    } else {
      resolveCompactionCollision(fullLayout, l, collision.y + collision.h, "y");
    }

    // Horizontal overflow: wrap to next row and try again
    if (compactH && l.x + l.w > cols) {
      (l as Mutable<LayoutItem>).x = cols - l.w;
      (l as Mutable<LayoutItem>).y++;

      // Move left again after wrapping
      while (l.x > 0 && !getFirstCollision(compareWith, l)) {
        (l as Mutable<LayoutItem>).x--;
      }
    }
  }

  // Ensure no negative positions
  (l as Mutable<LayoutItem>).y = Math.max(l.y, 0);
  (l as Mutable<LayoutItem>).x = Math.max(l.x, 0);

  return l;
}

// ============================================================================
// Collision Resolution
// ============================================================================

/**
 * Resolve a compaction collision by moving items.
 *
 * Before moving an item to a position, checks if that movement would
 * cause collisions and recursively moves those items first.
 *
 * Modifies items in place for performance.
 *
 * @param layout - Full layout (must be sorted for optimization)
 * @param item - Item being moved (will be mutated)
 * @param moveToCoord - Target coordinate
 * @param axis - Which axis to move on ('x' or 'y')
 */
function resolveCompactionCollision(
  layout: Layout,
  item: LayoutItem,
  moveToCoord: number,
  axis: "x" | "y"
): void {
  const sizeProp = axis === "x" ? "w" : "h";

  // Temporarily increment position to check for collisions
  (item as Mutable<LayoutItem>)[axis] += 1;

  // Find item's position in the sorted layout
  const itemIndex = layout.findIndex(l => l.i === item.i);

  // Check items that come after this one in the sorted layout
  for (let i = itemIndex + 1; i < layout.length; i++) {
    const otherItem = layout[i];
    if (otherItem === undefined) continue;

    // Skip static items
    if (otherItem.static) continue;

    // Optimization: can break early if we're past this item vertically
    // (only valid because layout is sorted)
    if (otherItem.y > item.y + item.h) break;

    if (collides(item, otherItem)) {
      // Recursively resolve collision
      resolveCompactionCollision(
        layout,
        otherItem,
        moveToCoord + item[sizeProp],
        axis
      );
    }
  }

  // Actually move the item to the target position
  (item as Mutable<LayoutItem>)[axis] = moveToCoord;
}
