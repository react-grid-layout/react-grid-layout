/**
 * react-draggable hides text selection during an interaction by adding a
 * class to <body> whose `::selection` rule applies to every element, which
 * makes the browser restyle the whole page as a drag or resize starts and
 * ends. dragConfig.enableUserSelectHack and resizeConfig.enableUserSelectHack
 * let a grid opt out (react-grid-layout#1630).
 */

import React from "react";
import { act, render } from "@testing-library/react";
import GridLayout from "../../src/react/components/GridLayout";
import type { DragConfig, ResizeConfig } from "../../src/core/types";

const HACK_CLASS = "react-draggable-transparent-selection";

function mouse(type: string) {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    buttons: type === "mouseup" ? 0 : 1,
    clientX: 10,
    clientY: 10
  });
}

function renderGrid(config: {
  dragConfig?: Partial<DragConfig>;
  resizeConfig?: Partial<ResizeConfig>;
}) {
  const { container } = render(
    <GridLayout
      width={1200}
      layout={[{ i: "a", x: 0, y: 0, w: 4, h: 2 }]}
      gridConfig={{ cols: 12, rowHeight: 30 }}
      {...config}
    >
      <div key="a">a</div>
    </GridLayout>
  );
  const item = container.querySelector<HTMLElement>(".react-grid-item")!;
  const handle = item.querySelector<HTMLElement>(".react-resizable-handle")!;
  return { handle, item };
}

/** Whether <body> carries the hack's class once the pointer goes down on target. */
function marksBodyOnPress(target: HTMLElement): boolean {
  act(() => {
    target.dispatchEvent(mouse("mousedown"));
  });
  return document.body.classList.contains(HACK_CLASS);
}

afterEach(() => {
  act(() => {
    document.dispatchEvent(mouse("mouseup"));
  });
  document.body.classList.remove(HACK_CLASS);
});

describe("enableUserSelectHack", () => {
  it("marks <body> while dragging by default", () => {
    const { item } = renderGrid({});
    expect(marksBodyOnPress(item)).toBe(true);
  });

  it("leaves <body> alone while dragging when dragConfig turns it off", () => {
    const { item } = renderGrid({
      dragConfig: { enableUserSelectHack: false }
    });
    expect(marksBodyOnPress(item)).toBe(false);
  });

  it("marks <body> while resizing by default", () => {
    const { handle } = renderGrid({});
    expect(marksBodyOnPress(handle)).toBe(true);
  });

  it("leaves <body> alone while resizing when resizeConfig turns it off", () => {
    const { handle } = renderGrid({
      resizeConfig: { enableUserSelectHack: false }
    });
    expect(marksBodyOnPress(handle)).toBe(false);
  });

  it("turns each one off on its own", () => {
    const { handle, item } = renderGrid({
      dragConfig: { enableUserSelectHack: false }
    });
    expect(marksBodyOnPress(handle)).toBe(true);
    act(() => {
      document.dispatchEvent(mouse("mouseup"));
    });
    document.body.classList.remove(HACK_CLASS);
    expect(marksBodyOnPress(item)).toBe(false);
  });
});
