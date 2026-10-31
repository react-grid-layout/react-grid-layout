import type {
  Breakpoint,
  Breakpoints,
  Layout,
  LayoutItem,
  ResponsiveLayouts
} from "./types.js";

/** Absolute bound for rows and vertical dimensions supplied by a layout. */
export const MAX_GRID_ROWS = 10_000;

function bounded(value: number, lower: number, upper: number): number {
  if (value === Infinity) return upper;
  if (typeof value !== "number" || !Number.isFinite(value)) return lower;
  return Math.max(lower, Math.min(value, upper));
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
 * With a positive finite column count, w/minW are in [1, cols], x is in
 * [0, cols-w], and h/minH are in [1, rowLimit]. maxW/maxH are only raised to
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
 * emit one console.warn per call in development. These are intake bounds, not
 * a cap on the final bottom: collision resolution can stack items below them.
 */
export function validateLayoutInput(
  layout: Layout,
  { cols, maxRows = Infinity }: { cols: number; maxRows?: number }
): Layout {
  const widthLimit = Number.isFinite(cols) ? Math.max(1, cols) : 1;
  const rowLimit = Number.isFinite(maxRows)
    ? Math.max(1, Math.min(MAX_GRID_ROWS, maxRows))
    : MAX_GRID_ROWS;
  let output: LayoutItem[] | undefined;
  for (let index = 0; index < layout.length; index++) {
    const item = layout[index];
    if (item === undefined) continue;
    const w = bounded(item.w, 1, widthLimit);
    const h = bounded(item.h, 1, rowLimit);
    const x = bounded(item.x, 0, widthLimit - w);
    const y = item.y === Infinity ? Infinity : bounded(item.y, 0, rowLimit);
    const minW =
      item.minW === undefined ? undefined : bounded(item.minW, 1, widthLimit);
    const maxW =
      item.maxW === undefined ? undefined : atLeast(item.maxW, minW ?? 1);
    const minH =
      item.minH === undefined ? undefined : bounded(item.minH, 1, rowLimit);
    const maxH =
      item.maxH === undefined ? undefined : atLeast(item.maxH, minH ?? 1);
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
  if (
    output &&
    typeof process !== "undefined" &&
    process.env["NODE_ENV"] !== "production"
  ) {
    console.warn("ReactGridLayout: layout input was clamped to grid bounds.");
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
    if (!layout) continue;
    const validated = validateLayoutInput(layout, { cols: cols[bp], maxRows });
    if (validated !== layout) {
      output ??= { ...layouts };
      output[bp] = validated;
    }
  }
  return output ?? layouts;
}
