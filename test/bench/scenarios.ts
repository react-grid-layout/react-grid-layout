import React from "react";
import { fireEvent, render } from "@testing-library/react";
import type { Layout, LayoutItem } from "../../src/core/types";
import {
  verticalCompactor,
  horizontalCompactor,
  noCompactor
} from "../../src/core/compactors";
import {
  fastVerticalCompactor,
  fastHorizontalCompactor,
  wrapCompactor
} from "../../src/extras";
import {
  bottom,
  cloneLayout,
  correctBounds,
  moveElement
} from "../../src/core/layout";
import { GridLayout } from "../../src/react/components/GridLayout";
import { ResponsiveGridLayout } from "../../src/react/components/ResponsiveGridLayout";
import LegacyGridLayout from "../../src/legacy/ReactGridLayout";
import { generate } from "../golden/generators";
import { mulberry32 } from "../golden/rng";
import { dropExternal } from "../golden-react/drop";
import { measure, type Counts } from "./counters";

export const sizes = [50, 500, 2000] as const;
const cols = 12;
const seed = 42;

/** Mixed sizes and row jitter, using the golden corpus PRNG and IDs. */
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

type Interaction =
  | "drag-10"
  | "drag-subcell-10"
  | "resize"
  | "parent-rerender"
  | "mount"
  | "drag-stop"
  | "resize-stop"
  | "breakpoint"
  | "drop";

function reactScenario(
  size: number,
  interaction: Interaction,
  family: "packed" | "sparse"
): Counts {
  const isResize = interaction.startsWith("resize");
  const layout = verticalCompactor.compact(
    generate(family, seed, size, cols),
    cols
  );
  const children = layout.map(item =>
    React.createElement("div", { key: item.i, "data-bench-id": item.i })
  );
  const onDrag = jest.fn();
  const onResize = jest.fn();
  const onDragStop = jest.fn();
  const onResizeStop = jest.fn();
  const onDrop = jest.fn();
  const onBreakpointChange = jest.fn();
  const onLayoutChange = jest.fn();
  const Component =
    interaction === "parent-rerender"
      ? LegacyGridLayout
      : interaction === "breakpoint"
        ? ResponsiveGridLayout
        : GridLayout;
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
      onResize,
      onDragStop,
      onResizeStop,
      onDrop,
      onBreakpointChange,
      onLayoutChange,
      ...(interaction === "drop"
        ? {
            dropConfig: { enabled: true },
            droppingItem: { i: "external", w: 1, h: 1 }
          }
        : {}),
      ...(interaction === "breakpoint"
        ? {
            layouts: { lg: layout },
            breakpoints: { lg: 1000, sm: 0 },
            cols: { lg: 12, sm: 6 }
          }
        : {})
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
    if (interaction === "mount") {
      const counts = measure(() => {
        view = render(element);
      });
      expect(view!.container.querySelectorAll("[data-bench-id]")).toHaveLength(
        size
      );
      expect(counts.compact).toBeGreaterThan(0);
      expect(counts.gridItemRenders).toBe(size * counts.gridLayoutRenders);
      return counts;
    }
    view = render(element);
    if (interaction === "breakpoint") {
      onBreakpointChange.mockClear();
      onLayoutChange.mockClear();
      const counts = measure(() =>
        view!.rerender(React.cloneElement(element, { width: 600 }))
      );
      expect(onBreakpointChange).toHaveBeenCalledWith("sm", 6);
      const final = onLayoutChange.mock.calls.at(-1)?.[0] as Layout;
      expect(final).toHaveLength(size);
      expect(final.every(item => item.x + item.w <= 6)).toBe(true);
      expect(counts.compact).toBeGreaterThan(0);
      return counts;
    }
    if (interaction === "drop") {
      const drop = dropExternal(view.container);
      try {
        const counts = measure(() => {
          drop.enter({ x: 250, y: 150 });
          drop.over({ x: 250, y: 150 });
          drop.drop();
        });
        expect(onDrop).toHaveBeenCalledTimes(1);
        expect(onDrop.mock.calls[0]![1]).toMatchObject({
          i: "external",
          w: 1,
          h: 1
        });
        expect(
          view.container.querySelector(".react-grid-placeholder")
        ).toBeNull();
        expect(counts.compact).toBeGreaterThan(0);
        return counts;
      } finally {
        drop.uninstall();
      }
    }
    const item = view.container.querySelector<HTMLElement>(
      '[data-bench-id="0"]'
    );
    if (!item) throw new Error(`Missing ${interaction} item`);
    const target = isResize
      ? item.querySelector<HTMLElement>(".react-resizable-handle-se")
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
    const isStop = interaction.endsWith("-stop");
    const moves = isResize || isStop ? 1 : 10;
    const step = interaction === "drag-subcell-10" ? 1 : 100;
    const move = () => {
      for (let move = 1; move <= moves; move++) {
        fireEvent.mouseMove(document, {
          clientX: 10 + step * move,
          clientY: isResize ? 40 : 10,
          buttons: 1
        });
      }
    };
    const stop = () =>
      fireEvent.mouseUp(document, {
        clientX: 10 + step * moves,
        clientY: isResize ? 40 : 10,
        button: 0
      });
    let counts: Counts;
    if (isStop) {
      move();
      counts = measure(stop);
      const callback = isResize ? onResizeStop : onDragStop;
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.calls[0]![2]).toMatchObject({ i: "0" });
      expect(
        view.container.querySelector(".react-grid-placeholder")
      ).toBeNull();
      expect(counts.compact).toBeGreaterThan(0);
    } else counts = measure(move);
    const calls = isResize ? onResize.mock.calls : onDrag.mock.calls;
    expect(calls).toHaveLength(moves);
    // Prove real GridLayout handlers ran, rather than budgeting an inert DOM.
    const finalItem = calls.at(-1)![2] as LayoutItem;
    if (interaction === "drag-10") expect(finalItem.x).toBe(10);
    if (interaction === "drag-subcell-10") expect(finalItem.x).toBe(0);
    if (isResize) expect(finalItem.w).toBe(layout[0]!.w + 1);
    if (interaction === "drag-stop") expect(finalItem.x).toBe(1);
    if (!isStop) stop();
    return counts;
  } finally {
    view?.unmount();
    rect.mockRestore();
    height.mockRestore();
  }
}

export function runScenarios(): Record<string, Counts> {
  const results: Record<string, Counts> = {};
  const recordReact = (size: number, interaction: Interaction) => {
    const family = interaction.startsWith("resize") ? "sparse" : "packed";
    const id = String(size).padStart(4, "0");
    results[`${interaction}/${family}/${id}`] = reactScenario(
      size,
      interaction,
      family
    );
  };
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
      recordReact(size, interaction);
    }
  }
  recordReact(2000, "mount");
  for (const size of [50, 500]) {
    recordReact(size, "drag-stop");
    recordReact(size, "resize-stop");
  }
  for (const [name, compactor] of Object.entries({
    horizontal: horizontalCompactor,
    none: noCompactor,
    wrap: wrapCompactor,
    fastVertical: fastVerticalCompactor,
    fastHorizontal: fastHorizontalCompactor
  })) {
    const input = generate("statics-scattered", seed, 500, cols).map(item => ({
      ...item,
      h: 3
    }));
    let output: Layout = [];
    const counts = measure(() => {
      output = compactor.compact(input, cols);
    });
    expect(output).toHaveLength(input.length);
    expect(counts.compact).toBe(1);
    if (name === "fastVertical")
      expect(
        counts["extras/fastVerticalCompactor.ts:collides"]
      ).toBeGreaterThan(0);
    results[`compact-${name}/statics-scattered/0500`] = counts;
  }
  recordReact(500, "breakpoint");
  recordReact(500, "drop");
  return Object.fromEntries(
    Object.keys(results)
      .sort()
      .map(key => [key, results[key]])
  );
}
