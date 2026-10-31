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

type Interval = { start: number; end: number };
type OccupiedRectangle = Interval & { left: number; right: number };
type OccupiedBand = Interval & { columns: Interval[] };
type SampledStatic = {
  x: number;
  y: number;
  width: number;
  height: number;
  exactLattice: boolean;
};

function hasExactSampleLattice(item: LayoutItem, cols: number): boolean {
  const magnitude =
    (Math.abs(item.y) + Math.ceil(item.h)) * cols +
    Math.abs(item.x) +
    Math.ceil(item.w);
  const unit = 2 ** (Math.floor(Math.log2(magnitude)) - 52);
  // At this precision every intermediate row/cell expression is exact.
  // Decimal fractions may lose bits as rows grow, so use exact lookup for them.
  return (
    Number.isSafeInteger(item.x / unit) && Number.isSafeInteger(item.y / unit)
  );
}

function insertBoundary(boundaries: number[], value: number): void {
  let index = 0;
  while (index < boundaries.length && boundaries[index]! < value) index++;
  if (boundaries[index] !== value) boundaries.splice(index, 0, value);
}

function insertInterval(
  intervals: Interval[],
  start: number,
  end: number
): void {
  let index = 0;
  while (index < intervals.length && intervals[index]!.end < start) index++;
  while (index < intervals.length && intervals[index]!.start <= end) {
    const previous = intervals[index]!;
    start = Math.min(start, previous.start);
    end = Math.max(end, previous.end);
    intervals.splice(index, 1);
  }
  intervals.splice(index, 0, { start, end });
}

function addStatic(
  rectangles: OccupiedRectangle[],
  sampledStatics: SampledStatic[],
  item: LayoutItem,
  cols: number
): void {
  const width = Math.ceil(item.w);
  const height = Math.ceil(item.h);
  if (!(width > 0 && height > 0)) return;
  if (!Number.isInteger(item.x) || !Number.isInteger(item.y)) {
    sampledStatics.push({
      x: item.x,
      y: item.y,
      width,
      height,
      exactLattice: hasExactSampleLattice(item, cols)
    });
    return;
  }

  const start = item.y * cols + item.x;
  const row = Math.floor(start / cols);
  const left = start - row * cols;
  if (width < cols) {
    rectangles.push({
      start: row,
      end: row + height,
      left,
      right: Math.min(cols, left + width)
    });
    if (left + width > cols) {
      rectangles.push({
        start: row + 1,
        end: row + height + 1,
        left: 0,
        right: left + width - cols
      });
    }
    return;
  }

  // Adjacent sampled rows overlap when the width reaches cols. Represent
  // their union with two edge rows and one band, even for enormous heights.
  const end = start + (height - 1) * cols + width;
  const lastRow = Math.floor(end / cols);
  rectangles.push({ start: row, end: row + 1, left, right: cols });
  if (lastRow > row + 1)
    rectangles.push({ start: row + 1, end: lastRow, left: 0, right: cols });
  if (end > lastRow * cols) {
    rectangles.push({
      start: lastRow,
      end: lastRow + 1,
      left: 0,
      right: end - lastRow * cols
    });
  }
}

function occupiedBands(rectangles: OccupiedRectangle[]): OccupiedBand[] {
  const boundaries: number[] = [];
  for (let i = 0; i < rectangles.length; i++) {
    insertBoundary(boundaries, rectangles[i]!.start);
    insertBoundary(boundaries, rectangles[i]!.end);
  }
  const bands: OccupiedBand[] = [];
  for (let i = 1; i < boundaries.length; i++) {
    const start = boundaries[i - 1]!;
    const end = boundaries[i]!;
    const columns: Interval[] = [];
    for (let j = 0; j < rectangles.length; j++) {
      const rectangle = rectangles[j]!;
      if (rectangle.start <= start && rectangle.end >= end) {
        insertInterval(columns, rectangle.left, rectangle.right);
      }
    }
    if (columns.length > 0) bands.push({ start, end, columns });
  }
  return bands;
}

function skipStatics(
  position: number,
  cols: number,
  bands: OccupiedBand[],
  sampledStatics: SampledStatic[]
): number {
  if (bands.length === 0 && sampledStatics.length === 0) return position;
  let previous: number;
  do {
    previous = position;
    if (Number.isInteger(position)) {
      const row = Math.floor(position / cols);
      const column = position - row * cols;
      for (let i = 0; i < bands.length; i++) {
        const band = bands[i]!;
        if (row < band.start || row >= band.end) continue;
        for (let j = 0; j < band.columns.length; j++) {
          const interval = band.columns[j]!;
          if (column < interval.start || column >= interval.end) continue;
          position =
            interval.start === 0 && interval.end === cols
              ? band.end * cols
              : row * cols + interval.end;
          break;
        }
        break;
      }
    }
    for (let i = 0; i < sampledStatics.length; i++) {
      position = skipSampledStatic(position, sampledStatics[i]!, cols);
    }
  } while (position !== previous);
  return position;
}

function skipSampledStatic(
  position: number,
  sample: SampledStatic,
  cols: number
): number {
  const row = Math.floor((position - sample.x) / cols - sample.y);
  // Rounding and a row's last cell can put the estimate on a neighboring row.
  for (
    let dy = Math.max(0, row - 1);
    dy <= row + 1 && dy < sample.height;
    dy++
  ) {
    const base = (sample.y + dy) * cols;
    let dx = Math.round(position - base - sample.x);
    if (dx < 0 || dx >= sample.width || base + (sample.x + dx) !== position)
      continue;
    if (sample.exactLattice) {
      if (sample.width >= cols) {
        return (
          (sample.y + sample.height - 1) * cols + (sample.x + sample.width)
        );
      }
      return base + (sample.x + sample.width);
    }
    while (dx < sample.width && base + (sample.x + dx) === position) {
      position++;
      dx++;
    }
  }
  return position;
}

/**
 * Compact items in wrap order, filling gaps from left-to-right, top-to-bottom.
 * All items are assumed to be 1x1 for wrap mode to work correctly.
 */
function compactWrap(layout: Layout, cols: number): LayoutItem[] {
  if (layout.length === 0) return [];

  const sorted = sortByWrapOrder(layout);
  const statics = sorted.filter(item => item.static);

  const rectangles: OccupiedRectangle[] = [];
  const sampledStatics: SampledStatic[] = [];
  for (const s of statics) {
    addStatic(rectangles, sampledStatics, s, cols);
  }
  const bands = occupiedBands(rectangles);
  return placeWrapItems(layout, sorted, cols, bands, sampledStatics);
}

function placeWrapItems(
  layout: Layout,
  sorted: LayoutItem[],
  cols: number,
  bands: OccupiedBand[],
  sampledStatics: SampledStatic[]
): LayoutItem[] {
  const out: LayoutItem[] = new Array(layout.length);
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
    nextPos = skipStatics(nextPos, cols, bands, sampledStatics);

    // For items larger than 1x1, we need to check if the full item fits
    const { x, y } = fromWrapPosition(nextPos, cols);

    // Check if item would overflow the row
    if (x + l.w > cols) {
      // Move to start of next row
      nextPos = (y + 1) * cols;
      // Skip any static positions on the new row
      nextPos = skipStatics(nextPos, cols, bands, sampledStatics);
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
