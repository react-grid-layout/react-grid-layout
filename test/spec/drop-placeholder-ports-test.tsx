import React from "react";
import { act, render } from "@testing-library/react";
import { getAllCollisions, noCompactor } from "../../src/core";
import type { Layout } from "../../src/core/types";
import { GridLayout } from "../../src/react/components/GridLayout";
import { dropExternal } from "../golden-react/drop";

// #2265: an external drop over a full grid with preventCollision must not
// overlap the items it lands on.
test("an external drop over a full grid with preventCollision never overlaps", () => {
  const layout: Layout = [
    { i: "a", x: 0, y: 0, w: 6, h: 2 },
    { i: "b", x: 6, y: 0, w: 6, h: 2 }
  ];
  const onDrop = jest.fn();
  const view = render(
    <GridLayout
      width={1200}
      layout={layout}
      gridConfig={{ cols: 12, rowHeight: 30, maxRows: 2 }}
      compactor={{ ...noCompactor, preventCollision: true }}
      dropConfig={{ enabled: true }}
      onDrop={onDrop}
    >
      <div key="a" />
      <div key="b" />
    </GridLayout>
  );
  const drop = dropExternal(view.container);
  try {
    drop.enter({ x: 20, y: 15 });
    drop.over({ x: 20, y: 15 });
    drop.over({ x: 700, y: 15 });
    drop.drop();
  } finally {
    drop.uninstall();
  }
  const [final, item] = onDrop.mock.calls[0] ?? [];
  if (item) {
    expect(getAllCollisions(final as Layout, item)).toEqual([]);
  }
  expect(
    view.container.querySelectorAll(".react-grid-placeholder")
  ).toHaveLength(0);
});

// #2248: leaving the grid right after a hover moved the placeholder must not
// leave a placeholder behind.
test("leaving the grid in the same batch as a hover leaves no placeholder", () => {
  const view = render(
    <GridLayout
      width={1200}
      layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
      gridConfig={{ cols: 12, rowHeight: 30 }}
      dropConfig={{ enabled: true }}
    >
      <div key="a" />
    </GridLayout>
  );
  const grid = view.container.querySelector<HTMLElement>(".react-grid-layout")!;
  const event = (type: string, x: number, y: number) => {
    const e = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperties(e, {
      clientX: { value: x },
      clientY: { value: y }
    });
    return e;
  };
  act(() => {
    grid.dispatchEvent(event("dragenter", 400, 200));
    grid.dispatchEvent(event("dragover", 400, 200));
  });
  act(() => {
    grid.dispatchEvent(event("dragover", 600, 300));
    grid.dispatchEvent(event("dragleave", 2000, 2000));
  });
  expect(
    view.container.querySelectorAll(".react-grid-placeholder")
  ).toHaveLength(0);
});
