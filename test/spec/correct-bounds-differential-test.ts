import { correctBounds } from "../../src/core/layout";
import { outcome, seededLayouts } from "./helpers/loopRewrite";
import { legacyCorrectBounds } from "./oracles/legacyCorrectBounds";

describe("correctBounds retains the pre-sweep finite-input contract", () => {
  it("matches output, mutation, identity and error names in 2,000 seeded cases", () => {
    const generate = seededLayouts(20_261_101);
    // Exclude non-finite y: resolving static Infinity to a finite bottom is an
    // intentional PR 2328 change. All generated geometry is finite.
    for (let index = 0; index < 2000; index++) {
      const args = generate(index);
      expect({
        index,
        result: outcome(args, (layout, cols) => correctBounds(layout, { cols }))
      }).toEqual({
        index,
        result: outcome(args, (layout, cols) =>
          legacyCorrectBounds(layout, { cols })
        )
      });
    }
  });
});
