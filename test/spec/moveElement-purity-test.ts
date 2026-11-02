import { cloneLayoutItem, moveElement } from "../../src/core/layout";
import type { CompactType, LayoutItem } from "../../src/core/types";
import { copy } from "../golden/capture";
import { mulberry32 } from "../golden/rng";

// Object.freeze, not test/util/deepFreeze.js: that Proxy hands out a new
// wrapper on every read, which breaks the reference lookups moveElement does.
function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const key of Object.keys(value)) {
      freeze((value as Record<string, unknown>)[key]);
    }
    Object.freeze(value);
  }
  return value;
}

type Case = {
  name: string;
  layout: LayoutItem[];
  target?: number;
  x: number | undefined;
  y: number | undefined;
  compactType: CompactType;
  isUserAction?: boolean;
  preventCollision?: boolean;
  allowOverlap?: boolean;
  /** Where item "a" ends up; measured on the mutating implementation. */
  expectA?: Partial<LayoutItem>;
};

const cases: Case[] = [
  {
    name: "vertical push",
    layout: [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "b", x: 0, y: 2, w: 2, h: 2 },
      { i: "c", x: 0, y: 4, w: 2, h: 2 }
    ],
    x: 0,
    y: 3,
    compactType: "vertical",
    isUserAction: true
  },
  {
    name: "horizontal push",
    layout: [
      { i: "a", x: 0, y: 0, w: 2, h: 1 },
      { i: "b", x: 2, y: 0, w: 2, h: 1 },
      { i: "c", x: 4, y: 0, w: 2, h: 1 }
    ],
    x: 3,
    y: 0,
    compactType: "horizontal",
    isUserAction: true,
    // The west-collision branch moves the dragged item to the collider's x.
    expectA: { x: 2, y: 0 }
  },
  {
    name: "wrap push",
    layout: [
      { i: "a", x: 0, y: 0, w: 1, h: 1 },
      { i: "b", x: 1, y: 0, w: 1, h: 1 }
    ],
    x: 1,
    y: 0,
    compactType: "wrap",
    isUserAction: true
  },
  {
    name: "free-form swap",
    layout: [
      { i: "a", x: 0, y: 2, w: 1, h: 2 },
      { i: "b", x: 0, y: 0, w: 1, h: 2 }
    ],
    x: 0,
    y: 1,
    compactType: null,
    isUserAction: true,
    // The swap puts the dragged item at the collider's old y.
    expectA: { x: 0, y: 0 }
  },
  {
    name: "preventCollision rollback",
    layout: [
      { i: "a", x: 0, y: 0, w: 1, h: 1, moved: true },
      { i: "b", x: 1, y: 0, w: 1, h: 1 }
    ],
    x: 1,
    y: 0,
    compactType: "vertical",
    preventCollision: true,
    expectA: { x: 0, y: 0, moved: false }
  },
  {
    name: "allowOverlap",
    layout: [
      { i: "a", x: 0, y: 0, w: 1, h: 1 },
      { i: "b", x: 1, y: 0, w: 1, h: 1 }
    ],
    x: 1,
    y: 0,
    compactType: "vertical",
    allowOverlap: true
  },
  {
    name: "draggable static pushed off a static",
    layout: [
      { i: "a", x: 0, y: 0, w: 1, h: 1, static: true, isDraggable: true },
      { i: "b", x: 0, y: 2, w: 1, h: 1, static: true }
    ],
    x: 0,
    y: 2,
    compactType: "vertical",
    isUserAction: true,
    // moveAway finds room above the static it landed on.
    expectA: { x: 0, y: 1 }
  }
];

function run(c: Case, layout: LayoutItem[], l = layout[c.target ?? 0]!) {
  return moveElement(
    layout,
    l,
    c.x,
    c.y,
    c.isUserAction,
    c.preventCollision,
    c.compactType,
    12,
    c.allowOverlap
  );
}

describe("moveElement does not mutate its input", () => {
  it.each(cases)("$name", c => {
    const before = copy(c.layout);
    const layout = freeze(copy(c.layout));
    const result = run(c, layout);
    expect(layout).toEqual(before);
    // The moved item is read from the returned layout, not from the input.
    const moved = result.find(item => item.i === "a")!;
    expect(moved).toMatchObject(c.expectA ?? { x: c.x, y: c.y });
  });

  it("keeps untouched items by reference and returns the input on a no-op rollback", () => {
    const layout = freeze([
      { i: "a", x: 0, y: 0, w: 1, h: 1, moved: false },
      { i: "b", x: 0, y: 1, w: 1, h: 1 },
      { i: "c", x: 5, y: 0, w: 1, h: 1 }
    ]);
    const pushed = moveElement(
      layout,
      layout[0]!,
      0,
      1,
      true,
      false,
      "vertical",
      12
    );
    expect(pushed[2]).toBe(layout[2]);
    expect(pushed[0]).not.toBe(layout[0]);

    const blocked = moveElement(
      layout,
      layout[0]!,
      0,
      1,
      false,
      true,
      "vertical",
      12
    );
    expect(blocked).toBe(layout);
  });

  it("moves a detached copy of a layout item (C-B16)", () => {
    const layout = freeze([
      { i: "a", x: 0, y: 0, w: 1, h: 1 },
      { i: "b", x: 0, y: 1, w: 1, h: 1 }
    ]);
    const detached = freeze(cloneLayoutItem(layout[0]!));
    const result = moveElement(
      layout,
      detached,
      0,
      1,
      true,
      false,
      "vertical",
      12
    );
    const byReference = moveElement(
      layout,
      layout[0]!,
      0,
      1,
      true,
      false,
      "vertical",
      12
    );
    expect(result).toEqual(byReference);
    expect(result.find(item => item.i === "a")).toMatchObject({ x: 0, y: 1 });
  });

  it("never writes to a frozen input across 2,000 seeded cases", () => {
    const next = mulberry32(20_261_102);
    const pick = <T>(xs: readonly T[]): T =>
      xs[Math.floor(next() * xs.length)]!;
    const modes: CompactType[] = ["vertical", "horizontal", "wrap", null];
    for (let n = 0; n < 2000; n++) {
      const size = 2 + Math.floor(next() * 7);
      const base: LayoutItem[] = Array.from({ length: size }, (_, i) => ({
        i: String(i),
        x: Math.floor(next() * 6),
        y: Math.floor(next() * 6),
        w: 1 + Math.floor(next() * 3),
        h: 1 + Math.floor(next() * 3),
        ...(next() < 0.2 ? { static: true } : {}),
        ...(next() < 0.1 ? { isDraggable: true } : {}),
        ...(next() < 0.2 ? { moved: next() < 0.5 } : {})
      }));
      const c: Case = {
        name: String(n),
        layout: base,
        target: Math.floor(next() * size),
        x: next() < 0.9 ? Math.floor(next() * 8) : undefined,
        y: next() < 0.9 ? Math.floor(next() * 8) : undefined,
        compactType: pick(modes),
        isUserAction: next() < 0.5,
        preventCollision: next() < 0.3,
        allowOverlap: next() < 0.2
      };
      const before = copy(base);
      const layout = freeze(copy(base));
      expect(() => run(c, layout)).not.toThrow();
      expect(layout).toEqual(before);
    }
  });
});
