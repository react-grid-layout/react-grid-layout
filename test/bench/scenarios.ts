import React from "react";
import { fireEvent, render } from "@testing-library/react";
import type { Layout, LayoutItem } from "../../src/core/types";
import { verticalCompactor } from "../../src/core/compactors";
import {
  bottom,
  cloneLayout,
  correctBounds,
  moveElement
} from "../../src/core/layout";
import { GridLayout } from "../../src/react/components/GridLayout";
import LegacyGridLayout from "../../src/legacy/ReactGridLayout";
import { generate } from "../golden/generators";
import { mulberry32 } from "../golden/rng";
import { measure, type Counts } from "./counters";

export const sizes = [50, 500, 2000] as const;
const cols = 12;
const seed = 42;

/** count.cjs's mixed-size corpus, using the golden corpus PRNG and IDs. */
function mixed(size: number): Layout {
  const random = mulberry32(seed);
  let x = 0;
  let y = 0;
  const layout = generate("packed", seed, size, cols).map(item => {
    const w = 1 + Math.floor(random() * 3);
    const h = 1 + Math.floor(random() * 3);
    if (x + w > cols) {
      x = 0;
      y += 2;
    }
    const result = { ...item, x, y: y + Math.floor(random() * 2), w, h };
    x += w;
    return result;
  });
  return verticalCompactor.compact(correctBounds(layout, { cols }), cols);
}

function dragFrame(layout: LayoutItem[], mid: number): Layout {
  const moved = moveElement(
    layout,
    layout[0]!,
    3,
    mid,
    true,
    false,
    "vertical",
    cols,
    false
  );
  return verticalCompactor.compact(moved, cols);
}

type Interaction = "drag-10" | "drag-subcell-10" | "resize" | "parent-rerender";

function reactScenario(size: number, interaction: Interaction): Counts {
  const family = interaction === "resize" ? "sparse" : "packed";
  const layout = verticalCompactor.compact(
    generate(family, seed, size, cols),
    cols
  );
  const children = layout.map(item =>
    React.createElement("div", { key: item.i, "data-bench-id": item.i })
  );
  const onDrag = jest.fn();
  const onResize = jest.fn();
  const Component =
    interaction === "parent-rerender" ? LegacyGridLayout : GridLayout;
  const element = React.createElement(
    Component,
    {
      width: 1200,
      layout,
      gridConfig: {
        cols,
        rowHeight: 30,
        margin: [0, 0],
        containerPadding: [0, 0]
      },
      dragConfig: { threshold: 0, bounded: true },
      compactor: verticalCompactor,
      onDrag,
      onResize
    },
    children
  );

  // Deterministic positioned-parent geometry. Keep pointer away from scroll edges.
  const rect = jest
    .spyOn(Element.prototype, "getBoundingClientRect")
    .mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      width: 1200,
      height: 100_000,
      right: 1200,
      bottom: 100_000,
      toJSON: () => ({})
    });
  const height = jest
    .spyOn(Element.prototype, "clientHeight", "get")
    .mockReturnValue(100_000);
  let view: ReturnType<typeof render> | undefined;
  try {
    view = render(element);
    const item = view.container.querySelector<HTMLElement>(
      '[data-bench-id="0"]'
    )!;
    const target =
      interaction === "resize"
        ? item.querySelector<HTMLElement>(".react-resizable-handle-se")!
        : item;
    if (!target) throw new Error(`Missing ${interaction} target`);

    if (interaction === "parent-rerender") {
      // A fresh element with stable children and consumer props.
      const next = React.cloneElement(element);
      return measure(() => view!.rerender(next));
    }

    fireEvent.mouseDown(target, { clientX: 10, clientY: 10, button: 0 });
    onDrag.mockClear();
    onResize.mockClear();
    const moves = interaction === "resize" ? 1 : 10;
    const step = interaction === "drag-subcell-10" ? 1 : 100;
    const counts = measure(() => {
      for (let move = 1; move <= moves; move++) {
        fireEvent.mouseMove(document, {
          clientX: 10 + step * move,
          clientY: interaction === "resize" ? 40 : 10,
          buttons: 1
        });
      }
    });
    const calls =
      interaction === "resize" ? onResize.mock.calls : onDrag.mock.calls;
    expect(calls).toHaveLength(moves);
    // Prove real GridLayout handlers ran, rather than budgeting an inert DOM.
    const finalItem = calls.at(-1)![2] as LayoutItem;
    if (interaction === "drag-10") expect(finalItem.x).toBe(10);
    if (interaction === "drag-subcell-10") expect(finalItem.x).toBe(0);
    if (interaction === "resize") expect(finalItem.w).toBe(layout[0]!.w + 1);
    fireEvent.mouseUp(document, {
      clientX: 10 + step * moves,
      clientY: 10,
      button: 0
    });
    return counts;
  } finally {
    view?.unmount();
    rect.mockRestore();
    height.mockRestore();
  }
}

export function runScenarios(): Record<string, Counts> {
  const results: Record<string, Counts> = {};
  for (const size of sizes) {
    const base = mixed(size);
    const mid = Math.floor(bottom(base) / 2);
    const id = String(size).padStart(4, "0");
    // Input cloning is preparation, as GridLayout already owns its current layout.
    const moveInput = cloneLayout(base);
    results[`move/mixed/${id}`] = measure(() => {
      moveElement(
        moveInput,
        moveInput[0]!,
        3,
        mid,
        true,
        false,
        "vertical",
        cols,
        false
      );
    });
    const dragInput = cloneLayout(base);
    results[`drag/mixed/${id}`] = measure(() => {
      dragFrame(dragInput, mid);
    });
    results[`compact/mixed/${id}`] = measure(() => {
      verticalCompactor.compact(base, cols);
    });
    for (const interaction of [
      "drag-10",
      "drag-subcell-10",
      "resize",
      "parent-rerender"
    ] as const) {
      const family = interaction === "resize" ? "sparse" : "packed";
      results[`${interaction}/${family}/${id}`] = reactScenario(
        size,
        interaction
      );
    }
  }
  return Object.fromEntries(
    Object.entries(results).sort(([a], [b]) => a.localeCompare(b))
  );
}
