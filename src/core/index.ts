/**
 * react-grid-layout/core
 *
 * Pure TypeScript layout algorithms and types.
 * No React dependencies - can be used with any framework.
 */

// Re-export all types
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

// Layout algorithm functions will be added here:
// export { compact, moveElement, correctBounds } from './layout.js';
// export { sortLayoutItems, sortLayoutItemsByRowCol } from './sort.js';
// export { collides, getFirstCollision, getAllCollisions } from './collision.js';
// export { calcPosition, calcGridPosition, calcWH } from './position.js';
