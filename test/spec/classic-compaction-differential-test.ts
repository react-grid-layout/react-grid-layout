import { PendingIndex, indexable } from "../../src/core/compaction/cellIndex";
import { classicCompactor } from "../../src/core/compaction/classic";
import type { LayoutItem } from "../../src/core/types";
import { HORIZONTAL, VERTICAL } from "../../src/core/geometry/axis";
import type { Axis } from "../../src/core/geometry/axis";
import { outcome, seededLayouts } from "./helpers/loopRewrite";
import { legacyClassicCompactor } from "./oracles/legacyClassicCompactor";

describe("classic compaction retains the pre-jump finite-input contract", () => {
  it.each([VERTICAL, HORIZONTAL])(
    "matches output, mutation, identity and error names in 2,000 seeded cases ($pos)",
    axis => {
      // Intake clamps w/h to >= 1. Non-positive sizes are unsupported direct
      // core inputs, so compare only sizes >= 1, including fractions.
      const generate = seededLayouts(20_261_102, true);
      let bothThrew = 0;
      for (let index = 0; index < 2000; index++) {
        const args = generate(index);
        const result = outcome(args, classicCompactor(axis).compact);
        expect({
          index,
          result
        }).toEqual({
          index,
          result: outcome(args, legacyClassicCompactor(axis).compact)
        });
        if (JSON.parse(result).threw) bothThrew++;
      }
      console.info(`classic ${axis.pos}: 2000 cases; both threw: ${bothThrew}`);
    }
  );

  it.each([VERTICAL, HORIZONTAL])(
    "terminates with finite coordinates for unsupported non-positive sizes ($pos)",
    axis => {
      const layout = [
        { i: "static", x: -1, y: 1, w: 2, h: 0.1, static: true },
        { i: "movable", x: -1, y: -3, w: 0.5, h: 8 },
        { i: "negative", x: 0.5, y: 256, w: -1, h: -0 },
        { i: "zero", x: 2, y: 4, w: 0, h: -2 }
      ];
      const output = classicCompactor(axis).compact(layout, 2);
      expect(output).toHaveLength(layout.length);
      for (const item of output) {
        expect(Number.isFinite(item.x)).toBe(true);
        expect(Number.isFinite(item.y)).toBe(true);
      }
    }
  );
});

describe("classic compaction on the indexed path", () => {
  // Integer layouts with unique ids take the spatial indexes in cellIndex.ts.
  // The generic seeds above are mostly fractional, so they rarely reach them.
  function integerLayout(
    seed: number,
    size: { min: number; spread: number; statics?: number }
  ): { layout: LayoutItem[]; cols: number } {
    let state = seed;
    const random = () => {
      state = (state * 1_103_515_245 + 12_345) & 2_147_483_647;
      return state / 2_147_483_647;
    };
    const int = (n: number) => Math.floor(random() * n);
    const cols = 1 + int(12);
    const n = size.min + int(size.spread);
    const statics = size.statics ?? (random() < 0.4 ? 0 : random() * 0.25);
    const tall = size.statics === undefined && random() < 0.25;
    const layout = Array.from({ length: n }, (_, index) => {
      const w = 1 + int(Math.min(cols, 4));
      return {
        i: String(index),
        x: int(cols - w + 1),
        y: int(n),
        w,
        h: 1 + int(tall ? 12 : 3),
        ...(random() < statics ? { static: true } : {})
      };
    });
    return { layout, cols };
  }

  function matchesOracle(axis: Axis, args: ReturnType<typeof integerLayout>) {
    expect(indexable(args.layout, args.cols)).toBe(true);
    return {
      result: outcome(args, classicCompactor(axis).compact),
      expected: outcome(args, legacyClassicCompactor(axis).compact)
    };
  }

  it.each([VERTICAL, HORIZONTAL])(
    "matches output, mutation and identity in 300 integer layouts ($pos)",
    axis => {
      // At least 64 items: smaller layouts keep the plain scans.
      for (let index = 0; index < 300; index++) {
        const args = integerLayout(index + 1, { min: 64, spread: 60 });
        const { result, expected } = matchesOracle(axis, args);
        expect({ index, result }).toEqual({ index, result: expected });
      }
    }
  );

  it.each([VERTICAL, HORIZONTAL])(
    "matches the oracle where PendingIndex is built ($pos)",
    axis => {
      for (let index = 0; index < 30; index++) {
        const args = integerLayout(10_000 + index, {
          min: 220,
          spread: 60,
          statics: 0.1
        });
        expect(PendingIndex.worthwhile(args.layout, axis)).toBe(true);
        const { result, expected } = matchesOracle(axis, args);
        expect({ index, result }).toEqual({ index, result: expected });
      }
    }
  );
});

/** Map.get calls made by `run`. A counter, not a spy, so a regression that
 * makes millions of calls fails on the bound instead of exhausting the heap. */
function countMapLookups<T>(run: () => T): { result: T; lookups: number } {
  const original = Map.prototype.get;
  let lookups = 0;
  Map.prototype.get = function (this: Map<unknown, unknown>, key: unknown) {
    lookups++;
    return original.call(this, key);
  };
  try {
    return { result: run(), lookups };
  } finally {
    Map.prototype.get = original;
  }
}

describe("classic compaction index gate", () => {
  it("keeps grids under 64 items on the scan path", () => {
    const layout = Array.from({ length: 63 }, (_, k) => ({
      i: String(k),
      x: k % 12,
      y: Math.floor(k / 12),
      w: 1,
      h: 1
    }));
    expect(indexable(layout, 12)).toBe(false);
    expect(
      indexable([...layout, { i: "63", x: 0, y: 6, w: 1, h: 1 }], 12)
    ).toBe(true);
  });

  it.each([VERTICAL, HORIZONTAL])(
    "keeps repeated-id integer layouts on the scan path ($pos)",
    axis => {
      const args = {
        layout: [
          { i: "dup", x: 0, y: 0, w: 2, h: 2 },
          { i: "dup", x: 1, y: 1, w: 2, h: 2 },
          { i: "a", x: 0, y: 3, w: 1, h: 1, static: true }
        ],
        cols: 4
      };
      expect(indexable(args.layout, args.cols)).toBe(false);
      expect(outcome(args, classicCompactor(axis).compact)).toEqual(
        outcome(args, legacyClassicCompactor(axis).compact)
      );
    }
  );

  it.each([VERTICAL, HORIZONTAL])(
    "keeps a 1024-column grid on the scan path and matches the oracle ($pos)",
    axis => {
      const args = {
        layout: Array.from({ length: 40 }, (_, k) => ({
          i: `k${k}`,
          x: 0,
          y: k % 3,
          w: 1024,
          h: 1 + (k % 2),
          ...(k % 13 === 5 ? { static: true } : {})
        })),
        cols: 1024
      };
      expect(indexable(args.layout, args.cols)).toBe(false);
      expect(outcome(args, classicCompactor(axis).compact)).toEqual(
        outcome(args, legacyClassicCompactor(axis).compact)
      );
    }
  );

  it.each([VERTICAL, HORIZONTAL])(
    "falls back to the scan for full-width items on a 48-column grid ($pos)",
    axis => {
      // Without the wide-query fallbacks this fixture makes 279,128 (y) and
      // 413,888 (x) lookups; with them, about 5,000 and 15,000.
      const args = {
        layout: Array.from({ length: 80 }, (_, k) => ({
          i: `k${k}`,
          x: 0,
          y: k % 3,
          w: 48,
          h: 1 + (k % 2),
          ...(k % 13 === 5 ? { static: true } : {})
        })),
        cols: 48
      };
      expect(indexable(args.layout, args.cols)).toBe(true);
      const { lookups } = countMapLookups(() =>
        classicCompactor(axis).compact(
          args.layout.map(item => ({ ...item })),
          args.cols
        )
      );
      expect(lookups).toBeLessThan(40_000);
      expect(outcome(args, classicCompactor(axis).compact)).toEqual(
        outcome(args, legacyClassicCompactor(axis).compact)
      );
    }
  );

  it("does not index huge statics when nothing can move", () => {
    // 2,000 statics of 48 x 680 cells would be about 8 million cell writes.
    const layout = Array.from({ length: 2000 }, (_, k) => ({
      i: `s${k}`,
      x: 0,
      y: k * 680,
      w: 48,
      h: 680,
      static: true
    }));
    expect(indexable(layout, 48)).toBe(true);
    const { lookups } = countMapLookups(() =>
      classicCompactor(VERTICAL).compact(layout, 48)
    );
    expect(lookups).toBeLessThan(10_000);
  });

  it("walks only occupied bands for items a billion rows down", () => {
    // A column with no placed cells used to cost one Map lookup per empty
    // 8-row band between the item and row 0.
    const args = {
      layout: [
        { i: "static", x: 0, y: 1_000_000_000, w: 1, h: 1, static: true },
        { i: "far", x: 1, y: 1_000_000_000, w: 1, h: 1 },
        // Padding so the layout clears the index's minimum size.
        ...Array.from({ length: 70 }, (_, k) => ({
          i: `pad${k}`,
          x: 1,
          y: 1_000_000_001 + k,
          w: 1,
          h: 1
        }))
      ],
      cols: 2
    };
    expect(indexable(args.layout, args.cols)).toBe(true);
    // Count cell lookups, not milliseconds: the empty-band walk made about
    // 125 million Map.get calls at this y.
    const { result: output, lookups } = countMapLookups(() =>
      classicCompactor(VERTICAL).compact(args.layout, args.cols)
    );
    expect(lookups).toBeLessThan(10_000);
    // The frozen oracle steps one row at a time here, so it is not run.
    expect(output.find(item => item.i === "far")?.y).toBe(0);
    expect(output.find(item => item.i === "static")?.y).toBe(1_000_000_000);
  });
});

it("horizontal wrap on decimal geometry matches the pre-jump result", () => {
  // Found by the review gate after #2328: the wrap jump left a one-row gap.
  const layout = () => [
    { i: "0", x: 0, y: 1, w: 1.7, h: 1.7 },
    { i: "1", x: 12, y: 1.1, w: 1.1, h: 3 },
    { i: "2", x: 3, y: 0.7, w: 2, h: 3 }
  ];
  const actual = classicCompactor(HORIZONTAL).compact(layout(), 2);
  const expected = legacyClassicCompactor(HORIZONTAL).compact(layout(), 2);
  expect(actual.map(l => [l.x, l.y])).toEqual(expected.map(l => [l.x, l.y]));
});
