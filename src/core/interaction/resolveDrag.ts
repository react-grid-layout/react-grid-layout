import type { CompactType, Layout, LayoutItem } from "../types.js";
import { getFirstCollision } from "../collision.js";
import { cloneLayout } from "../layout.js";
import { DragCollisionIndex } from "./dragCollisionIndex.js";

function shallowEqual(a: LayoutItem, b: LayoutItem): boolean {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i] as keyof LayoutItem;
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!Object.is(a[key], b[key])) return false;
  }
  return true;
}

/**
 * Run a drag move on copies so neither `layout` nor `l` is written.
 *
 * The resolver below works by writing positions into the items it is given.
 * Here it gets a shallow copy of every item (one copy per distinct reference,
 * so a repeated reference stays repeated). `l` is found by reference, then by
 * id, so a detached copy of a layout item moves that item (C-B16). Copies the
 * move left equal to their original are swapped back, so untouched items keep
 * their identity, and a move that changed nothing returns `layout` itself.
 */
export function moveWithoutMutation(
  compactType: CompactType,
  layout: Layout,
  l: LayoutItem,
  x: number | undefined,
  y: number | undefined,
  isUserAction: boolean | undefined,
  preventCollision: boolean | undefined,
  allowOverlap?: boolean
): LayoutItem[] {
  // A detached copy of a layout item stands for that item, and the layout
  // entry, not the copy, supplies its fields, early returns included. An item
  // with no entry moves on its own.
  const entry = layout.includes(l)
    ? l
    : (layout.find(item => item !== undefined && item.i === l.i) ?? l);

  // Early returns write nothing, so they need no copies.
  if (entry.static && entry.isDraggable !== true) return [...layout];
  if (entry.y === y && entry.x === x) return [...layout];

  const working: LayoutItem[] = new Array(layout.length);
  const copies = new Map<LayoutItem, LayoutItem>();
  const originals = new Map<LayoutItem, LayoutItem>();
  for (let i = 0; i < layout.length; i++) {
    if (!(i in layout)) continue;
    const item = layout[i];
    if (item === undefined) {
      working[i] = item as unknown as LayoutItem;
      continue;
    }
    let copy = copies.get(item);
    if (copy === undefined) {
      copy = { ...item };
      copies.set(item, copy);
      originals.set(copy, item);
    }
    working[i] = copy;
  }
  const target = copies.get(entry) ?? { ...l };

  const result = new DragResolver(compactType).move(
    working,
    target,
    x,
    y,
    isUserAction,
    preventCollision,
    allowOverlap
  ) as LayoutItem[];

  // Every path of move() returns an array this call owns, so swap in place.
  let unchanged = result === working;
  for (let i = 0; i < result.length; i++) {
    const item = result[i];
    if (item === undefined) continue;
    const original = originals.get(item);
    if (original !== undefined && shallowEqual(item, original)) {
      result[i] = original;
    } else {
      unchanged = false;
    }
  }
  return unchanged ? (layout as LayoutItem[]) : result;
}

/**
 * Shared only by the recursive steps of one public movement call. It writes
 * positions into the items it is given; public callers hand it copies
 * (moveWithoutMutation).
 */
export class DragResolver {
  private collisions: DragCollisionIndex | undefined;

  constructor(private readonly compactType: CompactType) {}

  move(
    layout: Layout,
    l: LayoutItem,
    x: number | undefined,
    y: number | undefined,
    isUserAction: boolean | undefined,
    preventCollision: boolean | undefined,
    allowOverlap?: boolean
  ): Layout {
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

    // Update position (writes the working copy; see moveWithoutMutation)
    if (typeof x === "number") l.x = x;
    if (typeof y === "number") l.y = y;
    l.moved = true;

    const { compactType } = this;
    if (this.collisions === undefined) {
      this.collisions = new DragCollisionIndex(layout, compactType);
    } else {
      this.collisions.update(l);
    }
    const movingUp =
      compactType === "vertical" && typeof y === "number"
        ? oldY >= y
        : compactType === "horizontal" && typeof x === "number"
          ? oldX >= x
          : false;
    const collisions = this.collisions.getCollisions(l, movingUp);
    const hasCollisions = collisions.length > 0;

    // Handle overlap mode - just clone and return
    if (hasCollisions && allowOverlap) {
      return cloneLayout(layout);
    }

    // Handle prevent collision mode - revert position
    // Return same reference to signal no change occurred
    if (hasCollisions && preventCollision) {
      l.x = oldX;
      l.y = oldY;
      l.moved = false;
      this.collisions.update(l);
      return layout;
    }

    // Resolve collisions by moving other items
    let resultLayout: Layout = [...layout];
    for (let i = 0; i < collisions.length; i++) {
      const collision = collisions[i];
      if (collision === undefined) continue;

      // Skip already-moved items to prevent infinite loops
      if (collision.moved) continue;

      // Static items can't be moved - move the dragged item instead
      if (collision.static) {
        resultLayout = this.moveAway(resultLayout, collision, l, isUserAction);
      } else {
        resultLayout = this.moveAway(resultLayout, l, collision, isUserAction);
      }
    }

    return resultLayout;
  }

  moveAway(
    layout: Layout,
    collidesWith: LayoutItem,
    itemToMove: LayoutItem,
    isUserAction: boolean | undefined
  ): Layout {
    const { compactType } = this;
    // Wrap mode flows left-to-right, top-to-bottom like a paragraph. For
    // collision resolution it behaves like horizontal compaction (items push
    // right); the final wrap compactor re-flows to strict reading order (#2252).
    const compactH = compactType === "horizontal" || compactType === "wrap";
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
        return this.move(
          layout,
          itemToMove,
          compactH ? fakeItem.x : undefined,
          compactV ? fakeItem.y : undefined,
          isUserAction,
          preventCollision
        );
      }

      // Handle specific collision cases
      if (collisionNorth && compactV) {
        return this.move(
          layout,
          itemToMove,
          undefined,
          itemToMove.y + 1,
          isUserAction,
          preventCollision
        );
      }

      if (collisionNorth && compactType === null) {
        // Swap positions in free-form mode (#1982). The collider takes the dragged
        // item's y; the dragged item sits just below the collider's new bottom edge
        // (which equals the dragged item's y plus its height), so a partial overlap
        // resolves tight instead of shoving a full item height down and leaving a gap.
        const newCollidesY = itemToMove.y;
        collidesWith.y = newCollidesY;
        itemToMove.y = newCollidesY + collidesWith.h;
        return [...layout];
      }

      if (collisionWest && compactH) {
        return this.move(
          layout,
          collidesWith,
          itemToMove.x,
          undefined,
          isUserAction,
          preventCollision
        );
      }
    }

    // Default: move down/right by 1
    const newX = compactH ? itemToMove.x + 1 : undefined;
    const newY = compactV ? itemToMove.y + 1 : undefined;

    if (newX === undefined && newY === undefined) {
      return [...layout];
    }

    return this.move(
      layout,
      itemToMove,
      newX,
      newY,
      isUserAction,
      preventCollision
    );
  }
}
