/**
 * Compactor implementations.
 *
 * Compactors are pluggable strategies for removing gaps between grid items.
 * Use the Compactor interface to create custom compaction algorithms.
 */

import type { Compactor, CompactType, Layout, LayoutItem } from "./types.js";
import { cloneLayout } from "./layout.js";
import { HORIZONTAL, VERTICAL } from "./geometry/axis.js";
import {
  classicCompactor,
  compactItem,
  resolveClassicCollision
} from "./compaction/classic.js";

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
 * @param hasStatics - Whether layout contains static items (disables early break optimization)
 */
export function resolveCompactionCollision(
  layout: Layout,
  item: LayoutItem,
  moveToCoord: number,
  axis: "x" | "y",
  hasStatics?: boolean
): void {
  resolveClassicCollision(
    layout,
    item,
    moveToCoord,
    axis === "x" ? HORIZONTAL : VERTICAL,
    hasStatics
  );
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
  return compactItem(compareWith, l, fullLayout, VERTICAL, Infinity, maxY);
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
  return compactItem(compareWith, l, fullLayout, HORIZONTAL, cols, Infinity);
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
export const verticalCompactor: Compactor = classicCompactor(VERTICAL);

// ============================================================================
// Horizontal Compactor
// ============================================================================

/**
 * Horizontal compactor - moves items left to fill gaps.
 *
 * Items are sorted by column then row, and each item is moved
 * as far left as possible without overlapping other items.
 */
export const horizontalCompactor: Compactor = classicCompactor(HORIZONTAL);

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

/**
 * No compaction, with overlapping allowed.
 *
 * Items stay where placed and can overlap each other.
 */
export const noOverlapCompactor: Compactor = {
  ...noCompactor,
  allowOverlap: true
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
    else baseCompactor = noOverlapCompactor;
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
