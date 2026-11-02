import {
  mountGrid,
  drag,
  gridConfig,
  type Variant
} from "../golden-react/fixture";

// A cols change must keep the user's edits even when the saved layout
// violates the new cols. Intake validation used to produce a new layout
// array on every cols change, which read as a new layout prop and reset
// the grid to it.
const free: Variant = { name: "v2", api: "v2", compact: null };

function dragThenShrinkCols(aX: number) {
  const layout = [
    { i: "a", x: aX, y: 0, w: 1, h: 1 },
    { i: "b", x: 0, y: 2, w: 1, h: 1 }
  ];
  const f = mountGrid({ variant: free, layout });
  drag(f, "b", [[110, 0]]);
  f.rerenderProps({ gridConfig: { ...gridConfig, cols: 3 } });
  const transform = f.item("b").style.transform;
  f.unmount();
  return transform;
}

test.each([
  ["fits the new cols", 1],
  ["violates the new cols", 5]
])("a cols change keeps a drag when the saved layout %s", (_, aX) => {
  expect(dragThenShrinkCols(aX)).toBe("translate(200px,200px)");
});
