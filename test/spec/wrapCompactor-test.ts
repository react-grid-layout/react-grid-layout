/**
 * Unit tests for wrapCompactor
 *
 * Tests the wrap compaction algorithm exported from src/extras/wrapCompactor.ts
 *
 * Based on tests from the original PR #1773 by John Thomson (@JohnThomson).
 */

import {
  wrapCompactor,
  wrapOverlapCompactor
} from "../../src/extras/wrapCompactor";
import type { Layout } from "../../src/core/types";

describe("wrapCompactor", () => {
  describe("basic properties", () => {
    it("has correct type", () => {
      expect(wrapCompactor.type).toBe("wrap");
    });

    it("has allowOverlap false", () => {
      expect(wrapCompactor.allowOverlap).toBe(false);
    });
  });

  describe("compact", () => {
    it("handles empty layout", () => {
      const layout: Layout = [];
      const compacted = wrapCompactor.compact(layout, 12);
      expect(compacted).toHaveLength(0);
    });

    it("handles single item", () => {
      const layout: Layout = [
        { i: "a", x: 5, y: 3, w: 1, h: 1, static: false, moved: false }
      ];

      const compacted = wrapCompactor.compact(layout, 6);
      expect(compacted[0]?.x).toBe(0);
      expect(compacted[0]?.y).toBe(0);
    });

    it("compacts items in reading order (left-to-right, top-to-bottom)", () => {
      // Items scattered across the grid
      const layout: Layout = [
        { i: "a", x: 3, y: 2, w: 1, h: 1, static: false, moved: false },
        { i: "b", x: 0, y: 1, w: 1, h: 1, static: false, moved: false },
        { i: "c", x: 2, y: 0, w: 1, h: 1, static: false, moved: false }
      ];

      // After compaction, items should be at positions 0, 1, 2
      const compacted = wrapCompactor.compact(layout, 6);

      // Find items by their i property
      const itemA = compacted.find(l => l.i === "a");
      const itemB = compacted.find(l => l.i === "b");
      const itemC = compacted.find(l => l.i === "c");

      // c was first in reading order (y=0), then b (y=1), then a (y=2)
      expect(itemC?.x).toBe(0);
      expect(itemC?.y).toBe(0);
      expect(itemB?.x).toBe(1);
      expect(itemB?.y).toBe(0);
      expect(itemA?.x).toBe(2);
      expect(itemA?.y).toBe(0);
    });

    it("wraps to next row when exceeding cols", () => {
      // 4 items in a 2-column grid
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 1, h: 1, static: false, moved: false },
        { i: "b", x: 1, y: 0, w: 1, h: 1, static: false, moved: false },
        { i: "c", x: 0, y: 1, w: 1, h: 1, static: false, moved: false },
        { i: "d", x: 1, y: 1, w: 1, h: 1, static: false, moved: false }
      ];

      const compacted = wrapCompactor.compact(layout, 2);

      // Items should form a 2x2 grid
      expect(compacted.find(l => l.i === "a")).toMatchObject({ x: 0, y: 0 });
      expect(compacted.find(l => l.i === "b")).toMatchObject({ x: 1, y: 0 });
      expect(compacted.find(l => l.i === "c")).toMatchObject({ x: 0, y: 1 });
      expect(compacted.find(l => l.i === "d")).toMatchObject({ x: 1, y: 1 });
    });

    it("respects static items", () => {
      const layout: Layout = [
        { i: "static", x: 1, y: 0, w: 1, h: 1, static: true, moved: false },
        { i: "a", x: 0, y: 0, w: 1, h: 1, static: false, moved: false },
        { i: "b", x: 2, y: 0, w: 1, h: 1, static: false, moved: false }
      ];

      const compacted = wrapCompactor.compact(layout, 4);

      // Static item should stay in place
      const staticItem = compacted.find(l => l.i === "static");
      expect(staticItem?.x).toBe(1);
      expect(staticItem?.y).toBe(0);

      // Other items should compact around it
      const itemA = compacted.find(l => l.i === "a");
      const itemB = compacted.find(l => l.i === "b");

      // 'a' goes to position 0, skips static at 1, 'b' goes to 2
      expect(itemA?.x).toBe(0);
      expect(itemB?.x).toBe(2);
    });

    it("preserves original array order in output", () => {
      const layout: Layout = [
        { i: "b", x: 1, y: 0, w: 1, h: 1, static: false, moved: false },
        { i: "a", x: 0, y: 0, w: 1, h: 1, static: false, moved: false }
      ];

      const compacted = wrapCompactor.compact(layout, 6);

      // Output order should match input order (b first, a second)
      expect(compacted[0]?.i).toBe("b");
      expect(compacted[1]?.i).toBe("a");
    });
  });
});

describe("wrapOverlapCompactor", () => {
  it("has correct type", () => {
    expect(wrapOverlapCompactor.type).toBe("wrap");
  });

  it("has allowOverlap true", () => {
    expect(wrapOverlapCompactor.allowOverlap).toBe(true);
  });

  it("compact clones without moving", () => {
    const layout: Layout = [
      { i: "a", x: 5, y: 3, w: 1, h: 1, static: false, moved: false },
      { i: "b", x: 2, y: 1, w: 1, h: 1, static: false, moved: false }
    ];

    const result = wrapOverlapCompactor.compact(layout, 6);

    // Items should stay where they are (no compaction)
    expect(result.find(l => l.i === "a")).toMatchObject({ x: 5, y: 3 });
    expect(result.find(l => l.i === "b")).toMatchObject({ x: 2, y: 1 });
  });
});

describe("Compactor interface compliance", () => {
  it("has required properties", () => {
    expect(wrapCompactor).toHaveProperty("type");
    expect(wrapCompactor).toHaveProperty("allowOverlap");
    expect(typeof wrapCompactor.compact).toBe("function");
  });

  it("compact returns an array", () => {
    const result = wrapCompactor.compact([], 12);
    expect(Array.isArray(result)).toBe(true);
  });

  it("compact preserves item count", () => {
    const layout: Layout = [
      { i: "a", x: 0, y: 0, w: 1, h: 1, static: false, moved: false },
      { i: "b", x: 1, y: 0, w: 1, h: 1, static: false, moved: false },
      { i: "c", x: 2, y: 0, w: 1, h: 1, static: false, moved: false }
    ];

    const result = wrapCompactor.compact(layout, 12);
    expect(result).toHaveLength(3);
  });

  it("compact preserves item properties", () => {
    const layout: Layout = [
      {
        i: "test",
        x: 0,
        y: 0,
        w: 2,
        h: 3,
        minW: 1,
        maxW: 4,
        minH: 1,
        maxH: 6,
        static: false,
        moved: false
      }
    ];

    const result = wrapCompactor.compact(layout, 12);
    const item = result[0];

    expect(item?.i).toBe("test");
    expect(item?.w).toBe(2);
    expect(item?.h).toBe(3);
    expect(item?.minW).toBe(1);
    expect(item?.maxW).toBe(4);
    expect(item?.minH).toBe(1);
    expect(item?.maxH).toBe(6);
  });
});
