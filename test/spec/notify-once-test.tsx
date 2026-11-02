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
    drag(fixture, "a", [
      [0, 7],
      [0, 210],
      [0, 2]
    ]);
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
