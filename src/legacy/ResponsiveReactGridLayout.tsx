/**
 * Legacy ResponsiveReactGridLayout wrapper
 *
 * This component wraps the new TypeScript ResponsiveGridLayout to provide
 * backwards compatibility with the v1 API by converting flat props
 * to the new composable interface format.
 */

import React from "react";
import {
  ResponsiveGridLayout,
  type ResponsiveGridLayoutProps
} from "../react/components/ResponsiveGridLayout.js";
import type {
  Layout,
  LayoutItem,
  CompactType,
  Breakpoint,
  Breakpoints,
  ResponsiveLayouts,
  ResizeHandleAxis,
  DragConfig,
  ResizeConfig,
  DropConfig,
  PositionStrategy
} from "../core/types.js";
import { getCompactor } from "../core/compactors.js";
import {
  transformStrategy,
  absoluteStrategy,
  createScaledStrategy
} from "../core/position.js";

// ============================================================================
// Legacy Props Interface
// ============================================================================

/**
 * Legacy props interface for backwards compatibility with v1 API.
 * These flat props are converted to composable interfaces internally.
 */
export interface LegacyResponsiveReactGridLayoutProps<
  B extends Breakpoint = string
> {
  // Required
  children: React.ReactNode;
  width: number;

  // Responsive-specific
  breakpoint?: B;
  breakpoints?: Breakpoints<B>;
  cols?: Breakpoints<B>;
  layouts?: ResponsiveLayouts<B>;
  onBreakpointChange?: (newBreakpoint: B, cols: number) => void;
  onLayoutChange?: (layout: Layout, layouts: ResponsiveLayouts<B>) => void;
  onWidthChange?: (
    containerWidth: number,
    margin: readonly [number, number],
    cols: number,
    containerPadding: readonly [number, number] | null
  ) => void;

  // Grid measurement
  rowHeight?: number;
  maxRows?: number;
  margin?:
    | readonly [number, number]
    | Partial<Record<B, readonly [number, number]>>;
  containerPadding?:
    | readonly [number, number]
    | Partial<Record<B, readonly [number, number] | null>>
    | null;

  // Layout data
  droppingItem?: LayoutItem;

  // Compaction (→ compactor)
  compactType?: CompactType;
  preventCollision?: boolean;
  allowOverlap?: boolean;
  /** @deprecated Use compactType instead */
  verticalCompact?: boolean;

  // Drag behavior (→ dragConfig)
  isDraggable?: boolean;
  isBounded?: boolean;
  draggableHandle?: string;
  draggableCancel?: string;

  // Resize behavior (→ resizeConfig)
  isResizable?: boolean;
  resizeHandles?: ResizeHandleAxis[];
  resizeHandle?:
    | React.ReactElement
    | ((
        axis: ResizeHandleAxis,
        ref: React.Ref<HTMLElement>
      ) => React.ReactElement);

  // Drop behavior (→ dropConfig)
  isDroppable?: boolean;

  // Position (→ positionStrategy)
  useCSSTransforms?: boolean;
  transformScale?: number;

  // Container props (passed through)
  autoSize?: boolean;
  className?: string;
  style?: React.CSSProperties;
  innerRef?: React.Ref<HTMLDivElement>;

  // Callbacks (passed through)
  onDragStart?: ResponsiveGridLayoutProps<B>["onDragStart"];
  onDrag?: ResponsiveGridLayoutProps<B>["onDrag"];
  onDragStop?: ResponsiveGridLayoutProps<B>["onDragStop"];
  onResizeStart?: ResponsiveGridLayoutProps<B>["onResizeStart"];
  onResize?: ResponsiveGridLayoutProps<B>["onResize"];
  onResizeStop?: ResponsiveGridLayoutProps<B>["onResizeStop"];
  onDrop?: (layout: Layout, item: LayoutItem | undefined, e: Event) => void;
  onDropDragOver?: (
    e: React.DragEvent
  ) => { w?: number; h?: number } | false | void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ResponsiveReactGridLayout - Legacy wrapper component
 *
 * Converts v1 flat props to v2 composable interfaces for backwards compatibility.
 */
function ResponsiveReactGridLayout<B extends Breakpoint = string>(
  props: LegacyResponsiveReactGridLayoutProps<B>
) {
  const {
    // Required
    children,
    width,

    // Responsive-specific
    breakpoint,
    breakpoints,
    cols,
    layouts,
    onBreakpointChange,
    onLayoutChange,
    onWidthChange,

    // Grid measurement
    rowHeight,
    maxRows,
    margin,
    containerPadding,

    // Layout data
    droppingItem,

    // Compaction
    compactType: compactTypeProp,
    preventCollision = false,
    allowOverlap = false,
    verticalCompact,

    // Drag behavior
    isDraggable = true,
    isBounded = false,
    draggableHandle,
    draggableCancel,

    // Resize behavior
    isResizable = true,
    resizeHandles = ["se"],
    resizeHandle,

    // Drop behavior
    isDroppable = false,

    // Position
    useCSSTransforms = true,
    transformScale = 1,

    // Container props
    autoSize,
    className,
    style,
    innerRef,

    // Callbacks
    onDragStart,
    onDrag,
    onDragStop,
    onResizeStart,
    onResize,
    onResizeStop,
    onDrop,
    onDropDragOver
  } = props;

  // Handle deprecated verticalCompact prop
  let compactType: CompactType =
    compactTypeProp === undefined ? "vertical" : compactTypeProp;
  if (verticalCompact === false) {
    if (process.env["NODE_ENV"] !== "production") {
      console.warn(
        "`verticalCompact` on <ResponsiveReactGridLayout> is deprecated and will be removed soon. " +
          'Use `compactType`: "horizontal" | "vertical" | null.'
      );
    }
    compactType = null;
  }

  // Convert flat props to composable interfaces

  const dragConfig: Partial<DragConfig> = {
    enabled: isDraggable,
    bounded: isBounded,
    handle: draggableHandle,
    cancel: draggableCancel
  };

  const resizeConfig: Partial<ResizeConfig> = {
    enabled: isResizable,
    handles: resizeHandles,
    handleComponent: resizeHandle
  };

  const dropConfig: Partial<DropConfig> = {
    enabled: isDroppable
  };

  // Build position strategy
  let positionStrategy: PositionStrategy;
  if (!useCSSTransforms) {
    positionStrategy = absoluteStrategy;
  } else if (transformScale !== 1) {
    positionStrategy = createScaledStrategy(transformScale);
  } else {
    positionStrategy = transformStrategy;
  }

  // Get compactor from type and options
  const compactor = getCompactor(compactType, allowOverlap, preventCollision);

  return (
    <ResponsiveGridLayout<B>
      width={width}
      breakpoint={breakpoint}
      breakpoints={breakpoints}
      cols={cols}
      layouts={layouts}
      rowHeight={rowHeight}
      maxRows={maxRows}
      margin={margin}
      containerPadding={containerPadding}
      compactor={compactor}
      dragConfig={dragConfig}
      resizeConfig={resizeConfig}
      dropConfig={dropConfig}
      positionStrategy={positionStrategy}
      droppingItem={droppingItem}
      autoSize={autoSize}
      className={className}
      style={style}
      innerRef={innerRef}
      onBreakpointChange={onBreakpointChange}
      onLayoutChange={onLayoutChange}
      onWidthChange={onWidthChange}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragStop={onDragStop}
      onResizeStart={onResizeStart}
      onResize={onResize}
      onResizeStop={onResizeStop}
      onDrop={onDrop}
      onDropDragOver={onDropDragOver}
    >
      {children}
    </ResponsiveGridLayout>
  );
}

// Static properties for backwards compatibility
ResponsiveReactGridLayout.displayName = "ResponsiveReactGridLayout";

export default ResponsiveReactGridLayout;
export { ResponsiveReactGridLayout, ResponsiveReactGridLayout as Responsive };
