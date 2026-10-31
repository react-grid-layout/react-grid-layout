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
      // preventCollision must roll back the detached target and return the input.
      expect(result).toBe(layout);
      expect(detached).toEqual({ ...stored, moved: false });
      expect(layout[0]).toBe(stored);
      expect(layout[1]).toBe(obstacle);
    }
  );
});
