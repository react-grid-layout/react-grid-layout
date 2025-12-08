/**
 * Core types for react-grid-layout v2
 *
 * These types are framework-agnostic and define the data structures
 * used by the layout algorithms.
 */

// ============================================================================
// Resize Handle Types
// ============================================================================

/**
 * Axis identifiers for resize handles.
 * - Cardinal: 'n', 's', 'e', 'w' (north, south, east, west)
 * - Diagonal: 'ne', 'nw', 'se', 'sw'
 */
export type ResizeHandleAxis =
  | "s"
  | "w"
  | "e"
  | "n"
  | "sw"
  | "nw"
  | "se"
  | "ne";

// ============================================================================
// Layout Item Types
// ============================================================================

/**
 * A single item in the grid layout.
 *
 * Position (x, y) is in grid units, not pixels.
 * Size (w, h) is in grid units.
 */
export interface LayoutItem {
  /** Unique identifier for this item */
  i: string;

  /** X position in grid units (0-indexed from left) */
  x: number;

  /** Y position in grid units (0-indexed from top) */
  y: number;

  /** Width in grid units */
  w: number;

  /** Height in grid units */
  h: number;

  /** Minimum width in grid units */
  minW?: number;

  /** Minimum height in grid units */
  minH?: number;

  /** Maximum width in grid units */
  maxW?: number;

  /** Maximum height in grid units */
  maxH?: number;

  /**
   * If true, item cannot be dragged or resized, and other items
   * will move around it during compaction.
   */
  static?: boolean;

  /**
   * If false, item cannot be dragged (but may still be resizable).
   * Overrides grid-level isDraggable for this item.
   */
  isDraggable?: boolean;

  /**
   * If false, item cannot be resized (but may still be draggable).
   * Overrides grid-level isResizable for this item.
   */
  isResizable?: boolean;

  /**
   * Which resize handles to show for this item.
   * Overrides grid-level resizeHandles for this item.
   */
  resizeHandles?: ResizeHandleAxis[];

  /**
   * If true, item is constrained to the grid container bounds.
   * Overrides grid-level isBounded for this item.
   */
  isBounded?: boolean;

  /**
   * Internal flag set during drag/resize operations to indicate
   * the item has moved from its original position.
   * @internal
   */
  moved?: boolean;
}

/**
 * A layout is a readonly array of layout items.
 * Layouts should be treated as immutable.
 */
export type Layout = readonly LayoutItem[];

// ============================================================================
// Position & Size Types
// ============================================================================

/**
 * Pixel position and size of an element.
 */
export interface Position {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Partial position (just coordinates, no size).
 */
export interface PartialPosition {
  left: number;
  top: number;
}

/**
 * Size in pixels.
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Position when dropping an external element onto the grid.
 */
export interface DroppingPosition {
  left: number;
  top: number;
  e: Event;
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Data provided by react-draggable during drag operations.
 */
export interface ReactDraggableCallbackData {
  node: HTMLElement;
  x?: number;
  y?: number;
  deltaX: number;
  deltaY: number;
  lastX?: number;
  lastY?: number;
}

/**
 * Grid-level drag event data.
 */
export interface GridDragEvent {
  e: Event;
  node: HTMLElement;
  newPosition: PartialPosition;
}

/**
 * Grid-level resize event data.
 */
export interface GridResizeEvent {
  e: Event;
  node: HTMLElement;
  size: Size;
  handle: ResizeHandleAxis;
}

/**
 * Drag-over event with layer coordinates.
 */
export interface DragOverEvent extends MouseEvent {
  nativeEvent: Event & {
    layerX: number;
    layerY: number;
  };
}

// ============================================================================
// Compaction Types
// ============================================================================

/**
 * Type of compaction to apply to the layout.
 * - 'vertical': Items compact upward (default)
 * - 'horizontal': Items compact leftward
 * - null: No compaction (free-form positioning)
 */
export type CompactType = "horizontal" | "vertical" | null;

// ============================================================================
// Callback Types
// ============================================================================

/**
 * Standard callback signature for layout change events.
 *
 * @param layout - The current layout after the change
 * @param oldItem - The item before the change (null if not applicable)
 * @param newItem - The item after the change (null if not applicable)
 * @param placeholder - The placeholder item during drag/resize (null at start)
 * @param event - The DOM event that triggered the change
 * @param element - The DOM element being manipulated (null if not applicable)
 */
export type EventCallback = (
  layout: Layout,
  oldItem: LayoutItem | null,
  newItem: LayoutItem | null,
  placeholder: LayoutItem | null,
  event: Event,
  element: HTMLElement | null
) => void;

/**
 * Callback when layout changes for any reason.
 */
export type OnLayoutChangeCallback = (layout: Layout) => void;

// ============================================================================
// Composable Interfaces (v2 API)
// ============================================================================

/**
 * Interface for layout compaction strategies.
 *
 * Implement this interface to create custom compaction algorithms.
 *
 * @example
 * ```typescript
 * const myCompactor: Compactor = {
 *   type: 'vertical',
 *   allowOverlap: false,
 *   compact(layout, cols) {
 *     // Custom compaction logic
 *     return compactedLayout;
 *   },
 *   onMove(layout, item, x, y, cols) {
 *     // Handle item movement
 *     return updatedLayout;
 *   }
 * };
 * ```
 */
export interface Compactor {
  /** Compaction type identifier */
  readonly type: CompactType;

  /** Whether overlapping items are allowed */
  readonly allowOverlap: boolean;

  /** Whether to prevent collisions instead of pushing items */
  readonly preventCollision?: boolean;

  /**
   * Compact the layout.
   *
   * @param layout - The layout to compact
   * @param cols - Number of columns in the grid
   * @returns The compacted layout
   */
  compact(layout: Layout, cols: number): Layout;

  /**
   * Handle item movement, returning the updated layout.
   *
   * @param layout - Current layout
   * @param item - The item being moved
   * @param x - New x position
   * @param y - New y position
   * @param cols - Number of columns
   * @returns Updated layout after the move
   */
  onMove(
    layout: Layout,
    item: LayoutItem,
    x: number,
    y: number,
    cols: number
  ): Layout;
}

/**
 * Interface for position calculation strategies.
 *
 * Implement this interface to customize how grid positions
 * are converted to pixel positions (e.g., CSS Grid, Flexbox).
 */
export interface PositionStrategy {
  /**
   * Calculate pixel position from grid position.
   *
   * @param item - The layout item
   * @param colWidth - Width of a single column in pixels
   * @param rowHeight - Height of a single row in pixels
   * @param margin - [horizontal, vertical] margin in pixels
   * @param containerPadding - [horizontal, vertical] padding in pixels
   * @returns Pixel position and size
   */
  calcPosition(
    item: LayoutItem,
    colWidth: number,
    rowHeight: number,
    margin: [number, number],
    containerPadding: [number, number]
  ): Position;

  /**
   * Calculate grid position from pixel position.
   *
   * @param left - Left position in pixels
   * @param top - Top position in pixels
   * @param colWidth - Width of a single column in pixels
   * @param rowHeight - Height of a single row in pixels
   * @param margin - [horizontal, vertical] margin in pixels
   * @param containerPadding - [horizontal, vertical] padding in pixels
   * @param cols - Number of columns
   * @returns Grid x, y position
   */
  calcGridPosition(
    left: number,
    top: number,
    colWidth: number,
    rowHeight: number,
    margin: [number, number],
    containerPadding: [number, number],
    cols: number
  ): { x: number; y: number };

  /**
   * Calculate width and height from grid units.
   *
   * @param w - Width in grid units
   * @param h - Height in grid units
   * @param colWidth - Width of a single column in pixels
   * @param rowHeight - Height of a single row in pixels
   * @param margin - [horizontal, vertical] margin in pixels
   * @returns Width and height in pixels
   */
  calcWH(
    w: number,
    h: number,
    colWidth: number,
    rowHeight: number,
    margin: [number, number]
  ): Size;
}

// ============================================================================
// Grid Configuration Types
// ============================================================================

/**
 * Core grid configuration (framework-agnostic).
 */
export interface GridConfig {
  /** Number of columns in the grid */
  cols: number;

  /** Height of a single row in pixels */
  rowHeight: number;

  /** Width of the container in pixels */
  width: number;

  /** [horizontal, vertical] margin between items in pixels */
  margin: [number, number];

  /** [horizontal, vertical] padding inside the container in pixels */
  containerPadding: [number, number];

  /** Maximum number of rows */
  maxRows: number;
}

/**
 * Drag configuration options.
 */
export interface DragConfig {
  /** Whether items can be dragged */
  isDraggable: boolean;

  /** Whether items are bounded to the container */
  isBounded: boolean;

  /** CSS selector for drag handle (e.g., '.drag-handle') */
  draggableHandle?: string;

  /** CSS selector for elements that should not trigger drag */
  draggableCancel?: string;

  /** Allow dragging with a touch gesture */
  allowTouchDrag?: boolean;

  /**
   * Minimum pixels to move before drag starts.
   * Helps distinguish click from drag.
   * @default 3
   */
  dragThreshold?: number;
}

/**
 * Resize configuration options.
 */
export interface ResizeConfig {
  /** Whether items can be resized */
  isResizable: boolean;

  /** Which resize handles to show */
  resizeHandles: ResizeHandleAxis[];

  /** Custom resize handle component */
  resizeHandle?: React.ReactNode;
}

/**
 * Drop configuration options (for dropping external elements).
 */
export interface DropConfig {
  /** Whether external elements can be dropped on the grid */
  isDroppable: boolean;

  /** Default size for dropped items */
  droppingItem?: Partial<LayoutItem>;
}

// ============================================================================
// Responsive Types
// ============================================================================

/**
 * Breakpoint name (e.g., 'lg', 'md', 'sm', 'xs', 'xxs').
 */
export type Breakpoint = string;

/**
 * Map of breakpoint name to pixel width.
 * Generic type B allows custom breakpoint strings.
 */
export type Breakpoints<B extends Breakpoint = Breakpoint> = Record<B, number>;

/**
 * Map of breakpoint name to number of columns.
 * Generic type B allows custom breakpoint strings.
 */
export type BreakpointCols<B extends Breakpoint = Breakpoint> = Record<
  B,
  number
>;

/**
 * Map of breakpoint name to layout.
 * Generic type B allows custom breakpoint strings.
 */
export type ResponsiveLayouts<B extends Breakpoint = Breakpoint> = Partial<
  Record<B, Layout>
>;

/**
 * Callback when breakpoint changes.
 */
export type OnBreakpointChangeCallback<B extends Breakpoint = Breakpoint> = (
  newBreakpoint: B,
  cols: number
) => void;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Makes all properties in T mutable (removes readonly).
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Deep partial - all properties and nested properties are optional.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract the element type from an array type.
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;
