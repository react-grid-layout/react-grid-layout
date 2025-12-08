/**
 * Sorting utilities for grid layouts.
 *
 * These functions sort layout items for compaction and iteration.
 */

import type { CompactType, Layout, LayoutItem } from "./types.js";

/**
 * Sort layout items based on the compaction type.
 *
 * - Vertical compaction: sort by row (y) then column (x)
 * - Horizontal compaction: sort by column (x) then row (y)
 * - No compaction (null): return original order
 *
 * Does not modify the original layout.
 *
 * @param layout - Layout to sort
 * @param compactType - Type of compaction
 * @returns Sorted layout
 */
export function sortLayoutItems(
  layout: Layout,
  compactType: CompactType
): LayoutItem[] {
  if (compactType === "horizontal") {
    return sortLayoutItemsByColRow(layout);
  }
  if (compactType === "vertical") {
    return sortLayoutItemsByRowCol(layout);
  }
  // No compaction - return a copy to maintain immutability
  return [...layout];
}

/**
 * Sort layout items by row ascending, then column ascending.
 *
 * Items are ordered from top-left to bottom-right, row by row.
 * This is the natural reading order for vertical compaction.
 *
 * Does not modify the original layout.
 *
 * @param layout - Layout to sort
 * @returns Sorted array of layout items
 */
export function sortLayoutItemsByRowCol(layout: Layout): LayoutItem[] {
  return [...layout].sort((a, b) => {
    // Primary sort by row (y)
    if (a.y !== b.y) {
      return a.y - b.y;
    }
    // Secondary sort by column (x)
    return a.x - b.x;
  });
}

/**
 * Sort layout items by column ascending, then row ascending.
 *
 * Items are ordered from top-left to bottom-right, column by column.
 * This is the natural order for horizontal compaction.
 *
 * Does not modify the original layout.
 *
 * @param layout - Layout to sort
 * @returns Sorted array of layout items
 */
export function sortLayoutItemsByColRow(layout: Layout): LayoutItem[] {
  return [...layout].sort((a, b) => {
    // Primary sort by column (x)
    if (a.x !== b.x) {
      return a.x - b.x;
    }
    // Secondary sort by row (y)
    return a.y - b.y;
  });
}
