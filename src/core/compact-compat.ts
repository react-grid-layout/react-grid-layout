/**
 * Legacy compaction API - backwards compatibility layer.
 *
 * This file implements the exact v1 compaction algorithm for backwards compatibility.
 * The algorithm matches lib/utils.js compact/compactItem functions exactly.
 */

import type { CompactType, Layout, LayoutItem, Mutable } from "./types.js";
import { cloneLayoutItem, bottom } from "./layout.js";
import { getFirstCollision, collides } from "./collision.js";
import { sortLayoutItems } from "./sort.js";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all static items from a layout
 */
function getStatics(layout: Layout): LayoutItem[] {
  return layout.filter(l => l.static);
}

const heightWidth: { x: "w"; y: "h" } = { x: "w", y: "h" };

/**
 * Before moving item down/right, check if movement will cause collisions
 * and move those items first. This is the recursive collision resolver.
 */
function resolveCompactionCollision(
  layout: Layout,
  item: LayoutItem,
  moveToCoord: number,
  axis: "x" | "y"
): void {
  const sizeProp = heightWidth[axis];
  (item as Mutable<LayoutItem>)[axis] += 1;

  const itemIndex = layout.findIndex(l => l.i === item.i);

  // Go through each item we collide with
  for (let i = itemIndex + 1; i < layout.length; i++) {
    const otherItem = layout[i];
    if (otherItem === undefined) continue;

    // Ignore static items
    if (otherItem.static) continue;

    // Optimization: we can break early if we know we're past this element
    // We can do this because it's a sorted layout
    if (otherItem.y > item.y + item.h) break;

    if (collides(item, otherItem)) {
      resolveCompactionCollision(
        layout,
        otherItem,
        moveToCoord + item[sizeProp],
        axis
      );
    }
  }

  (item as Mutable<LayoutItem>)[axis] = moveToCoord;
}

/**
 * Compact a single item in the layout.
 *
 * This is the exact algorithm from lib/utils.js compactItem.
 */
function compactItemInternal(
  compareWith: Layout,
  l: LayoutItem,
  compactType: CompactType,
  cols: number,
  fullLayout: Layout,
  allowOverlap: boolean | undefined,
  b: number | undefined
): LayoutItem {
  const compactV = compactType === "vertical";
  const compactH = compactType === "horizontal";

  if (compactV) {
    // Bottom 'y' possible is the bottom of the layout.
    // This allows you to do nice stuff like specify {y: Infinity}
    if (typeof b === "number") {
      (l as Mutable<LayoutItem>).y = Math.min(b, l.y);
    } else {
      (l as Mutable<LayoutItem>).y = Math.min(bottom(compareWith), l.y);
    }
    // Move the element up as far as it can go without colliding.
    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      (l as Mutable<LayoutItem>).y--;
    }
  } else if (compactH) {
    // Move the element left as far as it can go without colliding.
    while (l.x > 0 && !getFirstCollision(compareWith, l)) {
      (l as Mutable<LayoutItem>).x--;
    }
  }

  // Move it down/right, and keep moving if it's colliding.
  let collision: LayoutItem | undefined;
  // Checking the compactType null value to avoid breaking the layout when overlapping is allowed.
  while (
    (collision = getFirstCollision(compareWith, l)) !== undefined &&
    !(compactType === null && allowOverlap)
  ) {
    if (compactH) {
      resolveCompactionCollision(fullLayout, l, collision.x + collision.w, "x");
    } else {
      resolveCompactionCollision(fullLayout, l, collision.y + collision.h, "y");
    }

    // Since we can't grow without bounds horizontally, if we've overflown,
    // let's move it down and try again.
    if (compactH && l.x + l.w > cols) {
      (l as Mutable<LayoutItem>).x = cols - l.w;
      (l as Mutable<LayoutItem>).y++;
      // Also move element as left as we can
      while (l.x > 0 && !getFirstCollision(compareWith, l)) {
        (l as Mutable<LayoutItem>).x--;
      }
    }
  }

  // Ensure that there are no negative positions
  (l as Mutable<LayoutItem>).y = Math.max(l.y, 0);
  (l as Mutable<LayoutItem>).x = Math.max(l.x, 0);

  return l;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Compact a layout by removing gaps between items.
 *
 * This is the exact algorithm from lib/utils.js compact function.
 *
 * @param layout - Layout to compact
 * @param compactType - 'vertical', 'horizontal', or null
 * @param cols - Number of columns in the grid
 * @param allowOverlap - If true, overlapping is allowed
 * @returns Compacted layout
 */
export function compact(
  layout: Layout,
  compactType: CompactType,
  cols: number,
  allowOverlap?: boolean
): LayoutItem[] {
  // Statics go in the compareWith array right away so items flow around them.
  const compareWith = getStatics(layout);
  // We keep track of the bottom position.
  let b = bottom(compareWith);
  // We go through the items by row and column (or col and row for horizontal).
  const sorted = sortLayoutItems(layout, compactType);
  // Holding for new items.
  const out: LayoutItem[] = new Array(layout.length);

  for (let i = 0; i < sorted.length; i++) {
    const sortedItem = sorted[i];
    if (sortedItem === undefined) continue;

    let l = cloneLayoutItem(sortedItem);

    // Don't move static elements
    if (!l.static) {
      l = compactItemInternal(
        compareWith,
        l,
        compactType,
        cols,
        sorted,
        allowOverlap,
        b
      );
      b = Math.max(b, l.y + l.h);

      // Add to comparison array. We only collide with items before this one.
      // Statics are already in this array.
      compareWith.push(l);
    }

    // Add to output array to make sure they still come out in the right order.
    const originalIndex = layout.indexOf(sortedItem);
    out[originalIndex] = l;

    // Clear moved flag, if it exists.
    (l as Mutable<LayoutItem>).moved = false;
  }

  return out;
}

/**
 * Compact a single item within the layout.
 *
 * @deprecated Use compact() instead, which handles the full layout.
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
  return compactItemInternal(
    compareWith,
    cloneLayoutItem(l),
    compactType,
    cols,
    fullLayout,
    allowOverlap,
    maxY
  );
}
