import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { noCompactor } from "../../src/core";
import { GridLayout } from "../../src/react/components/GridLayout";
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

describe("a bounds change re-bounds the grid's own state", () => {
  // The layout prop stays the same object; only cols and maxRows change.
  const layout = [{ i: "a", x: 0, y: 0, w: 2, h: 5, minW: 4 }];
  function render(cols: number, maxRows: number, onLayoutChange: jest.Mock) {
    return (
      <GridLayout
        width={600}
        layout={layout}
        gridConfig={{ cols, maxRows, rowHeight: 10 }}
        compactor={noCompactor}
        onLayoutChange={onLayoutChange}
      >
        <div key="a" />
      </GridLayout>
    );
  }
  const last = (spy: jest.Mock) => spy.mock.calls.at(-1)?.[0][0];

  test("a smaller maxRows clamps h", () => {
    const spy = jest.fn();
    const view = rtlRender(render(6, 10, spy));
    view.rerender(render(6, 3, spy));
    expect(last(spy)).toMatchObject({ h: 3 });
  });

  test("a larger cols restores a minW an earlier smaller cols clamped", () => {
    const spy = jest.fn();
    const view = rtlRender(render(6, 10, spy));
    view.rerender(render(2, 10, spy));
    expect(last(spy)).toMatchObject({ minW: 2 });
    view.rerender(render(6, 10, spy));
    expect(last(spy)).toMatchObject({ minW: 4 });
  });
});
