/**
 * Legacy compaction API - backwards compatibility layer.
 *
 * These functions maintain backwards compatibility with the v1 API that uses
 * string-based compactType. For new code, prefer using Compactor objects
 * directly from `./compactors.js`.
 *
 * @deprecated Prefer using Compactor objects from './compactors.js'
 */

import type { Compactor, CompactType, Layout, LayoutItem } from "./types.js";
import { getCompactor } from "./compactors.js";

/**
 * Compact a layout by removing gaps between items.
 *
 * @deprecated Use Compactor.compact() instead:
 * ```typescript
 * import { verticalCompactor } from 'react-grid-layout/core';
 * const compacted = verticalCompactor.compact(layout, cols);
 * ```
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
  const compactor = getCompactor(compactType, allowOverlap);
  return compactor.compact(layout, cols) as LayoutItem[];
}

/**
 * Compact a single item within the layout.
 *
 * @deprecated Use Compactor.compact() instead, which handles the full layout.
 */
export function compactItem(
  compareWith: Layout,
  l: LayoutItem,
  compactType: CompactType,
  cols: number,
  _fullLayout: Layout,
  allowOverlap: boolean | undefined,
  _maxY: number | undefined
): LayoutItem {
  const compactor = getCompactor(compactType, allowOverlap);
  const result = compactor.compact([...compareWith, l], cols);
  const compacted = result.find(item => item.i === l.i);
  return compacted ?? l;
}

/**
 * Apply a compactor to a layout.
 *
 * This is a convenience wrapper - you can also call compactor.compact() directly.
 *
 * @param layout - Layout to compact
 * @param compactor - Compactor to use
 * @param cols - Number of columns
 * @returns Compacted layout
 */
export function applyCompactor(
  layout: Layout,
  compactor: Compactor,
  cols: number
): LayoutItem[] {
  return compactor.compact(layout, cols) as LayoutItem[];
}
