import type { ProfilerOnRenderCallback } from "react";
import * as coreCompactors from "../../src/core/compactors";
import * as extras from "../../src/extras";
import type { Compactor } from "../../src/core/types";

const compactors = Object.values({ ...coreCompactors, ...extras }).filter(
  (value): value is Compactor =>
    typeof value === "object" && value !== null && "compact" in value
);

const arrayMethods = [
  "sort",
  "filter",
  "indexOf",
  "findIndex",
  "map",
  "some",
  "find",
  "slice",
  "includes"
] as const;

export const counterNames = [
  ...arrayMethods,
  "arrayIterator",
  "clientHeight",
  "cloneLayoutItem",
  "collides",
  "compact",
  "getBoundingClientRect",
  "getComputedStyle",
  "getFirstCollision",
  "getStatics",
  "gridItemCommits",
  "gridItemMaxCommits",
  "gridItemRenders",
  "gridLayoutRenders",
  "idleItemCommits",
  "idleItemRenders",
  "offsetParent",
  "placeholderCommits",
  "placeholderRenders"
] as const;
export type Counter = (typeof counterNames)[number];
export type Counts = Record<string, number>;

type ProbeHost = {
  __RGL_BENCH_COUNT__?: (
    name: string,
    props?: { i: string; className?: string }
  ) => void;
};
const realm = globalThis as typeof globalThis & { __RGL_BENCH__?: ProbeHost };
const host = (realm.__RGL_BENCH__ ??= {});
let active: Counts | undefined;
let commits = new Map<string, number>();

export const onItemRender: ProfilerOnRenderCallback = id => {
  if (!active) return;
  if (id === "placeholder") {
    active.placeholderCommits++;
    return;
  }
  active.gridItemCommits++;
  if (id !== "0") active.idleItemCommits++;
  const count = (commits.get(id) ?? 0) + 1;
  commits.set(id, count);
  active.gridItemMaxCommits = Math.max(active.gridItemMaxCommits, count);
};

/** Install only around a synchronous operation, preserving descriptors exactly. */
export function measure(operation: () => void): Counts {
  if (active) throw new Error("Nested benchmark measurements are unsupported");
  const counts = Object.fromEntries(
    counterNames.map(key => [key, 0])
  ) as Counts;
  // Preserve the original aggregate names without extra work on every entry.
  for (const [legacy, key] of Object.entries({
    collides: "core/collision.ts:collides",
    getFirstCollision: "core/collision.ts:getFirstCollision",
    cloneLayoutItem: "core/layout.ts:cloneLayoutItem",
    getStatics: "core/layout.ts:getStatics"
  })) {
    Object.defineProperty(counts, legacy, {
      enumerable: true,
      get: () => counts[key] ?? 0
    });
  }
  const restores: (() => void)[] = [];
  const previousProbe = Object.getOwnPropertyDescriptor(
    host,
    "__RGL_BENCH_COUNT__"
  );
  active = counts;
  commits = new Map();
  try {
    host.__RGL_BENCH_COUNT__ = (name, props) => {
      if (name === "GridItemInner") {
        if (props?.className?.includes("react-grid-placeholder"))
          counts.placeholderRenders++;
        else {
          counts.gridItemRenders++;
          if (props?.i !== "0") counts.idleItemRenders++;
        }
        return;
      }
      const key = name === "GridLayout" ? "gridLayoutRenders" : name;
      counts[key] = (counts[key] ?? 0) + 1;
    };
    restores.push(() => {
      if (previousProbe)
        Object.defineProperty(host, "__RGL_BENCH_COUNT__", previousProbe);
      else delete host.__RGL_BENCH_COUNT__;
    });

    const compactSpies = compactors.map(compactor => {
      const spy = jest.spyOn(compactor, "compact");
      restores.push(() => spy.mockRestore());
      return spy;
    });

    for (const [owner, key] of [
      [HTMLElement.prototype, "offsetParent"],
      [Element.prototype, "clientHeight"]
    ] as const) {
      const descriptor = Object.getOwnPropertyDescriptor(owner, key)!;
      Object.defineProperty(owner, key, {
        ...descriptor,
        get(this: HTMLElement) {
          counts[typeof key === "symbol" ? "arrayIterator" : key]++;
          return descriptor.get!.call(this);
        }
      });
      restores.push(() => Object.defineProperty(owner, key, descriptor));
    }
    for (const [owner, key] of [
      [Element.prototype, "getBoundingClientRect"],
      [window, "getComputedStyle"]
    ] as const) {
      const descriptor = Object.getOwnPropertyDescriptor(owner, key)!;
      const original = descriptor.value;
      Object.defineProperty(owner, key, {
        ...descriptor,
        value(this: unknown, ...args: unknown[]) {
          counts[typeof key === "symbol" ? "arrayIterator" : key]++;
          return original.apply(this, args);
        }
      });
      restores.push(() => Object.defineProperty(owner, key, descriptor));
    }
    // Preserve setupTests.js's timsort implementation, including its tie order.
    for (const key of [...arrayMethods, Symbol.iterator] as const) {
      const descriptor = Object.getOwnPropertyDescriptor(Array.prototype, key)!;
      const original = descriptor.value;
      Object.defineProperty(Array.prototype, key, {
        ...descriptor,
        value(this: unknown[], ...args: unknown[]) {
          counts[typeof key === "symbol" ? "arrayIterator" : key]++;
          return original.apply(this, args);
        }
      });
      restores.push(() =>
        Object.defineProperty(Array.prototype, key, descriptor)
      );
    }

    operation();
    for (let i = 0; i < compactSpies.length; i++) {
      counts.compact += compactSpies[i]!.mock.calls.length;
    }
    return counts;
  } finally {
    for (let i = restores.length - 1; i >= 0; i--) restores[i]!();
    active = undefined;
    commits.clear();
  }
}
