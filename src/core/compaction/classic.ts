import type { Compactor, Layout, LayoutItem } from "../types.js";
import { normalizeLayoutGeometry } from "../geometry/normalize.js";
import type { Axis } from "../geometry/axis.js";
import { collides, getFirstCollision } from "../collision.js";
import { advanceRows, bottom, cloneLayoutItem, getStatics } from "../layout.js";

interface CollisionContext {
  readonly layout: Layout;
  readonly firstIndices: ReadonlyMap<string, number>;
  readonly hasStatics: boolean;
}

function firstPositions<Key>(
  layout: Layout,
  key: (item: LayoutItem) => Key
): Map<Key, number> {
  const positions = new Map<Key, number>();
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    if (item === undefined) continue;
    const itemKey = key(item);
    if (!positions.has(itemKey)) positions.set(itemKey, i);
  }
  return positions;
}

function collisionContext(
  layout: Layout,
  hasStatics?: boolean
): CollisionContext {
  return {
    layout,
    firstIndices: firstPositions(layout, item => item.i),
    hasStatics: hasStatics ?? getStatics(layout).length > 0
  };
}

export function resolveClassicCollision(
  layout: Layout,
  item: LayoutItem,
  moveToCoord: number,
  axis: Axis,
  hasStatics?: boolean
): void {
  const context = collisionContext(layout, hasStatics);
  resolveCollision(
    context,
    item,
    moveToCoord,
    axis,
    context.firstIndices.get(item.i) ?? -1
  );
}

function resolveCollision(
  context: CollisionContext,
  item: LayoutItem,
  moveToCoord: number,
  axis: Axis,
  itemIndex: number
): void {
  item[axis.pos] += 1;

  for (let i = itemIndex + 1; i < context.layout.length; i++) {
    const otherItem = context.layout[i];
    if (otherItem === undefined) continue;
    if (otherItem.static) continue;
    // Both axes keep the y-based break because it affects classic output.
    if (!context.hasStatics && otherItem.y > item.y + item.h) break;

    if (collides(item, otherItem)) {
      resolveCollision(
        context,
        otherItem,
        moveToCoord + item[axis.size],
        axis,
        context.firstIndices.get(otherItem.i) ?? -1
      );
    }
  }

  item[axis.pos] = moveToCoord;
}

function moveTowardOrigin(
  compareWith: Layout,
  item: LayoutItem,
  axis: Axis
): void {
  const start = item[axis.pos];
  if (!(start > 0) || getFirstCollision(compareWith, item)) return;
  item[axis.pos] = firstReachableCollision(compareWith, item, axis, start);
}

function firstReachableCollision(
  compareWith: Layout,
  item: LayoutItem,
  axis: Axis,
  start: number
): number {
  let steps = Math.ceil(start);
  for (let i = 0; i < compareWith.length; i++) {
    const other = compareWith[i];
    if (other === undefined || other.i === item.i) continue;
    if (item[axis.cross] + item[axis.crossSize] <= other[axis.cross]) continue;
    if (item[axis.cross] >= other[axis.cross] + other[axis.crossSize]) continue;

    // The old loop samples start, start - 1, ... . A fractional blocker
    // between samples must not stop an item that would step over it.
    const distance = Math.max(
      1,
      Math.floor(start - (other[axis.pos] + other[axis.size])) + 1
    );
    if (distance >= steps) continue;
    const position = start - distance;
    if (position + item[axis.size] <= other[axis.pos]) continue;
    if (position >= other[axis.pos] + other[axis.size]) continue;
    steps = distance;
  }
  return start - steps;
}

/** Rows a jump must skip to reset the backoff. A check costs an O(n)
 * snapshot plus two O(n) event scans, so a shorter jump does not pay for it. */
const WORTHWHILE_JUMP = 8;

interface WrapState {
  /** Coordinates at the last wrap, kept only when this wrap may jump. */
  previous?: { x: number; y: number; coordinates: number[] };
  /** Wraps left before the next snapshot. */
  wait: number;
  /** Doubles after each check without a worthwhile jump, so dense layouts
   * stop taking an O(n) snapshot on every wrap. A worthwhile jump resets it. */
  backoff: number;
}

/** How a sample row relates vertically to another item, as collides() sees it. */
function verticalRelation(y: number, h: number, other: LayoutItem): number {
  const end = y + h;
  const top = end < other.y ? 0 : end === other.y ? 1 : 2;
  return top * 2 + (y >= other.y + other.h ? 1 : 0);
}

/** First y++ sample where the set of vertically intersecting items changes. */
function nextCollisionRow(
  compareWith: Layout,
  item: LayoutItem,
  y: number
): number {
  let steps = Infinity;
  for (let index = 0; index < compareWith.length; index++) {
    const other = compareWith[index]!;
    if (other === undefined || other.i === item.i) continue;
    const enter = Math.floor(other.y - item.h - y) + 1;
    const touch = Math.ceil(other.y - item.h - y);
    const leave = Math.ceil(other.y + other.h - y);
    let candidate = Infinity;
    if (enter > 0) candidate = Math.min(candidate, enter);
    if (touch > 0) candidate = Math.min(candidate, touch);
    if (leave > 0) candidate = Math.min(candidate, leave);
    if (!Number.isFinite(candidate)) continue;
    // The closed forms subtract in floating point, so with fractional rows
    // they can land one sample late (2.7 - 1.7 > 1). Overshooting skips a
    // change, so step back while the previous sample already differs.
    const base = verticalRelation(y, item.h, other);
    while (
      candidate > 1 &&
      verticalRelation(advanceRows(y, candidate - 1), item.h, other) !== base
    ) {
      candidate--;
    }
    steps = Math.min(steps, candidate);
  }
  return Number.isFinite(steps) ? advanceRows(y, steps) : Infinity;
}

function wrapOverflow(
  compareWith: Layout,
  item: LayoutItem,
  fullLayout: Layout,
  axis: Axis,
  cols: number,
  state?: WrapState
): WrapState | undefined {
  if (axis.pos !== "x" || !(item.x + item.w > cols)) return state;

  item.x = cols - item.w;
  item.y++;
  moveTowardOrigin(compareWith, item, axis);

  state ??= { wait: 0, backoff: 0 };
  const previous = state.previous;
  state.previous = undefined;
  // Skipping a jump only replays the wraps it would have skipped, so output
  // is unchanged. Each skipped run is at most as long as the wraps before it.
  if (state.wait > 0) {
    state.wait--;
    return state;
  }

  // A repeated wrap with identical collision inputs and recursive side effects
  // will repeat until a vertical intersection changes. Jump to that sample.
  const coordinates: number[] = [];
  let unchanged = previous?.x === item.x;
  for (let index = 0; index < fullLayout.length; index++) {
    const other = fullLayout[index]!;
    if (other === undefined) continue;
    const y = other === item ? 0 : other.y;
    coordinates[index * 2] = other.x;
    coordinates[index * 2 + 1] = y;
    if (
      previous?.coordinates[index * 2] !== other.x ||
      previous?.coordinates[index * 2 + 1] !== y
    )
      unchanged = false;
  }
  let jumped = false;
  if (unchanged && previous) {
    const next = Math.min(
      nextCollisionRow(compareWith, item, previous.y),
      nextCollisionRow(fullLayout, item, previous.y)
    );
    if (Number.isFinite(next) && next > item.y) {
      jumped = next - item.y >= WORTHWHILE_JUMP;
      item.y = next;
      item.x = cols - item.w;
      moveTowardOrigin(compareWith, item, axis);
    }
  }
  if (previous && !jumped) {
    state.backoff = state.backoff * 2 + 1;
    state.wait = state.backoff;
    return state;
  }
  if (jumped) state.backoff = 0;
  state.previous = { x: item.x, y: item.y, coordinates };
  return state;
}

export function compactItem(
  compareWith: Layout,
  item: LayoutItem,
  fullLayout: Layout,
  axis: Axis,
  cols: number,
  maxY: number,
  context?: CollisionContext
): LayoutItem {
  item.x = Math.max(item.x, 0);
  item.y = Math.max(item.y, 0);
  if (axis.pos === "y") item[axis.pos] = Math.min(maxY, item[axis.pos]);

  moveTowardOrigin(compareWith, item, axis);

  let wrap: WrapState | undefined;
  let collision: LayoutItem | undefined;
  while ((collision = getFirstCollision(compareWith, item)) !== undefined) {
    context ??= collisionContext(fullLayout);
    resolveCollision(
      context,
      item,
      collision[axis.pos] + collision[axis.size],
      axis,
      context.firstIndices.get(item.i) ?? -1
    );
    wrap = wrapOverflow(compareWith, item, fullLayout, axis, cols, wrap);
  }

  item[axis.pos] = Math.max(item[axis.pos], 0);
  return item;
}

export function classicCompactor(axis: Axis): Compactor {
  return {
    type: axis.pos === "y" ? "vertical" : "horizontal",
    allowOverlap: false,

    compact(layout: Layout, cols: number): Layout {
      layout = normalizeLayoutGeometry(layout);
      const compareWith = getStatics(layout);
      let maxY = axis.pos === "y" ? bottom(compareWith) : 0;
      const sorted = [...layout].sort(axis.compare);
      const originalIndices = firstPositions(layout, item => item);
      const context = collisionContext(sorted, compareWith.length > 0);
      const out: LayoutItem[] = new Array(layout.length);

      for (let i = 0; i < sorted.length; i++) {
        const sortedItem = sorted[i];
        if (sortedItem === undefined) continue;

        let item = cloneLayoutItem(sortedItem);
        if (!item.static) {
          item = compactItem(
            compareWith,
            item,
            sorted,
            axis,
            cols,
            maxY,
            context
          );
          if (axis.pos === "y") maxY = Math.max(maxY, item.y + item.h);
          compareWith.push(item);
        }

        // Repeated references keep the first output slot, matching indexOf.
        const originalIndex = originalIndices.get(sortedItem) ?? -1;
        out[originalIndex] = item;
        item.moved = false;
      }

      return out;
    }
  };
}
