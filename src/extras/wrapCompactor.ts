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

import { normalizeLayoutGeometry } from "../core/geometry/normalize.js";
import type { Compactor, Layout, LayoutItem, Mutable } from "../core/types.js";
import { advanceRows, cloneLayout, cloneLayoutItem } from "../core/layout.js";

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

/** Add an affine rectangle of sampled cells to its fractional lattice. */
function addRectangle(
  lattices: Map<number, OccupiedRectangle[]>,
  start: number,
  width: number,
  height: number,
  cols: number
): void {
  const fraction = start - Math.floor(start);
  let rectangles = lattices.get(fraction);
  if (!rectangles) lattices.set(fraction, (rectangles = []));
  const integerStart = start - fraction;
  const row = Math.floor(integerStart / cols);
  const left = integerStart - row * cols;
  if (width < cols) {
    rectangles.push({
      start: row,
      end: row + height,
      left,
      right: Math.min(cols, left + width)
    });
    if (left + width > cols)
      rectangles.push({
        start: row + 1,
        end: row + height + 1,
        left: 0,
        right: left + width - cols
      });
    return;
  }
  const end = integerStart + (height - 1) * cols + width;
  const lastRow = Math.floor(end / cols);
  rectangles.push({ start: row, end: row + 1, left, right: cols });
  if (lastRow > row + 1)
    rectangles.push({ start: row + 1, end: lastRow, left: 0, right: cols });
  if (end > lastRow * cols)
    rectangles.push({
      start: lastRow,
      end: lastRow + 1,
      left: 0,
      right: end - lastRow * cols
    });
}

function exponent(value: number): number {
  return value === 0 ? -Infinity : Math.floor(Math.log2(Math.abs(value)));
}

/**
 * Within fixed IEEE-754 binades, adding integer row/cell offsets translates
 * the same fractional sample. Split only where intermediate precision changes,
 * preserving (y + dy) * cols + (x + dx), including decimal rounding.
 */
function addSampleRectangle(
  lattices: Map<number, OccupiedRectangle[]>,
  item: LayoutItem,
  cols: number,
  dx: number,
  dy: number,
  width: number,
  height: number
): void {
  const left = item.x + dx;
  const right = item.x + (dx + width - 1);
  const top = item.y + dy;
  const bottom = item.y + (dy + height - 1);
  const base = top * cols;
  const lastBase = bottom * cols;
  const start = base + left;
  const end = lastBase + right;
  const uniform =
    hasExactSampleLattice(item, cols) ||
    (exponent(left) === exponent(right) &&
      exponent(top) === exponent(bottom) &&
      exponent(base) === exponent(lastBase) &&
      exponent(start) === exponent(end) &&
      exponent(end) < 52 &&
      end === start + (height - 1) * cols + (width - 1));
  if (uniform || (width === 1 && height === 1)) {
    addRectangle(lattices, start, width, height, cols);
    return;
  }
  if (height > 1 && (height * cols >= width || width === 1)) {
    const first = Math.floor(height / 2);
    addSampleRectangle(lattices, item, cols, dx, dy, width, first);
    addSampleRectangle(
      lattices,
      item,
      cols,
      dx,
      dy + first,
      width,
      height - first
    );
  } else {
    const first = Math.floor(width / 2);
    addSampleRectangle(lattices, item, cols, dx, dy, first, height);
    addSampleRectangle(
      lattices,
      item,
      cols,
      dx + first,
      dy,
      width - first,
      height
    );
  }
}

function occupiedBands(rectangles: OccupiedRectangle[]): OccupiedBand[] {
  // Precision splits can create neighboring rectangles with identical columns.
  // Coalesce them before crossing row boundaries, including across statics.
  rectangles.sort(
    (a, b) => a.left - b.left || a.right - b.right || a.start - b.start
  );
  const merged: OccupiedRectangle[] = [];
  for (const rectangle of rectangles) {
    const previous = merged[merged.length - 1];
    if (
      previous &&
      previous.left === rectangle.left &&
      previous.right === rectangle.right &&
      previous.end >= rectangle.start
    ) {
      previous.end = Math.max(previous.end, rectangle.end);
    } else merged.push({ ...rectangle });
  }
  rectangles = merged;
  const boundaries = [
    ...new Set(
      rectangles.flatMap(rectangle => [rectangle.start, rectangle.end])
    )
  ].sort((a, b) => a - b);
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
  lattices: Map<number, OccupiedBand[]>
): number {
  let previous: number;
  do {
    previous = position;
    const fraction = position - Math.floor(position);
    const bands = lattices.get(fraction);
    if (!bands) return position;
    const row = Math.floor((position - fraction) / cols);
    const column = position - fraction - row * cols;
    for (let i = 0; i < bands.length; i++) {
      const band = bands[i]!;
      if (row < band.start) break;
      if (row >= band.end) continue;
      for (let j = 0; j < band.columns.length; j++) {
        const interval = band.columns[j]!;
        if (column < interval.start || column >= interval.end) continue;
        const steps =
          interval.start === 0 && interval.end === cols
            ? (band.end - row) * cols - column
            : interval.end - column;
        position = advanceRows(position, steps);
        break;
      }
      break;
    }
  } while (position !== previous);
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

  const rectangles = new Map<number, OccupiedRectangle[]>();
  for (const item of statics) {
    const width = Math.ceil(item.w);
    const height = Math.ceil(item.h);
    if (width > 0 && height > 0)
      addSampleRectangle(rectangles, item, cols, 0, 0, width, height);
  }
  const lattices = new Map<number, OccupiedBand[]>();
  for (const [fraction, cells] of rectangles)
    lattices.set(fraction, occupiedBands(cells));
  return placeWrapItems(layout, sorted, cols, lattices);
}

function placeWrapItems(
  layout: Layout,
  sorted: LayoutItem[],
  cols: number,
  lattices: Map<number, OccupiedBand[]>
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
    nextPos = skipStatics(nextPos, cols, lattices);

    // For items larger than 1x1, we need to check if the full item fits
    const { x, y } = fromWrapPosition(nextPos, cols);

    // Check if item would overflow the row
    if (x + l.w > cols) {
      // Move to start of next row
      nextPos = (y + 1) * cols;
      // Skip any static positions on the new row
      nextPos = skipStatics(nextPos, cols, lattices);
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
    return compactWrap(normalizeLayoutGeometry(layout), cols);
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
    return cloneLayout(normalizeLayoutGeometry(layout));
  }
};
