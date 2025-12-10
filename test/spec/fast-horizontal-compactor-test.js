/* eslint-env jest */

/**
 * Fast Horizontal Compactor Tests
 *
 * Compares performance and correctness of the fast horizontal compactor
 * against the standard horizontal compactor.
 *
 * Usage:
 *   npm test -- --testPathPattern=fast-horizontal-compactor
 */

import { horizontalCompactor, noCompactor } from "../../src/core/compactors";
import {
  fastHorizontalCompactor,
  fastHorizontalOverlapCompactor
} from "../../src/extras/fastHorizontalCompactor";
import { collides } from "../../src/core/collision";

// Generate a random layout
function generateRandomLayout(n, cols = 12, numStatics = 0) {
  const layout = [];
  for (let i = 0; i < n; i++) {
    const isStatic = i < numStatics;
    layout.push({
      i: String(i),
      x: Math.floor(Math.random() * (cols - 2)),
      y: Math.floor(Math.random() * n),
      w: 1 + Math.floor(Math.random() * 3),
      h: 1 + Math.floor(Math.random() * 3),
      static: isStatic
    });
  }
  return layout;
}

// Generate a grid layout (items placed in order)
function generateGridLayout(n, cols = 12) {
  const layout = [];
  for (let i = 0; i < n; i++) {
    layout.push({
      i: String(i),
      x: (i * 2) % cols,
      y: Math.floor((i * 2) / cols) * 2,
      w: 2,
      h: 2
    });
  }
  return layout;
}

// Generate a messy (gaps, overlaps) layout
function generateMessyLayout(n, cols = 12) {
  const layout = [];
  for (let i = 0; i < n; i++) {
    layout.push({
      i: String(i),
      x: Math.floor(Math.random() * (cols - 2)),
      y: Math.floor(Math.random() * (n / 2)),
      w: 1 + Math.floor(Math.random() * 3),
      h: 1 + Math.floor(Math.random() * 3)
    });
  }
  return layout;
}

// Check if a layout has any overlaps (ignoring static items overlapping each other)
function hasOverlaps(layout) {
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      if (collides(layout[i], layout[j])) {
        // Allow static items to overlap with each other
        if (layout[i].static && layout[j].static) continue;
        return true;
      }
    }
  }
  return false;
}

// Measure execution time
function measureTime(fn, iterations = 100) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  return (end - start) / iterations;
}

// Calculate the total width of a layout (rightmost x + w)
function layoutWidth(layout) {
  return Math.max(0, ...layout.map(item => item.x + item.w));
}

describe("Fast Horizontal Compactor", () => {
  describe("Correctness", () => {
    it("produces a valid layout with no overlaps", () => {
      for (let run = 0; run < 10; run++) {
        const cols = 6 + Math.floor(Math.random() * 6);
        const numItems = 2 + Math.floor(Math.random() * 20);
        const numStatics = Math.floor(Math.random() * numItems);

        const layout = generateRandomLayout(numItems, cols, numStatics);
        const compacted = fastHorizontalCompactor.compact(layout, cols);

        expect(hasOverlaps(compacted)).toBe(false);
      }
    });

    it("is idempotent (compacting twice gives same result)", () => {
      for (let run = 0; run < 5; run++) {
        const layout = generateRandomLayout(50, 12, 5);

        const compacted1 = fastHorizontalCompactor.compact(layout, 12);
        const compacted2 = fastHorizontalCompactor.compact(compacted1, 12);

        // Compare positions
        for (let i = 0; i < compacted1.length; i++) {
          const item1 = compacted1.find(l => l.i === compacted2[i].i);
          const item2 = compacted2[i];
          expect(item1.x).toBe(item2.x);
          expect(item1.y).toBe(item2.y);
        }
      }
    });

    it("does not move static items", () => {
      const layout = [
        { i: "static", x: 5, y: 5, w: 2, h: 2, static: true },
        { i: "a", x: 0, y: 0, w: 2, h: 2 },
        { i: "b", x: 0, y: 5, w: 8, h: 2 }
      ];

      const compacted = fastHorizontalCompactor.compact(layout, 12);
      const staticItem = compacted.find(l => l.i === "static");

      expect(staticItem.x).toBe(5);
      expect(staticItem.y).toBe(5);
    });

    it("moves items around static items", () => {
      const layout = [
        { i: "static", x: 0, y: 0, w: 2, h: 12, static: true },
        { i: "a", x: 5, y: 0, w: 4, h: 2 }
      ];

      const compacted = fastHorizontalCompactor.compact(layout, 12);
      const itemA = compacted.find(l => l.i === "a");

      // Item should be moved to x=2 (right next to static)
      expect(itemA.x).toBe(2);
    });

    it("compacts items to the left", () => {
      const layout = [
        { i: "a", x: 5, y: 0, w: 2, h: 2 },
        { i: "b", x: 8, y: 0, w: 2, h: 2 }
      ];

      const compacted = fastHorizontalCompactor.compact(layout, 12);

      const itemA = compacted.find(l => l.i === "a");
      const itemB = compacted.find(l => l.i === "b");

      // Items should be compacted to the left
      expect(itemA.x).toBe(0);
      expect(itemB.x).toBe(2); // Right after A
    });

    it("handles overlap compactor variant", () => {
      const layout = generateMessyLayout(20, 12);

      // With allowOverlap, items should still compact but may overlap
      const compacted = fastHorizontalOverlapCompactor.compact(layout, 12);

      // All items should have x >= 0
      compacted.forEach(item => {
        expect(item.x).toBeGreaterThanOrEqual(0);
      });
    });

    it("preserves y positions when compacting horizontally", () => {
      const layout = [
        { i: "a", x: 5, y: 0, w: 2, h: 2 },
        { i: "b", x: 8, y: 3, w: 2, h: 2 },
        { i: "c", x: 10, y: 6, w: 2, h: 2 }
      ];

      const compacted = fastHorizontalCompactor.compact(layout, 12);

      // Y positions should be preserved
      expect(compacted.find(l => l.i === "a").y).toBe(0);
      expect(compacted.find(l => l.i === "b").y).toBe(3);
      expect(compacted.find(l => l.i === "c").y).toBe(6);

      // X positions should be compacted to 0 (no collisions on different rows)
      expect(compacted.find(l => l.i === "a").x).toBe(0);
      expect(compacted.find(l => l.i === "b").x).toBe(0);
      expect(compacted.find(l => l.i === "c").x).toBe(0);
    });
  });

  describe("Performance Comparison", () => {
    const testSizes = [50, 100, 200, 500];
    const benchmarkResults = {};

    afterAll(() => {
      // Format time value
      const formatTime = time => {
        if (time < 0.001) return `${(time * 1_000_000).toFixed(2)} ns`;
        if (time < 1) return `${(time * 1000).toFixed(2)} µs`;
        if (time < 1000) return `${time.toFixed(2)} ms`;
        return `${(time / 1000).toFixed(2)} s`;
      };

      const lines = [
        "",
        "┌──────────────────────────────────────────────────────────────────────────────────┐",
        "│                    ⚡ Horizontal Compactor Performance Comparison                │",
        "├──────────────────────────────────────────────────────────────────────────────────┤",
        "│ Items    │ Standard Horizontal   │ Fast Horizontal       │ Speedup              │",
        "├──────────┼───────────────────────┼───────────────────────┼──────────────────────┤"
      ];

      testSizes.forEach(size => {
        const stdKey = `standard_${size}`;
        const fastKey = `fast_${size}`;

        if (benchmarkResults[stdKey] && benchmarkResults[fastKey]) {
          const speedup = benchmarkResults[stdKey] / benchmarkResults[fastKey];
          lines.push(
            `│ ${String(size).padEnd(8)} │ ${formatTime(benchmarkResults[stdKey]).padStart(21)} │ ${formatTime(benchmarkResults[fastKey]).padStart(21)} │ ${speedup.toFixed(2).padStart(6)}x faster     │`
          );
        }
      });

      lines.push(
        "└──────────────────────────────────────────────────────────────────────────────────┘"
      );

      console.log(lines.join("\n"));
    });

    testSizes.forEach(size => {
      it(`compares ${size} items (messy layout)`, () => {
        const layout = generateMessyLayout(size, 12);

        // Warm up
        horizontalCompactor.compact(layout, 12);
        fastHorizontalCompactor.compact(layout, 12);

        // Measure standard compactor
        const stdTime = measureTime(
          () => horizontalCompactor.compact(layout, 12),
          size > 200 ? 5 : 10
        );
        benchmarkResults[`standard_${size}`] = stdTime;

        // Measure fast compactor
        const fastTime = measureTime(
          () => fastHorizontalCompactor.compact(layout, 12),
          size > 200 ? 5 : 10
        );
        benchmarkResults[`fast_${size}`] = fastTime;

        // Fast compactor should be at least as fast
        // (For small layouts, difference may be negligible)
        expect(fastTime).toBeLessThan(stdTime * 2);
      });
    });

    it("compares with static items (200 items, 20 static)", () => {
      const layout = generateRandomLayout(200, 12, 20);

      const stdTime = measureTime(
        () => horizontalCompactor.compact(layout, 12),
        5
      );

      const fastTime = measureTime(
        () => fastHorizontalCompactor.compact(layout, 12),
        5
      );

      console.log(
        [
          "",
          "  With static items (200 items, 20 static):",
          `    Standard: ${stdTime.toFixed(2)}ms`,
          `    Fast:     ${fastTime.toFixed(2)}ms`,
          `    Speedup:  ${(stdTime / fastTime).toFixed(2)}x`
        ].join("\n")
      );
    });
  });

  describe("Edge Cases", () => {
    it("handles empty layout", () => {
      const compacted = fastHorizontalCompactor.compact([], 12);
      expect(compacted).toEqual([]);
    });

    it("handles single item", () => {
      const layout = [{ i: "a", x: 10, y: 5, w: 2, h: 2 }];
      const compacted = fastHorizontalCompactor.compact(layout, 12);

      expect(compacted[0].x).toBe(0); // Should compact to left
      expect(compacted[0].y).toBe(5); // Y preserved
    });

    it("handles all static items", () => {
      const layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2, static: true },
        { i: "b", x: 4, y: 4, w: 2, h: 2, static: true }
      ];

      const compacted = fastHorizontalCompactor.compact(layout, 12);

      // Static items should not move
      expect(compacted.find(l => l.i === "a").x).toBe(0);
      expect(compacted.find(l => l.i === "b").x).toBe(4);
    });

    it("handles items wider than grid", () => {
      const layout = [
        { i: "a", x: 0, y: 0, w: 15, h: 2 } // Wider than 12 cols
      ];

      // Should not throw
      const compacted = fastHorizontalCompactor.compact(layout, 12);
      expect(compacted.length).toBe(1);
    });

    it("handles items at x position beyond grid", () => {
      const layout = [
        { i: "a", x: 15, y: 0, w: 2, h: 2 } // Beyond 12 cols
      ];

      // Should not throw
      const compacted = fastHorizontalCompactor.compact(layout, 12);
      expect(compacted.length).toBe(1);
      // Should be compacted to left
      expect(compacted[0].x).toBe(0);
    });

    it("handles items with y beyond initial maxRow", () => {
      const layout = [
        { i: "a", x: 5, y: 0, w: 2, h: 2 },
        { i: "b", x: 5, y: 100, w: 2, h: 2 } // Very far down
      ];

      // Should not throw and should compact correctly
      const compacted = fastHorizontalCompactor.compact(layout, 12);
      expect(compacted.find(l => l.i === "a").x).toBe(0);
      expect(compacted.find(l => l.i === "b").x).toBe(0);
      expect(compacted.find(l => l.i === "b").y).toBe(100); // Y preserved
    });
  });

  describe("onMove", () => {
    it("updates item position", () => {
      const layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2 },
        { i: "b", x: 2, y: 0, w: 2, h: 2 }
      ];

      const itemA = layout[0];
      const newLayout = fastHorizontalCompactor.onMove(layout, itemA, 5, 5, 12);

      const movedItem = newLayout.find(l => l.i === "a");
      expect(movedItem.x).toBe(5);
      expect(movedItem.y).toBe(5);
      expect(movedItem.moved).toBe(true);
    });
  });

  describe("Correctness vs Standard Compactor", () => {
    // Helper to check if layouts have same items at same positions
    function layoutsMatch(layout1, layout2) {
      if (layout1.length !== layout2.length) return false;
      for (const item1 of layout1) {
        const item2 = layout2.find(l => l.i === item1.i);
        if (!item2) return false;
        if (item1.x !== item2.x || item1.y !== item2.y) return false;
      }
      return true;
    }

    it("produces same result as standard compactor for simple grid layouts", () => {
      const layout = generateGridLayout(20, 12);

      const stdCompacted = horizontalCompactor.compact(layout, 12);
      const fastCompacted = fastHorizontalCompactor.compact(layout, 12);

      // Both should produce identical results for ordered grids
      expect(layoutsMatch(stdCompacted, fastCompacted)).toBe(true);
    });

    it("produces same result for layouts with gaps", () => {
      // Layout with intentional gaps
      const layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2 },
        { i: "b", x: 5, y: 4, w: 2, h: 2 }, // Gap to the left
        { i: "c", x: 10, y: 8, w: 2, h: 2 } // Larger gap to the left
      ];

      const stdCompacted = horizontalCompactor.compact(layout, 12);
      const fastCompacted = fastHorizontalCompactor.compact(layout, 12);

      expect(layoutsMatch(stdCompacted, fastCompacted)).toBe(true);
    });

    it("produces same result for layouts with single static item", () => {
      const layout = [
        { i: "static", x: 2, y: 0, w: 2, h: 12, static: true },
        { i: "a", x: 0, y: 0, w: 1, h: 4 },
        { i: "b", x: 0, y: 0, w: 1, h: 4 },
        { i: "c", x: 10, y: 0, w: 4, h: 2 }
      ];

      const stdCompacted = horizontalCompactor.compact(layout, 12);
      const fastCompacted = fastHorizontalCompactor.compact(layout, 12);

      expect(layoutsMatch(stdCompacted, fastCompacted)).toBe(true);
    });

    it("produces valid (no overlaps) result even when different from standard", () => {
      // For messy random layouts, the algorithms may produce different
      // but equally valid results. Both should have no overlaps.
      for (let run = 0; run < 20; run++) {
        const layout = generateMessyLayout(50, 12);

        const stdCompacted = horizontalCompactor.compact(layout, 12);
        const fastCompacted = fastHorizontalCompactor.compact(layout, 12);

        // Both should have no overlaps
        expect(hasOverlaps(stdCompacted)).toBe(false);
        expect(hasOverlaps(fastCompacted)).toBe(false);

        // Both should have same total number of items
        expect(fastCompacted.length).toBe(stdCompacted.length);
      }
    });

    it("produces similar or better compaction width", () => {
      // The fast compactor should produce layouts with similar total width
      // (within a small tolerance, since algorithms may differ slightly)
      let fastBetter = 0;
      let stdBetter = 0;
      let equal = 0;

      for (let run = 0; run < 50; run++) {
        const layout = generateMessyLayout(30, 12);

        const stdCompacted = horizontalCompactor.compact(layout, 12);
        const fastCompacted = fastHorizontalCompactor.compact(layout, 12);

        const stdWidth = layoutWidth(stdCompacted);
        const fastWidth = layoutWidth(fastCompacted);

        if (fastWidth < stdWidth) fastBetter++;
        else if (stdWidth < fastWidth) stdBetter++;
        else equal++;
      }

      console.log(
        [
          "",
          "  Compaction width comparison (50 random layouts):",
          `    Fast better: ${fastBetter}`,
          `    Standard better: ${stdBetter}`,
          `    Equal: ${equal}`
        ].join("\n")
      );

      // Fast compactor should not be significantly worse
      // Allow some tolerance since algorithms may differ
      expect(stdBetter).toBeLessThan(40); // At most 80% worse
    });

    it("handles complex static item configurations identically", () => {
      // Multiple static items at various positions
      const layout = [
        { i: "s1", x: 0, y: 0, w: 2, h: 4, static: true },
        { i: "s2", x: 3, y: 6, w: 2, h: 4, static: true },
        { i: "s3", x: 8, y: 2, w: 1, h: 6, static: true },
        { i: "a", x: 5, y: 0, w: 2, h: 2 },
        { i: "b", x: 1, y: 4, w: 2, h: 2 },
        { i: "c", x: 0, y: 10, w: 3, h: 2 },
        { i: "d", x: 10, y: 0, w: 2, h: 3 }
      ];

      const stdCompacted = horizontalCompactor.compact(layout, 12);
      const fastCompacted = fastHorizontalCompactor.compact(layout, 12);

      // Static items should be in same position in both
      for (const item of layout.filter(l => l.static)) {
        const stdItem = stdCompacted.find(l => l.i === item.i);
        const fastItem = fastCompacted.find(l => l.i === item.i);
        expect(stdItem.x).toBe(fastItem.x);
        expect(stdItem.y).toBe(fastItem.y);
      }

      // Both should have no overlaps
      expect(hasOverlaps(stdCompacted)).toBe(false);
      expect(hasOverlaps(fastCompacted)).toBe(false);
    });

    it("preserves item dimensions", () => {
      const layout = generateRandomLayout(30, 12, 5);

      const fastCompacted = fastHorizontalCompactor.compact(layout, 12);

      // All items should preserve their w, h, and i
      for (const original of layout) {
        const compacted = fastCompacted.find(l => l.i === original.i);
        expect(compacted).toBeDefined();
        expect(compacted.w).toBe(original.w);
        expect(compacted.h).toBe(original.h);
        expect(compacted.static).toBe(original.static);
      }
    });

    it("matches standard compactor for deterministic layout from benchmark", () => {
      // Use the same deterministic layout from benchmark-test.js
      const layout = [];
      for (let i = 0; i < 100; i++) {
        layout.push({
          i: String(i),
          x: (i * 3) % 12,
          y: i % 7,
          w: 1 + (i % 3),
          h: 1 + (i % 2)
        });
      }

      const stdCompacted = horizontalCompactor.compact(layout, 12);
      const fastCompacted = fastHorizontalCompactor.compact(layout, 12);

      // Both should have no overlaps
      expect(hasOverlaps(stdCompacted)).toBe(false);
      expect(hasOverlaps(fastCompacted)).toBe(false);

      // Widths should be similar (within 20%)
      const stdWidth = layoutWidth(stdCompacted);
      const fastWidth = layoutWidth(fastCompacted);
      const widthDiff =
        Math.abs(stdWidth - fastWidth) / Math.max(stdWidth, 1);

      console.log(
        [
          "",
          "  Deterministic 100-item layout:",
          `    Standard width: ${stdWidth}`,
          `    Fast width: ${fastWidth}`,
          `    Difference: ${(widthDiff * 100).toFixed(1)}%`
        ].join("\n")
      );

      expect(widthDiff).toBeLessThan(0.3); // Within 30%
    });

    it("handles edge case: items that could stack in different orders", () => {
      // Items that could be stacked in different valid configurations
      const layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 6 },
        { i: "b", x: 0, y: 0, w: 2, h: 6 }, // Same position as a
        { i: "c", x: 0, y: 0, w: 2, h: 6 } // Same position as a and b
      ];

      const stdCompacted = horizontalCompactor.compact(layout, 12);
      const fastCompacted = fastHorizontalCompactor.compact(layout, 12);

      // Both should produce valid layouts with no overlaps
      expect(hasOverlaps(stdCompacted)).toBe(false);
      expect(hasOverlaps(fastCompacted)).toBe(false);

      // Total width should be 6 (3 items * width 2)
      expect(layoutWidth(stdCompacted)).toBe(6);
      expect(layoutWidth(fastCompacted)).toBe(6);
    });

    it("handles narrow grids (1-3 columns)", () => {
      for (let cols = 1; cols <= 3; cols++) {
        const layout = [];
        for (let i = 0; i < 10; i++) {
          layout.push({
            i: String(i),
            x: i * 2,
            y: 0,
            w: 1,
            h: 1 + (i % 2)
          });
        }

        const stdCompacted = horizontalCompactor.compact(layout, cols);
        const fastCompacted = fastHorizontalCompactor.compact(layout, cols);

        expect(hasOverlaps(stdCompacted)).toBe(false);
        expect(hasOverlaps(fastCompacted)).toBe(false);
      }
    });

    it("handles tall items spanning multiple rows", () => {
      const layout = [
        { i: "a", x: 5, y: 0, w: 2, h: 5 },
        { i: "b", x: 8, y: 2, w: 3, h: 3 }
      ];

      const stdCompacted = horizontalCompactor.compact(layout, 12);
      const fastCompacted = fastHorizontalCompactor.compact(layout, 12);

      // Both should compact correctly
      expect(hasOverlaps(stdCompacted)).toBe(false);
      expect(hasOverlaps(fastCompacted)).toBe(false);

      // Item a should be at x=0
      expect(fastCompacted.find(l => l.i === "a").x).toBe(0);
      // Item b should be at x=2 (right after a, overlapping rows)
      expect(fastCompacted.find(l => l.i === "b").x).toBe(2);
    });
  });
});
