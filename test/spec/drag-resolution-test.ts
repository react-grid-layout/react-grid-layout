import { moveElement } from "../../src/core/layout";
import type { CompactType, LayoutItem } from "../../src/core/types";
import { copy } from "../golden/capture";
import { mulberry32 } from "../golden/rng";
import { serialize } from "../golden/serialize";
import { legacyMoveElement } from "./oracles/legacyMoveElement";

describe("drag collision candidates", () => {
  it.each<{
    compactType: CompactType;
    axis: "x" | "y";
    size: "w" | "h";
  }>([
    { compactType: "vertical", axis: "y", size: "h" },
    { compactType: "horizontal", axis: "x", size: "w" }
  ])(
    "retains NaN-size collisions for a detached target at infinity ($compactType)",
    ({ compactType, axis, size }) => {
      const stored: LayoutItem = { i: "a", x: 0, y: 0, w: 1, h: 1 };
      const obstacle: LayoutItem = {
        i: "b",
        x: 0,
        y: 0,
        w: 1,
        h: 1,
        [size]: Number.NaN
      };
      const layout = [stored, obstacle];
      const detached = { ...stored, moved: true };
      const result = moveElement(
        layout,
        detached,
        axis === "x" ? Infinity : undefined,
        axis === "y" ? Infinity : undefined,
        false,
        true,
        compactType,
        12
      );

      // Legacy collides treats a NaN interval end as overlapping infinity.
      // preventCollision must roll back the detached target and return the input.
      expect(result).toBe(layout);
      expect(detached).toEqual({ ...stored, moved: false });
      expect(layout[0]).toBe(stored);
      expect(layout[1]).toBe(obstacle);
    }
  );
});

describe("drag collision order with non-finite coordinates", () => {
  it("matches the full per-step sort when a NaN coordinate breaks the comparator", () => {
    // Review repro: binary reinsertion assumed a total order, which NaN does not
    // give. The original code re-sorted the whole layout on every step.
    const layout: LayoutItem[] = [
      { i: "0", x: Number.NaN, y: 2, w: 1, h: 1 },
      { i: "1", x: 2, y: 2, w: 3, h: 3, static: true },
      { i: "2", x: 3, y: 1, w: 2, h: 1 },
      { i: "3", x: Number.NaN, y: 3, w: 2, h: 2 }
    ];
    moveElement(layout, layout[0]!, 2, 3, false, false, "horizontal", 12);
    expect(layout[0]).toMatchObject({ x: 5, moved: true });
  });
});

describe("moveElement matches the pre-index implementation", () => {
  // Differential against a verbatim copy of the old code (test/spec/oracles),
  // over inputs the golden corpus avoids: NaN, +/-Infinity, negative and
  // fractional coordinates, duplicates and statics.
  const values = [0, 1, 2, 3, 5, -1, 0.5, 2.5, Infinity, -Infinity, Number.NaN];
  const compactTypes: CompactType[] = ["vertical", "horizontal", "wrap", null];

  function randomLayout(next: () => number): LayoutItem[] {
    const pick = <T>(xs: readonly T[]): T =>
      xs[Math.floor(next() * xs.length)]!;
    const size = 2 + Math.floor(next() * 7);
    return Array.from({ length: size }, (_, i) => ({
      i: next() < 0.1 ? "dup" : String(i),
      x: pick(values),
      y: pick(values),
      w: pick([1, 1, 2, 3, 0, Number.NaN]),
      h: pick([1, 1, 2, 3, 0, Number.NaN]),
      ...(next() < 0.2 ? { static: true } : {}),
      ...(next() < 0.1 ? { isDraggable: true } : {})
    }));
  }

  it("agrees on 2,000 seeded cases including non-finite geometry", () => {
    const next = mulberry32(20_261_031);
    for (let n = 0; n < 2000; n++) {
      const base = randomLayout(next);
      const target = Math.floor(next() * base.length);
      const x =
        next() < 0.8 ? values[Math.floor(next() * values.length)] : undefined;
      const y =
        next() < 0.8 ? values[Math.floor(next() * values.length)] : undefined;
      const compactType =
        compactTypes[Math.floor(next() * compactTypes.length)]!;
      const isUserAction = next() < 0.5;
      const preventCollision = next() < 0.3;
      const allowOverlap = next() < 0.2;

      // Some non-finite inputs recurse forever in both versions (x or y of
      // Infinity never changes under +1). Compare the outcome, including a
      // thrown RangeError; untrusted input is bounded before it reaches here.
      const run = (move: typeof moveElement) => {
        const layout = copy(base);
        try {
          const result = move(
            layout,
            layout[target]!,
            x,
            y,
            isUserAction,
            preventCollision,
            compactType,
            12,
            allowOverlap
          );
          return serialize({ layout, result, same: result === layout });
        } catch (error) {
          return serialize({ threw: (error as Error).name });
        }
      };
      expect(run(moveElement)).toBe(run(legacyMoveElement));
    }
  });
});
