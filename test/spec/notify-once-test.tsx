import { drag, mountGrid, variants } from "../golden-react/fixture";
import type { Variant } from "../golden-react/fixture";

// RFC 0003 RGL-15: no onLayoutChange for a net-zero drag (C-B2), and an onDrag
// placeholder that matches the event.

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
  test("a drag that ends where it started calls onLayoutChange zero times", () => {
    const { fixture, onLayoutChange } = mount(name);
    drag(fixture, "a", [
      [0, 7],
      [0, 210],
      [0, 2]
    ]);
    expect(onLayoutChange).toHaveBeenCalledTimes(0);
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
