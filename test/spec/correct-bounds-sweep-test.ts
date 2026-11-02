import type { LayoutItem } from "../../src/core/types";
import {
  advanceRows,
  bottom,
  correctBounds,
  getStatics
} from "../../src/core/layout";
import { getFirstCollision } from "../../src/core/collision";

// Review-round-1 implementation. Preserve its first-collision order and jumps
// as an independent compatibility oracle for the sorted sweep.
function previousBounds(layout: LayoutItem[], cols: number): LayoutItem[] {
  const colliders = getStatics(layout);
  for (const item of layout) {
    if (item.x + item.w > cols) item.x = cols - item.w;
    if (item.x < 0) {
      item.x = 0;
      item.w = cols;
    }
    if (item.y === Infinity)
      item.y = bottom(colliders.filter(l => Number.isFinite(l.y)));
    if (!item.static) colliders.push(item);
    else {
      let collision: LayoutItem | undefined;
      while ((collision = getFirstCollision(colliders, item))) {
        item.y = advanceRows(
          item.y,
          Math.max(1, Math.ceil(collision.y + collision.h - item.y))
        );
      }
    }
  }
  return layout;
}

test("sorted static correction matches prior jumps for seeded integer and fractional colliders", () => {
  let seed = 42;
  const random = () =>
    (seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0) / 2 ** 32;
  const fractions = [0, 0.1, 0.2, 0.5, 0.875];
  for (let trial = 0; trial < 2000; trial++) {
    const cols = 1 + Math.floor(random() * 8);
    const layout = Array.from({ length: 12 }, (_, i) => ({
      i: String(i),
      x:
        Math.floor(random() * (cols + 2)) -
        1 +
        fractions[Math.floor(random() * fractions.length)]!,
      y:
        Math.floor(random() * 16) +
        fractions[Math.floor(random() * fractions.length)]!,
      w: 0.1 + Math.floor(random() * cols),
      h: 0.1 + Math.floor(random() * 8),
      static: random() < 0.8
    }));
    expect(
      correctBounds(
        layout.map(l => ({ ...l })),
        { cols }
      )
    ).toEqual(
      previousBounds(
        layout.map(l => ({ ...l })),
        cols
      )
    );
  }
});
