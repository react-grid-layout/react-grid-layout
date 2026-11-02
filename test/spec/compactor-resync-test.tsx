import { mountGrid, variants } from "../golden-react/fixture";
import type { Variant } from "../golden-react/fixture";
import {
  getCompactor,
  verticalCompactor,
  verticalOverlapCompactor
} from "../../src/core/compactors";

// RFC 0003 RGL-17 (RX-8b): a compactor change re-syncs the grid when its
// type, allowOverlap, preventCollision or compact reference changes, and a
// new object with the same four never does. RGL_W008 for getCompactor("wrap").

const variant = (name: string): Variant => variants.find(v => v.name === name)!;

const overlapping = [
  { i: "a", x: 0, y: 0, w: 1, h: 1 },
  { i: "b", x: 0, y: 0, w: 1, h: 1 }
];

function yOf(layout: any[], id: string) {
  return layout.find(l => l.i === id).y;
}

test("a same-type compactor swap re-compacts (overlap allowed, then not)", () => {
  const onLayoutChange = jest.fn();
  const fixture = mountGrid({
    variant: variant("vertical"),
    layout: overlapping,
    props: {
      onLayoutChange,
      compactor: verticalOverlapCompactor
    }
  });
  onLayoutChange.mockClear();
  fixture.rerenderProps({ compactor: verticalCompactor });
  expect(onLayoutChange).toHaveBeenCalledTimes(1);
  const layout = onLayoutChange.mock.calls[0][0];
  expect([yOf(layout, "a"), yOf(layout, "b")].sort()).toEqual([0, 1]);
});

test("an inline compactor with the same settings never re-syncs", () => {
  const onLayoutChange = jest.fn();
  const fixture = mountGrid({
    variant: variant("vertical"),
    props: {
      onLayoutChange,
      compactor: { ...verticalCompactor, preventCollision: true }
    }
  });
  onLayoutChange.mockClear();
  const before = fixture.container.innerHTML;
  for (let n = 0; n < 5; n++)
    fixture.rerenderProps({
      compactor: { ...verticalCompactor, preventCollision: true }
    });
  expect(onLayoutChange).toHaveBeenCalledTimes(0);
  expect(fixture.container.innerHTML).toBe(before);
});

test("a legacy grid with preventCollision never re-syncs on parent renders", () => {
  const onLayoutChange = jest.fn();
  const fixture = mountGrid({
    variant: variant("legacy"),
    props: { onLayoutChange, preventCollision: true }
  });
  onLayoutChange.mockClear();
  for (let n = 0; n < 5; n++) fixture.rerenderProps({ preventCollision: true });
  expect(onLayoutChange).toHaveBeenCalledTimes(0);
});

describe("RGL_W008", () => {
  let warn: jest.SpyInstance;
  beforeEach(() => {
    warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => warn.mockRestore());

  const w008 = () =>
    warn.mock.calls.filter(call => String(call[0]).includes("RGL_W008"));

  test('getCompactor("wrap") warns once', () => {
    getCompactor("wrap");
    getCompactor("wrap");
    expect(w008()).toHaveLength(1);
  });

  test("other getCompactor calls and legacy compactType=wrap do not warn", () => {
    getCompactor("vertical");
    getCompactor(null, true, true);
    mountGrid({
      variant: { name: "legacy-wrap", api: "legacy", compact: "wrap" }
    });
    expect(w008()).toHaveLength(0);
  });
});
