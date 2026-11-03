import { indexable } from "../../src/core/compaction/cellIndex";
import { classicCompactor } from "../../src/core/compaction/classic";
import type { LayoutItem } from "../../src/core/types";
import { HORIZONTAL, VERTICAL } from "../../src/core/geometry/axis";
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
  function integerLayout(seed: number): { layout: LayoutItem[]; cols: number } {
    let state = seed;
    const random = () => {
      state = (state * 1_103_515_245 + 12_345) & 2_147_483_647;
      return state / 2_147_483_647;
    };
    const int = (n: number) => Math.floor(random() * n);
    const cols = 1 + int(12);
    const n = 1 + int(random() < 0.2 ? 100 : 40);
    const statics = random() < 0.4 ? 0 : random() * 0.25;
    const tall = random() < 0.25;
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

  it.each([VERTICAL, HORIZONTAL])(
    "matches output, mutation and identity in 1,000 integer layouts ($pos)",
    axis => {
      for (let index = 0; index < 1000; index++) {
        const args = integerLayout(index + 1);
        expect(indexable(args.layout, args.cols)).toBe(true);
        expect({
          index,
          result: outcome(args, classicCompactor(axis).compact)
        }).toEqual({
          index,
          result: outcome(args, legacyClassicCompactor(axis).compact)
        });
      }
    }
  );
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
