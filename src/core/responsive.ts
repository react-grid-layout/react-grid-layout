/**
 * Responsive layout utilities.
 *
 * Functions for handling responsive breakpoints and layout generation.
 */

import type {
  Breakpoint,
  Breakpoints,
  Compactor,
  CompactType,
  Layout,
  ResponsiveLayouts
} from "./types.js";
import { cloneLayout, correctBounds } from "./layout.js";
import { getCompactor } from "./compactors.js";

// ============================================================================
// Breakpoint Utilities
// ============================================================================

/**
 * Sort breakpoints by width (ascending).
 *
 * Returns an array of breakpoint names sorted from smallest to largest.
 * E.g., ['xxs', 'xs', 'sm', 'md', 'lg']
 *
 * @param breakpoints - Map of breakpoint names to widths
 * @returns Sorted array of breakpoint names
 */
export function sortBreakpoints<B extends Breakpoint>(
  breakpoints: Breakpoints<B>
): B[] {
  const keys = Object.keys(breakpoints) as B[];
  return keys.sort((a, b) => breakpoints[a] - breakpoints[b]);
}

/**
 * Get the active breakpoint for a given width.
 *
 * Returns the highest breakpoint that is valid for the width (width > breakpoint).
 *
 * @param breakpoints - Map of breakpoint names to widths
 * @param width - Container width in pixels
 * @returns Active breakpoint name
 */
export function getBreakpointFromWidth<B extends Breakpoint>(
  breakpoints: Breakpoints<B>,
  width: number
): B {
  const sorted = sortBreakpoints(breakpoints);
  let matching = sorted[0];

  if (matching === undefined) {
    throw new Error("No breakpoints defined");
  }

  for (let i = 1; i < sorted.length; i++) {
    const breakpointName = sorted[i];
    if (breakpointName === undefined) continue;

    const breakpointWidth = breakpoints[breakpointName];
    if (width > breakpointWidth) {
      matching = breakpointName;
    }
  }

  return matching;
}

/**
 * Get the column count for a breakpoint.
 *
 * @param breakpoint - Breakpoint name
 * @param cols - Map of breakpoint names to column counts
 * @returns Number of columns for the breakpoint
 * @throws Error if breakpoint is not defined in cols
 */
export function getColsFromBreakpoint<B extends Breakpoint>(
  breakpoint: B,
  cols: Breakpoints<B>
): number {
  const colCount = cols[breakpoint];
  if (colCount === undefined) {
    throw new Error(
      `ResponsiveReactGridLayout: \`cols\` entry for breakpoint ${String(breakpoint)} is missing!`
    );
  }
  return colCount;
}

// ============================================================================
// Layout Generation
// ============================================================================

/**
 * Find or generate a layout for a breakpoint.
 *
 * If a layout exists for the breakpoint, returns a clone.
 * Otherwise, generates a new layout from the nearest larger breakpoint.
 *
 * @param layouts - Existing layouts by breakpoint
 * @param breakpoints - Breakpoint definitions
 * @param breakpoint - Target breakpoint
 * @param lastBreakpoint - Previous breakpoint (for fallback)
 * @param cols - Column count for the target breakpoint
 * @param compactTypeOrCompactor - Compaction type string (legacy) or Compactor object
 * @returns Layout for the breakpoint
 */
export function findOrGenerateResponsiveLayout<B extends Breakpoint>(
  layouts: ResponsiveLayouts<B>,
  breakpoints: Breakpoints<B>,
  breakpoint: B,
  lastBreakpoint: B,
  cols: number,
  compactTypeOrCompactor: CompactType | Compactor
): Layout {
  // If it already exists, just return it
  const existingLayout = layouts[breakpoint];
  if (existingLayout) {
    return cloneLayout(existingLayout);
  }

  // Find or generate the next layout
  let layout = layouts[lastBreakpoint];

  // Look for layouts at larger breakpoints
  const breakpointsSorted = sortBreakpoints(breakpoints);
  const breakpointsAbove = breakpointsSorted.slice(
    breakpointsSorted.indexOf(breakpoint)
  );

  for (let i = 0; i < breakpointsAbove.length; i++) {
    const b = breakpointsAbove[i];
    if (b === undefined) continue;

    const layoutForBreakpoint = layouts[b];
    if (layoutForBreakpoint) {
      layout = layoutForBreakpoint;
      break;
    }
  }

  // Clone layout so we don't modify existing items
  const clonedLayout = cloneLayout(layout || []);

  // Correct bounds and compact - use compactor.compact() (#2213)
  // Handle both legacy compactType string and new Compactor object
  const corrected = correctBounds(clonedLayout, { cols });
  const compactor: Compactor =
    typeof compactTypeOrCompactor === "object" &&
    compactTypeOrCompactor !== null
      ? compactTypeOrCompactor
      : getCompactor(compactTypeOrCompactor);
  return compactor.compact(corrected, cols);
}

// ============================================================================
// Margin/Padding Helpers
// ============================================================================

type IndentationValue<B extends Breakpoint> =
  | readonly [number, number]
  | Partial<Record<B, readonly [number, number]>>;

/**
 * Get margin or padding value for a breakpoint.
 *
 * Supports both fixed values ([x, y]) and breakpoint-specific values
 * ({ lg: [x, y], md: [x, y], ... }).
 *
 * @param value - Fixed value or breakpoint-specific map
 * @param breakpoint - Current breakpoint
 * @returns Margin/padding tuple [x, y]
 */
export function getIndentationValue<B extends Breakpoint>(
  value: IndentationValue<B>,
  breakpoint: B
): readonly [number, number] {
  // If it's a tuple (array), return it directly
  if (Array.isArray(value)) {
    return value as readonly [number, number];
  }

  // It's a breakpoint map - find the value
  const breakpointMap = value as Partial<Record<B, readonly [number, number]>>;
  const breakpointValue = breakpointMap[breakpoint];
  if (breakpointValue !== undefined) {
    return breakpointValue;
  }

  // Fallback to first defined value
  const keys = Object.keys(breakpointMap) as B[];
  for (const key of keys) {
    const v = breakpointMap[key];
    if (v !== undefined) {
      return v;
    }
  }

  // Default fallback
  return [10, 10];
}
