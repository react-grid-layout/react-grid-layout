/**
 * Unit tests for compactors
 *
 * Tests the compaction algorithms exported from src/core/compactors.ts
 */

import {
  verticalCompactor,
  horizontalCompactor,
  noCompactor,
  getCompactor,
  verticalOverlapCompactor,
  horizontalOverlapCompactor,
  noOverlapCompactor,
  type Compactor
} from "../../src/core/compactors";
import type { Layout } from "../../src/core/types";

describe("Compactors", () => {
  describe("verticalCompactor", () => {
    it("has correct type", () => {
      expect(verticalCompactor.type).toBe("vertical");
    });

    it("compacts items to the top", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 5, w: 2, h: 2, static: false, moved: false },
        { i: "b", x: 2, y: 10, w: 2, h: 2, static: false, moved: false }
      ];

      const compacted = verticalCompactor.compact(layout, 12);

      // Items should be moved to the top
      const itemA = compacted.find(l => l.i === "a");
      const itemB = compacted.find(l => l.i === "b");

      expect(itemA?.y).toBe(0);
      expect(itemB?.y).toBe(0);
    });

    it("stacks items vertically when they overlap horizontally", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2, static: false, moved: false },
        { i: "b", x: 0, y: 5, w: 2, h: 2, static: false, moved: false }
      ];

      const compacted = verticalCompactor.compact(layout, 12);

      const itemA = compacted.find(l => l.i === "a");
      const itemB = compacted.find(l => l.i === "b");

      // Item B should be stacked below item A
      expect(itemA?.y).toBe(0);
      expect(itemB?.y).toBe(2); // itemA.y + itemA.h
    });

    it("respects static items", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 5, w: 2, h: 2, static: true, moved: false },
        { i: "b", x: 0, y: 0, w: 2, h: 2, static: false, moved: false }
      ];

      const compacted = verticalCompactor.compact(layout, 12);

      const itemA = compacted.find(l => l.i === "a");
      const itemB = compacted.find(l => l.i === "b");

      // Static item A should stay in place
      expect(itemA?.y).toBe(5);
      // Item B should be at top (before the static item)
      expect(itemB?.y).toBe(0);
    });

    it("handles empty layout", () => {
      const layout: Layout = [];
      const compacted = verticalCompactor.compact(layout, 12);
      expect(compacted).toHaveLength(0);
    });

    it("handles single item", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 10, w: 2, h: 2, static: false, moved: false }
      ];

      const compacted = verticalCompactor.compact(layout, 12);
      expect(compacted[0]?.y).toBe(0);
    });

    it("preserves x position during vertical compaction", () => {
      const layout: Layout = [
        { i: "a", x: 5, y: 10, w: 2, h: 2, static: false, moved: false }
      ];

      const compacted = verticalCompactor.compact(layout, 12);
      expect(compacted[0]?.x).toBe(5);
      expect(compacted[0]?.y).toBe(0);
    });

    it("handles items at different x positions independently", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 5, w: 2, h: 2, static: false, moved: false },
        { i: "b", x: 4, y: 10, w: 2, h: 2, static: false, moved: false }
      ];

      const compacted = verticalCompactor.compact(layout, 12);

      const itemA = compacted.find(l => l.i === "a");
      const itemB = compacted.find(l => l.i === "b");

      // Both should be at y=0 since they don't overlap horizontally
      expect(itemA?.y).toBe(0);
      expect(itemB?.y).toBe(0);
    });
  });

  describe("horizontalCompactor", () => {
    it("has correct type", () => {
      expect(horizontalCompactor.type).toBe("horizontal");
    });

    it("compacts items to the left", () => {
      const layout: Layout = [
        { i: "a", x: 5, y: 0, w: 2, h: 2, static: false, moved: false },
        { i: "b", x: 10, y: 0, w: 2, h: 2, static: false, moved: false }
      ];

      const compacted = horizontalCompactor.compact(layout, 12);

      const itemA = compacted.find(l => l.i === "a");
      const itemB = compacted.find(l => l.i === "b");

      // Items should be moved to the left
      expect(itemA?.x).toBe(0);
      expect(itemB?.x).toBe(2); // Right after item A
    });

    it("stacks items horizontally when they overlap vertically", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2, static: false, moved: false },
        { i: "b", x: 5, y: 0, w: 2, h: 2, static: false, moved: false }
      ];

      const compacted = horizontalCompactor.compact(layout, 12);

      const itemA = compacted.find(l => l.i === "a");
      const itemB = compacted.find(l => l.i === "b");

      expect(itemA?.x).toBe(0);
      expect(itemB?.x).toBe(2); // itemA.x + itemA.w
    });

    it("handles empty layout", () => {
      const layout: Layout = [];
      const compacted = horizontalCompactor.compact(layout, 12);
      expect(compacted).toHaveLength(0);
    });

    it("preserves y position during horizontal compaction", () => {
      const layout: Layout = [
        { i: "a", x: 10, y: 5, w: 2, h: 2, static: false, moved: false }
      ];

      const compacted = horizontalCompactor.compact(layout, 12);
      expect(compacted[0]?.x).toBe(0);
      expect(compacted[0]?.y).toBe(5);
    });
  });

  describe("noCompactor", () => {
    it("has null type", () => {
      expect(noCompactor.type).toBe(null);
    });

    it("returns layout unchanged", () => {
      const layout: Layout = [
        { i: "a", x: 5, y: 10, w: 2, h: 2, static: false, moved: false },
        { i: "b", x: 0, y: 0, w: 2, h: 2, static: false, moved: false }
      ];

      const result = noCompactor.compact(layout, 12);

      expect(result).toEqual(layout);
    });

    it("handles empty layout", () => {
      const layout: Layout = [];
      const result = noCompactor.compact(layout, 12);
      expect(result).toHaveLength(0);
    });
  });

  describe("getCompactor", () => {
    it("returns verticalCompactor for 'vertical'", () => {
      const compactor = getCompactor("vertical");
      expect(compactor.type).toBe("vertical");
    });

    it("returns horizontalCompactor for 'horizontal'", () => {
      const compactor = getCompactor("horizontal");
      expect(compactor.type).toBe("horizontal");
    });

    it("returns noCompactor for null", () => {
      const compactor = getCompactor(null);
      expect(compactor.type).toBe(null);
    });

    it("returns noCompactor for undefined", () => {
      // @ts-expect-error Testing runtime behavior
      // eslint-disable-next-line unicorn/no-useless-undefined
      const compactor = getCompactor(undefined);
      expect(compactor.type).toBe(null);
    });
  });

  describe("Compactor interface compliance", () => {
    const compactors: Compactor[] = [
      verticalCompactor,
      horizontalCompactor,
      noCompactor
    ];

    compactors.forEach(compactor => {
      describe(`${compactor.type ?? "no"} compactor`, () => {
        it("has a type property", () => {
          expect(compactor).toHaveProperty("type");
        });

        it("has a compact method", () => {
          expect(typeof compactor.compact).toBe("function");
        });

        it("compact returns an array", () => {
          const result = compactor.compact([], 12);
          expect(Array.isArray(result)).toBe(true);
        });

        it("compact preserves item count", () => {
          const layout: Layout = [
            { i: "a", x: 0, y: 0, w: 1, h: 1, static: false, moved: false },
            { i: "b", x: 1, y: 0, w: 1, h: 1, static: false, moved: false },
            { i: "c", x: 2, y: 0, w: 1, h: 1, static: false, moved: false }
          ];

          const result = compactor.compact(layout, 12);
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

          const result = compactor.compact(layout, 12);
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
    });
  });

  describe("onMove implementations", () => {
    it("verticalCompactor.onMove updates item position", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2, static: false, moved: false },
        { i: "b", x: 2, y: 0, w: 2, h: 2, static: false, moved: false }
      ];

      const item = layout[0]!;
      const result = verticalCompactor.onMove(layout, item, 4, 2, 12);

      const movedItem = result.find(l => l.i === "a");
      expect(movedItem?.x).toBe(4);
      expect(movedItem?.y).toBe(2);
      expect(movedItem?.moved).toBe(true);
    });

    it("horizontalCompactor.onMove updates item position", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2, static: false, moved: false },
        { i: "b", x: 2, y: 0, w: 2, h: 2, static: false, moved: false }
      ];

      const item = layout[0]!;
      const result = horizontalCompactor.onMove(layout, item, 6, 3, 12);

      const movedItem = result.find(l => l.i === "a");
      expect(movedItem?.x).toBe(6);
      expect(movedItem?.y).toBe(3);
      expect(movedItem?.moved).toBe(true);
    });

    it("noCompactor.onMove updates item position", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2, static: false, moved: false }
      ];

      const item = layout[0]!;
      const result = noCompactor.onMove(layout, item, 5, 5, 12);

      const movedItem = result.find(l => l.i === "a");
      expect(movedItem?.x).toBe(5);
      expect(movedItem?.y).toBe(5);
      expect(movedItem?.moved).toBe(true);
    });

    it("onMove returns new layout (immutable)", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2, static: false, moved: false }
      ];

      const item = layout[0]!;
      const result = verticalCompactor.onMove(layout, item, 1, 1, 12);

      expect(result).not.toBe(layout);
      expect(result[0]).not.toBe(layout[0]);
    });

    it("onMove handles non-existent item gracefully", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2, static: false, moved: false }
      ];

      const nonExistentItem = {
        i: "z",
        x: 0,
        y: 0,
        w: 1,
        h: 1,
        static: false,
        moved: false
      };
      const result = verticalCompactor.onMove(
        layout,
        nonExistentItem,
        1,
        1,
        12
      );

      // Should return cloned layout without changes
      expect(result).toHaveLength(1);
      expect(result[0]?.i).toBe("a");
    });
  });

  describe("Overlap-allowing compactors", () => {
    it("verticalOverlapCompactor has allowOverlap true", () => {
      expect(verticalOverlapCompactor.allowOverlap).toBe(true);
      expect(verticalOverlapCompactor.type).toBe("vertical");
    });

    it("horizontalOverlapCompactor has allowOverlap true", () => {
      expect(horizontalOverlapCompactor.allowOverlap).toBe(true);
      expect(horizontalOverlapCompactor.type).toBe("horizontal");
    });

    it("noOverlapCompactor has allowOverlap true and type null", () => {
      expect(noOverlapCompactor.allowOverlap).toBe(true);
      expect(noOverlapCompactor.type).toBe(null);
    });

    it("verticalOverlapCompactor.compact clones without moving", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 5, w: 2, h: 2, static: false, moved: false },
        { i: "b", x: 0, y: 10, w: 2, h: 2, static: false, moved: false }
      ];

      const result = verticalOverlapCompactor.compact(layout, 12);

      // Items should stay where they are (no compaction)
      const itemA = result.find(l => l.i === "a");
      const itemB = result.find(l => l.i === "b");
      expect(itemA?.y).toBe(5);
      expect(itemB?.y).toBe(10);
    });

    it("horizontalOverlapCompactor.compact clones without moving", () => {
      const layout: Layout = [
        { i: "a", x: 5, y: 0, w: 2, h: 2, static: false, moved: false },
        { i: "b", x: 10, y: 0, w: 2, h: 2, static: false, moved: false }
      ];

      const result = horizontalOverlapCompactor.compact(layout, 12);

      // Items should stay where they are (no compaction)
      const itemA = result.find(l => l.i === "a");
      const itemB = result.find(l => l.i === "b");
      expect(itemA?.x).toBe(5);
      expect(itemB?.x).toBe(10);
    });
  });

  describe("getCompactor with allowOverlap", () => {
    it("returns verticalOverlapCompactor for vertical with allowOverlap", () => {
      const compactor = getCompactor("vertical", true);
      expect(compactor.type).toBe("vertical");
      expect(compactor.allowOverlap).toBe(true);
    });

    it("returns horizontalOverlapCompactor for horizontal with allowOverlap", () => {
      const compactor = getCompactor("horizontal", true);
      expect(compactor.type).toBe("horizontal");
      expect(compactor.allowOverlap).toBe(true);
    });

    it("returns noOverlapCompactor for null with allowOverlap", () => {
      const compactor = getCompactor(null, true);
      expect(compactor.type).toBe(null);
      expect(compactor.allowOverlap).toBe(true);
    });

    it("returns compactor with preventCollision flag", () => {
      const compactor = getCompactor("vertical", false, true);
      expect(compactor.type).toBe("vertical");
      expect(compactor.preventCollision).toBe(true);
    });
  });

  describe("Collision resolution", () => {
    it("resolves collision by moving items down", () => {
      // Create a layout where items need to push each other
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2, static: false, moved: false },
        { i: "b", x: 0, y: 0, w: 2, h: 2, static: false, moved: false } // Overlapping!
      ];

      const compacted = verticalCompactor.compact(layout, 12);

      const itemA = compacted.find(l => l.i === "a");
      const itemB = compacted.find(l => l.i === "b");

      // One should be at y=0, other at y=2
      expect(itemA?.y).toBe(0);
      expect(itemB?.y).toBe(2);
    });

    it("horizontal compactor resolves collisions by moving right", () => {
      // Create items that collide horizontally
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 4, h: 1, static: false, moved: false },
        { i: "b", x: 0, y: 0, w: 4, h: 1, static: false, moved: false } // Same position as a
      ];

      const compacted = horizontalCompactor.compact(layout, 12);

      const itemA = compacted.find(l => l.i === "a");
      const itemB = compacted.find(l => l.i === "b");

      // Items should not overlap - b should be pushed to x=4
      expect(itemA?.x).toBe(0);
      expect(itemB?.x).toBe(4);
    });
  });

  describe("Edge cases", () => {
    it("handles items with zero width", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 0, h: 2, static: false, moved: false }
      ];

      // Should not throw
      expect(() => verticalCompactor.compact(layout, 12)).not.toThrow();
    });

    it("handles items with zero height", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 0, static: false, moved: false }
      ];

      // Should not throw
      expect(() => verticalCompactor.compact(layout, 12)).not.toThrow();
    });

    it("handles items wider than cols", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 20, h: 2, static: false, moved: false }
      ];

      const compacted = verticalCompactor.compact(layout, 12);
      // Item should be compacted (implementation may clamp width)
      expect(compacted).toHaveLength(1);
    });

    it("handles negative positions", () => {
      const layout: Layout = [
        { i: "a", x: -5, y: -5, w: 2, h: 2, static: false, moved: false }
      ];

      const compacted = verticalCompactor.compact(layout, 12);
      // Should handle gracefully
      expect(compacted).toHaveLength(1);
    });

    it("handles very large layout", () => {
      const layout: Layout = [];
      for (let i = 0; i < 100; i++) {
        layout.push({
          i: `item-${i}`,
          x: i % 12,
          y: Math.floor(i / 12) * 2,
          w: 1,
          h: 2,
          static: false,
          moved: false
        });
      }

      const start = performance.now();
      const compacted = verticalCompactor.compact(layout, 12);
      const duration = performance.now() - start;

      expect(compacted).toHaveLength(100);
      // Should complete in reasonable time (< 100ms)
      expect(duration).toBeLessThan(100);
    });
  });
});
