import type { Compactor, Layout, LayoutItem } from "../types.js";
import type { Axis } from "../geometry/axis.js";
import { collides, getFirstCollision } from "../collision.js";
import { bottom, cloneLayoutItem, getStatics } from "../layout.js";

export function resolveClassicCollision(
  layout: Layout,
  item: LayoutItem,
  moveToCoord: number,
  axis: Axis,
  hasStatics?: boolean
): void {
  item[axis.pos] += 1;
  const itemIndex = layout.findIndex(l => l.i === item.i);
  const layoutHasStatics = hasStatics ?? getStatics(layout).length > 0;

  for (let i = itemIndex + 1; i < layout.length; i++) {
    const otherItem = layout[i];
    if (otherItem === undefined) continue;
    if (otherItem.static) continue;
    // Both axes keep the y-based break because it affects classic output.
    if (!layoutHasStatics && otherItem.y > item.y + item.h) break;

    if (collides(item, otherItem)) {
      resolveClassicCollision(
        layout,
        otherItem,
        moveToCoord + item[axis.size],
        axis,
        layoutHasStatics
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
  while (item[axis.pos] > 0 && !getFirstCollision(compareWith, item)) {
    item[axis.pos]--;
  }
}

function wrapOverflow(
  compareWith: Layout,
  item: LayoutItem,
  axis: Axis,
  cols: number
): void {
  if (axis.pos !== "x") return;
  if (!(item[axis.pos] + item[axis.size] > cols)) return;

  item[axis.pos] = cols - item[axis.size];
  item[axis.cross]++;
  moveTowardOrigin(compareWith, item, axis);
}

export function compactItem(
  compareWith: Layout,
  item: LayoutItem,
  fullLayout: Layout,
  axis: Axis,
  cols: number,
  maxY: number
): LayoutItem {
  item.x = Math.max(item.x, 0);
  item.y = Math.max(item.y, 0);
  if (axis.pos === "y") item[axis.pos] = Math.min(maxY, item[axis.pos]);

  moveTowardOrigin(compareWith, item, axis);

  let collision: LayoutItem | undefined;
  while ((collision = getFirstCollision(compareWith, item)) !== undefined) {
    resolveClassicCollision(
      fullLayout,
      item,
      collision[axis.pos] + collision[axis.size],
      axis
    );
    wrapOverflow(compareWith, item, axis, cols);
  }

  item[axis.pos] = Math.max(item[axis.pos], 0);
  return item;
}

export function classicCompactor(axis: Axis): Compactor {
  return {
    type: axis.pos === "y" ? "vertical" : "horizontal",
    allowOverlap: false,

    compact(layout: Layout, cols: number): Layout {
      const compareWith = getStatics(layout);
      let maxY = axis.pos === "y" ? bottom(compareWith) : 0;
      const sorted = [...layout].sort(axis.compare);
      const out: LayoutItem[] = new Array(layout.length);

      for (let i = 0; i < sorted.length; i++) {
        const sortedItem = sorted[i];
        if (sortedItem === undefined) continue;

        let item = cloneLayoutItem(sortedItem);
        if (!item.static) {
          item = compactItem(compareWith, item, sorted, axis, cols, maxY);
          if (axis.pos === "y") maxY = Math.max(maxY, item.y + item.h);
          compareWith.push(item);
        }

        const originalIndex = layout.indexOf(sortedItem);
        out[originalIndex] = item;
        item.moved = false;
      }

      return out;
    }
  };
}
