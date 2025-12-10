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
 * - 'wrap': Items arranged in wrapped-paragraph style (like words in text)
 * - null: No compaction (free-form positioning)
 */
export type CompactType = "horizontal" | "vertical" | "wrap" | null;

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

  /**
   * Whether items can overlap (stack on top of each other).
   *
   * When true:
   * - Items can be placed on top of other items
   * - Dragging into another item does NOT push it away
   * - Compaction is skipped after drag/resize
   */
  readonly allowOverlap: boolean;

  /**
   * Whether to block movement that would cause collision.
   *
   * When true (and allowOverlap is false):
   * - Dragging into another item is blocked (item snaps back)
   * - Other items are NOT pushed away
   * - Only affects drag/resize, not compaction
   *
   * Has no effect when allowOverlap is true.
   */
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
 * Interface for CSS positioning strategies.
 *
 * Implement this interface to customize how items are positioned in the DOM.
 * Built-in strategies: transformStrategy, absoluteStrategy.
 *
 * @example
 * ```typescript
 * // Use transform-based positioning (default, better performance)
 * <GridLayout positionStrategy={transformStrategy} />
 *
 * // Use top/left positioning (for environments where transforms cause issues)
 * <GridLayout positionStrategy={absoluteStrategy} />
 *
 * // Use scaled transforms (for scaled containers)
 * <GridLayout positionStrategy={createScaledStrategy(0.5)} />
 * ```
 */
export interface PositionStrategy {
  /** Strategy type identifier */
  readonly type: "transform" | "absolute";

  /** Scale factor for drag/resize calculations */
  readonly scale: number;

  /**
   * Convert pixel position to CSS style object.
   *
   * @param pos - Position in pixels
   * @returns CSS properties for positioning the element
   */
  calcStyle(pos: Position): React.CSSProperties;

  /**
   * Calculate position during drag operations, accounting for transforms and scale.
   *
   * @param clientX - Mouse client X position
   * @param clientY - Mouse client Y position
   * @param offsetX - Offset from element origin X
   * @param offsetY - Offset from element origin Y
   * @returns Adjusted left/top position
   */
  calcDragPosition(
    clientX: number,
    clientY: number,
    offsetX: number,
    offsetY: number
  ): PartialPosition;
}

// ============================================================================
// Grid Configuration Types (v2 Composable Interfaces)
// ============================================================================

/**
 * Grid measurement configuration.
 * Groups all grid metrics (columns, row height, margins).
 */
export interface GridConfig {
  /** Number of columns in the grid (default: 12) */
  cols: number;

  /** Height of a single row in pixels (default: 150) */
  rowHeight: number;

  /** [horizontal, vertical] margin between items in pixels (default: [10, 10]) */
  margin: readonly [number, number];

  /** [horizontal, vertical] padding inside the container (default: null, uses margin) */
  containerPadding: readonly [number, number] | null;

  /** Maximum number of rows (default: Infinity) */
  maxRows: number;
}

/** Default grid configuration */
export const defaultGridConfig: GridConfig = {
  cols: 12,
  rowHeight: 150,
  margin: [10, 10],
  containerPadding: null,
  maxRows: Infinity
};

/**
 * Drag behavior configuration.
 * Groups all drag-related settings.
 */
export interface DragConfig {
  /** Whether items can be dragged (default: true) */
  enabled: boolean;

  /** Whether items are bounded to the container (default: false) */
  bounded: boolean;

  /** CSS selector for drag handle (e.g., '.drag-handle') */
  handle?: string;

  /** CSS selector for elements that should not trigger drag */
  cancel?: string;

  /**
   * Minimum pixels to move before drag starts.
   * Helps distinguish click from drag (fixes #1341, #1401).
   * @default 3
   */
  threshold: number;
}

/** Default drag configuration */
export const defaultDragConfig: DragConfig = {
  enabled: true,
  bounded: false,
  threshold: 3
};

/**
 * Resize behavior configuration.
 * Groups all resize-related settings.
 */
export interface ResizeConfig {
  /** Whether items can be resized (default: true) */
  enabled: boolean;

  /** Which resize handles to show (default: ['se']) */
  handles: readonly ResizeHandleAxis[];

  /**
   * Custom resize handle component.
   * Can be a React node or a function that receives the axis.
   */
  handleComponent?:
    | React.ReactNode
    | ((
        axis: ResizeHandleAxis,
        ref: React.Ref<HTMLElement>
      ) => React.ReactNode);
}

/** Default resize configuration */
export const defaultResizeConfig: ResizeConfig = {
  enabled: true,
  handles: ["se"]
};

/**
 * Drop configuration (for dropping external elements).
 * Groups all drop-related settings.
 */
export interface DropConfig {
  /** Whether external elements can be dropped on the grid (default: false) */
  enabled: boolean;

  /** Default size for dropped items (default: { w: 1, h: 1 }) */
  defaultItem: { w: number; h: number };

  /**
   * Called when dragging over the grid.
   * Return dimensions to override defaultItem, or false to reject the drop.
   */
  onDragOver?: (e: DragEvent) => { w?: number; h?: number } | false | void;
}

/** Default drop configuration */
export const defaultDropConfig: DropConfig = {
  enabled: false,
  defaultItem: { w: 1, h: 1 }
};

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
