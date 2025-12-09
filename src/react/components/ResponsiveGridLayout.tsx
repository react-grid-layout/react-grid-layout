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
  CompactType
} from "../../core/types.js";
import { cloneLayout, correctBounds } from "../../core/layout.js";
import {
  getBreakpointFromWidth,
  getColsFromBreakpoint,
  findOrGenerateResponsiveLayout,
  getIndentationValue
} from "../../core/responsive.js";
import { compact } from "../../core/compact-compat.js";
import { bottom } from "../../core/layout.js";

import { GridLayout, type GridLayoutProps } from "./GridLayout.js";

// ============================================================================
// Types
// ============================================================================

export interface ResponsiveGridLayoutProps<
  B extends Breakpoint = string
> extends Omit<
  GridLayoutProps,
  "cols" | "layout" | "margin" | "containerPadding" | "onLayoutChange"
> {
  /** Current breakpoint (optional, auto-detected from width) */
  breakpoint?: B;
  /** Breakpoint definitions (name → min-width) */
  breakpoints?: Breakpoints<B>;
  /** Column counts per breakpoint */
  cols?: Breakpoints<B>;
  /** Layouts for each breakpoint */
  layouts?: ResponsiveLayouts<B>;
  /** Margin between items - can be fixed or per-breakpoint */
  margin?:
    | readonly [number, number]
    | Partial<Record<B, readonly [number, number]>>;
  /** Container padding - can be fixed or per-breakpoint */
  containerPadding?:
    | readonly [number, number]
    | Partial<Record<B, readonly [number, number] | null>>
    | null;
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
 * Synchronize layout with children
 */
function synchronizeLayoutWithChildren(
  initialLayout: Layout,
  children: React.ReactNode,
  cols: number,
  compactType: CompactType,
  allowOverlap: boolean
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

  // Correct bounds and compact
  const corrected = correctBounds(layout, { cols });
  return compact(corrected, compactType, cols, allowOverlap);
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
    margin: propMargin = [10, 10] as readonly [number, number],
    containerPadding: propContainerPadding = null,
    compactType = "vertical",
    allowOverlap = false,
    onBreakpointChange = noop,
    onLayoutChange = noop,
    onWidthChange = noop,
    ...restProps
  } = props;

  // Calculate initial state
  const initialBreakpoint = useMemo(() => {
    return propBreakpoint ?? getBreakpointFromWidth(breakpoints, width);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initialCols = useMemo(() => {
    return getColsFromBreakpoint(initialBreakpoint, colsConfig);
  }, [initialBreakpoint, colsConfig]);

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

  // Sync layouts from props
  useEffect(() => {
    if (!deepEqual(propsLayouts, prevLayoutsRef.current)) {
      const newLayout = findOrGenerateResponsiveLayout(
        propsLayouts,
        breakpoints,
        breakpoint,
        breakpoint,
        cols,
        compactType
      );
      setLayout(newLayout);
      setLayouts(propsLayouts);
      prevLayoutsRef.current = propsLayouts;
    }
  }, [propsLayouts, breakpoints, breakpoint, cols, compactType]);

  // Handle compactType changes
  useEffect(() => {
    if (compactType !== prevCompactTypeRef.current) {
      // Re-compact the current layout with the new compactType
      const newLayout = compact(
        cloneLayout(layout),
        compactType,
        cols,
        allowOverlap
      );
      const newLayouts = {
        ...layouts,
        [breakpoint]: newLayout
      } as ResponsiveLayouts<B>;

      setLayout(newLayout);
      setLayouts(newLayouts);
      onLayoutChange(newLayout, newLayouts);
      prevCompactTypeRef.current = compactType;
    }
  }, [
    compactType,
    layout,
    cols,
    allowOverlap,
    layouts,
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
        const newLayouts = { ...layouts } as ResponsiveLayouts<B>;

        // Preserve current layout if not in new layouts
        if (!newLayouts[lastBreakpoint]) {
          (newLayouts as Record<B, Layout>)[lastBreakpoint] =
            cloneLayout(layout);
        }

        // Find or generate new layout
        let newLayout = findOrGenerateResponsiveLayout(
          newLayouts,
          breakpoints,
          newBreakpoint,
          lastBreakpoint,
          newCols,
          compactType
        );

        // Sync with children
        newLayout = synchronizeLayoutWithChildren(
          newLayout,
          children,
          newCols,
          compactType,
          allowOverlap
        );

        // Store new layout
        (newLayouts as Record<B, Layout>)[newBreakpoint] = newLayout;

        // Update state
        setBreakpoint(newBreakpoint);
        setCols(newCols);
        setLayout(newLayout);
        setLayouts(newLayouts);

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
    layouts,
    children,
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
      const newLayouts = {
        ...layouts,
        [breakpoint]: newLayout
      } as ResponsiveLayouts<B>;

      setLayout(newLayout);
      setLayouts(newLayouts);
      onLayoutChange(newLayout, newLayouts);
    },
    [layouts, breakpoint, onLayoutChange]
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

  return (
    <GridLayout
      {...restProps}
      width={width}
      margin={currentMargin}
      containerPadding={currentContainerPadding}
      onLayoutChange={handleLayoutChange}
      layout={layout}
      cols={cols}
      compactType={compactType}
      allowOverlap={allowOverlap}
    >
      {children}
    </GridLayout>
  );
}

export default ResponsiveGridLayout;
