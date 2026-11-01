import type { Layout, LayoutItem } from "../../../src/core/types";
import { capture } from "../../golden/capture";
import { mulberry32 } from "../../golden/rng";
import { serialize } from "../../golden/serialize";

/** Bounded finite geometry keeps the pre-rewrite loops practical to run. */
export function seededLayouts(seed: number, positiveSizes = false) {
  const next = mulberry32(seed);
  const pick = <T>(values: readonly T[]): T =>
    values[Math.floor(next() * values.length)]!;
  const positions = [-3, -1, -0, 0, 0.1, 0.5, 0.875, 1, 2, 5, 24, 64, 256];
  const sizes = positiveSizes
    ? [1, 1.1, 1.5, 1.875, 2, 3, 8]
    : [-2, -1, -0, 0, 0.1, 0.5, 1, 2, 3, 8];
  return (index: number): { layout: LayoutItem[]; cols: number } => {
    const cols = 1 + Math.floor(next() * 24);
    const length = index % 25 === 0 ? 0 : 2 + Math.floor(next() * 6);
    const layout: LayoutItem[] = Array.from({ length }, (_, item) => ({
      i: next() < 0.2 ? "dup" : String(item),
      x: pick(positions),
      y: pick(positions),
      w: Math.min(cols, pick(sizes)),
      h: pick(sizes),
      ...(next() < 0.35 ? { static: true } : {}),
      ...(next() < 0.2 ? { moved: true } : {})
    }));
    if (index % 5 === 0 && layout.length > 1) {
      // Deliberate overlapping statics, including decimal geometry.
      layout[0]!.static = true;
      layout[1] = { ...layout[0]!, i: "overlap", static: true };
    }
    if (index % 7 === 0 && layout.length > 1) layout[1] = layout[0]!;
    if (index % 11 === 0 && layout.length > 0) layout[0]!.y = 10_000;
    return { layout, cols };
  };
}

/** Successful calls retain post-call/alias evidence; throws compare names only. */
export function outcome(
  args: { layout: LayoutItem[]; cols: number },
  compact: (layout: LayoutItem[], cols: number) => Layout
): string {
  const { error, ...result } = capture(args, ({ layout, cols }) =>
    compact(layout, cols)
  );
  // State at a throw is unspecified, matching drag-resolution-test.ts.
  return serialize(error ? { threw: error.name } : result);
}
