/**
 * Compactor implementations.
 *
 * Compactors are pluggable strategies for removing gaps between grid items.
 * Use the Compactor interface to create custom compaction algorithms.
 */

import type {
  Compactor,
  CompactType,
  Layout,
  LayoutItem,
  Mutable
} from "./types.js";
import { getFirstCollision } from "./collision.js";
import { sortLayoutItemsByRowCol, sortLayoutItemsByColRow } from "./sort.js";
import { bottom, cloneLayoutItem, getStatics, cloneLayout } from "./layout.js";
import { collides } from "./collision.js";

// ============================================================================
// Helpers for Custom Compactors
// ============================================================================

/**
 * Resolve a compaction collision by moving items.
 *
 * Before moving an item to a position, checks if that movement would
 * cause collisions and recursively moves those items first.
 *
 * Useful for implementing custom compactors.
 *
 * @param layout - Full layout (must be sorted for optimization)
 * @param item - Item being moved (will be mutated)
 * @param moveToCoord - Target coordinate
 * @param axis - Which axis to move on ('x' or 'y')
 */
export function resolveCompactionCollision(
  layout: Layout,
  item: LayoutItem,
  moveToCoord: number,
  axis: "x" | "y"
): void {
  const sizeProp = axis === "x" ? "w" : "h";

  // Temporarily increment position to check for collisions
  (item as Mutable<LayoutItem>)[axis] += 1;

  const itemIndex = layout.findIndex(l => l.i === item.i);

  for (let i = itemIndex + 1; i < layout.length; i++) {
    const otherItem = layout[i];
    if (otherItem === undefined) continue;
    if (otherItem.static) continue;
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
 * Compact a single item vertically (move up).
 *
 * Moves the item as far up as possible without colliding.
 * Useful for implementing custom vertical compactors.
 *
 * @param compareWith - Items to check for collisions
 * @param l - Item to compact (will be mutated)
 * @param fullLayout - Full layout for collision resolution
 * @param maxY - Maximum Y to start from
 * @returns The compacted item
 */
export function compactItemVertical(
  compareWith: Layout,
  l: LayoutItem,
  fullLayout: Layout,
  maxY: number
): LayoutItem {
  // Limit Y to the current bottom
  (l as Mutable<LayoutItem>).y = Math.min(maxY, l.y);

  // Move up as far as possible
  while (l.y > 0 && !getFirstCollision(compareWith, l)) {
    (l as Mutable<LayoutItem>).y--;
  }

  // Resolve collisions by moving down
  let collision: LayoutItem | undefined;
  while ((collision = getFirstCollision(compareWith, l)) !== undefined) {
    resolveCompactionCollision(fullLayout, l, collision.y + collision.h, "y");
  }

  (l as Mutable<LayoutItem>).y = Math.max(l.y, 0);
  return l;
}

/**
 * Compact a single item horizontally (move left).
 *
 * Moves the item as far left as possible without colliding.
 * Wraps to the next row if it overflows.
 * Useful for implementing custom horizontal compactors.
 *
 * @param compareWith - Items to check for collisions
 * @param l - Item to compact (will be mutated)
 * @param cols - Number of columns in the grid
 * @param fullLayout - Full layout for collision resolution
 * @returns The compacted item
 */
export function compactItemHorizontal(
  compareWith: Layout,
  l: LayoutItem,
  cols: number,
  fullLayout: Layout
): LayoutItem {
  // Move left as far as possible
  while (l.x > 0 && !getFirstCollision(compareWith, l)) {
    (l as Mutable<LayoutItem>).x--;
  }

  // Resolve collisions
  let collision: LayoutItem | undefined;
  while ((collision = getFirstCollision(compareWith, l)) !== undefined) {
    resolveCompactionCollision(fullLayout, l, collision.x + collision.w, "x");

    // Horizontal overflow: wrap to next row
    if (l.x + l.w > cols) {
      (l as Mutable<LayoutItem>).x = cols - l.w;
      (l as Mutable<LayoutItem>).y++;

      while (l.x > 0 && !getFirstCollision(compareWith, l)) {
        (l as Mutable<LayoutItem>).x--;
      }
    }
  }

  (l as Mutable<LayoutItem>).x = Math.max(l.x, 0);
  return l;
}

// ============================================================================
// Vertical Compactor
// ============================================================================

/**
 * Vertical compactor - moves items up to fill gaps.
 *
 * Items are sorted by row then column, and each item is moved
 * as far up as possible without overlapping other items.
 *
 * This is the default compaction mode for react-grid-layout.
 */
export const verticalCompactor: Compactor = {
  type: "vertical",
  allowOverlap: false,

  compact(layout: Layout, _cols: number): Layout {
    const compareWith = getStatics(layout);
    let maxY = bottom(compareWith);
    const sorted = sortLayoutItemsByRowCol(layout);
    const out: LayoutItem[] = new Array(layout.length);

    for (let i = 0; i < sorted.length; i++) {
      const sortedItem = sorted[i];
      if (sortedItem === undefined) continue;

      let l = cloneLayoutItem(sortedItem);

      if (!l.static) {
        l = compactItemVertical(compareWith, l, sorted, maxY);
        maxY = Math.max(maxY, l.y + l.h);
        compareWith.push(l);
      }

      const originalIndex = layout.indexOf(sortedItem);
      out[originalIndex] = l;
      l.moved = false;
    }

    return out;
  },

  onMove(
    layout: Layout,
    item: LayoutItem,
    x: number,
    y: number,
    _cols: number
  ): Layout {
    // Simple move - compact() will be called after
    const newLayout = cloneLayout(layout);
    const movedItem = newLayout.find(l => l.i === item.i);
    if (movedItem) {
      movedItem.x = x;
      movedItem.y = y;
      movedItem.moved = true;
    }
    return newLayout;
  }
};

// ============================================================================
// Horizontal Compactor
// ============================================================================

/**
 * Horizontal compactor - moves items left to fill gaps.
 *
 * Items are sorted by column then row, and each item is moved
 * as far left as possible without overlapping other items.
 */
export const horizontalCompactor: Compactor = {
  type: "horizontal",
  allowOverlap: false,

  compact(layout: Layout, cols: number): Layout {
    const compareWith = getStatics(layout);
    const sorted = sortLayoutItemsByColRow(layout);
    const out: LayoutItem[] = new Array(layout.length);

    for (let i = 0; i < sorted.length; i++) {
      const sortedItem = sorted[i];
      if (sortedItem === undefined) continue;

      let l = cloneLayoutItem(sortedItem);

      if (!l.static) {
        l = compactItemHorizontal(compareWith, l, cols, sorted);
        compareWith.push(l);
      }

      const originalIndex = layout.indexOf(sortedItem);
      out[originalIndex] = l;
      l.moved = false;
    }

    return out;
  },

  onMove(
    layout: Layout,
    item: LayoutItem,
    x: number,
    y: number,
    _cols: number
  ): Layout {
    const newLayout = cloneLayout(layout);
    const movedItem = newLayout.find(l => l.i === item.i);
    if (movedItem) {
      movedItem.x = x;
      movedItem.y = y;
      movedItem.moved = true;
    }
    return newLayout;
  }
};

// ============================================================================
// No Compaction
// ============================================================================

/**
 * No compaction - items stay where placed.
 *
 * Use this for free-form layouts where items can be placed anywhere.
 * Items will not automatically move to fill gaps.
 */
export const noCompactor: Compactor = {
  type: null,
  allowOverlap: false,

  compact(layout: Layout, _cols: number): Layout {
    // No compaction - just clone to maintain immutability
    return cloneLayout(layout);
  },

  onMove(
    layout: Layout,
    item: LayoutItem,
    x: number,
    y: number,
    _cols: number
  ): Layout {
    const newLayout = cloneLayout(layout);
    const movedItem = newLayout.find(l => l.i === item.i);
    if (movedItem) {
      movedItem.x = x;
      movedItem.y = y;
      movedItem.moved = true;
    }
    return newLayout;
  }
};

// ============================================================================
// Overlap-Allowing Variants
// ============================================================================

/**
 * Vertical compactor that allows overlapping items.
 *
 * Items compact upward but are allowed to overlap each other.
 * Useful for layered layouts or when collision detection is handled externally.
 */
export const verticalOverlapCompactor: Compactor = {
  ...verticalCompactor,
  allowOverlap: true,

  compact(layout: Layout, _cols: number): Layout {
    // With overlap allowed, just clone without moving
    return cloneLayout(layout);
  }
};

/**
 * Horizontal compactor that allows overlapping items.
 */
export const horizontalOverlapCompactor: Compactor = {
  ...horizontalCompactor,
  allowOverlap: true,

  compact(layout: Layout, _cols: number): Layout {
    return cloneLayout(layout);
  }
};

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Get a compactor by type.
 *
 * This is a convenience function for backwards compatibility with the
 * string-based compactType API.
 *
 * Note: For 'wrap' mode, import `wrapCompactor` from 'react-grid-layout/extras'
 * and pass it directly to the `compactor` prop. This function returns
 * `noCompactor` for 'wrap' type since the wrap compactor is tree-shakeable.
 *
 * @param compactType - 'vertical', 'horizontal', 'wrap', or null
 * @param allowOverlap - Whether to allow overlapping items
 * @returns The appropriate Compactor
 */
export function getCompactor(
  compactType: CompactType,
  allowOverlap: boolean = false,
  preventCollision: boolean = false
): Compactor {
  let baseCompactor: Compactor;

  if (allowOverlap) {
    if (compactType === "vertical") baseCompactor = verticalOverlapCompactor;
    else if (compactType === "horizontal")
      baseCompactor = horizontalOverlapCompactor;
    else baseCompactor = noCompactor;
  } else {
    if (compactType === "vertical") baseCompactor = verticalCompactor;
    else if (compactType === "horizontal") baseCompactor = horizontalCompactor;
    // For 'wrap' and null, use noCompactor
    // Users wanting wrap mode should import wrapCompactor from extras
    else baseCompactor = noCompactor;
  }

  // Return with preventCollision if specified
  if (preventCollision) {
    return { ...baseCompactor, preventCollision };
  }
  return baseCompactor;
}
