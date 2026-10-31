/** Pin fast compactor error, warning, ordering and geometry divergence. */
import {
  horizontalCompactor,
  horizontalOverlapCompactor,
  verticalCompactor,
  verticalOverlapCompactor
} from "../../../src/core/compactors";
import {
  fastVerticalCompactor,
  fastVerticalOverlapCompactor
} from "../../../src/extras/fastVerticalCompactor";
import {
  fastHorizontalCompactor,
  fastHorizontalOverlapCompactor
} from "../../../src/extras/fastHorizontalCompactor";
import type { Compactor, LayoutItem } from "../../../src/core/types";
import { expectGolden } from "../expectGolden";
import {
  assertCompacted,
  compact,
  compactionSamples,
  difference,
  orders
} from "./compaction";

const variants = {
  vertical: fastVerticalCompactor,
  "vertical-overlap": fastVerticalOverlapCompactor,
  horizontal: fastHorizontalCompactor,
  "horizontal-overlap": fastHorizontalOverlapCompactor
};
const regularGeometry = new Set([
  "empty",
  "single",
  "packed",
  "sparse",
  "tall",
  "cascade",
  "statics-scattered",
  "statics-blocking",
  "overlapping",
  "minmax",
  "large"
]);

// Full-output equality is a promise only for these explicit keyed scenarios.
// Other families still pin both results and their diff, even where they diverge.
const sharedAgreement = [
  "empty/1/forward",
  "empty/1/shuffled",
  "empty/17/forward",
  "empty/17/shuffled",
  "single/1/forward",
  "single/1/shuffled",
  "single/17/forward",
  "single/17/shuffled",
  "packed/1/forward",
  "packed/17/forward"
];
const agreement: Record<string, Set<string>> = {
  vertical: new Set([...sharedAgreement, "large/1/forward"]),
  horizontal: new Set(sharedAgreement),
  "vertical-overlap": new Set([
    "empty/1/forward",
    "empty/1/shuffled",
    "single/1/forward",
    "single/1/shuffled"
  ]),
  "horizontal-overlap": new Set([
    "empty/1/forward",
    "empty/1/shuffled",
    "single/1/forward",
    "single/1/shuffled"
  ])
};

function familyBug(name: string, family: string) {
  if (
    name.startsWith("vertical") &&
    [
      "infinity",
      "zero",
      "out-of-bounds",
      "fractional",
      "statics-scattered"
    ].includes(family)
  )
    return "c: fast vertical exceptional geometry, ordering and static moved flags differ from classic";
  if (
    name.startsWith("horizontal") &&
    ["infinity", "out-of-bounds"].includes(family)
  )
    return "d: fast horizontal allocation, bounds or negative-coordinate behavior differs from classic";
  return;
}

describe("golden fast compactors", () => {
  for (const [name, compactor] of Object.entries(variants)) {
    it(`${name}: records all seeded families, orders and caller-visible side effects`, () => {
      const records = compactionSamples
        // Full families (including overlap variants) are captured below once.
        .filter(sample => sample.family === "sparse" && sample.seed === 1)
        .filter(
          sample =>
            sample.family !== "large" ||
            (sample.order === "forward" && !name.includes("overlap"))
        )
        .map(sample => {
          const result = compact(compactor, sample.layout, sample.cols);
          const throws =
            name.startsWith("horizontal") && sample.family === "infinity";
          if (throws) {
            expect(result.error).toEqual({
              name: "RangeError",
              message: "Invalid array length"
            });
          } else {
            assertCompacted(result, {
              statics: true,
              noOverlaps:
                !name.includes("overlap") && regularGeometry.has(sample.family),
              bounds:
                name.startsWith("horizontal") &&
                regularGeometry.has(sample.family)
                  ? sample.cols
                  : undefined
            });
          }
          return {
            family: sample.family,
            seed: sample.seed,
            order: sample.order,
            knownBug: familyBug(name, sample.family),
            invariantException:
              sample.family === "duplicate-ids"
                ? "duplicate IDs are invalid and collision checks suppress matching IDs"
                : !regularGeometry.has(sample.family)
                  ? "nonstandard geometry is pinned without overlap/bounds guarantees"
                  : name.includes("overlap")
                    ? "overlap variant does not promise disjoint items"
                    : undefined,
            ...result
          };
        });
      expectGolden(`extras-fast/${name}/families`, records);
    });
  }

  it("classic and fast outputs agree on declared controls and pin every family difference", () => {
    const pairs = [
      {
        axis: "vertical",
        classic: verticalCompactor,
        fast: fastVerticalCompactor
      },
      {
        axis: "horizontal",
        classic: horizontalCompactor,
        fast: fastHorizontalCompactor
      },
      {
        axis: "vertical-overlap",
        classic: verticalOverlapCompactor,
        fast: fastVerticalOverlapCompactor
      },
      {
        axis: "horizontal-overlap",
        classic: horizontalOverlapCompactor,
        fast: fastHorizontalOverlapCompactor
      }
    ];
    const records = pairs.flatMap(({ axis, classic, fast }) =>
      compactionSamples
        .filter(
          sample =>
            sample.family !== "large" ||
            (sample.order === "forward" && !axis.includes("overlap"))
        )
        .map(sample => {
          const key = `${sample.family}/${sample.seed}/${sample.order}`;
          const classicResult = compact(classic, sample.layout, sample.cols);
          const fastResult = compact(fast, sample.layout, sample.cols);
          assertCompacted(classicResult, {
            statics: true,
            noOverlaps: !axis.includes("overlap")
          });
          if (!fastResult.error)
            assertCompacted(fastResult, {
              statics: true,
              noOverlaps:
                !axis.includes("overlap") && regularGeometry.has(sample.family)
            });
          else
            expect(fastResult.error).toEqual({
              name: "RangeError",
              message: "Invalid array length"
            });
          const diff = difference(classicResult, fastResult);
          if (agreement[axis]!.has(key)) {
            expect({ axis, key, output: fastResult.output }).toEqual({
              axis,
              key,
              output: classicResult.output
            });
            expect(fastResult.error).toBeUndefined();
          }
          return {
            axis,
            family: sample.family,
            seed: sample.seed,
            order: sample.order,
            expectedAgreement: agreement[axis]!.has(key),
            knownBug: familyBug(axis, sample.family),
            classic: classicResult,
            fast: fastResult,
            diff
          };
        })
    );
    expectGolden("extras-fast/classic-differential", records);
    // List every observed disagreement, rather than filtering to known bugs.
    expectGolden(
      "extras-fast/disagreement-families",
      [
        ...new Set(
          records
            .filter(
              record =>
                !record.diff.equalOutput ||
                record.diff.classicError ||
                record.diff.fastError
            )
            .map(record => `${record.axis}/${record.family}`)
        )
      ].sort()
    );
  });

  it("minimal B3 cases pin non-finite y, fractional tides, order and static moved flags", () => {
    const cases: { subcase: string; layout: LayoutItem[] }[] = [
      {
        subcase: "a-infinity-y",
        layout: [{ i: "a", x: 0, y: Infinity, w: 1, h: 1 }]
      },
      {
        subcase: "b-outside-columns",
        layout: [{ i: "a", x: 12, y: 3, w: 1, h: 1 }]
      },
      { subcase: "b-zero-width", layout: [{ i: "a", x: 0, y: 3, w: 0, h: 1 }] },
      {
        subcase: "c-fractional-x",
        layout: [
          { i: "a", x: 0.5, y: 0, w: 1, h: 1 },
          { i: "b", x: 0, y: 5, w: 1, h: 1 }
        ]
      },
      {
        subcase: "d-negative-x",
        layout: [
          { i: "a", x: -1, y: 0, w: 2, h: 1 },
          { i: "b", x: 0, y: 5, w: 1, h: 1 }
        ]
      },
      {
        subcase: "e-input-order",
        layout: [
          { i: "b", x: 0, y: 5, w: 1, h: 1 },
          { i: "a", x: 0, y: 0, w: 1, h: 1 }
        ]
      },
      {
        subcase: "f-static-moved",
        layout: [
          { i: "s", x: 0, y: 0, w: 1, h: 1, static: true, moved: true },
          { i: "a", x: 1, y: 3, w: 1, h: 1 }
        ]
      }
    ];
    const records = cases.flatMap(({ subcase, layout }) =>
      orders(layout).map(sample => {
        const classic = compact(verticalCompactor, sample.layout, 12);
        const fast = compact(fastVerticalCompactor, sample.layout, 12);
        assertCompacted(fast, { statics: true });
        if (subcase === "a-infinity-y")
          expect(Number.isNaN(fast.output![0]!.y)).toBe(true);
        if (subcase.startsWith("b-"))
          expect(fast.output![0]!.y).toBe(-Infinity);
        return {
          knownBug:
            "c: fast vertical exceptional geometry, ordering and static moved flags differ from classic",
          subcase,
          order: sample.order,
          classic,
          fast,
          diff: difference(classic, fast)
        };
      })
    );
    expectGolden("extras-fast/known-bug-c", records);
  });

  it("minimal B4 cases pin allocation errors, width warning, negative y and overlap displacement", () => {
    const cases: {
      subcase: string;
      layout: LayoutItem[];
      fast?: Compactor;
      classic?: Compactor;
    }[] = [
      {
        subcase: "a-infinity-y",
        layout: [{ i: "a", x: 0, y: Infinity, w: 1, h: 1 }]
      },
      {
        subcase: "a-fractional-y",
        layout: [{ i: "a", x: 0, y: 0.5, w: 1, h: 1 }]
      },
      {
        subcase: "a-fractional-h",
        layout: [{ i: "a", x: 0, y: 0, w: 1, h: 1.5 }]
      },
      { subcase: "b-too-wide", layout: [{ i: "a", x: 0, y: 0, w: 13, h: 1 }] },
      {
        subcase: "c-negative-y",
        layout: [{ i: "a", x: 3, y: -2, w: 1, h: 1 }]
      },
      {
        subcase: "d-overlap-pushes-right",
        layout: [
          { i: "a", x: 0, y: 0, w: 4, h: 1 },
          { i: "b", x: 1, y: 0, w: 1, h: 1 }
        ],
        fast: fastHorizontalOverlapCompactor,
        classic: horizontalOverlapCompactor
      }
    ];
    const records = cases.flatMap(testCase =>
      orders(testCase.layout).map(sample => {
        const classic = compact(
          testCase.classic ?? horizontalCompactor,
          sample.layout,
          12
        );
        const fast = compact(
          testCase.fast ?? fastHorizontalCompactor,
          sample.layout,
          12
        );
        if (testCase.subcase.startsWith("a-")) {
          expect(fast.error).toEqual({
            name: "RangeError",
            message: "Invalid array length"
          });
        } else {
          assertCompacted(fast);
        }
        if (testCase.subcase === "b-too-wide") {
          expect(fast.output![0]!.y).toBe(10_001);
          expect(fast.warnings).toEqual([
            [
              'Fast horizontal compactor: Item "a" exceeded max row limit (10001). This may indicate a layout that cannot be compacted within grid bounds.'
            ]
          ]);
        }
        return {
          knownBug:
            "d: fast horizontal throws on fractional or infinite extents and can displace items",
          subcase: testCase.subcase,
          order: sample.order,
          classic,
          fast,
          diff: difference(classic, fast)
        };
      })
    );
    expectGolden("extras-fast/known-bug-d", records);
  });

  it("overlap variants retain their distinct vertical and horizontal movement contracts", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 2, w: 4, h: 2 },
      { i: "b", x: 1, y: 3, w: 1, h: 1 }
    ];
    const records = orders(layout).flatMap(sample =>
      [
        {
          axis: "vertical",
          classic: verticalOverlapCompactor,
          fast: fastVerticalOverlapCompactor
        },
        {
          axis: "horizontal",
          classic: horizontalOverlapCompactor,
          fast: fastHorizontalOverlapCompactor
        }
      ].map(({ axis, classic, fast }) => {
        const classicResult = compact(classic, sample.layout, 12);
        const fastResult = compact(fast, sample.layout, 12);
        assertCompacted(fastResult);
        return {
          axis,
          order: sample.order,
          classic: classicResult,
          fast: fastResult,
          diff: difference(classicResult, fastResult)
        };
      })
    );
    expectGolden("extras-fast/overlap-semantics", records);
  });
});
