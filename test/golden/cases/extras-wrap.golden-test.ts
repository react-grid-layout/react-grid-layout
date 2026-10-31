/** Pin paragraph flow, clone-only overlap mode, and variable-size defects. */
import {
  wrapCompactor,
  wrapOverlapCompactor
} from "../../../src/extras/wrapCompactor";
import type { LayoutItem } from "../../../src/core/types";
import { capture } from "../capture";
import { expectGolden } from "../expectGolden";
import {
  assertCompacted,
  compact,
  compactionSamples,
  orders
} from "./compaction";

const supported = new Set([
  "empty",
  "single",
  "packed",
  "statics-scattered",
  "large"
]);

describe("golden wrap compactors", () => {
  for (const [name, compactor] of Object.entries({
    wrap: wrapCompactor,
    overlap: wrapOverlapCompactor
  })) {
    it(`${name}: records seeded flow, stable ties, static positions and clone identity`, () => {
      const records = compactionSamples
        .filter(
          sample =>
            sample.family !== "large" ||
            (sample.order === "forward" && name === "wrap")
        )
        .map(sample => {
          const result = compact(compactor, sample.layout, sample.cols);
          assertCompacted(result, {
            statics: true,
            noOverlaps: name === "wrap" && supported.has(sample.family),
            bounds:
              name === "wrap" && supported.has(sample.family)
                ? sample.cols
                : undefined
          });
          return {
            family: sample.family,
            seed: sample.seed,
            order: sample.order,
            invariantException:
              name === "overlap"
                ? "overlap variant clones existing geometry"
                : sample.family === "duplicate-ids"
                  ? "duplicate IDs are invalid input"
                  : !supported.has(sample.family)
                    ? "wrap's disjointness contract assumes 1x1 items and valid statics"
                    : undefined,
            ...result
          };
        });
      expectGolden(`extras-wrap/${name}/families`, records);
    });
  }

  it("minimal B5a and B5b pin tall overlap and a wide item's collision with a static cell", () => {
    const cases: { subcase: string; cols: number; layout: LayoutItem[] }[] = [
      {
        subcase: "a-tall-overlap",
        cols: 2,
        layout: [
          { i: "a", x: 0, y: 0, w: 1, h: 2 },
          { i: "b", x: 1, y: 0, w: 1, h: 1 },
          { i: "c", x: 0, y: 1, w: 1, h: 1 }
        ]
      },
      {
        subcase: "b-wide-over-static",
        cols: 4,
        layout: [
          { i: "s", x: 1, y: 0, w: 1, h: 1, static: true },
          { i: "a", x: 0, y: 0, w: 2, h: 1 }
        ]
      }
    ];
    const records = cases.flatMap(testCase =>
      orders(testCase.layout).map(sample => {
        const result = compact(wrapCompactor, sample.layout, testCase.cols);
        assertCompacted(result, { statics: true });
        return {
          knownBug:
            "e: wrap tests only the first cell and advances by width, ignoring height",
          subcase: testCase.subcase,
          cols: testCase.cols,
          order: sample.order,
          ...result
        };
      })
    );
    expectGolden("extras-wrap/known-bug-e-geometry", records);
  });

  it("B5c bounds the static Infinity fill with an explicit cell budget", () => {
    const layout: LayoutItem[] = [
      { i: "s", x: 0, y: 0, w: 1, h: Infinity, static: true },
      { i: "a", x: 1, y: 3, w: 1, h: 1 }
    ];
    const records = orders(layout).map(sample => {
      const budget = 64;
      const visited: number[] = [];
      let attempts = 0;
      const result = capture([sample.layout, 4] as const, ([working, cols]) => {
        const originalAdd = Set.prototype.add;
        Set.prototype.add = function <T>(this: Set<T>, value: T): Set<T> {
          attempts++;
          if (attempts > budget) throw new Error("static cell budget exceeded");
          visited.push(value as number);
          return originalAdd.call(this, value) as Set<T>;
        };
        try {
          return wrapCompactor.compact(working, cols);
        } finally {
          Set.prototype.add = originalAdd;
        }
      });
      expect(result.error).toEqual({
        name: "Error",
        message: "static cell budget exceeded"
      });
      expect(attempts).toBe(65);
      expect(visited).toHaveLength(64);
      return {
        knownBug:
          "e: wrap static h Infinity exhausts a deterministic cell budget",
        subcase: "c-infinity-static",
        order: sample.order,
        boundedProbe: {
          kind: "Set.add step budget",
          budget,
          attempts,
          visited,
          limitation:
            "observes 65 attempted cells; does not claim to execute an infinite loop to completion"
        },
        ...result
      };
    });
    expectGolden("extras-wrap/known-bug-e-static-infinity-budget", records);
  });

  it("one-cell items flow around every occupied static cell and preserve input order", () => {
    const layout: LayoutItem[] = [
      { i: "late", x: 2, y: 9, w: 1, h: 1, moved: true },
      { i: "s", x: 1, y: 0, w: 1, h: 2, static: true, moved: true },
      { i: "first", x: 0, y: 0, w: 1, h: 1 },
      { i: "tie", x: 0, y: 0, w: 1, h: 1 }
    ];
    const records = orders(layout).map(sample => {
      const result = compact(wrapCompactor, sample.layout, 2);
      assertCompacted(result, { statics: true, noOverlaps: true, bounds: 2 });
      expect(result.output!.map(item => item.i)).toEqual(
        sample.layout.map(item => item.i)
      );
      expect(result.output!.every(item => item.moved === false)).toBe(true);
      return { order: sample.order, ...result };
    });
    expectGolden("extras-wrap/static-cells-and-ties", records);
  });

  it("overlap mode clones without repositioning even tall items and Infinity statics", () => {
    // The clone-only overlap path never enters the unbounded static-cell fill.
    const layout: LayoutItem[] = [
      { i: "s", x: 1, y: 0, w: 1, h: Infinity, static: true, moved: true },
      { i: "a", x: 0, y: 3, w: 2, h: 2, moved: true }
    ];
    const records = orders(layout).map(sample => {
      const result = compact(wrapOverlapCompactor, sample.layout, 2);
      assertCompacted(result, { statics: true });
      expect(
        result.output!.map(({ i, x, y, w, h, moved }) => ({
          i,
          x,
          y,
          w,
          h,
          moved
        }))
      ).toEqual(
        sample.layout.map(({ i, x, y, w, h, moved }) => ({
          i,
          x,
          y,
          w,
          h,
          moved
        }))
      );
      return { order: sample.order, ...result };
    });
    expectGolden("extras-wrap/overlap-clone-contract", records);
  });
});
