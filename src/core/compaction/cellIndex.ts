import type { Layout, LayoutItem } from "../types.js";
import type { Axis } from "../geometry/axis.js";
import { collides } from "../collision.js";

/**
 * Spatial filters for classic compaction on integer layouts. Each one returns
 * a superset of the items `collides()` could match, in the order the plain
 * scans visit them, so the classic loops keep their exact output while
 * skipping items that cannot touch the query.
 */

/** Rows per band. Wider bands mean fewer cells per item but more candidates. */
const BAND = 8;

/** Largest `cols` and starting column extent the index accepts. */
const MAX_COLUMNS = 1024;

/** Cells one item may occupy before the layout keeps the plain scans. */
const MAX_CELLS_PER_ITEM = 4096;

function band(row: number): number {
  return Math.floor(row / BAND);
}

/**
 * True when ids are unique and every item has non-negative integer geometry
 * of at least one cell within the index bounds. Compaction keeps such
 * geometry integer: every write is a sum or difference of these values,
 * `cols` or a clamp to 0. Duplicate ids make resolveCollision restart scans
 * at the first item with that id, which the indexes do not model.
 */
export function indexable(layout: Layout, cols: number): boolean {
  if (!Number.isInteger(cols) || cols < 1 || cols > MAX_COLUMNS) return false;
  const ids = new Set<string>();
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    if (item === undefined) return false;
    if (ids.has(item.i)) return false;
    ids.add(item.i);
    const { x, y, w, h } = item;
    if (!Number.isInteger(x) || !Number.isInteger(y)) return false;
    if (!Number.isInteger(w) || !Number.isInteger(h)) return false;
    if (x < 0 || y < 0 || w < 1 || h < 1) return false;
    // Horizontal wrap places items at cols - w, so w > cols goes negative.
    if (w > cols || x + w > MAX_COLUMNS) return false;
    if (!Number.isSafeInteger(y + h)) return false;
    if (w * (band(y + h - 1) - band(y) + 1) > MAX_CELLS_PER_ITEM) return false;
  }
  return true;
}

/**
 * Index over the placed items (`compareWith`). Classic compaction only
 * appends to that list and never moves an item after placing it, so cells are
 * written once per item.
 */
export class PlacedIndex {
  /** Row band, then column, to ascending indices. Nested so no key aliases. */
  private readonly cells = new Map<number, Map<number, number[]>>();
  private readonly items: LayoutItem[] = [];

  constructor(initial: Layout) {
    for (let i = 0; i < initial.length; i++) {
      const item = initial[i];
      if (item !== undefined) this.push(item);
      else this.items.push(item as unknown as LayoutItem);
    }
  }

  private cell(column: number, rowBand: number): number[] | undefined {
    return this.cells.get(rowBand)?.get(column);
  }

  push(item: LayoutItem): void {
    const index = this.items.length;
    this.items.push(item);
    const last = band(item.y + item.h - 1);
    for (let b = band(item.y); b <= last; b++) {
      let row = this.cells.get(b);
      if (row === undefined) this.cells.set(b, (row = new Map()));
      for (let column = item.x; column < item.x + item.w; column++) {
        const cell = row.get(column);
        if (cell === undefined) row.set(column, [index]);
        else cell.push(index);
      }
    }
  }

  /** Same result as getFirstCollision(compareWith, item). */
  firstCollision(item: LayoutItem): LayoutItem | undefined {
    let best = Infinity;
    const last = band(item.y + item.h - 1);
    for (let b = band(item.y); b <= last; b++) {
      for (let column = item.x; column < item.x + item.w; column++) {
        const cell = this.cell(column, b);
        if (cell === undefined) continue;
        for (let k = 0; k < cell.length; k++) {
          const index = cell[k]!;
          if (index >= best) break;
          if (collides(this.items[index]!, item)) {
            best = index;
            break;
          }
        }
      }
    }
    return best === Infinity ? undefined : this.items[best];
  }

  /**
   * Same result as the plain firstReachableCollision scan: the smallest step
   * count over items that overlap on the cross axis. Visiting order does not
   * matter because the scan keeps a strict minimum.
   */
  firstReachable(
    item: LayoutItem,
    axis: Axis,
    start: number,
    consider: (other: LayoutItem, steps: number) => number
  ): number {
    let steps = Math.ceil(start);
    const seen = new Set<number>();
    const visit = (cell: number[] | undefined) => {
      if (cell === undefined) return;
      for (let k = 0; k < cell.length; k++) {
        const index = cell[k]!;
        if (seen.has(index)) continue;
        seen.add(index);
        steps = consider(this.items[index]!, steps);
      }
    };
    if (axis.pos === "x") {
      // Columns are few: visit every cell left of the item's far edge.
      const last = band(item.y + item.h - 1);
      for (let b = band(item.y); b <= last; b++)
        for (let column = 0; column < start + item.w; column++)
          visit(this.cell(column, b));
      return steps;
    }
    // Vertical: walk bands upward from the item. An item seen only in bands
    // below `b` ends by row b * BAND, so it is at least start - b * BAND + 1
    // steps away; stop once that cannot beat the best so far.
    for (let b = band(start + item.h - 1); b >= 0; b--) {
      if (Math.floor(start - (b + 1) * BAND) + 1 >= steps) break;
      for (let column = item.x; column < item.x + item.w; column++)
        visit(this.cell(column, b));
    }
    return steps;
  }
}

/**
 * For the not-yet-placed items (`sorted`), indexed by where they are now:
 * cross-axis unit (column for vertical, row band for horizontal), then
 * main-axis band. Compaction moves these items only along the main axis, and
 * resolveCollision reports each final write through `moved`.
 *
 * On integer geometry an item resolving at [p, p + size) can only collide
 * with items that overlap that range when its scan starts: every push inside
 * the scan lands at or past p + size, and pushes never move an item back. So
 * a snapshot of the overlapping items, checked in index order against their
 * current positions, visits every item the full scan would push.
 */
export class PendingIndex {
  /** Cross unit, then main-axis band, to ascending indices. */
  private readonly cells = new Map<number, Map<number, number[]>>();
  private readonly indices = new Map<LayoutItem, number>();

  constructor(
    layout: Layout,
    private readonly axis: Axis
  ) {
    for (let index = 0; index < layout.length; index++) {
      const item = layout[index];
      if (item === undefined || item.static) continue;
      this.indices.set(item, index);
      this.place(item, item[axis.pos], index, true);
    }
  }

  private firstUnit(item: LayoutItem): number {
    return this.axis.pos === "y" ? item.x : band(item.y);
  }

  private lastUnit(item: LayoutItem): number {
    return this.axis.pos === "y"
      ? item.x + item.w - 1
      : band(item.y + item.h - 1);
  }

  private place(item: LayoutItem, pos: number, index: number, add: boolean) {
    const firstUnit = this.firstUnit(item);
    const lastUnit = this.lastUnit(item);
    const lastBand = band(pos + item[this.axis.size] - 1);
    for (let unit = firstUnit; unit <= lastUnit; unit++) {
      let bands = this.cells.get(unit);
      if (bands === undefined) this.cells.set(unit, (bands = new Map()));
      for (let b = band(pos); b <= lastBand; b++) {
        let cell = bands.get(b);
        if (cell === undefined) bands.set(b, (cell = []));
        const at = firstAfter(cell, index - 1);
        if (add) cell.splice(at, 0, index);
        else if (cell[at] === index) cell.splice(at, 1);
      }
    }
  }

  /** Record that `item` moved along the main axis from `from`. */
  moved(item: LayoutItem, from: number): void {
    const index = this.indices.get(item);
    if (index === undefined || item[this.axis.pos] === from) return;
    this.place(item, from, index, false);
    this.place(item, item[this.axis.pos], index, true);
  }

  /** Ascending indices after `after` that overlap `item`'s cells now. */
  candidates(item: LayoutItem, after: number): number[] {
    let out: number[] = [];
    const firstUnit = this.firstUnit(item);
    const lastUnit = this.lastUnit(item);
    const pos = item[this.axis.pos];
    const lastBand = band(pos + item[this.axis.size] - 1);
    for (let unit = firstUnit; unit <= lastUnit; unit++) {
      const bands = this.cells.get(unit);
      if (bands === undefined) continue;
      for (let b = band(pos); b <= lastBand; b++) {
        const cell = bands.get(b);
        if (cell !== undefined) out = mergeAfter(out, cell, after);
      }
    }
    return out;
  }
}

/** Ascending union of `merged` and the entries of `cell` greater than `after`. */
function mergeAfter(merged: number[], cell: number[], after: number): number[] {
  let k = firstAfter(cell, after);
  if (k === cell.length) return merged;
  const out: number[] = [];
  let m = 0;
  while (m < merged.length || k < cell.length) {
    const a = m < merged.length ? merged[m]! : Infinity;
    const b = k < cell.length ? cell[k]! : Infinity;
    if (a <= b) {
      out.push(a);
      m++;
      if (a === b) k++;
    } else {
      out.push(b);
      k++;
    }
  }
  return out;
}

/** Position of the first entry greater than `from` in an ascending list. */
function firstAfter(list: number[], from: number): number {
  let lo = 0;
  let hi = list.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (list[mid]! <= from) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
