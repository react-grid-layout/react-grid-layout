/**
 * useResponsiveLayout hook
 *
 * Manages responsive breakpoints and layout generation for different screen sizes.
 * Extracts state management from ResponsiveReactGridLayout into a reusable hook.
 */

import {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef
} from "react";
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
 * Validate and clone a layout for one breakpoint. Rows are always bounded;
 * columns only where the breakpoint has configured cols (see
 * validateLayoutInput). Stateless: nothing waits for cols to appear later.
 */
function intakeLayout(
  layout: Layout,
  cols: number | undefined,
  maxRows: number | undefined
): Layout {
  const validated = validateLayoutInput(layout, { cols, maxRows });
  // A saved key without cols keeps the consumer's item shape; copy it so a
  // later mutation of the caller's array is not stored.
  if (cols === undefined) return validated.map(item => ({ ...item }));
  return cloneLayout(validated);
}

/** intakeLayout for every breakpoint in `input`. */
function intakeLayouts<B extends Breakpoint>(
  input: ResponsiveLayouts<B>,
  colsConfig: Breakpoints<B>,
  maxRows: number | undefined
): ResponsiveLayouts<B> {
  const layouts = {} as ResponsiveLayouts<B>;
  for (const bp of Object.keys(input) as B[]) {
    const layout = input[bp];
    if (layout)
      (layouts as Record<B, Layout>)[bp] = intakeLayout(
        layout,
        colsConfig[bp],
        maxRows
      );
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
  const [layouts, setLayoutsState] = useState<ResponsiveLayouts<B>>(() =>
    intakeLayouts(unvalidatedLayouts, colsConfig, maxRows)
  );

  // Setters read config through refs so they stay stable when cols is an
  // inline object. The refs update in a layout effect, so they only ever hold
  // committed config, never that of a render React discarded or suspended.
  const colsConfigRef = useRef(colsConfig);
  const maxRowsRef = useRef(maxRows);
  useLayoutEffect(() => {
    colsConfigRef.current = colsConfig;
    maxRowsRef.current = maxRows;
  }, [colsConfig, maxRows]);

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
  const setLayoutForBreakpoint = useCallback((bp: B, newLayout: Layout) => {
    // Intake now, so later mutation of the caller's array is not stored.
    const stored = intakeLayout(
      newLayout,
      colsConfigRef.current[bp],
      maxRowsRef.current
    );
    setLayoutsState(prev => ({ ...prev, [bp]: stored }));
  }, []);

  // Set all layouts
  const setLayouts = useCallback((newLayouts: ResponsiveLayouts<B>) => {
    setLayoutsState(
      intakeLayouts(newLayouts, colsConfigRef.current, maxRowsRef.current)
    );
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

      setLayoutsState(prev => ({ ...prev, [newBreakpoint]: newLayout }));
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
