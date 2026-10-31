/**
 * Fast Horizontal Compactor
 *
 * An optimized horizontal compaction algorithm using a "sweeping tide" approach.
 * Sparse row spans keep storage and range queries independent of layout height.
 * The tide avoids recursive collision resolution; range scans scale with the
 * number of previously placed items.
 *
 * Best suited for large layouts (200+ items) where compaction performance
 * is critical. For smaller layouts, the difference is negligible.
 *
 * Adapted from the vertical fast compactor algorithm from PR #2152 by Morris Brodersen (@morris).
 *
 * @example
 * ```tsx
 * import { fastHorizontalCompactor } from 'react-grid-layout/extras';
 *
 * <GridLayout
 *   compactor={fastHorizontalCompactor}
 *   layout={layout}
 *   // ...
 * />
 * ```
 */

import type { Compactor, Layout, LayoutItem, Mutable } from "../core/types.js";
import { advanceRows, cloneLayout } from "../core/layout.js";

type RowSpan = { start: number; last: number; fraction: number; right: number };

/** Represent the old y++ samples by runs with a common fractional lattice. */
function rowSpans(y: number, h: number, right = 0): RowSpan[] {
  const end = y + h;
  const spans: RowSpan[] = [];
  while (y < end) {
    const boundary =
      y < 0 ? 0 : y < 1 ? 1 : 2 ** (Math.floor(Math.log2(y)) + 1);
    const steps = Math.min(
      Math.ceil(end - y),
      Number.isInteger(y) ? Infinity : Math.max(1, Math.ceil(boundary - y))
    );
    spans.push({
      start: y,
      last: advanceRows(y, steps - 1),
      fraction: y - Math.floor(y),
      right
    });
    y = advanceRows(y, steps);
  }
  return spans;
}

function getMaxTideForItem(tide: RowSpan[], y: number, h: number): number {
  let maxTide = 0;
  for (const query of rowSpans(y, h)) {
    for (const span of tide) {
      if (
        span.fraction !== query.fraction ||
        span.last < query.start ||
        span.start > query.last
      )
        continue;
      maxTide = Math.max(maxTide, span.right);
    }
  }
  return maxTide;
}

function addTide(tide: RowSpan[], y: number, h: number, right: number): void {
  if (!(right > 0)) return;
  tide.push(...rowSpans(y, h, right));
}

/** Skip rows with unchanged tide and static intersections, retaining the limit. */
function nextRow(
  tide: RowSpan[],
  statics: LayoutItem[],
  y: number,
  h: number,
  limit: number
): number {
  if (!Number.isInteger(y) || !Number.isInteger(h)) return y + 1;
  let next = Math.max(y + 1, limit + 1);
  for (const span of tide) {
    if (span.fraction !== 0) continue;
    for (const edge of [span.start - h + 1, span.last + 1]) {
      if (edge > y) next = Math.min(next, edge);
    }
  }
  for (const item of statics) {
    // Include neighboring samples because subtraction and addition can round
    // differently at a fractional collision boundary.
    for (const edge of [Math.floor(item.y - h), Math.ceil(item.y + item.h)]) {
      for (const offset of [-1, 0, 1]) {
        const row = edge + offset;
        if (row > y) next = Math.min(next, row);
      }
    }
  }
  return next;
}

/**
 * Check if an item can be placed at a given position without colliding with static items.
 */
function canPlaceAt(
  item: LayoutItem,
  x: number,
  y: number,
  staticItems: LayoutItem[],
  cols: number
): boolean {
  // Check grid bounds
  if (x + item.w > cols) return false;

  // Check static collisions
  for (const staticItem of staticItems) {
    if (
      x < staticItem.x + staticItem.w &&
      x + item.w > staticItem.x &&
      y < staticItem.y + staticItem.h &&
      y + item.h > staticItem.y
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Fast horizontal compaction using a "sweeping tide" algorithm with row wrapping.
 *
 * The algorithm works by:
 * 1. Sorting items by (y, x, static) - top-to-bottom, left-to-right (like standard compactor)
 * 2. Maintaining sparse sampled row spans that track the rightmost occupied column per row
 * 3. For each item, finding the leftmost position it can occupy
 * 4. If the item doesn't fit in its current row, wrapping to the next row
 * 5. Checking for collisions with static items and adjusting as needed
 *
 * Row ranges replace per-row allocation and traversal.
 *
 * @param layout - The layout to compact (will be modified in place)
 * @param cols - Number of columns in the grid
 * @param allowOverlap - Whether to allow overlapping items
 */
function compactHorizontalFast(
  layout: LayoutItem[],
  cols: number,
  allowOverlap: boolean
): void {
  const numItems = layout.length;
  if (numItems === 0) return;

  // Sort items by column then row (same as standard horizontal compactor)
  // Static items are sorted first at each position to reduce collision checks
  layout.sort((a, b) => {
    if (a.x !== b.x) return a.x - b.x;
    if (a.y !== b.y) return a.y - b.y;
    if (a.static !== b.static) return a.static ? -1 : 1;
    return 0;
  });

  // Calculate max row extent to retain the existing invalid-extent contract.
  let maxRow = 0;
  for (let i = 0; i < numItems; i++) {
    const item = layout[i];
    if (item !== undefined) {
      const bottom = item.y + item.h;
      if (bottom > maxRow) maxRow = bottom;
    }
  }

  // Preserve the existing invalid-extent contract without allocating by height.
  if (!Number.isInteger(maxRow) || maxRow >= 2 ** 32)
    throw new RangeError("Invalid array length");
  const tide: RowSpan[] = [];

  // Collect static items for collision checking
  const staticItems = layout.filter(item => item.static);

  // Safety limit for row wrapping (prevents infinite loops)
  // Use a limit relative to layout size (at least 10_000, or 100x the number of items)
  const maxRowLimit = Math.max(10_000, numItems * 100);

  for (let i = 0; i < numItems; i++) {
    const item = layout[i] as Mutable<LayoutItem>;

    if (item.static) {
      // Static items don't move; they become part of the tide
      addTide(tide, item.y, item.h, item.x + item.w);
      continue;
    }

    // For non-static items, find the best position
    let targetY = item.y;
    let targetX = 0;
    let placed = false;

    // Try to place the item, wrapping to lower rows if needed
    while (!placed) {
      // Find the maximum tide across the rows this item spans
      const maxTide = getMaxTideForItem(tide, targetY, item.h);

      // Try to place at the tide position
      targetX = maxTide;

      // Check if item fits within grid bounds
      if (targetX + item.w <= cols) {
        // Check for static item collisions
        if (
          allowOverlap ||
          canPlaceAt(item, targetX, targetY, staticItems, cols)
        ) {
          placed = true;
        } else {
          // Find the rightmost static collision and try past it
          let maxStaticRight = targetX;
          let foundCollision = false;
          for (const staticItem of staticItems) {
            if (
              targetX < staticItem.x + staticItem.w &&
              targetX + item.w > staticItem.x &&
              targetY < staticItem.y + staticItem.h &&
              targetY + item.h > staticItem.y
            ) {
              maxStaticRight = Math.max(
                maxStaticRight,
                staticItem.x + staticItem.w
              );
              foundCollision = true;
            }
          }
          if (foundCollision) {
            targetX = maxStaticRight;
          }

          // After moving past static, check if we still fit
          if (foundCollision && targetX + item.w <= cols) {
            // Verify no more collisions at new position
            if (canPlaceAt(item, targetX, targetY, staticItems, cols)) {
              placed = true;
            } else {
              // Can't fit in this row, wrap to next
              targetY = nextRow(
                tide,
                staticItems,
                targetY,
                item.h,
                maxRowLimit
              );
            }
          } else if (foundCollision) {
            // Pushed past grid edge, wrap to next row
            targetY = nextRow(tide, staticItems, targetY, item.h, maxRowLimit);
          } else {
            // No collision but can't place - shouldn't happen
            placed = true;
          }
        }
      } else {
        // Doesn't fit in this row, wrap to next
        targetY = nextRow(tide, staticItems, targetY, item.h, maxRowLimit);
      }

      // Safety check to prevent infinite loops
      if (targetY > maxRowLimit) {
        if (typeof console !== "undefined" && console.warn) {
          console.warn(
            `Fast horizontal compactor: Item "${item.i}" exceeded max row limit (${targetY}). ` +
              `This may indicate a layout that cannot be compacted within grid bounds.`
          );
        }
        // Give up and place at current position
        targetX = 0;
        placed = true;
      }
    }

    // Update item position
    item.x = targetX;
    item.y = targetY;
    item.moved = false;

    // Update tide: mark rows as blocked up to item's right edge
    addTide(tide, targetY, item.h, targetX + item.w);
  }
}

/**
 * Fast horizontal compactor - optimized for large layouts.
 *
 * Uses a sparse "sweeping tide" with storage based on placed row ranges.
 * Sorting and range scans replace recursive collision resolution.
 *
 * Best suited for layouts with 200+ items where compaction performance
 * becomes noticeable. For smaller layouts, the standard horizontalCompactor
 * works equally well.
 */
export const fastHorizontalCompactor: Compactor = {
  type: "horizontal",
  allowOverlap: false,

  compact(layout: Layout, cols: number): Layout {
    // Clone the layout since we modify in place
    const out = cloneLayout(layout) as LayoutItem[];
    compactHorizontalFast(out, cols, false);
    return out;
  }
};

/**
 * Fast horizontal compactor that allows overlapping items.
 *
 * Compacts items leftward but allows them to overlap each other.
 */
export const fastHorizontalOverlapCompactor: Compactor = {
  ...fastHorizontalCompactor,
  allowOverlap: true,

  compact(layout: Layout, cols: number): Layout {
    const out = cloneLayout(layout) as LayoutItem[];
    compactHorizontalFast(out, cols, true);
    return out;
  }
};
