/**
 * Wrap Compactor
 *
 * A compaction algorithm that treats grid items like words in a paragraph.
 * Items flow left-to-right, wrapping to the next row when they reach
 * the grid edge.
 *
 * When dragging:
 * - Moving an item earlier in the sequence shifts other items down/right
 * - Moving an item later in the sequence shifts other items up/left
 *
 * This creates a natural reordering behavior similar to drag-and-drop
 * in file managers or card layouts.
 *
 * Based on the algorithm from PR #1773 by John Thomson (@JohnThomson).
 *
 * @example
 * ```tsx
 * import { wrapCompactor } from 'react-grid-layout/extras';
 *
 * <GridLayout
 *   compactor={wrapCompactor}
 *   layout={layout}
 *   // ...
 * />
 * ```
 */

import type { Compactor, Layout, LayoutItem, Mutable } from "../core/types.js";
import { cloneLayout, cloneLayoutItem } from "../core/layout.js";

/**
 * Sort items in wrap order: left-to-right, top-to-bottom.
 * This is the visual reading order for wrapped content.
 */
function sortByWrapOrder(layout: Layout): LayoutItem[] {
  return [...layout].sort((a, b) => {
    // Primary: top-to-bottom (by row)
    if (a.y !== b.y) return a.y - b.y;
    // Secondary: left-to-right (by column)
    return a.x - b.x;
  });
}

/**
 * Convert a linear wrap position back to x,y coordinates.
 */
function fromWrapPosition(pos: number, cols: number): { x: number; y: number } {
  return {
    x: pos % cols,
    y: Math.floor(pos / cols)
  };
}

/**
 * Compact items in wrap order, filling gaps from left-to-right, top-to-bottom.
 * All items are assumed to be 1x1 for wrap mode to work correctly.
 */
function compactWrap(layout: Layout, cols: number): LayoutItem[] {
  if (layout.length === 0) return [];

  const sorted = sortByWrapOrder(layout);
  const out: LayoutItem[] = new Array(layout.length);
  const statics = sorted.filter(item => item.static);

  // Track which positions are occupied by static items
  const staticPositions = new Set<number>();
  for (const s of statics) {
    // For static items, mark all cells they occupy
    for (let dy = 0; dy < s.h; dy++) {
      for (let dx = 0; dx < s.w; dx++) {
        staticPositions.add((s.y + dy) * cols + (s.x + dx));
      }
    }
  }

  let nextPos = 0;

  for (let i = 0; i < sorted.length; i++) {
    const sortedItem = sorted[i];
    if (sortedItem === undefined) continue;

    const l = cloneLayoutItem(sortedItem);

    if (l.static) {
      // Static items stay in place
      const originalIndex = layout.indexOf(sortedItem);
      out[originalIndex] = l;
      l.moved = false;
      continue;
    }

    // Find next available position that doesn't conflict with statics
    while (staticPositions.has(nextPos)) {
      nextPos++;
    }

    // For items larger than 1x1, we need to check if the full item fits
    const { x, y } = fromWrapPosition(nextPos, cols);

    // Check if item would overflow the row
    if (x + l.w > cols) {
      // Move to start of next row
      nextPos = (y + 1) * cols;
      // Skip any static positions on the new row
      while (staticPositions.has(nextPos)) {
        nextPos++;
      }
    }

    const newCoords = fromWrapPosition(nextPos, cols);
    (l as Mutable<LayoutItem>).x = newCoords.x;
    (l as Mutable<LayoutItem>).y = newCoords.y;

    // Advance past this item
    nextPos += l.w;

    const originalIndex = layout.indexOf(sortedItem);
    out[originalIndex] = l;
    l.moved = false;
  }

  return out;
}

/**
 * Wrap compactor - arranges items like words in a paragraph.
 *
 * Items flow left-to-right and wrap to the next row when they
 * reach the grid edge. Dragging an item reorders the sequence,
 * with other items shifting to maintain the flow.
 *
 * Works best with uniformly-sized items (especially 1x1), but
 * handles larger items by ensuring they fit within row bounds.
 */
export const wrapCompactor: Compactor = {
  type: "wrap",
  allowOverlap: false,

  compact(layout: Layout, cols: number): Layout {
    return compactWrap(layout, cols);
  }
};

/**
 * Wrap compactor that allows overlapping items.
 */
export const wrapOverlapCompactor: Compactor = {
  ...wrapCompactor,
  allowOverlap: true,

  compact(layout: Layout, _cols: number): Layout {
    // With overlap allowed, just clone without compacting
    return cloneLayout(layout);
  }
};
