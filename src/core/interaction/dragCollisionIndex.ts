import type { CompactType, Layout, LayoutItem } from "../types.js";
import { collides } from "../collision.js";
import { sortLayoutItems } from "../sort.js";

type Entry = {
  item: LayoutItem;
  order: number;
  index: number;
  maxEnd: number;
};

/** A stable sorted view and interval bounds, repaired after each position write. */
export class DragCollisionIndex {
  private entries: Entry[] = [];
  private readonly inputOrder: Entry[] = [];
  private readonly byItem = new Map<LayoutItem, Entry[]>();
  private readonly axis: "x" | "y";
  private readonly cross: "x" | "y";
  private readonly size: "w" | "h";
  private searchable: boolean;

  constructor(
    layout: Layout,
    private readonly compactType: CompactType
  ) {
    this.axis = compactType === "horizontal" ? "x" : "y";
    this.cross = this.axis === "x" ? "y" : "x";
    this.size = this.axis === "x" ? "w" : "h";
    this.searchable = compactType !== null;
    for (let order = 0; order < layout.length; order++) {
      const item = layout[order];
      if (item === undefined) continue;
      const entry = { item, order, index: order, maxEnd: 0 };
      this.inputOrder.push(entry);
      const occurrences = this.byItem.get(item);
      if (occurrences === undefined) this.byItem.set(item, [entry]);
      else occurrences.push(entry);
      this.checkCoordinates(item);
    }
    this.sortFromInput();
  }

  /**
   * Order entries exactly as moveElement always has: sortLayoutItems over the
   * layout in input order. Used at construction and whenever a non-finite
   * coordinate makes the comparator inconsistent, because binary insertion
   * needs a total order and NaN does not provide one.
   */
  private sortFromInput(): void {
    const items = this.inputOrder.map(entry => entry.item);
    const sorted = sortLayoutItems(items, this.compactType);
    // Stable sort keeps repeated references in input order, so each item's
    // occurrences map back to its entries in sequence.
    const next = new Map<LayoutItem, number>();
    this.entries = sorted.map(item => {
      const occurrences = this.byItem.get(item) ?? [];
      const k = next.get(item) ?? 0;
      next.set(item, k + 1);
      const entry = occurrences[k];
      if (entry === undefined)
        throw new Error("DragCollisionIndex: item has no entry");
      return entry;
    });
    this.refresh(0);
  }

  private checkCoordinates(item: LayoutItem): void {
    if (!Number.isFinite(item.x) || !Number.isFinite(item.y)) {
      this.searchable = false;
    }
  }

  private compare(a: Entry, b: Entry): number {
    const primary = a.item[this.axis];
    const otherPrimary = b.item[this.axis];
    if (primary !== otherPrimary) return primary - otherPrimary;
    return a.item[this.cross] - b.item[this.cross] || a.order - b.order;
  }

  private refresh(start: number): void {
    let maxEnd = this.entries[start - 1]?.maxEnd ?? -Infinity;
    for (let i = start; i < this.entries.length; i++) {
      const entry = this.entries[i];
      if (entry === undefined) continue;
      const end = entry.item[this.axis] + entry.item[this.size];
      // Non-finite sizes must retain collides' existing comparison semantics.
      maxEnd = Math.max(maxEnd, Number.isNaN(end) ? Infinity : end);
      entry.maxEnd = maxEnd;
      entry.index = i;
    }
  }

  update(item: LayoutItem): void {
    this.checkCoordinates(item);
    const occurrences = this.byItem.get(item);
    if (this.compactType === null || occurrences === undefined) return;
    if (!this.searchable) {
      this.sortFromInput();
      return;
    }

    let start = this.entries.length;
    // Remove all occurrences before reinserting: a repeated reference changes
    // every sort key at once. Ties still use each occurrence's input ordinal.
    for (let i = occurrences.length - 1; i >= 0; i--) {
      const entry = occurrences[i];
      if (entry === undefined) continue;
      start = Math.min(start, entry.index);
      this.entries.splice(entry.index, 1);
    }
    for (let i = 0; i < occurrences.length; i++) {
      const entry = occurrences[i];
      if (entry === undefined) continue;
      let low = 0;
      let high = this.entries.length;
      while (low < high) {
        const mid = (low + high) >>> 1;
        const other = this.entries[mid];
        if (other !== undefined && this.compare(other, entry) < 0)
          low = mid + 1;
        else high = mid;
      }
      this.entries.splice(low, 0, entry);
      start = Math.min(start, low);
    }
    this.refresh(start);
  }

  getCollisions(item: LayoutItem, reverse: boolean): LayoutItem[] {
    let low = 0;
    let high = this.entries.length;
    const start = item[this.axis];
    const end = start + item[this.size];
    if (this.searchable && Number.isFinite(start) && !Number.isNaN(end)) {
      // Prefix maxima exclude intervals ending before this item, even when
      // a tall/wide item starts many rows/columns earlier.
      while (low < high) {
        const mid = (low + high) >>> 1;
        const entry = this.entries[mid];
        if (entry !== undefined && entry.maxEnd <= start) low = mid + 1;
        else high = mid;
      }
    }
    const collisions: LayoutItem[] = [];
    for (let i = low; i < this.entries.length; i++) {
      const entry = this.entries[i];
      if (entry === undefined) continue;
      if (this.searchable && entry.item[this.axis] >= end) break;
      if (collides(entry.item, item)) collisions.push(entry.item);
    }
    // Each caller owns its snapshot; later recursive moves only repair the view.
    return reverse ? collisions.reverse() : collisions;
  }
}
