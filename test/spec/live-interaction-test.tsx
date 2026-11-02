import React from "react";
import { act, render } from "@testing-library/react";
import GridLayout from "../../src/react/components/GridLayout";
import LegacyGridLayout from "../../src/legacy/ReactGridLayout";
import GridItem from "../../src/react/components/GridItem";
import {
  absoluteStrategy,
  createScaledStrategy,
  noCompactor,
  transformStrategy
} from "../../src/core/index";

const Modern = GridLayout;
const Legacy = LegacyGridLayout;

function mouse(node: Element | Document, type: string, x: number, y: number) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    buttons: type === "mouseup" ? 0 : 1,
    clientX: x,
    clientY: y
  });
  act(() => {
    node.dispatchEvent(event);
  });
  return event;
}

const modes = [
  { name: "v2 transform", legacy: false, absolute: false, scale: 1 },
  { name: "v2 absolute", legacy: false, absolute: true, scale: 1 },
  { name: "v2 scaled", legacy: false, absolute: false, scale: 0.5 },
  { name: "legacy transform", legacy: true, absolute: false, scale: 1 },
  { name: "legacy absolute", legacy: true, absolute: true, scale: 1 },
  { name: "legacy scaled", legacy: true, absolute: false, scale: 0.5 }
];

function setup(mode: (typeof modes)[number]) {
  const onDrag = jest.fn();
  const onDragStop = jest.fn();
  const onResize = jest.fn();
  const onResizeStop = jest.fn();
  const children = [<div key="a">a</div>, <div key="b">b</div>];
  const common = {
    width: 1200,
    layout: [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "b", x: 8, y: 0, w: 2, h: 2 }
    ],
    onDrag,
    onDragStop,
    onResize,
    onResizeStop,
    children
  };
  const result = render(
    mode.legacy ? (
      <Legacy
        {...common}
        cols={12}
        rowHeight={100}
        margin={[0, 0]}
        containerPadding={[0, 0]}
        compactType={null}
        useCSSTransforms={!mode.absolute}
        transformScale={mode.scale}
      />
    ) : (
      <Modern
        {...common}
        gridConfig={{
          cols: 12,
          rowHeight: 100,
          margin: [0, 0],
          containerPadding: [0, 0]
        }}
        dragConfig={{ threshold: 0 }}
        compactor={noCompactor}
        positionStrategy={
          mode.absolute ? absoluteStrategy : createScaledStrategy(mode.scale)
        }
      />
    )
  );
  return { ...result, onDrag, onDragStop, onResize, onResizeStop };
}

function location(node: HTMLElement, absolute: boolean) {
  return absolute
    ? [Number.parseFloat(node.style.left), Number.parseFloat(node.style.top)]
    : node.style.transform.match(/-?\d+(?:\.\d+)?(?=px)/g)!.map(Number);
}

describe.each(modes)("#2303 live interaction: $name", mode => {
  it("renders every sub-cell drag move, keeps the placeholder snapped, and snaps on stop", () => {
    const { container, onDrag, onDragStop } = setup(mode);
    const item = container.querySelector(".react-grid-item") as HTMLElement;
    mouse(item, "mousedown", 0, 0);
    const positions: number[][] = [];
    for (const delta of [7, 13, 21]) {
      const event = mouse(
        document,
        "mousemove",
        delta * mode.scale,
        delta * mode.scale
      );
      positions.push(location(item, mode.absolute));
      expect(onDrag.mock.calls.at(-1)![2]).toMatchObject({ x: 0, y: 0 });
      expect(onDrag.mock.calls.at(-1)![4]).toBe(event);
      const placeholder = container.querySelector(
        ".react-grid-placeholder"
      ) as HTMLElement;
      expect(location(placeholder, mode.absolute)).toEqual([0, 0]);
    }
    const event = mouse(document, "mouseup", 21 * mode.scale, 21 * mode.scale);
    expect(onDrag).toHaveBeenCalledTimes(3);
    expect(onDragStop).toHaveBeenCalledTimes(1);
    expect(onDragStop.mock.calls[0][2]).toMatchObject({ x: 0, y: 0 });
    expect(onDragStop.mock.calls[0][4]).toBe(event);
    expect(onDragStop.mock.calls[0][5]).toBe(item);
    expect(container.querySelector(".react-grid-placeholder")).toBeNull();
    expect(location(item, mode.absolute)).toEqual([0, 0]);
    expect(positions).toEqual([
      [7, 7],
      [13, 13],
      [21, 21]
    ]);
  });

  it("renders every sub-cell resize move and restores snapped dimensions on stop", () => {
    const { container, onResize, onResizeStop } = setup(mode);
    const item = container.querySelector(".react-grid-item") as HTMLElement;
    const handle = item.querySelector(".react-resizable-handle-se")!;
    mouse(handle, "mousedown", 200 * mode.scale, 200 * mode.scale);
    const sizes: string[][] = [];
    for (const delta of [7, 13, 21]) {
      const event = mouse(
        document,
        "mousemove",
        (200 + delta) * mode.scale,
        (200 + delta) * mode.scale
      );
      sizes.push([item.style.width, item.style.height]);
      expect(onResize.mock.calls.at(-1)![2]).toMatchObject({ w: 2, h: 2 });
      expect(onResize.mock.calls.at(-1)![4]).toBe(event);
      const placeholder = container.querySelector(
        ".react-grid-placeholder"
      ) as HTMLElement;
      expect([placeholder.style.width, placeholder.style.height]).toEqual([
        "200px",
        "200px"
      ]);
    }
    const event = mouse(
      document,
      "mouseup",
      221 * mode.scale,
      221 * mode.scale
    );
    expect(onResize).toHaveBeenCalledTimes(3);
    expect(onResizeStop).toHaveBeenCalledTimes(1);
    expect(onResizeStop.mock.calls[0][2]).toMatchObject({ w: 2, h: 2 });
    expect(onResizeStop.mock.calls[0][4]).toBe(event);
    expect(container.querySelector(".react-grid-placeholder")).toBeNull();
    expect([item.style.width, item.style.height]).toEqual(["200px", "200px"]);
    expect(sizes).toEqual([
      ["207px", "207px"],
      ["213px", "213px"],
      ["221px", "221px"]
    ]);
  });
});

it("keeps unchanged idle GridItems memoized", () => {
  const calcStyle = jest.fn(transformStrategy.calcStyle);
  const props = {
    children: <div>idle</div>,
    cols: 12,
    containerWidth: 1200,
    margin: [0, 0] as const,
    containerPadding: [0, 0] as const,
    rowHeight: 100,
    maxRows: Infinity,
    i: "idle",
    x: 0,
    y: 0,
    w: 2,
    h: 2,
    isDraggable: true,
    isResizable: true,
    isBounded: false,
    positionStrategy: { ...transformStrategy, calcStyle }
  };
  const { rerender } = render(<GridItem {...props} />);
  const initial = calcStyle.mock.calls.length;
  rerender(<GridItem {...props} />);
  expect(calcStyle).toHaveBeenCalledTimes(initial);
  rerender(<GridItem {...props} x={1} />);
  expect(calcStyle).toHaveBeenCalledTimes(initial + 1);
});

it("preserves synchronous drag deltas when moves are batched", () => {
  const { container, onDragStop } = setup(modes[0]);
  const item = container.querySelector(".react-grid-item") as HTMLElement;
  mouse(item, "mousedown", 0, 0);
  act(() => {
    for (const delta of [7, 13, 21]) {
      document.dispatchEvent(
        new MouseEvent("mousemove", {
          bubbles: true,
          buttons: 1,
          clientX: delta,
          clientY: delta
        })
      );
    }
  });
  expect(location(item, false)).toEqual([21, 21]);
  mouse(document, "mouseup", 21, 21);
  expect(onDragStop).toHaveBeenCalledTimes(1);
});

it("does not trigger drag callbacks before the v2 threshold", () => {
  const onDragStart = jest.fn();
  const onDragStop = jest.fn();
  const { container } = render(
    <Modern
      width={1200}
      layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
      onDragStart={onDragStart}
      onDragStop={onDragStop}
    >
      <div key="a">a</div>
    </Modern>
  );
  const item = container.querySelector(".react-grid-item")!;
  mouse(item, "mousedown", 0, 0);
  mouse(document, "mousemove", 1, 1);
  mouse(document, "mouseup", 1, 1);
  expect(onDragStart).not.toHaveBeenCalled();
  expect(onDragStop).not.toHaveBeenCalled();
  expect(container.querySelector(".react-grid-placeholder")).toBeNull();
});

it("retains pixel drag bounds and resize min/max constraints", () => {
  const { container } = render(
    <Modern
      width={1200}
      layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2, maxW: 3, maxH: 3 }]}
      gridConfig={{
        cols: 12,
        rowHeight: 100,
        margin: [0, 0],
        containerPadding: [0, 0]
      }}
      compactor={noCompactor}
      dragConfig={{ bounded: true, threshold: 0 }}
    >
      <div key="a">a</div>
    </Modern>
  );
  const grid = container.querySelector(".react-grid-layout")!;
  Object.defineProperty(grid, "clientHeight", { value: 400 });
  const item = container.querySelector(".react-grid-item") as HTMLElement;
  mouse(item, "mousedown", 0, 0);
  mouse(document, "mousemove", -20, -20);
  expect(location(item, false)).toEqual([0, 0]);
  mouse(document, "mousemove", 2000, 1000);
  expect(location(item, false)).toEqual([1000, 200]);
  mouse(document, "mouseup", 2000, 1000);
  // Move back from the right edge before checking size limits independently.
  mouse(item, "mousedown", 0, 0);
  mouse(document, "mousemove", -2000, -1000);
  mouse(document, "mouseup", -2000, -1000);
  const handle = item.querySelector(".react-resizable-handle-se")!;
  mouse(handle, "mousedown", 0, 0);
  mouse(document, "mousemove", -500, -500);
  expect([item.style.width, item.style.height]).toEqual(["100px", "100px"]);
  mouse(document, "mousemove", 500, 500);
  expect([item.style.width, item.style.height]).toEqual(["300px", "300px"]);
  mouse(document, "mouseup", 500, 500);
});
