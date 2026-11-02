/** A local PRNG: independent seeds never share state. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 1_831_565_813) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function rng(seed: number) {
  const next = mulberry32(seed);
  const int = (lo: number, hi: number) =>
    lo + Math.floor(next() * (hi - lo + 1));
  return {
    next,
    int,
    bool: (probability = 0.5) => next() < probability,
    pick: <T>(values: readonly T[]): T => {
      if (values.length === 0)
        throw new Error("Cannot pick from an empty array");
      return values[int(0, values.length - 1)]!;
    },
    shuffle: <T>(values: readonly T[]): T[] => {
      const result = [...values];
      for (let i = result.length - 1; i > 0; i--) {
        const j = int(0, i);
        [result[i], result[j]] = [result[j]!, result[i]!];
      }
      return result;
    }
  };
}
