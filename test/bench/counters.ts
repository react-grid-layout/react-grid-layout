import type { ProfilerOnRenderCallback } from "react";
import { verticalCompactor } from "../../src/core/compactors";

export const counterNames = [
  "clientHeight",
  "cloneLayoutItem",
  "collides",
  "compact",
  "filter",
  "findIndex",
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
  "indexOf",
  "offsetParent",
  "placeholderCommits",
  "placeholderRenders",
  "sort"
] as const;
export type Counter = (typeof counterNames)[number];
export type Counts = Record<Counter, number>;

type Probe =
  | "collides"
  | "getFirstCollision"
  | "cloneLayoutItem"
  | "getStatics"
  | "GridLayout"
  | "GridItemInner";
const host = globalThis as typeof globalThis & {
  __RGL_BENCH_COUNT__?: (
    name: Probe,
    props?: { i: string; className?: string }
  ) => void;
};
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

function isLayoutArray(array: unknown[]): boolean {
  const item = array[0];
  return (
    item !== null &&
    typeof item === "object" &&
    "i" in item &&
    "x" in item &&
    "y" in item &&
    "w" in item &&
    "h" in item
  );
}

/** Install only around a synchronous operation, preserving descriptors exactly. */
export function measure(operation: () => void): Counts {
  if (active) throw new Error("Nested benchmark measurements are unsupported");
  const counts = Object.fromEntries(
    counterNames.map(key => [key, 0])
  ) as Counts;
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
      counts[name === "GridLayout" ? "gridLayoutRenders" : name]++;
    };
    restores.push(() => {
      if (previousProbe)
        Object.defineProperty(host, "__RGL_BENCH_COUNT__", previousProbe);
      else delete host.__RGL_BENCH_COUNT__;
    });

    // Preserve setupTests.js's timsort implementation, including its tie order.
    for (const key of ["sort", "filter", "indexOf", "findIndex"] as const) {
      const descriptor = Object.getOwnPropertyDescriptor(Array.prototype, key)!;
      const original = descriptor.value;
      Object.defineProperty(Array.prototype, key, {
        ...descriptor,
        value(this: unknown[], ...args: unknown[]) {
          if (isLayoutArray(this)) counts[key]++;
          return original.apply(this, args);
        }
      });
      restores.push(() =>
        Object.defineProperty(Array.prototype, key, descriptor)
      );
    }

    const compact = jest.spyOn(verticalCompactor, "compact");
    const originalCompact = compact.getMockImplementation()!;
    compact.mockImplementation((...args) => {
      counts.compact++;
      return originalCompact(...args);
    });
    restores.push(() => compact.mockRestore());

    for (const [owner, key] of [
      [HTMLElement.prototype, "offsetParent"],
      [Element.prototype, "clientHeight"]
    ] as const) {
      const descriptor = Object.getOwnPropertyDescriptor(owner, key)!;
      Object.defineProperty(owner, key, {
        ...descriptor,
        get(this: HTMLElement) {
          counts[key]++;
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
          counts[key]++;
          return original.apply(this, args);
        }
      });
      restores.push(() => Object.defineProperty(owner, key, descriptor));
    }
    operation();
    return counts;
  } finally {
    for (let i = restores.length - 1; i >= 0; i--) restores[i]!();
    active = undefined;
    commits.clear();
  }
}
