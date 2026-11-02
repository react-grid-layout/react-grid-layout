import { fastHorizontalCompactor } from "../../src/extras/fastHorizontalCompactor";
import { outcome, seededLayouts } from "./helpers/loopRewrite";
import { legacyFastHorizontalCompactor } from "./oracles/legacyFastHorizontalCompactor";

describe("fast horizontal compaction retains the pre-tide-storage finite-input contract", () => {
  it("matches output, mutation, identity and error names in 2,000 seeded cases", () => {
    // Intake clamps w/h to >= 1. Use the same supported-size domain as classic,
    // retaining fractional geometry, duplicates, aliases and overlapping statics.
    const generate = seededLayouts(20_261_104, true);
    let bothThrew = 0;
    for (let index = 0; index < 2000; index++) {
      const args = generate(index);
      const result = outcome(args, fastHorizontalCompactor.compact);
      expect({ index, result }).toEqual({
        index,
        result: outcome(args, legacyFastHorizontalCompactor.compact)
      });
      if (JSON.parse(result).threw) bothThrew++;
    }
    console.info(`fast horizontal: 2000 cases; both threw: ${bothThrew}`);
  });
});
