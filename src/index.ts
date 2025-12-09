/**
 * react-grid-layout v2
 *
 * A draggable and resizable grid layout with responsive breakpoints.
 *
 * Entry points:
 * - `react-grid-layout` - React components (this file)
 * - `react-grid-layout/core` - Pure layout algorithms (no React)
 * - `react-grid-layout/legacy` - v1 API compatibility wrapper
 */

// =============================================================================
// React Components
// =============================================================================

export {
  GridItem,
  GridLayout,
  ResponsiveGridLayout,
  type GridItemProps,
  type GridItemCallback,
  type ResizeHandle,
  type GridLayoutProps,
  type ResponsiveGridLayoutProps
} from "./react/components/index.js";

// =============================================================================
// React Hooks
// =============================================================================

export {
  useContainerWidth,
  useGridLayout,
  useResponsiveLayout,
  type UseContainerWidthOptions,
  type UseContainerWidthResult,
  type UseGridLayoutOptions,
  type UseGridLayoutResult,
  type DragState,
  type ResizeState,
  type DropState,
  type UseResponsiveLayoutOptions,
  type UseResponsiveLayoutResult,
  type DefaultBreakpoints,
  DEFAULT_BREAKPOINTS,
  DEFAULT_COLS
} from "./react/hooks/index.js";

// =============================================================================
// Core Types
// =============================================================================

export type {
  Layout,
  LayoutItem,
  CompactType,
  Position,
  DroppingPosition,
  Breakpoint,
  Breakpoints,
  ResponsiveLayouts,
  Compactor,
  ResizeHandleAxis,
  GridDragEvent,
  GridResizeEvent,
  EventCallback
} from "./core/types.js";

// =============================================================================
// Core Utilities
// =============================================================================

export {
  // Layout utilities
  cloneLayout,
  cloneLayoutItem,
  getLayoutItem,
  bottom,
  validateLayout,
  moveElement,

  // Collision detection
  collides,
  getFirstCollision,
  getAllCollisions,

  // Sorting
  sortLayoutItems,
  sortLayoutItemsByRowCol,
  sortLayoutItemsByColRow,

  // Compactors
  getCompactor,
  verticalCompactor,
  horizontalCompactor,
  noCompactor,

  // Position utilities
  calcGridItemPosition,
  calcXY,
  calcWH,
  setTransform,
  setTopLeft,

  // Responsive utilities
  getBreakpointFromWidth,
  getColsFromBreakpoint,
  findOrGenerateResponsiveLayout
} from "./core/index.js";
