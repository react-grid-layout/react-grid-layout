import * as core from "../../src/core/compactors";
import * as extras from "../../src/extras";
import type { Compactor, Layout, LayoutItem } from "../../src/core/types";
import { correctBounds } from "../../src/core/layout";
import { measure } from "./counters";

const compactors = Object.entries({ ...core, ...extras }).filter(
  (entry): entry is [string, Compactor] =>
    typeof entry[1] === "object" && entry[1] !== null && "compact" in entry[1]
);
const geometry = ["x", "y", "w", "h"] as const;
const item: LayoutItem = { i: "a", x: 0, y: 0, w: 1, h: 1 };

function expectFinite(layout: Layout): void {
  for (const cell of layout) {
    for (const field of geometry)
      expect(Number.isFinite(cell[field])).toBe(true);
  }
}

// The probe budget interrupts source loops, so the regression fails instead of
// hanging Jest. One seed shared by every export makes failures reproducible.
test.each(compactors)(
  "%s bounds work and returns finite geometry for 500 seeded hostile layouts",
  (name, compactor) => {
    let seed = 1_806_561_293;
    const random = (limit: number) => {
      seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
      return seed % limit;
    };
    const coordinates = [0, 1, 2, 10, Number.NaN, Infinity, -Infinity, 1e9];
    const sizes = [1, 2, 3, Number.NaN, Infinity, -Infinity, 1e9];
    const warning = jest.spyOn(console, "warn").mockImplementation(() => {});
    let maximumProbes = 0;
    try {
      for (let iteration = 0; iteration < 500; iteration++) {
        const cols = 1 + random(12);
        const layout = Array.from({ length: 1 + random(10) }, (_, index) => ({
          i: String(index),
          x: coordinates[random(coordinates.length)]!,
          y: coordinates[random(coordinates.length)]!,
          w: sizes[random(sizes.length)]!,
          h: sizes[random(sizes.length)]!,
          static: random(4) === 0
        }));
        let output: Layout = [];
        let counts;
        try {
          counts = measure(() => {
            output = compactor.compact(layout, cols);
          }, 100_000);
        } catch (error) {
          throw new Error(
            `${name} iteration ${iteration}, cols ${cols}, input ${JSON.stringify(layout, (_key, value) => (typeof value === "number" && !Number.isFinite(value) ? String(value) : value))}: ${String(error)}`
          );
        }
        maximumProbes = Math.max(
          maximumProbes,
          Object.entries(counts)
            .filter(([key]) => key.includes(":"))
            .reduce((sum, [, value]) => sum + value, 0)
        );
        expect(output).toHaveLength(layout.length);
        expectFinite(output);
      }
    } finally {
      warning.mockRestore();
    }
    console.log(name, "maximum probes per call", maximumProbes);
  }
);

test.each(compactors)(
  "%s normalizes each non-finite size to one and resolves append sentinels",
  (_name, compactor) => {
    for (const field of geometry) {
      for (const value of [Number.NaN, Infinity, -Infinity]) {
        const input = [{ ...item, static: true, [field]: value }];
        let output: Layout = [];
        measure(() => {
          output = compactor.compact(input, 12);
        }, 10_000);
        expectFinite(output);
        expect(output[0]![field]).toBe(field === "w" || field === "h" ? 1 : 0);
        expect(input[0]![field]).toBe(value);
      }
    }
    let output: Layout = [];
    measure(() => {
      output = compactor.compact(
        [
          { ...item, i: "base", h: 3 },
          { ...item, i: "append", static: true, y: Infinity }
        ],
        12
      );
    }, 10_000);
    expect(output.find(cell => cell.i === "append")!.y).toBe(3);
  }
);

test.each(["vertical", "horizontal"])(
  "direct %s compactItem normalizes its item and malformed blockers",
  axis => {
    for (const field of geometry) {
      for (const value of [Number.NaN, Infinity, -Infinity]) {
        const moving = { ...item, [field]: value };
        const blocker = {
          ...item,
          i: "blocker",
          static: true,
          x: Number.NaN,
          w: Infinity,
          h: -Infinity
        };
        measure(() => {
          if (axis === "vertical")
            core.compactItemVertical(
              [blocker],
              moving,
              [blocker, moving],
              Infinity
            );
          else
            core.compactItemHorizontal([blocker], moving, 12, [
              blocker,
              moving
            ]);
        }, 10_000);
        expectFinite([moving]);
        expect(moving.w).toBe(1);
        expect(moving.h).toBe(1);
      }
    }
  }
);

test("correctBounds and collision resolution accept malformed direct input", () => {
  const moving = {
    ...item,
    x: Number.NaN,
    y: Infinity,
    w: -Infinity,
    h: Infinity
  };
  const blocker = {
    ...item,
    i: "blocker",
    static: true,
    x: Infinity,
    y: Number.NaN,
    w: Number.NaN
  };
  measure(() => {
    correctBounds([blocker, moving], { cols: 12 });
  }, 10_000);
  expectFinite([blocker, moving]);
  moving.h = Number.NaN;
  measure(() => {
    core.resolveCompactionCollision([blocker, moving], moving, Infinity, "y");
  }, 10_000);
  expectFinite([blocker, moving]);
});

// A repeated row must stop at future-item intersections as well as blockers.
// This fixture caught skipping the fullLayout events in the row-jump algorithm.
test("horizontal row jumps preserve recursive mutations at future fractional items", () => {
  const input: LayoutItem[] = [
    { i: "0", x: 0, y: 6.5, w: 2, h: 4.5 },
    { i: "1", x: 3, y: 1, w: 1, h: 4, static: true },
    { i: "2", x: 0, y: 0.5, w: 4, h: 2.5 },
    { i: "3", x: 1, y: 11, w: 3, h: 4 },
    { i: "4", x: 1, y: 14.5, w: 2, h: 1.5 },
    { i: "5", x: 3, y: 9, w: 1, h: 5, static: true },
    { i: "6", x: 0, y: 14.5, w: 4, h: 1.5 },
    { i: "7", x: 1, y: 14, w: 3, h: 1 },
    { i: "8", x: 2, y: 6.5, w: 2, h: 4.5 }
  ];
  let output: Layout = [];
  measure(() => {
    output = core.horizontalCompactor.compact(input, 4);
  }, 10_000);
  expect(output.map(({ x, y }) => [x, y])).toEqual([
    [0, 14.5],
    [3, 1],
    [0, 5.5],
    [0, 21],
    [2, 14.5],
    [3, 9],
    [0, 19.5],
    [0, 25],
    [0, 26.5]
  ]);
  expect(input.map(({ x, y }) => [x, y])).toEqual([
    [8, 6.5],
    [3, 1],
    [0, 0.5],
    [6, 11],
    [12, 14.5],
    [3, 9],
    [6, 14.5],
    [9, 14],
    [10, 6.5]
  ]);
});
