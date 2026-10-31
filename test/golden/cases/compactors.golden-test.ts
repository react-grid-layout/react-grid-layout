/** Golden boundaries catch observable drift during compaction refactors. */
import {
  compactItemHorizontal,
  compactItemVertical,
  getCompactor,
  horizontalCompactor,
  horizontalOverlapCompactor,
  noCompactor,
  noOverlapCompactor,
  resolveCompactionCollision,
  verticalCompactor,
  verticalOverlapCompactor
} from "../../../src/core/compactors";
import type { CompactType, LayoutItem } from "../../../src/core/types";
import { capture } from "../capture";
import { expectGolden } from "../expectGolden";
import {
  assertCompacted,
  compact,
  compactionSamples,
  orders
} from "./compaction";

const implementations = {
  vertical: verticalCompactor,
  horizontal: horizontalCompactor,
  none: noCompactor,
  "vertical-overlap": verticalOverlapCompactor,
  "horizontal-overlap": horizontalOverlapCompactor,
  "none-overlap": noOverlapCompactor
};

// These families have positive integral geometry, unique IDs and compatible
// statics. Overlapping movable inputs are repaired by the classic compactors.
const resolvable = new Set([
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

describe("golden core compactors", () => {
  for (const [name, compactor] of Object.entries(implementations)) {
    it(`${name}: preserves positions, item shape, input mutation and identities`, () => {
      const records = compactionSamples
        // The differential corpus owns the full matrix for these four modes.
        // Keep focused cascade controls here instead of duplicating every call.
        .filter(sample => name === "none" || sample.family === "cascade")
        .filter(
          sample =>
            sample.family !== "large" ||
            (sample.order === "forward" &&
              (name === "vertical" || name === "horizontal"))
        )
        .map(sample => {
          const result = compact(compactor, sample.layout, sample.cols);
          const resolves = name === "vertical" || name === "horizontal";
          assertCompacted(result, {
            statics: true,
            noOverlaps: resolves,
            bounds:
              name === "horizontal" && resolvable.has(sample.family)
                ? sample.cols
                : undefined
          });
          return {
            family: sample.family,
            seed: sample.seed,
            order: sample.order,
            invariantException:
              sample.family === "duplicate-ids"
                ? "duplicate IDs suppress collision checks"
                : ["out-of-bounds", "fractional", "infinity", "zero"].includes(
                      sample.family
                    )
                  ? "nonstandard geometry is pinned without overlap/bounds guarantees"
                  : !resolves
                    ? "clone-only compactor preserves existing overlaps"
                    : undefined,
            ...result
          };
        });
      expectGolden(`compactors/${name}/families`, records);
    });
  }

  it("getCompactor executes every type, overlap and preventCollision combination", () => {
    const input: LayoutItem[] = [
      { i: "b", x: 2, y: 5, w: 1, h: 1, moved: true },
      { i: "a", x: 0, y: 0, w: 1, h: 2, static: true }
    ];
    const records = (
      ["vertical", "horizontal", "wrap", null, undefined] as const
    ).flatMap(type =>
      [false, true].flatMap(allowOverlap =>
        [false, true].flatMap(preventCollision =>
          orders(input).map(sample => {
            const first = getCompactor(
              type as CompactType,
              allowOverlap,
              preventCollision
            );
            const second = getCompactor(
              type as CompactType,
              allowOverlap,
              preventCollision
            );
            const result = compact(first, sample.layout, 4);
            assertCompacted(result, { statics: true });
            expect(first.type).toBe(
              type === "wrap" || type === undefined ? null : type
            );
            expect(first.allowOverlap).toBe(allowOverlap);
            expect(first === second).toBe(!preventCollision);
            return {
              knownBug:
                type === "wrap"
                  ? "m: getCompactor wrap dispatches to a null-type clone-only compactor"
                  : undefined,
              type,
              allowOverlap,
              preventCollision,
              order: sample.order,
              selected: {
                type: first.type,
                allowOverlap: first.allowOverlap,
                preventCollision: first.preventCollision
              },
              sameFactoryObject: first === second,
              ...result
            };
          })
        )
      )
    );
    expectGolden("compactors/factory", records);
  });

  it("classic cascades mutate original items, in both axes and input orders", () => {
    const vertical: LayoutItem[] = [
      { i: "s", x: 0, y: 0, w: 1, h: 1, static: true },
      { i: "b", x: 0, y: 0, w: 1, h: 1 },
      { i: "c", x: 0, y: 1, w: 1, h: 1 }
    ];
    const horizontal = vertical.map(item => ({
      ...item,
      x: item.y,
      y: item.x
    }));
    const records = [
      {
        name: "vertical",
        layout: vertical,
        compactor: verticalCompactor,
        axis: "y"
      },
      {
        name: "horizontal",
        layout: horizontal,
        compactor: horizontalCompactor,
        axis: "x"
      }
    ].flatMap(({ name, layout, compactor, axis }) =>
      orders(layout).map(sample => {
        const result = compact(compactor, sample.layout, 12);
        assertCompacted(result, { statics: true, noOverlaps: true });
        const changed = result.postInput[0].find(item => item.i === "c")!;
        expect(changed[axis as "x" | "y"]).toBe(2);
        return {
          mutationHazard: "M1-original-cascade-items",
          name,
          order: sample.order,
          ...result
        };
      })
    );
    // Preserve the scattered-static regression fixture from #1309, including
    // the original objects changed by recursive compaction, in both orders.
    const issue1309: LayoutItem[] = [
      { w: 59, h: 5, x: 0, y: 113, i: "A", static: true },
      { w: 59, h: 5, x: 0, y: 74, i: "B", static: true },
      { w: 59, h: 5, x: 0, y: 35, i: "C", static: true },
      { w: 40, h: 20, x: 0, y: 0, i: "D" },
      { w: 40, h: 20, x: 0, y: 20, i: "E" },
      { w: 20, h: 20, x: 0, y: 40, i: "F" },
      { w: 20, h: 20, x: 20, y: 40, i: "G" },
      { w: 20, h: 10, x: 0, y: 60, i: "H" },
      { w: 20, h: 10, x: 20, y: 60, i: "I" }
    ];
    for (const sample of orders(issue1309)) {
      const result = compact(verticalCompactor, sample.layout, 60);
      assertCompacted(result, { statics: true, noOverlaps: true, bounds: 60 });
      records.push({
        mutationHazard: "M1-original-cascade-items",
        name: "issue-1309",
        order: sample.order,
        ...result
      });
    }
    expectGolden("compactors/input-mutation", records);
  });

  it("repeated references leave a hole in classic output", () => {
    const shared: LayoutItem = { i: "a", x: 0, y: 3, w: 1, h: 1 };
    const records = [verticalCompactor, horizontalCompactor].map(compactor => {
      const result = compact(compactor, [shared, shared], 12);
      expect(result.output).toHaveLength(2);
      expect(0 in result.output!).toBe(true);
      expect(1 in result.output!).toBe(false);
      return {
        knownBug:
          "q: repeated references map to the first index and leave an output hole",
        detail: "repeated-reference-indexOf-output-hole",
        type: compactor.type,
        ...result
      };
    });
    expectGolden("compactors/repeated-reference-hole", records);
  });

  it("exported item helpers retain return aliases and mutate downstream items", () => {
    const records = (["vertical", "horizontal"] as const).flatMap(axis =>
      [false, true].map(staticBlocker => {
        const isVertical = axis === "vertical";
        const blocker: LayoutItem = {
          i: "s",
          x: 0,
          y: 0,
          w: 2,
          h: 2,
          static: staticBlocker
        };
        const item: LayoutItem = {
          i: "a",
          x: isVertical ? -1 : 5,
          y: isVertical ? 5 : -1,
          w: 2,
          h: 2
        };
        const later: LayoutItem = {
          i: "b",
          x: isVertical ? 0 : 2,
          y: isVertical ? 2 : 0,
          w: 2,
          h: 2
        };
        const args = {
          compareWith: [blocker],
          item,
          fullLayout: [blocker, item, later],
          cols: 4,
          maxY: 6
        };
        const result = capture(args, working =>
          isVertical
            ? compactItemVertical(
                working.compareWith,
                working.item,
                working.fullLayout,
                working.maxY
              )
            : compactItemHorizontal(
                working.compareWith,
                working.item,
                working.cols,
                working.fullLayout
              )
        );
        expect(result.error).toBeUndefined();
        expect(
          result.identity.aliases.some(alias =>
            alias.inputPaths.includes("$.item")
          )
        ).toBe(true);
        return { axis, staticBlocker, ...result };
      })
    );
    expectGolden("compactors/item-helpers", records);
  });

  it("resolver pins recursion, static skipping and explicit hasStatics controls", () => {
    const records = (["x", "y"] as const).flatMap(axis =>
      [undefined, false, true].map(hasStatics => {
        const layout: LayoutItem[] = [
          { i: "a", x: 0, y: 0, w: 1, h: 1 },
          {
            i: "b",
            x: axis === "x" ? 1 : 0,
            y: axis === "y" ? 1 : 0,
            w: 1,
            h: 1
          },
          {
            i: "c",
            x: axis === "x" ? 2 : 0,
            y: axis === "y" ? 2 : 0,
            w: 1,
            h: 1
          },
          { i: "s", x: 5, y: 5, w: 1, h: 1, static: true }
        ];
        const result = capture(
          { layout, item: layout[0]!, axis, hasStatics },
          working =>
            resolveCompactionCollision(
              working.layout,
              working.item,
              1,
              working.axis,
              working.hasStatics
            )
        );
        expect(result.error).toBeUndefined();
        expect(result.output).toBeUndefined();
        expect(result.postInput.layout[2]![axis]).toBe(3);
        return result;
      })
    );
    expectGolden("compactors/resolver-cascade", records);
  });

  it("suspected x-axis early break skips a later col-major collider", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 2, h: 1 },
      { i: "gap", x: 0, y: 10, w: 1, h: 1 },
      { i: "later", x: 1, y: 0, w: 1, h: 1 }
    ];
    const records = [undefined, false, true].map(hasStatics => {
      const result = capture(
        { layout, item: layout[0]!, hasStatics },
        working =>
          resolveCompactionCollision(
            working.layout,
            working.item,
            2,
            "x",
            working.hasStatics
          )
      );
      expect(result.error).toBeUndefined();
      expect(result.postInput.layout[2]!.x).toBe(hasStatics ? 4 : 1);
      return {
        knownBug:
          "o: suspected x-axis resolver early break uses row order in a column-sorted layout",
        status: "suspected-axis-optimization; direct-helper-control",
        ...result
      };
    });
    expectGolden("compactors/suspected-x-axis-early-break", records);
  });
});
