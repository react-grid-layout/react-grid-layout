/**
 * Core layout manipulation utilities.
 *
 * These functions create, modify, and query grid layouts.
 * All functions treat layouts as immutable - they return new arrays/objects.
 */

import type { CompactType, Layout, LayoutItem, Mutable } from "./types.js";
import { getAllCollisions, getFirstCollision } from "./collision.js";
import { sortLayoutItems } from "./sort.js";

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

    if (!l.static) {
      collidesWith.push(l);
    } else {
      // Static items that collide with other statics must be moved down
      while (getFirstCollision(collidesWith, l)) {
        l.y++;
      }
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
 * @param cols - Number of columns in the grid
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
  cols: number,
  allowOverlap?: boolean
): LayoutItem[] {
  // Static items can't be moved unless explicitly draggable
  if (l.static && l.isDraggable !== true) {
    return [...layout];
  }

  // Short-circuit if position unchanged
  if (l.y === y && l.x === x) {
    return [...layout];
  }

  const oldX = l.x;
  const oldY = l.y;

  // Update position (mutates l directly - see JSDoc note)
  if (typeof x === "number") (l as Mutable<LayoutItem>).x = x;
  if (typeof y === "number") (l as Mutable<LayoutItem>).y = y;
  (l as Mutable<LayoutItem>).moved = true;

  // Sort for proper collision detection order
  let sorted = sortLayoutItems(layout, compactType);
  const movingUp =
    compactType === "vertical" && typeof y === "number"
      ? oldY >= y
      : compactType === "horizontal" && typeof x === "number"
        ? oldX >= x
        : false;

  if (movingUp) {
    sorted = sorted.reverse();
  }

  const collisions = getAllCollisions(sorted, l);
  const hasCollisions = collisions.length > 0;

  // Handle overlap mode - just clone and return
  if (hasCollisions && allowOverlap) {
    return cloneLayout(layout);
  }

  // Handle prevent collision mode - revert position
  // Return same reference to signal no change occurred
  if (hasCollisions && preventCollision) {
    (l as Mutable<LayoutItem>).x = oldX;
    (l as Mutable<LayoutItem>).y = oldY;
    (l as Mutable<LayoutItem>).moved = false;
    return layout as LayoutItem[];
  }

  // Resolve collisions by moving other items
  let resultLayout: LayoutItem[] = [...layout];
  for (let i = 0; i < collisions.length; i++) {
    const collision = collisions[i];
    if (collision === undefined) continue;

    // Skip already-moved items to prevent infinite loops
    if (collision.moved) continue;

    // Static items can't be moved - move the dragged item instead
    if (collision.static) {
      resultLayout = moveElementAwayFromCollision(
        resultLayout,
        collision,
        l,
        isUserAction,
        compactType,
        cols
      );
    } else {
      resultLayout = moveElementAwayFromCollision(
        resultLayout,
        l,
        collision,
        isUserAction,
        compactType,
        cols
      );
    }
  }

  return resultLayout;
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
 * @param cols - Number of columns
 * @returns Updated layout
 */
export function moveElementAwayFromCollision(
  layout: Layout,
  collidesWith: LayoutItem,
  itemToMove: LayoutItem,
  isUserAction: boolean | undefined,
  compactType: CompactType,
  cols: number
): LayoutItem[] {
  const compactH = compactType === "horizontal";
  const compactV = compactType === "vertical";
  const preventCollision = collidesWith.static;

  // Try to move up/left first (only on primary collision from user action)
  if (isUserAction) {
    isUserAction = false; // Only try this once

    // Create a fake item to test if there's room above/left
    const fakeItem: LayoutItem = {
      x: compactH ? Math.max(collidesWith.x - itemToMove.w, 0) : itemToMove.x,
      y: compactV ? Math.max(collidesWith.y - itemToMove.h, 0) : itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
      i: "-1"
    };

    const firstCollision = getFirstCollision(layout, fakeItem);
    const collisionNorth =
      firstCollision !== undefined &&
      firstCollision.y + firstCollision.h > collidesWith.y;
    const collisionWest =
      firstCollision !== undefined &&
      collidesWith.x + collidesWith.w > firstCollision.x;

    // No collision above/left - we can move there
    if (!firstCollision) {
      return moveElement(
        layout,
        itemToMove,
        compactH ? fakeItem.x : undefined,
        compactV ? fakeItem.y : undefined,
        isUserAction,
        preventCollision,
        compactType,
        cols
      );
    }

    // Handle specific collision cases
    if (collisionNorth && compactV) {
      return moveElement(
        layout,
        itemToMove,
        undefined,
        itemToMove.y + 1,
        isUserAction,
        preventCollision,
        compactType,
        cols
      );
    }

    if (collisionNorth && compactType === null) {
      // Swap positions in free-form mode
      (collidesWith as Mutable<LayoutItem>).y = itemToMove.y;
      (itemToMove as Mutable<LayoutItem>).y = itemToMove.y + itemToMove.h;
      return [...layout];
    }

    if (collisionWest && compactH) {
      return moveElement(
        layout,
        collidesWith,
        itemToMove.x,
        undefined,
        isUserAction,
        preventCollision,
        compactType,
        cols
      );
    }
  }

  // Default: move down/right by 1
  const newX = compactH ? itemToMove.x + 1 : undefined;
  const newY = compactV ? itemToMove.y + 1 : undefined;

  if (newX === undefined && newY === undefined) {
    return [...layout];
  }

  return moveElement(
    layout,
    itemToMove,
    newX,
    newY,
    isUserAction,
    preventCollision,
    compactType,
    cols
  );
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
