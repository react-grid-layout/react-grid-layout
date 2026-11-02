import type {
  Breakpoint,
  Breakpoints,
  Layout,
  LayoutItem,
  ResponsiveLayouts
} from "./types.js";
import { devWarn, isDevelopment } from "./dev.js";

/** Absolute bound for rows and vertical dimensions supplied by a layout. */
export const MAX_GRID_ROWS = 10_000;

function bounded(value: number, lower: number, upper: number): number {
  if (value === Infinity) return upper;
  if (typeof value !== "number" || !Number.isFinite(value)) return lower;
  return Math.max(lower, Math.min(value, upper));
}

/**
 * A size: positive and finite. Zero, negative and non-finite sizes use 1 (they
 * break layout math); a positive fraction such as 0.5 is kept, as in 2.x
 * before intake bounds. +Infinity uses the upper bound.
 */
function size(value: number, upper: number): number {
  if (value === Infinity) return upper;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0)
    return 1;
  return Math.min(value, upper);
}

/**
 * A minimum size: any finite value up to the upper bound, so `minW: 0` (no
 * minimum) is kept. Non-finite values use 1; +Infinity uses the upper bound.
 */
function minimum(value: number, upper: number): number {
  if (value === Infinity) return upper;
  if (typeof value !== "number" || !Number.isFinite(value)) return 1;
  return Math.min(value, upper);
}

/**
 * A maximum size: raised to its minimum (or kept as is with no minimum), and
 * always positive, so a resize clamped to it never reaches a zero or negative
 * size even when the minimum is 0 or less. A positive fraction is kept.
 */
function maximum(value: number, min: number | undefined): number {
  const raised = atLeast(value, min ?? 0);
  return raised > 0 ? raised : Math.max(1, min ?? 1);
}

/**
 * Raise a maximum to its minimum. A maximum above the grid is harmless (the
 * item size is bounded separately) and is kept, so `maxW: Infinity` survives
 * and a later, larger `cols` is not capped by the one in effect at intake.
 */
function atLeast(value: number, lower: number): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < lower)
    return lower;
  return value;
}

/**
 * Normalize untrusted layout geometry without mutating the input.
 *
 * Without cols (a breakpoint with no configured columns) only y, h, minH and
 * maxH are bounded; x, w, minW and maxW pass unchanged.
 *
 * With a positive finite column count, w is positive and at most cols, minW is
 * at most cols, x is in [0, cols-w], h is positive and at most rowLimit, and
 * minH is at most rowLimit. Zero or negative w/h use 1; positive fractions
 * below 1 and minimums of 0 or less are kept (a floor of 1 is a 3.0 change).
 * maxW/maxH are only raised to
 * their minimum (or 1); larger values, including Infinity, pass unchanged. rowLimit is
 * MAX_GRID_ROWS (10,000), reduced by a smaller finite maxRows, with a floor
 * of 1. Finite y is in [0, rowLimit]. y: Infinity retains the supported
 * "place at bottom" sentinel for correctBounds/compaction to resolve.
 * Fractions are preserved. NaN/-Infinity (and nonnumeric runtime values) use
 * the lower bound; +Infinity uses the upper bound except for the y sentinel.
 * Optional size constraints stay absent; a present maximum is raised to a
 * present minimum if necessary, so constraints cannot restore oversized items.
 *
 * Unchanged layouts are returned as-is. Changed layouts contain new items and
 * emit one RGL_W002 console.warn per call in development. Duplicate ids are
 * kept as they are and emit one RGL_W007 warning per call in development. These are intake bounds, not
 * a cap on the final bottom: collision resolution can stack items below them.
 */
export function validateLayoutInput(
  layout: Layout,
  { cols, maxRows = Infinity }: { cols: number | undefined; maxRows?: number }
): Layout {
  // Without configured cols (a saved breakpoint key), only the row fields can
  // be bounded; x, w, minW and maxW pass unchanged until GridLayout renders
  // them with real cols.
  const hasCols = cols !== undefined;
  const widthLimit = hasCols && Number.isFinite(cols) ? Math.max(1, cols) : 1;
  const rowLimit = Number.isFinite(maxRows)
    ? Math.max(1, Math.min(MAX_GRID_ROWS, maxRows))
    : MAX_GRID_ROWS;
  let output: LayoutItem[] | undefined;
  // Duplicate ids collide as one item (C-B14). Checked in development only.
  const seen = isDevelopment() ? new Set<string>() : undefined;
  let duplicate: string | undefined;
  for (let index = 0; index < layout.length; index++) {
    const item = layout[index];
    if (item === undefined) continue;
    if (seen) {
      if (duplicate === undefined && seen.has(item.i)) duplicate = item.i;
      seen.add(item.i);
    }
    const w = hasCols ? size(item.w, widthLimit) : item.w;
    const h = size(item.h, rowLimit);
    const x = hasCols ? bounded(item.x, 0, widthLimit - w) : item.x;
    const y = item.y === Infinity ? Infinity : bounded(item.y, 0, rowLimit);
    const minW =
      item.minW === undefined || !hasCols
        ? item.minW
        : minimum(item.minW, widthLimit);
    const maxW =
      item.maxW === undefined || !hasCols
        ? item.maxW
        : maximum(item.maxW, minW);
    const minH =
      item.minH === undefined ? undefined : minimum(item.minH, rowLimit);
    const maxH = item.maxH === undefined ? undefined : maximum(item.maxH, minH);
    if (
      x === item.x &&
      y === item.y &&
      w === item.w &&
      h === item.h &&
      minW === item.minW &&
      maxW === item.maxW &&
      minH === item.minH &&
      maxH === item.maxH
    )
      continue;
    if (!output) {
      output = new Array(layout.length);
      for (let copy = 0; copy < layout.length; copy++)
        output[copy] = layout[copy]!;
    }
    const normalized: LayoutItem = { ...item, x, y, w, h };
    if (minW !== undefined) normalized.minW = minW;
    if (maxW !== undefined) normalized.maxW = maxW;
    if (minH !== undefined) normalized.minH = minH;
    if (maxH !== undefined) normalized.maxH = maxH;
    output[index] = normalized;
  }
  if (output) {
    devWarn(
      null,
      "RGL_W002",
      "ReactGridLayout: layout input was clamped to grid bounds."
    );
  }
  if (duplicate !== undefined) {
    devWarn(
      null,
      "RGL_W007",
      `ReactGridLayout: layout contains more than one item with i ${JSON.stringify(duplicate)}. ` +
        "Items that share an id collide as one item; give each a unique i."
    );
  }
  return output ?? layout;
}

/** Validate stored breakpoint layouts before any responsive generation/compaction. */
export function validateResponsiveLayoutsInput<B extends Breakpoint>(
  layouts: ResponsiveLayouts<B>,
  cols: Breakpoints<B>,
  maxRows = Infinity
): ResponsiveLayouts<B> {
  let output: ResponsiveLayouts<B> | undefined;
  for (const bp in layouts) {
    const layout = layouts[bp];
    // Saved keys can outlive their column configuration. Their rows are
    // bounded now; their columns are bounded when the breakpoint renders.
    if (!layout) continue;
    const validated = validateLayoutInput(layout, { cols: cols[bp], maxRows });
    if (validated !== layout) {
      output ??= { ...layouts };
      output[bp] = validated;
    }
  }
  return output ?? layouts;
}
