/* eslint-env jest */

/**
 * Performance Benchmark Tests
 *
 * These tests establish baseline performance metrics for react-grid-layout.
 * Run before and after changes to ensure no performance regressions.
 *
 * Usage:
 *   npm test -- --testPathPattern=benchmark
 *
 * The results are logged to console and stored in snapshots for comparison.
 */

import * as React from "react";
import { render, act as _act } from "@testing-library/react";
import ReactGridLayout from "../../src/legacy/ReactGridLayout";
import {
  compact,
  moveElement,
  sortLayoutItemsByRowCol,
  correctBounds
} from "../../src/legacy/utils-compat";

// Generate a layout with n items
function generateLayout(n, cols = 12) {
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

// Generate a messy (uncompacted) layout
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

// Measure execution time of a function
function measureTime(fn, iterations = 100) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  return (end - start) / iterations;
}

// Render component and measure time
function measureRenderTime(Component, props, iterations = 10) {
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const { unmount } = render(<Component {...props} />);
    const end = performance.now();
    times.push(end - start);
    unmount();
  }

  // Return median to reduce variance
  times.sort((a, b) => a - b);
  return times[Math.floor(times.length / 2)];
}

describe("Performance Benchmarks", () => {
  // Store results for snapshot comparison
  const benchmarkResults = {};

  afterAll(() => {
    // Format time value with appropriate units
    const formatTime = time => {
      if (typeof time !== "number") return String(time);
      if (time < 0.001) return `${(time * 1_000_000).toFixed(2)} ns`;
      if (time < 1) return `${(time * 1000).toFixed(2)} µs`;
      if (time < 1000) return `${time.toFixed(2)} ms`;
      return `${(time / 1000).toFixed(2)} s`;
    };

    // Group benchmarks by category
    const categories = {
      Compaction: [],
      Move: [],
      Sort: [],
      Bounds: [],
      Render: [],
      Simulation: []
    };

    Object.entries(benchmarkResults).forEach(([name, time]) => {
      if (name.startsWith("compact_"))
        categories["Compaction"].push([name, time]);
      else if (name.startsWith("move_")) categories["Move"].push([name, time]);
      else if (name.startsWith("sort_")) categories["Sort"].push([name, time]);
      else if (name.startsWith("correct_"))
        categories["Bounds"].push([name, time]);
      else if (name.startsWith("render_"))
        categories["Render"].push([name, time]);
      else if (name.startsWith("drag_"))
        categories["Simulation"].push([name, time]);
    });

    // Build formatted table as a single string to avoid Jest line annotations
    const lines = [
      "",
      "┌────────────────────────────────────────────────────────────────────┐",
      "│                      📊 Benchmark Results                          │",
      "├────────────────────────────────────────────────────────────────────┤",
      "│ Test                                              │ Time           │",
      "├───────────────────────────────────────────────────┼────────────────┤"
    ];

    Object.entries(categories).forEach(([category, results]) => {
      if (results.length === 0) return;
      // Category header
      lines.push(
        `│ ${category.toUpperCase().padEnd(49)} │                │`,
        "├───────────────────────────────────────────────────┼────────────────┤"
      );
      results.forEach(([name, time]) => {
        const displayName = name
          .replaceAll("_", " ")
          .replace(category.toLowerCase(), "")
          .trim();
        const timeStr = formatTime(time);
        lines.push(`│   ${displayName.padEnd(47)} │ ${timeStr.padStart(14)} │`);
      });
      lines.push(
        "├───────────────────────────────────────────────────┼────────────────┤"
      );
    });

    lines.push(
      "└────────────────────────────────────────────────────────────────────┘"
    );

    // Single console.log to avoid Jest annotations breaking up the table
    console.log(lines.join("\n"));
  });

  describe("Compaction Algorithm", () => {
    const testSizes = [100, 500, 1000];

    testSizes.forEach(size => {
      it(`compacts ${size} items (vertical)`, () => {
        const layout = generateMessyLayout(size);
        const time = measureTime(() => compact(layout, "vertical", 12), 10);
        benchmarkResults[`compact_vertical_${size}_items`] = time;

        // Ensure compaction completes in reasonable time
        // These thresholds should be adjusted based on baseline
        expect(time).toBeLessThan(size * 0.5); // 0.5ms per item max
      });

      it(`compacts ${size} items (horizontal)`, () => {
        const layout = generateMessyLayout(size);
        const time = measureTime(() => compact(layout, "horizontal", 12), 10);
        benchmarkResults[`compact_horizontal_${size}_items`] = time;

        expect(time).toBeLessThan(size * 0.5);
      });
    });
  });

  describe("Move Element", () => {
    const testSizes = [100, 500];

    testSizes.forEach(size => {
      it(`moves element in ${size} item layout`, () => {
        const layout = generateLayout(size);
        const item = layout[Math.floor(size / 2)];
        const time = measureTime(
          () => moveElement(layout, item, 5, 5, true, false, "vertical", 12),
          50
        );
        benchmarkResults[`move_element_${size}_items`] = time;

        expect(time).toBeLessThan(size * 0.2);
      });
    });
  });

  describe("Sort Layout", () => {
    const testSizes = [100, 500, 1000];

    testSizes.forEach(size => {
      it(`sorts ${size} items by row/col`, () => {
        const layout = generateMessyLayout(size);
        const time = measureTime(() => sortLayoutItemsByRowCol(layout), 10);
        benchmarkResults[`sort_${size}_items`] = time;

        // Sort should be O(n log n)
        expect(time).toBeLessThan(size * 0.05);
      });
    });
  });

  describe("Correct Bounds", () => {
    const testSizes = [100, 500, 1000];

    testSizes.forEach(size => {
      it(`corrects bounds for ${size} items`, () => {
        const layout = generateMessyLayout(size);
        const time = measureTime(() => correctBounds(layout, { cols: 12 }), 10);
        benchmarkResults[`correct_bounds_${size}_items`] = time;

        expect(time).toBeLessThan(size * 0.02);
      });
    });
  });

  describe("Component Render", () => {
    const testSizes = [50, 100, 200];

    testSizes.forEach(size => {
      it(`renders ${size} items`, () => {
        const layout = generateLayout(size);
        const children = layout.map(l => (
          <div key={l.i}>
            <span>{l.i}</span>
          </div>
        ));

        const time = measureRenderTime(
          ReactGridLayout,
          {
            layout,
            width: 1200,
            cols: 12,
            rowHeight: 30,
            children
          },
          5
        );
        benchmarkResults[`render_${size}_items`] = time;

        // Render should scale reasonably
        expect(time).toBeLessThan(size * 5); // 5ms per item max
      });
    });
  });

  describe("Full Drag Simulation", () => {
    it("simulates drag through 100-item layout", () => {
      const layout = generateLayout(100);
      const iterations = 10;

      // Simulate a drag from position 0,0 to 10,10 in 20 steps
      const time = measureTime(() => {
        let currentLayout = layout;
        const item = currentLayout[0];

        for (let step = 0; step < iterations; step++) {
          const x = Math.floor((step / iterations) * 10);
          const y = Math.floor((step / iterations) * 10);
          currentLayout = moveElement(
            currentLayout,
            { ...item, x, y },
            x,
            y,
            true,
            false,
            "vertical",
            12
          );
          currentLayout = compact(currentLayout, "vertical", 12);
        }
      }, 10);

      benchmarkResults["drag_simulation_100_items_20_steps"] = time;

      // Full drag should complete quickly for smooth 60fps
      expect(time).toBeLessThan(100); // 100ms for entire drag
    });
  });
});

describe("Benchmark Snapshot", () => {
  it("compaction output is deterministic (100 items)", () => {
    // Use seeded random for deterministic layout
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

    const compacted = compact(layout, "vertical", 12);

    // Snapshot the compaction result to detect algorithm changes
    expect(compacted).toMatchSnapshot();
  });

  it("compaction output is deterministic (horizontal, 100 items)", () => {
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

    const compacted = compact(layout, "horizontal", 12);
    expect(compacted).toMatchSnapshot();
  });
});
