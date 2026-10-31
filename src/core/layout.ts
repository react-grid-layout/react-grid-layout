/**
 * Core layout manipulation utilities.
 *
 * These functions create, modify, and query grid layouts.
 * All functions treat layouts as immutable - they return new arrays/objects.
 */

import type { CompactType, Layout, LayoutItem, Mutable } from "./types.js";
import { DragResolver } from "./interaction/resolveDrag.js";

// ============================================================================
// Layout Queries
// ============================================================================

/**
 * Get the bottom-most Y coordinate of the layout.
 *
 * This is the Y position plus height of the lowest item.
 *
 * @param layout - Layout to measure
 * @returns The bottom Y coordinate (0 if layout is empty)
 */
export function bottom(layout: Layout): number {
  let max = 0;
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    if (item !== undefined) {
      const bottomY = item.y + item.h;
      if (bottomY > max) max = bottomY;
    }
  }
  return max;
}

/**
 * Get a layout item by its ID.
 *
 * @param layout - Layout to search
 * @param id - Item ID to find
 * @returns The layout item, or undefined if not found
 */
export function getLayoutItem(
  layout: Layout,
  id: string
): LayoutItem | undefined {
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    if (item !== undefined && item.i === id) {
      return item;
    }
  }
  return undefined;
}

/**
 * Get all static items from the layout.
 *
 * Static items cannot be moved or resized by the user.
 *
 * @param layout - Layout to filter
 * @returns Array of static layout items
 */
export function getStatics(layout: Layout): LayoutItem[] {
  return layout.filter((l): l is LayoutItem => l.static === true);
}

// ============================================================================
// Layout Cloning
// ============================================================================

/**
 * Clone a layout item.
 *
 * Creates a shallow copy with all properties preserved.
 * Boolean properties are normalized (undefined becomes false).
 *
 * @param layoutItem - Item to clone
 * @returns A new layout item with the same properties
 */
export function cloneLayoutItem(layoutItem: LayoutItem): LayoutItem {
  return {
    i: layoutItem.i,
    x: layoutItem.x,
    y: layoutItem.y,
    w: layoutItem.w,
    h: layoutItem.h,
    minW: layoutItem.minW,
    maxW: layoutItem.maxW,
    minH: layoutItem.minH,
    maxH: layoutItem.maxH,
    moved: Boolean(layoutItem.moved),
    static: Boolean(layoutItem.static),
    isDraggable: layoutItem.isDraggable,
    isResizable: layoutItem.isResizable,
    resizeHandles: layoutItem.resizeHandles,
    constraints: layoutItem.constraints,
    isBounded: layoutItem.isBounded
  };
}

/**
 * Clone an entire layout.
 *
 * Creates a new array with cloned items.
 *
 * @param layout - Layout to clone
 * @returns A new layout with cloned items
 */
export function cloneLayout(layout: Layout): LayoutItem[] {
  const newLayout: LayoutItem[] = new Array(layout.length);
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    if (item !== undefined) {
      newLayout[i] = cloneLayoutItem(item);
    }
  }
  return newLayout;
}

// ============================================================================
// Layout Modification
// ============================================================================

/**
 * Replace a layout item in a layout.
 *
 * Returns a new layout with the item replaced. Other items are not cloned.
 *
 * @param layout - Layout to modify
 * @param layoutItem - New item (matched by `i` property)
 * @returns New layout with the item replaced
 */
export function modifyLayout(
  layout: Layout,
  layoutItem: LayoutItem
): LayoutItem[] {
  const newLayout: LayoutItem[] = new Array(layout.length);
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    if (item !== undefined) {
      if (layoutItem.i === item.i) {
        newLayout[i] = layoutItem;
      } else {
        newLayout[i] = item;
      }
    }
  }
  return newLayout;
}

/**
 * Apply a transformation to a layout item.
 *
 * Finds the item by key, clones it, applies the callback, and returns
 * a new layout with the modified item.
 *
 * @param layout - Layout to modify
 * @param itemKey - Key of the item to modify
 * @param cb - Callback that receives the cloned item and returns the modified item
 * @returns Tuple of [new layout, modified item or null if not found]
 */
export function withLayoutItem(
  layout: Layout,
  itemKey: string,
  cb: (item: LayoutItem) => LayoutItem
): [LayoutItem[], LayoutItem | null] {
  let item = getLayoutItem(layout, itemKey);
  if (!item) {
    return [[...layout], null];
  }

  // Clone, then modify via callback
  item = cb(cloneLayoutItem(item));
  const newLayout = modifyLayout(layout, item);

  return [newLayout, item];
}

// ============================================================================
// Bounds Correction
// ============================================================================

/** Preserve the rounding of repeated y++ while skipping whole unit ranges. */
export function advanceRows(y: number, steps: number): number {
  if (Number.isInteger(y)) return y + steps;
  if (y < 0) {
    const advance = Math.min(steps, Math.ceil(-y));
    y += advance;
    steps -= advance;
  }
  while (steps > 0) {
    const boundary = y < 1 ? 1 : 2 ** (Math.floor(Math.log2(y)) + 1);
    const withinRange = Math.min(steps, Math.ceil(boundary - y) - 1);
    if (withinRange > 0) {
      y += withinRange;
      steps -= withinRange;
    }
    if (steps > 0) {
      y++;
      steps--;
    }
  }
  return y;
}

type StaticBlocker = { item: LayoutItem; order: number };

function pushBlocker(heap: StaticBlocker[], blocker: StaticBlocker): void {
  let index = heap.length;
  heap.push(blocker);
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);
    if (heap[parent]!.order <= blocker.order) break;
    heap[index] = heap[parent]!;
    index = parent;
  }
  heap[index] = blocker;
}

function popBlocker(heap: StaticBlocker[]): void {
  const last = heap.pop()!;
  if (heap.length === 0) return;
  let index = 0;
  while (index * 2 + 1 < heap.length) {
    let child = index * 2 + 1;
    if (child + 1 < heap.length && heap[child + 1]!.order < heap[child]!.order)
      child++;
    if (last.order <= heap[child]!.order) break;
    heap[index] = heap[child]!;
    index = child;
  }
  heap[index] = last;
}

/** One row-ordered sweep; the heap retains original first-collision priority. */
function correctStatic(item: Mutable<LayoutItem>, colliders: Layout): void {
  const blockers: StaticBlocker[] = [];
  for (let order = 0; order < colliders.length; order++) {
    const other = colliders[order]!;
    if (other.i === item.i) continue;
    if (other.x + other.w <= item.x || other.x >= item.x + item.w) continue;
    blockers.push({ item: other, order });
  }
  blockers.sort((a, b) => a.item.y - b.item.y);
  const active: StaticBlocker[] = [];
  let next = 0;
  for (;;) {
    while (
      next < blockers.length &&
      !(item.y + item.h <= blockers[next]!.item.y)
    ) {
      pushBlocker(active, blockers[next++]!);
    }
    while (active.length > 0 && item.y >= active[0]!.item.y + active[0]!.item.h)
      popBlocker(active);
    if (active.length === 0) return;
    const collision = active[0]!.item;
    // Keep the original collider priority and subtraction order: decimal
    // rounding can change ceil(end - y), even when interval unions agree.
    item.y = advanceRows(
      item.y,
      Math.max(1, Math.ceil(collision.y + collision.h - item.y))
    );
  }
}

/**
 * Ensure all layout items fit within the grid bounds.
 *
 * - Items overflowing right are moved left
 * - Items overflowing left are moved to x=0 and clamped to grid width
 * - Static items that collide with other statics are moved down
 *
 * **IMPORTANT**: This function mutates the layout items in place for performance.
 * The type signature uses `Mutable<LayoutItem>[]` to make this explicit.
 * Clone the layout first (e.g., with `cloneLayout()`) if you need immutability.
 *
 * @param layout - Layout to correct (items WILL be mutated)
 * @param bounds - Grid bounds
 * @returns The same layout array (for chaining)
 */
export function correctBounds(
  layout: Mutable<LayoutItem>[],
  bounds: { cols: number }
): LayoutItem[] {
  const collidesWith = getStatics(layout);

  for (let i = 0; i < layout.length; i++) {
    const l = layout[i];
    if (l === undefined) continue;

    // Overflows right
    if (l.x + l.w > bounds.cols) {
      l.x = bounds.cols - l.w;
    }

    // Overflows left
    if (l.x < 0) {
      l.x = 0;
      l.w = bounds.cols;
    }

    // y: Infinity (a common "append to bottom" convention) must not survive
    // into rendering math, or the item renders at the top-left and overlaps.
    // Clamp it to the current bottom of the layout (#2161).
    if (l.y === Infinity) {
      l.y = bottom(collidesWith.filter(item => Number.isFinite(item.y)));
    }

    if (!l.static) {
      collidesWith.push(l);
    } else {
      // Static items that collide with other statics must be moved down
      correctStatic(l, collidesWith);
    }
  }

  return layout;
}

// ============================================================================
// Move Operations
// ============================================================================

/**
 * Move a layout element to a new position.
 *
 * Handles collision detection and cascading movements.
 * Does not compact the layout - call `compact()` separately.
 *
 * **Note**: This function mutates the `l` parameter directly for performance.
 * The item's x, y, and moved properties will be modified. Callers should
 * ideally pass a cloned item if they need to preserve the original.
 *
 * @param layout - Full layout
 * @param l - Item to move (will be mutated)
 * @param x - New X position (or undefined to keep current)
 * @param y - New Y position (or undefined to keep current)
 * @param isUserAction - True if this is a direct user action (affects collision resolution)
 * @param preventCollision - True to block movement into occupied space (item snaps back). No effect if allowOverlap is true.
 * @param compactType - Compaction type for collision resolution
 * @param _cols - Unused; kept so existing callers compile
 * @param allowOverlap - True to allow items to stack on top of each other
 * @returns The updated layout
 */
export function moveElement(
  layout: Layout,
  l: LayoutItem,
  x: number | undefined,
  y: number | undefined,
  isUserAction: boolean | undefined,
  preventCollision: boolean | undefined,
  compactType: CompactType,
  _cols: number,
  allowOverlap?: boolean
): LayoutItem[] {
  const result = new DragResolver(compactType).move(
    layout,
    l,
    x,
    y,
    isUserAction,
    preventCollision,
    allowOverlap
  );
  return Array.isArray(result) ? result : [...result];
}

/**
 * Move an item away from a collision.
 *
 * Attempts to move the item up/left first if there's room,
 * otherwise moves it down/right.
 *
 * @param layout - Full layout
 * @param collidesWith - The item being collided with
 * @param itemToMove - The item to move away
 * @param isUserAction - True if this is a direct user action
 * @param compactType - Compaction type
 * @param _cols - Unused; kept so existing callers compile
 * @returns Updated layout
 */
export function moveElementAwayFromCollision(
  layout: Layout,
  collidesWith: LayoutItem,
  itemToMove: LayoutItem,
  isUserAction: boolean | undefined,
  compactType: CompactType,
  _cols: number
): LayoutItem[] {
  const result = new DragResolver(compactType).moveAway(
    layout,
    collidesWith,
    itemToMove,
    isUserAction
  );
  return Array.isArray(result) ? result : [...result];
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate that a layout has the required properties.
 *
 * @param layout - Layout to validate
 * @param contextName - Name for error messages
 * @throws Error if layout is invalid
 */
export function validateLayout(
  layout: Layout,
  contextName: string = "Layout"
): void {
  const requiredProps = ["x", "y", "w", "h"] as const;

  if (!Array.isArray(layout)) {
    throw new Error(`${contextName} must be an array!`);
  }

  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    if (item === undefined) continue;

    for (const key of requiredProps) {
      const value = item[key];
      if (typeof value !== "number" || Number.isNaN(value)) {
        throw new Error(
          `ReactGridLayout: ${contextName}[${i}].${key} must be a number! ` +
            `Received: ${String(value)} (${typeof value})`
        );
      }
    }

    if (item.i !== undefined && typeof item.i !== "string") {
      throw new Error(
        `ReactGridLayout: ${contextName}[${i}].i must be a string! ` +
          `Received: ${String(item.i)} (${typeof item.i})`
      );
    }
  }
}
