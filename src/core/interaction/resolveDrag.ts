import type { CompactType, Layout, LayoutItem } from "../types.js";
import { getFirstCollision } from "../collision.js";
import { cloneLayout } from "../layout.js";
import { DragCollisionIndex } from "./dragCollisionIndex.js";

/** Shared only by the recursive steps of one public movement call. */
export class DragResolver {
  private collisions: DragCollisionIndex | undefined;

  constructor(
    private readonly compactType: CompactType,
    _cols: number
  ) {}

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

    // Update position (mutates l directly - see JSDoc note)
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
