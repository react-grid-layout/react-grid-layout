import { moveElement } from "../../src/core/layout";
import type { CompactType, LayoutItem } from "../../src/core/types";

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
      // preventCollision must roll back the target, which the detached copy
      // names by id. Nothing passed in is written.
      expect(result).toEqual([{ ...stored, moved: false }, obstacle]);
      expect(result[1]).toBe(obstacle);
      expect(detached).toEqual({ ...stored, moved: true });
      expect(layout[0]).toEqual({ i: "a", x: 0, y: 0, w: 1, h: 1 });
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
    const result = moveElement(
      layout,
      layout[0]!,
      2,
      3,
      false,
      false,
      "horizontal",
      12
    );
    expect(result[0]).toMatchObject({ x: 5, moved: true });
  });
});
