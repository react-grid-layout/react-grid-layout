/**
 * Legacy ReactGridLayout wrapper
 *
 * This component wraps the new TypeScript GridLayout to provide
 * backwards compatibility with the v1 API by converting flat props
 * to the new composable interface format.
 */

import React from "react";
import {
  GridLayout,
  type GridLayoutProps
} from "../react/components/GridLayout.js";
import type {
  Layout,
  LayoutItem,
  CompactType,
  ResizeHandleAxis,
  GridConfig,
  DragConfig,
  ResizeConfig,
  DropConfig,
  PositionStrategy,
  LayoutConstraint
} from "../core/types.js";
import { getCompactor } from "../core/compactors.js";
import {
  transformStrategy,
  absoluteStrategy,
  createScaledStrategy
} from "../core/position.js";
import { defaultConstraints, containerBounds } from "../core/constraints.js";

// ============================================================================
// Legacy Props Interface
// ============================================================================

/**
 * Legacy props interface for backwards compatibility with v1 API.
 * These flat props are converted to composable interfaces internally.
 */
export interface LegacyReactGridLayoutProps {
  // Required
  children: React.ReactNode;
  width: number;

  // Grid measurement (→ gridConfig)
  cols?: number;
  rowHeight?: number;
  maxRows?: number;
  margin?: readonly [number, number];
  containerPadding?: readonly [number, number] | null;

  // Layout data
  layout?: Layout;
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
  onLayoutChange?: (layout: Layout) => void;
  onDragStart?: GridLayoutProps["onDragStart"];
  onDrag?: GridLayoutProps["onDrag"];
  onDragStop?: GridLayoutProps["onDragStop"];
  onResizeStart?: GridLayoutProps["onResizeStart"];
  onResize?: GridLayoutProps["onResize"];
  onResizeStop?: GridLayoutProps["onResizeStop"];
  onDrop?: (layout: Layout, item: LayoutItem | undefined, e: Event) => void;
  onDropDragOver?: (
    e: React.DragEvent
  ) => { w?: number; h?: number } | false | void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ReactGridLayout - Legacy wrapper component
 *
 * Converts v1 flat props to v2 composable interfaces for backwards compatibility.
 */
function ReactGridLayout(props: LegacyReactGridLayoutProps) {
  const {
    // Required
    children,
    width,

    // Grid measurement
    cols = 12,
    rowHeight = 150,
    maxRows = Infinity,
    margin = [10, 10],
    containerPadding = null,

    // Layout data
    layout,
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
    onLayoutChange,
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
        "`verticalCompact` on <ReactGridLayout> is deprecated and will be removed soon. " +
          'Use `compactType`: "horizontal" | "vertical" | null.'
      );
    }
    compactType = null;
  }

  // Convert flat props to composable interfaces

  const gridConfig: Partial<GridConfig> = {
    cols,
    rowHeight,
    maxRows,
    margin,
    containerPadding
  };

  const dragConfig: Partial<DragConfig> = {
    enabled: isDraggable,
    bounded: isBounded,
    handle: draggableHandle,
    cancel: draggableCancel,
    // Set threshold to 0 for backwards compatibility with v1 API
    // v2 API defaults to 3px threshold (fixes #1341, #1401)
    threshold: 0
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

  // Build constraints array based on legacy props
  // When isBounded is true, add containerBounds constraint
  const constraints: LayoutConstraint[] = isBounded
    ? [...defaultConstraints, containerBounds]
    : defaultConstraints;

  return (
    <GridLayout
      width={width}
      gridConfig={gridConfig}
      dragConfig={dragConfig}
      resizeConfig={resizeConfig}
      dropConfig={dropConfig}
      positionStrategy={positionStrategy}
      compactor={compactor}
      constraints={constraints}
      layout={layout}
      droppingItem={droppingItem}
      autoSize={autoSize}
      className={className}
      style={style}
      innerRef={innerRef}
      onLayoutChange={onLayoutChange}
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
    </GridLayout>
  );
}

// Static properties for backwards compatibility
ReactGridLayout.displayName = "ReactGridLayout";

export default ReactGridLayout;
export { ReactGridLayout };
