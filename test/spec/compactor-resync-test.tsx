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

// A re-sync of an already-compacted layout changes nothing visible, so these
// count compact calls: a parent render must not run compaction at all.
function countedVertical() {
  const compact = jest.fn(verticalCompactor.compact);
  return { compactor: { ...verticalCompactor, compact }, compact };
}

test("an inline compactor with the same settings never re-syncs", () => {
  const { compactor, compact } = countedVertical();
  const fixture = mountGrid({
    variant: variant("vertical"),
    props: { compactor: { ...compactor, preventCollision: true } }
  });
  const calls = compact.mock.calls.length;
  for (let n = 0; n < 5; n++)
    fixture.rerenderProps({
      compactor: { ...compactor, preventCollision: true }
    });
  expect(compact.mock.calls.length).toBe(calls);
});

test("a legacy grid with preventCollision never re-syncs on parent renders", () => {
  const compact = jest.spyOn(verticalCompactor, "compact");
  try {
    const fixture = mountGrid({
      variant: variant("legacy"),
      props: { preventCollision: true }
    });
    const calls = compact.mock.calls.length;
    for (let n = 0; n < 5; n++)
      fixture.rerenderProps({ preventCollision: true });
    expect(compact.mock.calls.length).toBe(calls);
  } finally {
    compact.mockRestore();
  }
});

test("a swap that changes only the compact function re-syncs", () => {
  const { compactor, compact } = countedVertical();
  const fixture = mountGrid({
    variant: variant("vertical"),
    props: { compactor: verticalCompactor }
  });
  fixture.rerenderProps({ compactor });
  expect(compact).toHaveBeenCalled();
});

test("a swap that changes only preventCollision re-syncs", () => {
  const { compactor, compact } = countedVertical();
  const fixture = mountGrid({
    variant: variant("vertical"),
    props: { compactor }
  });
  const calls = compact.mock.calls.length;
  fixture.rerenderProps({
    compactor: { ...compactor, preventCollision: true }
  });
  expect(compact.mock.calls.length).toBeGreaterThan(calls);
});

describe("RGL_W008", () => {
  let warn: jest.SpyInstance;
  beforeEach(() => {
    warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => warn.mockRestore());

  const w008 = () =>
    warn.mock.calls.filter(call => String(call[0]).includes("RGL_W008"));

  // The warning dedupes once per module, so the silent paths run first, before
  // anything has used up the one warning.
  test("legacy compactType=wrap and other getCompactor calls do not warn", () => {
    mountGrid({
      variant: { name: "legacy-wrap", api: "legacy", compact: "wrap" }
    });
    getCompactor("vertical");
    getCompactor(null, true, true);
    expect(w008()).toHaveLength(0);
  });

  test('getCompactor("wrap") warns once', () => {
    getCompactor("wrap");
    getCompactor("wrap");
    expect(w008()).toHaveLength(1);
  });
});
