import React from "react";
import { fireEvent, render } from "@testing-library/react";
import type { Layout, LayoutItem } from "../../src/core/types";
import { verticalCompactor } from "../../src/core/compactors";
import { correctBounds } from "../../src/core/layout";
import { wrapCompactor } from "../../src/extras/wrapCompactor";
import { GridLayout } from "../../src/react/components/GridLayout";
import { measure, type Counts } from "./counters";

export const securityVectors = [
  "large-y",
  "minH-resize",
  "overlapping-statics",
  "wrap-static"
] as const;
export type SecurityVector = (typeof securityVectors)[number];

/** Absolute caps abort a broken algorithm inside its probe, before a tab-sized hang.
 * The collision budget is 50*n*n; all source entries/loops also stay below 200000.
 */
export function securityScenario(vector: SecurityVector): Counts {
  let counts: Counts;
  const item: LayoutItem = { i: "a", x: 0, y: 0, w: 1, h: 1 };
  if (vector === "large-y") {
    let output: Layout = [];
    counts = measure(() => {
      output = verticalCompactor.compact(
        [
          { ...item, i: "static", x: 1, h: 1e9, static: true },
          { ...item, y: 1e9 }
        ],
        2
      );
    }, 200000);
    expect(output[1]).toMatchObject({ y: 0 });
  } else if (vector === "overlapping-statics") {
    const input = Array.from({ length: 80 }, (_, i) => ({
      ...item,
      i: String(i),
      h: 10000,
      static: true
    }));
    counts = measure(() => {
      correctBounds(input, { cols: 1 });
    }, 200000);
    expect(input[0]!.y).toBe(10000);
    expect(input[78]!.y).toBe(790000);
    expect(input[79]!.y).toBe(0);
  } else if (vector === "wrap-static") {
    let output: Layout = [];
    counts = measure(() => {
      output = wrapCompactor.compact(
        [{ ...item, i: "static", h: 1e9, static: true }, item],
        1
      );
    }, 200000);
    expect(output[1]).toMatchObject({ x: 0, y: 1e9 });
  } else {
    const resized = jest.fn();
    const warning = jest.spyOn(console, "warn").mockImplementation(() => {});
    const view = render(
      React.createElement(
        GridLayout,
        {
          width: 800,
          layout: [{ ...item, minH: 1e9 }],
          gridConfig: {
            cols: 4,
            rowHeight: 10,
            margin: [0, 0],
            containerPadding: [0, 0]
          },
          onResize: resized
        },
        React.createElement("div", { key: "a" })
      )
    );
    try {
      const handle = view.container.querySelector(
        ".react-resizable-handle-se"
      )!;
      counts = measure(() => {
        fireEvent.mouseDown(handle, { clientX: 10, clientY: 10, button: 0 });
        fireEvent.mouseMove(document, { clientX: 20, clientY: 20, buttons: 1 });
        fireEvent.mouseUp(document, { clientX: 20, clientY: 20, button: 0 });
      }, 200000);
      expect(resized.mock.calls.at(-1)?.[2].h).toBe(10000);
    } finally {
      view.unmount();
      warning.mockRestore();
    }
  }
  expect(counts.collides).toBeLessThan(
    50 * (vector === "overlapping-statics" ? 80 : 2) ** 2
  );
  return counts;
}
