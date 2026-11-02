import { classicCompactor } from "../../src/core/compaction/classic";
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
