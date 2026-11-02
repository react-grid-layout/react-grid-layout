import { isDeepStrictEqual } from "node:util";
import type { Compactor, Layout } from "../../../src/core/types";
import { assertLayout, capture } from "../capture";
import { samples } from "../generators";

// Seed 17 adds geometry only for these randomized families. Retain both input
// orders elsewhere without duplicating identical deterministic seed fixtures.
export const compactionSamples = samples.filter(
  sample => sample.seed === 1 || ["sparse", "tall"].includes(sample.family)
);

/** Keep console output in the artifact, including the wide-item safety warning. */
export function compact(compactor: Compactor, layout: Layout, cols: number) {
  const warnings: unknown[][] = [];
  const result = capture([layout, cols] as const, ([working, width]) => {
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => warnings.push(args);
    try {
      return compactor.compact(working, width);
    } finally {
      console.warn = originalWarn;
    }
  });
  return { ...result, warnings };
}

export function assertCompacted(
  result: ReturnType<typeof compact>,
  options: Parameters<typeof assertLayout>[2] = {}
) {
  expect(result.error).toBeUndefined();
  expect(result.output).toBeDefined();
  assertLayout(result.input[0], result.output!, options);
}

export function orders(layout: Layout) {
  return [
    { order: "forward", layout },
    { order: "reversed", layout: [...layout].reverse() }
  ];
}

export function difference(
  classic: ReturnType<typeof compact>,
  fast: ReturnType<typeof compact>
) {
  return {
    equalOutput: isDeepStrictEqual(classic.output, fast.output),
    equalPostInput: isDeepStrictEqual(classic.postInput, fast.postInput),
    classicError: classic.error,
    fastError: fast.error,
    classicOrder: classic.output?.map(item => item.i),
    fastOrder: fast.output?.map(item => item.i)
  };
}
