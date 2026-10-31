import React from "react";
import { fireEvent, render } from "@testing-library/react";
import type { Layout, LayoutItem } from "../../src/core/types";
import {
  verticalCompactor,
  compactItemVertical,
  compactItemHorizontal
} from "../../src/core";
import {
  fastHorizontalCompactor,
  fastHorizontalOverlapCompactor
} from "../../src/extras";
import { correctBounds } from "../../src/core/layout";
import { wrapCompactor } from "../../src/extras/wrapCompactor";
import { GridLayout } from "../../src/react/components/GridLayout";
import { measure, type Counts } from "./counters";

export const securityVectors = [
  "large-y",
  "minH-resize",
  "overlapping-statics",
  "overlapping-statics-1000",
  "wrap-static",
  "wrap-fractional",
  "wrap-mixed-10000",
  "wrap-mixed-billion",
  "wrap-mixed-decimal",
  "helper-large-y",
  "helper-large-x",
  "fast-horizontal-tall",
  "fast-horizontal-blocked"
] as const;
export type SecurityVector = (typeof securityVectors)[number];

/** Absolute caps abort a broken algorithm inside its probe, before a tab-sized hang.
 * The collision budget is 50*n*n. Source probes are capped per scenario:
 * 1000 for direct helpers, 20000 for mixed wrap/fast horizontal, 200000 for
 * the original vectors, and 20*n*n for the 1000-static sorted sweep.
 */
export function securityScenario(vector: SecurityVector): Counts {
  let counts: Counts;
  const item: LayoutItem = { i: "a", x: 0, y: 0, w: 1, h: 1 };
  switch (vector) {
    case "helper-large-y":
    case "helper-large-x": {
      const vertical = vector === "helper-large-y";
      const blocker = {
        ...item,
        i: "blocker",
        static: true,
        x: vertical ? 1 : 0,
        y: vertical ? 0 : 1,
        w: vertical ? 1 : 1e9,
        h: vertical ? 1e9 : 1
      };
      const moving = { ...item, x: vertical ? 0 : 1e9, y: vertical ? 1e9 : 0 };
      counts = measure(() => {
        if (vertical)
          compactItemVertical([blocker], moving, [blocker, moving], 1e9);
        else compactItemHorizontal([blocker], moving, 2, [blocker, moving]);
      }, 1000);
      expect(moving).toMatchObject({ x: 0, y: 0 });
      break;
    }
    case "fast-horizontal-tall":
    case "fast-horizontal-blocked": {
      const blocked = vector === "fast-horizontal-blocked";
      const input = [
        { ...item, i: "static", w: blocked ? 2 : 1, h: 1e9, static: true },
        { ...item, x: 1 }
      ];
      // Catch a restored per-row allocation before fill can consume gigabytes.
      const fill = Array.prototype.fill;
      const allocation = jest
        .spyOn(Array.prototype, "fill")
        .mockImplementation(function (...args) {
          if (this.length > 1_000_000)
            throw new Error("Per-row tide allocation");
          return fill.apply(this, args);
        });
      const warning = jest.spyOn(console, "warn").mockImplementation(() => {});
      let output: Layout = [];
      try {
        counts = measure(() => {
          for (const compactor of [
            fastHorizontalCompactor,
            fastHorizontalOverlapCompactor
          ]) {
            output = compactor.compact(input, 2);
            expect(output.find(l => l.i === "a")).toMatchObject(
              blocked ? { x: 0, y: 10_001 } : { x: 1, y: 0 }
            );
          }
        }, 20_000);
      } finally {
        allocation.mockRestore();
        warning.mockRestore();
      }
      break;
    }
    case "wrap-mixed-10000":
    case "wrap-mixed-billion":
    case "wrap-mixed-decimal": {
      const height = vector === "wrap-mixed-10000" ? 10_000 : 1e9;
      let output: Layout = [];
      counts = measure(
        () => {
          output = wrapCompactor.compact(
            [
              { ...item, i: "integer", w: 2, h: height, static: true },
              {
                ...item,
                i: "fraction",
                x: vector === "wrap-mixed-decimal" ? 2.4 : 2.5,
                y: vector === "wrap-mixed-decimal" ? 0.9 : 0.875,
                w: 1.5,
                h: height,
                static: true
              },
              { ...item, i: "first", y: 1, w: 2 },
              { ...item, i: "second", y: 1 }
            ],
            4
          );
        },
        vector === "wrap-mixed-decimal" ? 200_000 : 20_000
      );
      expect(output[2]).toMatchObject({ x: 2, y: 0 });
      if (vector === "wrap-mixed-decimal")
        expect(output[3]!.y).toBeLessThanOrEqual(height);
      else expect(output[3]).toMatchObject({ x: 0, y: height });
      break;
    }
    case "large-y": {
      let output: Layout = [];
      counts = measure(() => {
        output = verticalCompactor.compact(
          [
            { ...item, i: "static", x: 1, h: 1e9, static: true },
            { ...item, y: 1e9 }
          ],
          2
        );
      }, 200_000);
      expect(output[1]).toMatchObject({ y: 0 });

      break;
    }
    case "overlapping-statics":
    case "overlapping-statics-1000": {
      const n = vector === "overlapping-statics-1000" ? 1000 : 80;
      const input = Array.from({ length: n }, (_, i) => ({
        ...item,
        i: String(i),
        h: 10_000,
        static: true
      }));
      counts = measure(
        () => {
          correctBounds(input, { cols: 1 });
        },
        n === 1000 ? 20_000_000 : 200_000
      );
      expect(input[0]!.y).toBe(10_000);
      expect(input[n - 2]!.y).toBe((n - 1) * 10_000);
      expect(input[n - 1]!.y).toBe(0);

      break;
    }
    case "wrap-static": {
      let output: Layout = [];
      counts = measure(() => {
        output = wrapCompactor.compact(
          [{ ...item, i: "static", h: 1e9, static: true }, item],
          1
        );
      }, 200_000);
      expect(output[1]).toMatchObject({ x: 0, y: 1e9 });

      break;
    }
    case "wrap-fractional": {
      const statics = Array.from({ length: 80 }, (_, i) => ({
        ...item,
        i: `s${i}`,
        x: 0.5,
        w: 1.5,
        h: 10_000,
        static: true
      }));
      let output: Layout = [];
      counts = measure(() => {
        output = wrapCompactor.compact(
          [
            ...statics,
            { ...item, i: "first", w: 1.5 },
            { ...item, i: "second", w: 1.5 }
          ],
          2
        );
      }, 200_000);
      expect(output[81]).toMatchObject({ x: 0.5, y: 10_000 });
      break;
    }
    default: {
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
          fireEvent.mouseMove(document, {
            clientX: 20,
            clientY: 20,
            buttons: 1
          });
          fireEvent.mouseUp(document, { clientX: 20, clientY: 20, button: 0 });
        }, 200_000);
        expect(resized.mock.calls.at(-1)?.[2].h).toBe(10_000);
      } finally {
        view.unmount();
        warning.mockRestore();
      }
    }
  }
  expect(counts.collides).toBeLessThan(
    50 *
      (vector === "overlapping-statics-1000"
        ? 1000
        : vector === "overlapping-statics"
          ? 80
          : 2) **
        2
  );
  return counts;
}
