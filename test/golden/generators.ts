import type { LayoutItem } from "../../src/core/types";
import { rng } from "./rng";

// Never generate NaN geometry: collision.ts:24-27's separating comparisons all
// fail for NaN, so collides returns true and move-until-clear loops can hang.
export const families = [
  "empty",
  "single",
  "packed",
  "sparse",
  "tall",
  "cascade",
  "statics-scattered",
  "statics-blocking",
  "overlapping",
  "out-of-bounds",
  "fractional",
  "infinity",
  "duplicate-ids",
  "minmax",
  "zero",
  "large"
] as const;
export type Family = (typeof families)[number];

export function generate(
  family: Family,
  seed: number,
  size: number,
  cols = 12
): LayoutItem[] {
  const random = rng(seed);
  const count = family === "empty" ? 0 : family === "single" ? 1 : size;
  return Array.from({ length: count }, (_, index) => {
    const item: LayoutItem = {
      i: String(index),
      x: index % cols,
      y: Math.floor(index / cols),
      w: 1,
      h: 1
    };
    switch (family) {
      case "sparse": {
        return {
          ...item,
          x: random.int(0, cols - 2),
          y: index * 3 + random.int(0, 2),
          w: random.int(1, 2)
        };
      }
      case "tall": {
        return {
          ...item,
          x: index % 3,
          y: Math.floor(index / 3) * 7,
          h: random.int(2, 5)
        };
      }
      case "cascade": {
        return { ...item, x: 0, y: index, w: 2, h: 2 };
      }
      case "statics-scattered": {
        return {
          ...item,
          y: Math.floor(index / cols) * 3,
          static: index % 3 === 0,
          moved: index % 3 === 0
        };
      }
      case "statics-blocking": {
        return {
          ...item,
          x: 0,
          y: index * 2,
          w: cols,
          static: index % 3 === 0
        };
      }
      case "overlapping": {
        return { ...item, x: index % 2, y: index % 2, w: 2, h: 2 };
      }
      case "out-of-bounds": {
        return {
          ...item,
          x: [-1, cols, cols - 1][index % 3]!,
          y: index * 2 - 1,
          w: index % 3 === 2 ? cols + 1 : 2
        };
      }
      case "fractional": {
        return {
          ...item,
          x: (index % 2) + 0.5,
          y: index * 2 + 0.5,
          w: 1.5,
          h: 1.5
        };
      }
      case "infinity": {
        return { ...item, y: index === count - 1 ? Infinity : index * 2 };
      }
      case "duplicate-ids": {
        return { ...item, i: String(index % 2), y: index * 2 };
      }
      case "minmax": {
        return {
          ...item,
          y: index * 2,
          w: 2,
          h: 2,
          minW: 2,
          maxW: index % 2 ? Infinity : 4,
          minH: 1,
          maxH: 3
        };
      }
      case "zero": {
        return {
          ...item,
          y: index * 2,
          w: index % 2 ? 1 : 0,
          h: index % 2 ? 0 : 1
        };
      }
      default: {
        return item;
      }
    }
  });
}

export const samples = families.flatMap(family =>
  (family === "sparse" || family === "tall" ? [1, 17] : [1]).flatMap(seed => {
    const size = family === "large" ? 200 : family === "cascade" ? 6 : 3;
    const layout = generate(family, seed, size);
    return [
      { family, seed, size, cols: 12, order: "forward", layout },
      {
        family,
        seed,
        size,
        cols: 12,
        order: "shuffled",
        layout: rng(seed ^ 0x12_34).shuffle(layout)
      }
    ];
  })
);
