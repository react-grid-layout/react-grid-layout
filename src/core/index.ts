/**
 * react-grid-layout/core
 *
 * Pure TypeScript layout algorithms and types.
 * No React dependencies - can be used with any framework.
 */

// =============================================================================
// Types
// =============================================================================

export type {
  // Resize handles
  ResizeHandleAxis,

  // Layout
  LayoutItem,
  Layout,

  // Position & Size
  Position,
  PartialPosition,
  Size,
  DroppingPosition,

  // Events
  ReactDraggableCallbackData,
  GridDragEvent,
  GridResizeEvent,
  DragOverEvent,

  // Compaction
  CompactType,

  // Callbacks
  EventCallback,
  OnLayoutChangeCallback,

  // Composable interfaces
  Compactor,
  PositionStrategy,

  // Configuration
  GridConfig,
  DragConfig,
  ResizeConfig,
  DropConfig,

  // Responsive
  Breakpoint,
  Breakpoints,
  BreakpointCols,
  ResponsiveLayouts,
  OnBreakpointChangeCallback,

  // Utility types
  Mutable,
  DeepPartial,
  ArrayElement
} from "./types.js";

// =============================================================================
// Collision Detection
// =============================================================================

export { collides, getFirstCollision, getAllCollisions } from "./collision.js";

// =============================================================================
// Sorting
// =============================================================================

export {
  sortLayoutItems,
  sortLayoutItemsByRowCol,
  sortLayoutItemsByColRow
} from "./sort.js";

// =============================================================================
// Layout Utilities
// =============================================================================

export {
  // Queries
  bottom,
  getLayoutItem,
  getStatics,

  // Cloning
  cloneLayoutItem,
  cloneLayout,

  // Modification
  modifyLayout,
  withLayoutItem,

  // Bounds
  correctBounds,

  // Movement
  moveElement,
  moveElementAwayFromCollision,

  // Validation
  validateLayout
} from "./layout.js";

// =============================================================================
// Compaction
// =============================================================================

// Compactor implementations
export {
  verticalCompactor,
  horizontalCompactor,
  noCompactor,
  verticalOverlapCompactor,
  horizontalOverlapCompactor,
  getCompactor,
  // Helpers for custom compactors
  resolveCompactionCollision,
  compactItemVertical,
  compactItemHorizontal
} from "./compactors.js";

// Legacy/convenience functions (backwards compatibility)
export { compact, compactItem, applyCompactor } from "./compact-compat.js";

// =============================================================================
// Position Calculations
// =============================================================================

export {
  setTransform,
  setTopLeft,
  perc,
  resizeItemInDirection
} from "./position.js";

// =============================================================================
// Grid Calculations
// =============================================================================

export type { PositionParams } from "./calculate.js";

export {
  calcGridColWidth,
  calcGridItemWHPx,
  calcGridItemPosition,
  calcXY,
  calcWH,
  clamp
} from "./calculate.js";

// =============================================================================
// Responsive Utilities
// =============================================================================

export {
  sortBreakpoints,
  getBreakpointFromWidth,
  getColsFromBreakpoint,
  findOrGenerateResponsiveLayout,
  getIndentationValue
} from "./responsive.js";
