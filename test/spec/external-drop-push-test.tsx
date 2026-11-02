import React from "react";
import { render } from "@testing-library/react";
import { verticalCompactor } from "../../src/core";
import type { Layout, LayoutItem } from "../../src/core/types";
import { GridLayout } from "../../src/react/components/GridLayout";
import { dropExternal } from "../golden-react/drop";

// #2313: an item dragged in from outside must push the items it lands on,
// as an internal drag does, so it can be dropped above the topmost item.
const layout: Layout = [{ i: "a", x: 0, y: 0, w: 2, h: 2 }];

function renderGrid(onDrop: jest.Mock) {
  return render(
    <GridLayout
      width={1200}
      layout={layout}
      gridConfig={{ cols: 12, rowHeight: 30 }}
      compactor={verticalCompactor}
      dropConfig={{ enabled: true }}
      onDrop={onDrop}
    >
      <div key="a" />
    </GridLayout>
  );
}

const dropped = (onDrop: jest.Mock) => ({
  layout: onDrop.mock.calls[0]?.[0] as Layout,
  item: onDrop.mock.calls[0]?.[1] as LayoutItem
});

// "below" hovers under the item first; "direct" lands on it with the first
// event, which goes through the initial placement path.
test.each([
  ["mouse", "below"],
  ["mouse", "direct"],
  ["touch", "below"],
  ["touch", "direct"]
] as const)(
  "%s drop entering %s the top item pushes it down",
  (kind, entry) => {
    const onDrop = jest.fn();
    const view = renderGrid(onDrop);
    const drop = dropExternal(view.container);
    const path =
      entry === "below"
        ? [
            { x: 20, y: 200 },
            { x: 20, y: 15 }
          ]
        : [{ x: 20, y: 15 }];
    try {
      if (kind === "mouse") {
        drop.enter(path[0]!);
        for (const at of path) drop.over(at);
        drop.drop();
      } else {
        const source = document.createElement("div");
        source.dataset.rglDraggable = "";
        document.body.append(source);
        drop.touchStart(source, path[0]!);
        for (const at of path) drop.touchMove(at);
        drop.touchEnd();
        source.remove();
      }
      const { layout: final, item } = dropped(onDrop);
      expect(item).toMatchObject({ x: 0, y: 0 });
      expect(final.find(l => l.i === "a")).toMatchObject({ x: 0, y: 1 });
    } finally {
      drop.uninstall();
    }
  }
);
