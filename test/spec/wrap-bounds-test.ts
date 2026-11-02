import type { Layout, LayoutItem } from "../../src/core/types";
import { wrapCompactor } from "../../src/extras";

// Original sampled-cell contract, kept small enough to enumerate independently.
function sampledWrap(layout: Layout, cols: number): Layout {
  const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
  const occupied = new Set<number>();
  for (const s of sorted.filter(item => item.static)) {
    for (let dy = 0; dy < s.h; dy++) {
      for (let dx = 0; dx < s.w; dx++) {
        occupied.add((s.y + dy) * cols + (s.x + dx));
      }
    }
  }
  let position = 0;
  const result = new Map<string, LayoutItem>();
  for (const item of sorted) {
    const copy = { ...item };
    if (!item.static) {
      while (occupied.has(position)) position++;
      if ((position % cols) + item.w > cols) {
        position = (Math.floor(position / cols) + 1) * cols;
        while (occupied.has(position)) position++;
      }
      copy.x = position % cols;
      copy.y = Math.floor(position / cols);
      position += item.w;
    }
    result.set(item.i, copy);
  }
  return layout.map(item => result.get(item.i)!);
}

const geometry = (layout: Layout) =>
  layout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }));

test("merged wrap occupancy matches the sampled-cell contract for mixed decimal and binary statics", () => {
  let seed = 42;
  const random = () =>
    (seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0) / 2 ** 32;
  const fractions = [0, 0.1, 0.2, 0.4, 0.5, 0.875];
  for (let trial = 0; trial < 2000; trial++) {
    const cols = 1 + Math.floor(random() * 8);
    const layout = Array.from({ length: 8 }, (_, i) => ({
      i: String(i),
      x:
        Math.floor(random() * cols) +
        fractions[Math.floor(random() * fractions.length)]!,
      y:
        Math.floor(random() * 16) +
        fractions[Math.floor(random() * fractions.length)]!,
      w:
        1 +
        Math.floor(random() * cols) +
        fractions[Math.floor(random() * fractions.length)]!,
      h: 1 + Math.floor(random() * 16),
      static: i < 4
    }));
    expect(geometry(wrapCompactor.compact(layout, cols))).toEqual(
      geometry(sampledWrap(layout, cols))
    );
  }
});
