import { wrapCompactor } from "../../src/extras/wrapCompactor";
import { outcome, seededLayouts } from "./helpers/loopRewrite";
import { legacyWrapCompactor } from "./oracles/legacyWrapCompactor";

describe("wrap compaction retains the pre-occupancy finite-input contract", () => {
  it("matches output, mutation, identity and error names in 2,000 seeded cases", () => {
    // Intake clamps w/h to >= 1. Use the same supported-size domain as classic,
    // retaining fractional geometry, duplicates, aliases and overlapping statics.
    const generate = seededLayouts(20_261_103, true);
    let bothThrew = 0;
    for (let index = 0; index < 2000; index++) {
      const args = generate(index);
      const result = outcome(args, wrapCompactor.compact);
      expect({ index, result }).toEqual({
        index,
        result: outcome(args, legacyWrapCompactor.compact)
      });
      if (JSON.parse(result).threw) bothThrew++;
    }
    console.info(`wrap: 2000 cases; both threw: ${bothThrew}`);
  });
});
