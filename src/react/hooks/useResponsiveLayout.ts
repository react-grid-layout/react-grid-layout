/**
 * useResponsiveLayout hook
 *
 * Manages responsive breakpoints and layout generation for different screen sizes.
 * Extracts state management from ResponsiveReactGridLayout into a reusable hook.
 */

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { deepEqual } from "fast-equals";
import type {
  Layout,
  Breakpoint,
  Breakpoints,
  ResponsiveLayouts,
  Compactor
} from "../../core/types.js";
import { validateLayoutInput } from "../../core/validation.js";
import { cloneLayout } from "../../core/layout.js";
import {
  getBreakpointFromWidth,
  getColsFromBreakpoint,
  findOrGenerateResponsiveLayout,
  sortBreakpoints
} from "../../core/responsive.js";
import { verticalCompactor } from "../../core/compactors.js";

// ============================================================================
// Types
// ============================================================================

/** Default breakpoint names */
export type DefaultBreakpoints = "lg" | "md" | "sm" | "xs" | "xxs";

/** Default breakpoint widths */
export const DEFAULT_BREAKPOINTS: Breakpoints<DefaultBreakpoints> = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0
};

/** Default column counts per breakpoint */
export const DEFAULT_COLS: Breakpoints<DefaultBreakpoints> = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2
};

export interface UseResponsiveLayoutOptions<
  B extends Breakpoint = DefaultBreakpoints
> {
  /** Current container width */
  width: number;
  /** Maximum input rows (also capped at MAX_GRID_ROWS). */
  maxRows?: number;
  /** Breakpoint definitions (name → min-width) */
  breakpoints?: Breakpoints<B>;
  /** Column counts per breakpoint */
  cols?: Breakpoints<B>;
  /** Layouts for each breakpoint */
  layouts?: ResponsiveLayouts<B>;
  /** Compactor for layout compaction (default: verticalCompactor) */
  compactor?: Compactor;
  /** Called when breakpoint changes */
  onBreakpointChange?: (newBreakpoint: B, cols: number) => void;
  /** Called when layout changes */
  onLayoutChange?: (layout: Layout, layouts: ResponsiveLayouts<B>) => void;
  /** Called when width changes */
  onWidthChange?: (
    width: number,
    margin: readonly [number, number],
    cols: number,
    containerPadding: readonly [number, number] | null
  ) => void;
}

export interface UseResponsiveLayoutResult<
  B extends Breakpoint = DefaultBreakpoints
> {
  /** Current layout for the active breakpoint */
  layout: Layout;
  /** All layouts by breakpoint */
  layouts: ResponsiveLayouts<B>;
  /** Current active breakpoint */
  breakpoint: B;
  /** Column count for the current breakpoint */
  cols: number;
  /** Update layouts for a specific breakpoint */
  setLayoutForBreakpoint: (breakpoint: B, layout: Layout) => void;
  /** Update all layouts */
  setLayouts: (layouts: ResponsiveLayouts<B>) => void;
  /** Sorted array of breakpoint names (smallest to largest) */
  sortedBreakpoints: B[];
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing responsive grid layouts.
 *
 * Automatically selects the appropriate layout based on container width
 * and generates layouts for new breakpoints from existing ones.
 *
 * @example
 * ```tsx
 * function MyResponsiveGrid() {
 *   const { width, containerRef } = useContainerWidth();
 *   const { layout, breakpoint, cols } = useResponsiveLayout({
 *     width,
 *     layouts: {
 *       lg: [...],
 *       md: [...],
 *       sm: [...]
 *     }
 *   });
 *
 *   return (
 *     <div ref={containerRef}>
 *       <GridLayout
 *         width={width}
 *         cols={cols}
 *         layout={layout}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
/**
 * Stored layouts, split by trust. `inputs` are the consumer's layouts as
 * written (copied at the call); `generated` are this hook's compaction output.
 * A breakpoint is in at most one of the two.
 */
interface StoredLayouts<B extends Breakpoint> {
  inputs: ResponsiveLayouts<B>;
  generated: ResponsiveLayouts<B>;
}

/** Copy the consumer's layouts so a later mutation of theirs is not stored. */
function copyInputs<B extends Breakpoint>(
  input: ResponsiveLayouts<B>
): ResponsiveLayouts<B> {
  const inputs = {} as ResponsiveLayouts<B>;
  for (const bp of Object.keys(input) as B[]) {
    const layout = input[bp];
    if (layout)
      (inputs as Record<B, Layout>)[bp] = layout.map(item => ({ ...item }));
  }
  return inputs;
}

/**
 * The layouts a render exposes. Inputs are validated with this render's
 * config, every render, so no setter, effect or retained callback can store
 * bounds from another commit. Rows are always bounded; columns only where the
 * breakpoint has cols (see validateLayoutInput). Generated layouts are trusted.
 */
function resolveLayouts<B extends Breakpoint>(
  stored: StoredLayouts<B>,
  colsConfig: Breakpoints<B>,
  maxRows: number | undefined
): ResponsiveLayouts<B> {
  const layouts = { ...stored.generated };
  for (const bp of Object.keys(stored.inputs) as B[]) {
    const layout = stored.inputs[bp];
    if (!layout) continue;
    const cols = colsConfig[bp];
    const validated = validateLayoutInput(layout, { cols, maxRows });
    // A saved key without cols keeps the consumer's item shape.
    (layouts as Record<B, Layout>)[bp] =
      cols === undefined ? validated : cloneLayout(validated);
  }
  return layouts;
}

export function useResponsiveLayout<B extends Breakpoint = DefaultBreakpoints>(
  options: UseResponsiveLayoutOptions<B>
): UseResponsiveLayoutResult<B> {
  const {
    width,
    maxRows = Infinity,
    breakpoints = DEFAULT_BREAKPOINTS as unknown as Breakpoints<B>,
    cols: colsConfig = DEFAULT_COLS as unknown as Breakpoints<B>,
    layouts: unvalidatedLayouts = {} as ResponsiveLayouts<B>,
    compactor = verticalCompactor,
    onBreakpointChange,
    onLayoutChange,
    onWidthChange
  } = options;

  // Sorted breakpoints for consistent ordering
  const sortedBreakpoints = useMemo(
    () => sortBreakpoints(breakpoints),
    [breakpoints]
  );

  // Calculate initial breakpoint and cols
  const initialBreakpoint = useMemo(
    () => getBreakpointFromWidth(breakpoints, width),
    // Only calculate on mount, not on width changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const initialCols = useMemo(
    () => getColsFromBreakpoint(initialBreakpoint, colsConfig),
    // The original breakpoint may become stale after configuration changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // State
  const [breakpoint, setBreakpoint] = useState<B>(initialBreakpoint);
  const [cols, setCols] = useState<number>(initialCols);
  const [stored, setStored] = useState<StoredLayouts<B>>(() => ({
    inputs: copyInputs(unvalidatedLayouts),
    generated: {} as ResponsiveLayouts<B>
  }));

  // Keying cols on its content keeps `layouts` stable when cols is an inline
  // object with equal values.
  const colsKey = JSON.stringify(colsConfig);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableCols = useMemo(() => colsConfig, [colsKey]);
  const layouts = useMemo(
    () => resolveLayouts(stored, stableCols, maxRows),
    [stored, stableCols, maxRows]
  );

  // Track previous values for change detection
  const prevWidthRef = useRef(width);
  const prevBreakpointRef = useRef(breakpoint);
  // Separate refs for props vs state to prevent infinite loops (#2202)
  // When using inline objects for layouts prop, we need to compare props to props
  // and state to state, not mix them up.
  const prevPropsLayoutsRef = useRef(unvalidatedLayouts);
  const prevLayoutsRef = useRef(layouts);

  // Current layout for the active breakpoint - use compactor (#2213)
  const layout = useMemo(() => {
    return findOrGenerateResponsiveLayout(
      layouts,
      breakpoints,
      breakpoint,
      prevBreakpointRef.current,
      cols,
      compactor,
      colsConfig
    );
  }, [layouts, breakpoints, breakpoint, cols, compactor, colsConfig]);

  // Set layout for a specific breakpoint
  // Setters store input only; validation happens when a render reads it, so
  // they need no config and stay stable.
  const setLayoutForBreakpoint = useCallback((bp: B, newLayout: Layout) => {
    const input = newLayout.map(item => ({ ...item }));
    setStored(prev => {
      const generated = { ...prev.generated };
      delete generated[bp];
      return { inputs: { ...prev.inputs, [bp]: input }, generated };
    });
  }, []);

  // Set all layouts
  const setLayouts = useCallback((newLayouts: ResponsiveLayouts<B>) => {
    const inputs = copyInputs(newLayouts);
    setStored({ inputs, generated: {} as ResponsiveLayouts<B> });
  }, []);

  // Handle width changes
  useEffect(() => {
    if (prevWidthRef.current === width) return;
    prevWidthRef.current = width;

    // Determine new breakpoint
    const newBreakpoint = getBreakpointFromWidth(breakpoints, width);
    const newCols = getColsFromBreakpoint(newBreakpoint, colsConfig);

    // Notify width change
    onWidthChange?.(width, [10, 10], newCols, null);

    // Check if breakpoint changed
    if (newBreakpoint !== breakpoint) {
      // Generate layout for new breakpoint
      // Use compactor (#2213)
      const newLayout = findOrGenerateResponsiveLayout(
        layouts,
        breakpoints,
        newBreakpoint,
        breakpoint,
        newCols,
        compactor,
        colsConfig
      );

      // Store only a layout that was generated; an existing one is unchanged.
      if (!layouts[newBreakpoint])
        setStored(prev => ({
          inputs: prev.inputs,
          generated: { ...prev.generated, [newBreakpoint]: newLayout }
        }));
      setBreakpoint(newBreakpoint);
      setCols(newCols);

      // Notify breakpoint change
      onBreakpointChange?.(newBreakpoint, newCols);

      prevBreakpointRef.current = newBreakpoint;
    }
  }, [
    width,
    breakpoints,
    colsConfig,
    maxRows,
    breakpoint,
    layouts,
    compactor,
    onBreakpointChange,
    onWidthChange
  ]);

  // Sync with prop layouts when they change. Compare the raw prop: its
  // validated form also changes with cols, which is not a prop change.
  useEffect(() => {
    if (!deepEqual(unvalidatedLayouts, prevPropsLayoutsRef.current)) {
      setLayouts(unvalidatedLayouts);
      prevPropsLayoutsRef.current = unvalidatedLayouts;
    }
  }, [unvalidatedLayouts, setLayouts]);

  // Notify layout changes
  useEffect(() => {
    if (!deepEqual(layouts, prevLayoutsRef.current)) {
      prevLayoutsRef.current = layouts;
      onLayoutChange?.(layout, layouts);
    }
  }, [layout, layouts, onLayoutChange]);

  return {
    layout,
    layouts,
    breakpoint,
    cols,
    setLayoutForBreakpoint,
    setLayouts,
    sortedBreakpoints
  };
}

export default useResponsiveLayout;
