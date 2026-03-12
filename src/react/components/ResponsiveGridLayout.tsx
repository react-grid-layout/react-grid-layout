/**
 * ResponsiveGridLayout component
 *
 * A responsive grid layout that automatically adjusts to container width.
 */

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  type ReactElement
} from "react";
import { deepEqual } from "fast-equals";

import type {
  Layout,
  LayoutItem,
  Breakpoint,
  Breakpoints,
  ResponsiveLayouts,
  Compactor
} from "../../core/types.js";
import { cloneLayout, correctBounds } from "../../core/layout.js";
import {
  getBreakpointFromWidth,
  getColsFromBreakpoint,
  findOrGenerateResponsiveLayout,
  getIndentationValue
} from "../../core/responsive.js";
import { getCompactor } from "../../core/compactors.js";
import { bottom } from "../../core/layout.js";

import { GridLayout, type GridLayoutProps } from "./GridLayout.js";

// ============================================================================
// Types
// ============================================================================

export interface ResponsiveGridLayoutProps<
  B extends Breakpoint = string
> extends Omit<GridLayoutProps, "gridConfig" | "layout" | "onLayoutChange"> {
  /** Current breakpoint (optional, auto-detected from width) */
  breakpoint?: B;
  /** Breakpoint definitions (name → min-width) */
  breakpoints?: Breakpoints<B>;
  /** Column counts per breakpoint */
  cols?: Breakpoints<B>;
  /** Layouts for each breakpoint */
  layouts?: ResponsiveLayouts<B>;
  /** Row height (default: 150) */
  rowHeight?: number;
  /** Maximum rows (default: Infinity) */
  maxRows?: number;
  /** Margin between items - can be fixed or per-breakpoint */
  margin?:
    | readonly [number, number]
    | Partial<Record<B, readonly [number, number]>>;
  /** Container padding - can be fixed or per-breakpoint */
  containerPadding?:
    | readonly [number, number]
    | Partial<Record<B, readonly [number, number] | null>>
    | null;
  /** Compactor for layout compaction */
  compactor?: Compactor;
  /** Called when breakpoint changes */
  onBreakpointChange?: (newBreakpoint: B, cols: number) => void;
  /** Called when layout changes */
  onLayoutChange?: (layout: Layout, layouts: ResponsiveLayouts<B>) => void;
  /** Called when width changes */
  onWidthChange?: (
    containerWidth: number,
    margin: readonly [number, number],
    cols: number,
    containerPadding: readonly [number, number] | null
  ) => void;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_BREAKPOINTS: Breakpoints<string> = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0
};

const DEFAULT_COLS: Breakpoints<string> = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2
};

const noop = () => {};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Synchronize layout with children - use compactor.compact() (#2213)
 */
function synchronizeLayoutWithChildren(
  initialLayout: Layout,
  children: React.ReactNode,
  cols: number,
  compactor: Compactor
): Layout {
  const layout: LayoutItem[] = [];

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child) || child.key === null) return;
    const key = String(child.key);

    // Find existing layout item
    const existingItem = initialLayout.find(l => l.i === key);

    if (existingItem) {
      layout.push({
        ...existingItem,
        i: key
      });
    } else {
      // Create new layout item from child data-grid prop
      const childProps = child.props as { "data-grid"?: Partial<LayoutItem> };
      const dataGrid = childProps["data-grid"];

      if (dataGrid) {
        layout.push({
          i: key,
          x: dataGrid.x ?? 0,
          y: dataGrid.y ?? 0,
          w: dataGrid.w ?? 1,
          h: dataGrid.h ?? 1,
          minW: dataGrid.minW,
          maxW: dataGrid.maxW,
          minH: dataGrid.minH,
          maxH: dataGrid.maxH,
          static: dataGrid.static,
          isDraggable: dataGrid.isDraggable,
          isResizable: dataGrid.isResizable,
          resizeHandles: dataGrid.resizeHandles,
          isBounded: dataGrid.isBounded
        });
      } else {
        // Create default layout item
        layout.push({
          i: key,
          x: 0,
          y: bottom(layout),
          w: 1,
          h: 1
        });
      }
    }
  });

  // Correct bounds and compact - use compactor.compact() (#2213)
  const corrected = correctBounds(layout, { cols });
  return compactor.compact(corrected, cols);
}

// ============================================================================
// Component
// ============================================================================

/**
 * ResponsiveGridLayout - A responsive grid layout that adjusts to container width.
 */
export function ResponsiveGridLayout<B extends Breakpoint = string>(
  props: ResponsiveGridLayoutProps<B>
): ReactElement {
  const {
    children,
    width,
    breakpoint: propBreakpoint,
    breakpoints = DEFAULT_BREAKPOINTS as Breakpoints<B>,
    cols: colsConfig = DEFAULT_COLS as Breakpoints<B>,
    layouts: propsLayouts = {} as ResponsiveLayouts<B>,
    rowHeight = 150,
    maxRows = Infinity,
    margin: propMargin = [10, 10] as readonly [number, number],
    containerPadding: propContainerPadding = null,
    compactor: compactorProp,
    onBreakpointChange = noop,
    onLayoutChange = noop,
    onWidthChange = noop,
    ...restProps
  } = props;

  // Get compactor (use provided or default to vertical)
  const compactor = compactorProp ?? getCompactor("vertical");
  const compactType = compactor.type;
  const allowOverlap = compactor.allowOverlap;

  // Calculate initial state
  const initialBreakpoint = useMemo(() => {
    return propBreakpoint ?? getBreakpointFromWidth(breakpoints, width);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initialCols = useMemo(() => {
    return getColsFromBreakpoint(initialBreakpoint, colsConfig);
  }, [initialBreakpoint, colsConfig]);

  // Use compactType for initial layout as compactor reference isn't stable here
  // findOrGenerateResponsiveLayout accepts both CompactType and Compactor (#2213)
  const initialLayout = useMemo(() => {
    return findOrGenerateResponsiveLayout(
      propsLayouts,
      breakpoints,
      initialBreakpoint,
      initialBreakpoint,
      initialCols,
      compactType
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // State
  const [breakpoint, setBreakpoint] = useState<B>(initialBreakpoint);
  const [cols, setCols] = useState<number>(initialCols);
  const [layout, setLayout] = useState<Layout>(initialLayout);
  const [layouts, setLayouts] = useState<ResponsiveLayouts<B>>(propsLayouts);

  // Refs for tracking changes
  const prevWidthRef = useRef(width);
  const prevBreakpointRef = useRef(propBreakpoint);
  const prevBreakpointsRef = useRef(breakpoints);
  const prevColsRef = useRef(colsConfig);
  const prevLayoutsRef = useRef(propsLayouts);
  const prevCompactTypeRef = useRef(compactType);

  // Ref to always have current layouts value (avoids stale closure in callbacks)
  const layoutsRef = useRef(layouts);

  // Keep layoutsRef in sync with layouts state
  useEffect(() => {
    layoutsRef.current = layouts;
  }, [layouts]);

  // Derive layout synchronously from props during render (not in useEffect which runs after render)
  // This prevents the timing issue where GridLayout sees children before the layout is updated
  // Use compactor directly (#2213)
  const derivedLayout: Layout | null = useMemo(() => {
    if (!deepEqual(propsLayouts, prevLayoutsRef.current)) {
      // Props changed, derive new layout synchronously
      return findOrGenerateResponsiveLayout(
        propsLayouts,
        breakpoints,
        breakpoint,
        breakpoint,
        cols,
        compactor
      );
    }
    return null; // No change needed
  }, [propsLayouts, breakpoints, breakpoint, cols, compactor]);

  // The effective layout to pass to GridLayout - use derived if available, else state
  const effectiveLayout = derivedLayout ?? layout;

  // Update state and refs in effect (for consistency on future renders)
  useEffect(() => {
    if (derivedLayout !== null) {
      setLayout(derivedLayout);
      setLayouts(propsLayouts);
      layoutsRef.current = propsLayouts;
      prevLayoutsRef.current = propsLayouts;
    }
  }, [derivedLayout, propsLayouts]);

  // Handle compactType changes - use compactor.compact() (#2213)
  useEffect(() => {
    if (compactType !== prevCompactTypeRef.current) {
      // Re-compact the current layout with the new compactType
      // Use effectiveLayout to avoid stale data when layouts are being synced
      const newLayout = compactor.compact(cloneLayout(effectiveLayout), cols);
      const newLayouts = {
        ...layoutsRef.current,
        [breakpoint]: newLayout
      } as ResponsiveLayouts<B>;

      setLayout(newLayout);
      setLayouts(newLayouts);
      layoutsRef.current = newLayouts;
      onLayoutChange(newLayout, newLayouts);
      prevCompactTypeRef.current = compactType;
    }
  }, [
    compactType,
    compactor,
    effectiveLayout,
    cols,
    allowOverlap,
    breakpoint,
    onLayoutChange
  ]);

  // Handle width changes
  useEffect(() => {
    const widthChanged = width !== prevWidthRef.current;
    const breakpointPropChanged = propBreakpoint !== prevBreakpointRef.current;
    const breakpointsChanged = !deepEqual(
      breakpoints,
      prevBreakpointsRef.current
    );
    const colsChanged = !deepEqual(colsConfig, prevColsRef.current);

    if (
      widthChanged ||
      breakpointPropChanged ||
      breakpointsChanged ||
      colsChanged
    ) {
      const newBreakpoint =
        propBreakpoint ?? getBreakpointFromWidth(breakpoints, width);
      const newCols = getColsFromBreakpoint(newBreakpoint, colsConfig);
      const lastBreakpoint = breakpoint;

      // Breakpoint change
      if (
        lastBreakpoint !== newBreakpoint ||
        breakpointsChanged ||
        colsChanged
      ) {
        const newLayouts = { ...layoutsRef.current } as ResponsiveLayouts<B>;

        // Preserve current layout if not in new layouts
        if (!newLayouts[lastBreakpoint]) {
          (newLayouts as Record<B, Layout>)[lastBreakpoint] =
            cloneLayout(layout);
        }

        // Find or generate new layout - use compactor (#2213)
        let newLayout = findOrGenerateResponsiveLayout(
          newLayouts,
          breakpoints,
          newBreakpoint,
          lastBreakpoint,
          newCols,
          compactor
        );

        // Sync with children - use compactor (#2213)
        newLayout = synchronizeLayoutWithChildren(
          newLayout,
          children,
          newCols,
          compactor
        );

        // Store new layout
        (newLayouts as Record<B, Layout>)[newBreakpoint] = newLayout;

        // Update state
        setBreakpoint(newBreakpoint);
        setCols(newCols);
        setLayout(newLayout);
        setLayouts(newLayouts);
        layoutsRef.current = newLayouts;

        // Callbacks
        onBreakpointChange(newBreakpoint, newCols);
        onLayoutChange(newLayout, newLayouts);
      }

      // Get margin and padding for callback
      const currentMargin = getIndentationValue(
        propMargin as Parameters<typeof getIndentationValue>[0],
        newBreakpoint
      );
      const currentPadding = propContainerPadding
        ? getIndentationValue(
            propContainerPadding as Parameters<typeof getIndentationValue>[0],
            newBreakpoint
          )
        : null;

      // Width change callback
      onWidthChange(width, currentMargin, newCols, currentPadding);

      // Update refs
      prevWidthRef.current = width;
      prevBreakpointRef.current = propBreakpoint;
      prevBreakpointsRef.current = breakpoints;
      prevColsRef.current = colsConfig;
    }
  }, [
    width,
    propBreakpoint,
    breakpoints,
    colsConfig,
    breakpoint,
    cols,
    layout,
    children,
    compactor,
    compactType,
    allowOverlap,
    propMargin,
    propContainerPadding,
    onBreakpointChange,
    onLayoutChange,
    onWidthChange
  ]);

  // Handle layout change from GridLayout
  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      // Use layoutsRef.current to avoid stale closure issues
      const currentLayouts = layoutsRef.current;
      const newLayouts = {
        ...currentLayouts,
        [breakpoint]: newLayout
      } as ResponsiveLayouts<B>;

      setLayout(newLayout);
      setLayouts(newLayouts);
      layoutsRef.current = newLayouts;
      onLayoutChange(newLayout, newLayouts);
    },
    [breakpoint, onLayoutChange]
  );

  // Get margin and padding for current breakpoint
  const currentMargin = useMemo(() => {
    return getIndentationValue(
      propMargin as Parameters<typeof getIndentationValue>[0],
      breakpoint
    );
  }, [propMargin, breakpoint]);

  const currentContainerPadding = useMemo(() => {
    if (propContainerPadding === null) return null;
    return getIndentationValue(
      propContainerPadding as Parameters<typeof getIndentationValue>[0],
      breakpoint
    );
  }, [propContainerPadding, breakpoint]);

  // Build grid config for current breakpoint
  const gridConfig = useMemo(
    () => ({
      cols,
      rowHeight,
      maxRows,
      margin: currentMargin,
      containerPadding: currentContainerPadding
    }),
    [cols, rowHeight, maxRows, currentMargin, currentContainerPadding]
  );

  return (
    <GridLayout
      {...restProps}
      width={width}
      gridConfig={gridConfig}
      compactor={compactor}
      onLayoutChange={handleLayoutChange}
      layout={effectiveLayout}
    >
      {children}
    </GridLayout>
  );
}

export default ResponsiveGridLayout;
