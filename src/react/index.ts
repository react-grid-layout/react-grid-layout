/**
 * react-grid-layout/react
 *
 * React bindings for the grid layout system.
 * Provides hooks and components for building grid layouts.
 */

// =============================================================================
// Components
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
} from "./components/index.js";

// =============================================================================
// Hooks
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
} from "./hooks/index.js";

// =============================================================================
// Re-exported Core Types
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
} from "../core/types.js";

// =============================================================================
// Re-exported Core Utilities
// =============================================================================

export {
  // Layout utilities
  cloneLayout,
  cloneLayoutItem,
  getLayoutItem,
  bottom,

  // Compactors
  getCompactor,
  verticalCompactor,
  horizontalCompactor,
  noCompactor,

  // Position utilities
  calcGridItemPosition,
  calcGridColWidth,
  calcGridItemWHPx,
  calcXY,
  calcWH,
  setTransform,
  setTopLeft
} from "../core/index.js";
