import { drag, mountGrid, variants } from "../golden-react/fixture";
import { horizontalCompactor } from "../../src/core/compactors";
import type { Variant } from "../golden-react/fixture";

// RFC 0003 RGL-15: one onLayoutChange per committed interaction (RX-5,
// https://github.com/react-grid-layout/react-grid-layout/issues/1984), none for
// a net-zero drag (C-B2), and an onDrag placeholder that matches the event.

const variant = (name: string): Variant => variants.find(v => v.name === name)!;

function mount(name: string) {
  const onLayoutChange = jest.fn();
  const onDrag = jest.fn();
  const fixture = mountGrid({
    variant: variant(name),
    props: { onLayoutChange, onDrag }
  });
  onLayoutChange.mockClear();
  return { fixture, onLayoutChange, onDrag };
}

describe.each(["vertical", "none", "legacy", "strict"])("%s", name => {
  test("a drag that moves an item calls onLayoutChange once", () => {
    const { fixture, onLayoutChange } = mount(name);
    drag(fixture, "a", [
      [7, 0],
      [310, 0]
    ]);
    expect(onLayoutChange).toHaveBeenCalledTimes(1);
    const a = onLayoutChange.mock.calls[0][0].find((l: any) => l.i === "a");
    expect(a.x).toBe(3);
  });

  test("a drag that ends where it started calls onLayoutChange zero times", () => {
    const { fixture, onLayoutChange } = mount(name);
    // Free-form is the case this fixes (moved: true survives the drag). The
    // compacting variants were fixed by RGL-11 and stay here as guards: out
    // over b and back, so b is pushed and restored. Free-form would leave b
    // pushed, so it goes out into empty space instead.
    drag(
      fixture,
      "a",
      name === "none"
        ? [
            [0, 7],
            [0, 210],
            [0, 2]
          ]
        : [
            [7, 0],
            [110, 0],
            [2, 0]
          ]
    );
    expect(onLayoutChange).toHaveBeenCalledTimes(0);
  });

  test("a resize calls onLayoutChange once", () => {
    const { fixture, onLayoutChange } = mount(name);
    const handle = fixture
      .item("c")
      .querySelector<HTMLElement>(".react-resizable-handle-se");
    const rect = handle!.getBoundingClientRect();
    const origin = { x: rect.left + 2, y: rect.top + 2 };
    fixture.pointer.down(handle, origin);
    fixture.pointer.move({ x: origin.x + 5, y: origin.y + 5 });
    fixture.pointer.move({
      x: origin.x + 110 * fixture.scale,
      y: origin.y + 110 * fixture.scale
    });
    fixture.pointer.up();
    expect(onLayoutChange).toHaveBeenCalledTimes(1);
    const c = onLayoutChange.mock.calls[0][0].find((l: any) => l.i === "c");
    expect([c.w, c.h]).toEqual([2, 2]);
  });
});

test("the onDrag placeholder is where the item moved on that event", () => {
  const { fixture, onDrag } = mount("none");
  drag(fixture, "a", [
    [0, 7],
    [0, 210]
  ]);
  const last = onDrag.mock.calls[onDrag.mock.calls.length - 1];
  const item = last[2];
  const placeholder = last[3];
  expect({ x: item.x, y: item.y }).toEqual({ x: 0, y: 2 });
  expect({ x: placeholder.x, y: placeholder.y }).toEqual({ x: 0, y: 2 });
});

describe.each(["vertical", "legacy"])("Responsive %s", name => {
  test("a compactor swap calls onLayoutChange once", () => {
    const onLayoutChange = jest.fn();
    const v = variant(name);
    const fixture = mountGrid({
      variant: v,
      responsive: true,
      layout: [
        { i: "a", x: 0, y: 1, w: 1, h: 1 },
        { i: "b", x: 3, y: 0, w: 1, h: 1 }
      ],
      props: { onLayoutChange }
    });
    onLayoutChange.mockClear();
    fixture.rerenderProps(
      v.api === "legacy"
        ? { compactType: "horizontal" }
        : { compactor: horizontalCompactor }
    );
    expect(onLayoutChange).toHaveBeenCalledTimes(1);
  });
});

test("the onDrag placeholder is the compacted position on that event", () => {
  const { fixture, onDrag } = mount("vertical");
  drag(fixture, "a", [
    [7, 0],
    [310, 210]
  ]);
  const last = onDrag.mock.calls[onDrag.mock.calls.length - 1];
  // The item argument is where the pointer put it; the placeholder is where
  // vertical compaction lands it on this same event.
  expect({ x: last[2].x, y: last[2].y }).toEqual({ x: 3, y: 2 });
  expect({ x: last[3].x, y: last[3].y }).toEqual({ x: 3, y: 0 });
});

test("a controlled parent that echoes the layout sees one onLayoutChange per drag (#1984)", () => {
  const onLayoutChange = jest.fn();
  const fixture = mountGrid({ variant: variant("vertical") });
  const echo = jest.fn((layout: any[]) => {
    onLayoutChange(layout);
    fixture.rerenderProps({
      layout: layout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }))
    });
  });
  fixture.rerenderProps({ onLayoutChange: echo });
  onLayoutChange.mockClear();
  drag(fixture, "a", [
    [7, 0],
    [310, 0]
  ]);
  expect(onLayoutChange).toHaveBeenCalledTimes(1);
});

test("a real item that uses the default dropping id stays in the stop report", () => {
  const onLayoutChange = jest.fn();
  const layout = [
    { i: "a", x: 0, y: 0, w: 1, h: 1 },
    { i: "__dropping-elem__", x: 1, y: 0, w: 1, h: 1 }
  ];
  const fixture = mountGrid({
    variant: variant("none"),
    layout,
    props: { onLayoutChange }
  });
  onLayoutChange.mockClear();
  drag(fixture, "a", [
    [0, 7],
    [0, 210]
  ]);
  expect(onLayoutChange).toHaveBeenCalledTimes(1);
  expect(onLayoutChange.mock.calls[0][0].map((l: any) => l.i)).toContain(
    "__dropping-elem__"
  );
});
