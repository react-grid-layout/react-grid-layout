import type { CompactType, LayoutItem } from "../../../src/core/types";
import {
  sortLayoutItems,
  sortLayoutItemsByColRow,
  sortLayoutItemsByRowCol
} from "../../../src/core/sort";
import { assertLayout, capture } from "../capture";
import { expectGolden } from "../expectGolden";
import { samples } from "../generators";

const modes: CompactType[] = ["vertical", "horizontal", "wrap", null];

describe("golden sorting", () => {
  it("pins stable ties, input-order preservation and direct axis helpers", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 2, y: 1, w: 1, h: 1 },
      { i: "b", x: 1, y: 2, w: 1, h: 1, static: true },
      { i: "tie-1", x: 1, y: 1, w: 1, h: 1 },
      { i: "tie-2", x: 1, y: 1, w: 2, h: 2 },
      { i: "negative", x: -1, y: -1, w: 1, h: 1 },
      { i: "fractional", x: 0.5, y: 0.5, w: 1, h: 1 },
      { i: "infinity", x: Infinity, y: Infinity, w: 1, h: 1 }
    ];
    expectGolden(
      "sort/ties-and-modes",
      [false, true].flatMap(reverse => {
        const ordered = reverse ? [...layout].reverse() : layout;
        return [
          ...modes.map(compactType =>
            capture({ layout: ordered, compactType }, args => {
              const output = sortLayoutItems(args.layout, args.compactType);
              assertLayout(args.layout, output, { statics: true });
              return output;
            })
          ),
          capture({ layout: ordered }, args => {
            const output = sortLayoutItemsByRowCol(args.layout);
            assertLayout(args.layout, output, { statics: true });
            return output;
          }),
          capture({ layout: ordered }, args => {
            const output = sortLayoutItemsByColRow(args.layout);
            assertLayout(args.layout, output, { statics: true });
            return output;
          })
        ];
      })
    );
  });

  it("pins generated families and empty arrays for every compact type", () => {
    expectGolden(
      "sort/generated",
      samples
        .filter(sample => sample.seed === 1 && sample.family !== "large")
        .map(sample => ({
          family: sample.family,
          seed: sample.seed,
          calls: modes.map(compactType =>
            capture({ layout: sample.layout, compactType }, args => {
              const output = sortLayoutItems(args.layout, args.compactType);
              assertLayout(args.layout, output, { statics: true });
              return output;
            })
          )
        }))
    );
  });

  it("pins sparse input densification without feeding undefined to unsafe algorithms", () => {
    const layout = new Array<LayoutItem>(4);
    layout[1] = { i: "a", x: 1, y: 1, w: 1, h: 1 };
    layout[3] = { i: "b", x: 0, y: 0, w: 1, h: 1 };
    expectGolden(
      "sort/holes",
      modes.map(compactType =>
        capture({ layout, compactType }, args =>
          sortLayoutItems(args.layout, args.compactType)
        )
      )
    );
  });
});
