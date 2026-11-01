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
  useMemo,
  useReducer,
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
 * Validate and clone a layout for a breakpoint. Without configured cols the
 * layout cannot be bounded yet, so it is kept raw and the caller records the
 * breakpoint as pending validation.
 */
function intakeLayout(
  layout: Layout,
  cols: number | undefined,
  maxRows: number | undefined
): Layout {
  if (cols === undefined) return layout;
  return cloneLayout(validateLayoutInput(layout, { cols, maxRows }));
}

/** Validate the pending raw layouts whose breakpoint now has cols. */
function validatePending<B extends Breakpoint>(
  layouts: ResponsiveLayouts<B>,
  pending: ReadonlySet<B>,
  colsConfig: Breakpoints<B>,
  maxRows: number | undefined
): ResponsiveLayouts<B> {
  let output: ResponsiveLayouts<B> | undefined;
  for (const bp of pending) {
    const layout = layouts[bp];
    if (!layout || colsConfig[bp] === undefined) continue;
    output ??= { ...layouts };
    (output as Record<B, Layout>)[bp] = intakeLayout(
      layout,
      colsConfig[bp],
      maxRows
    );
  }
  return output ?? layouts;
}

/** Stored layouts plus the breakpoints whose layout skipped validation. */
interface StoredLayouts<B extends Breakpoint> {
  layouts: ResponsiveLayouts<B>;
  pending: ReadonlySet<B>;
}

type StoredLayoutsAction<B extends Breakpoint> =
  | { type: "set"; bp: B; layout: Layout; cols: number | undefined }
  | {
      type: "replace";
      layouts: ResponsiveLayouts<B>;
      colsConfig: Breakpoints<B>;
    }
  | { type: "generated"; bp: B; layout: Layout }
  | { type: "resolve"; colsConfig: Breakpoints<B> };

/** Intake every layout; the ones without configured cols become pending. */
function intakeAll<B extends Breakpoint>(
  input: ResponsiveLayouts<B>,
  colsConfig: Breakpoints<B>,
  maxRows: number | undefined
): StoredLayouts<B> {
  const layouts = {} as ResponsiveLayouts<B>;
  const pending = new Set<B>();
  for (const bp of Object.keys(input) as B[]) {
    const layout = input[bp];
    if (!layout) continue;
    (layouts as Record<B, Layout>)[bp] = intakeLayout(
      layout,
      colsConfig[bp],
      maxRows
    );
    if (colsConfig[bp] === undefined) pending.add(bp);
  }
  return { layouts, pending };
}

function withPending<B extends Breakpoint>(
  pending: ReadonlySet<B>,
  bp: B,
  isPending: boolean
): ReadonlySet<B> {
  if (pending.has(bp) === isPending) return pending;
  const next = new Set(pending);
  if (isPending) next.add(bp);
  else next.delete(bp);
  return next;
}

/**
 * Every write goes through this reducer, so each one applies to the latest
 * state. Effects never commit a snapshot over an update made in the same
 * commit.
 */
function storedLayoutsReducer<B extends Breakpoint>(
  maxRows: number | undefined
) {
  return (
    state: StoredLayouts<B>,
    action: StoredLayoutsAction<B>
  ): StoredLayouts<B> => {
    switch (action.type) {
      case "set": {
        return {
          layouts: {
            ...state.layouts,
            [action.bp]: intakeLayout(action.layout, action.cols, maxRows)
          },
          pending: withPending(
            state.pending,
            action.bp,
            action.cols === undefined
          )
        };
      }
      case "replace": {
        return intakeAll(action.layouts, action.colsConfig, maxRows);
      }
      case "generated": {
        return {
          layouts: { ...state.layouts, [action.bp]: action.layout },
          pending: withPending(state.pending, action.bp, false)
        };
      }
      case "resolve": {
        const layouts = validatePending(
          state.layouts,
          state.pending,
          action.colsConfig,
          maxRows
        );
        if (layouts === state.layouts) return state;
        const pending = new Set(state.pending);
        for (const bp of state.pending)
          if (action.colsConfig[bp] !== undefined) pending.delete(bp);
        return { layouts, pending };
      }
    }
  };
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
  const reducer = useMemo(() => storedLayoutsReducer<B>(maxRows), [maxRows]);
  const [stored, dispatch] = useReducer(reducer, undefined, () =>
    intakeAll(unvalidatedLayouts, colsConfig, maxRows)
  );

  // Validate pending layouts as soon as their breakpoint gains cols, in this
  // render. The effect commits that through the reducer, so removing the
  // cols again cannot bring the raw layout back.
  const layouts = useMemo(
    () => validatePending(stored.layouts, stored.pending, colsConfig, maxRows),
    [stored, colsConfig, maxRows]
  );
  useEffect(() => {
    if (layouts !== stored.layouts) dispatch({ type: "resolve", colsConfig });
  }, [layouts, stored.layouts, colsConfig]);

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
  const setLayoutForBreakpoint = useCallback(
    (bp: B, newLayout: Layout) => {
      dispatch({ type: "set", bp, layout: newLayout, cols: colsConfig[bp] });
    },
    [colsConfig]
  );

  // Set all layouts
  const setLayouts = useCallback(
    (newLayouts: ResponsiveLayouts<B>) => {
      dispatch({ type: "replace", layouts: newLayouts, colsConfig });
    },
    [colsConfig]
  );

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

      dispatch({ type: "generated", bp: newBreakpoint, layout: newLayout });
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
