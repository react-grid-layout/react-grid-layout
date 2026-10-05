/**
 * Regression test for #2264.
 *
 * react-resizable forwards react-draggable's callback event, which is already a
 * native MouseEvent/TouchEvent and has no `nativeEvent` property. GridItem read
 * `e.nativeEvent` unconditionally, so every onResizeStart/onResize/onResizeStop
 * consumer received `undefined` as the event.
 *
 * GridItem's four drag handlers already pass the raw event. Resize must match.
 */

import React from "react";
import { render } from "@testing-library/react";
import type { ResizeCallbackData } from "react-resizable";

// Capture the resize callbacks react-resizable would be driving, so the test can
// invoke them with the event shape react-draggable actually delivers.
type ResizeHandler = (e: unknown, data: ResizeCallbackData) => void;
const captured: {
  onResizeStart?: ResizeHandler;
  onResize?: ResizeHandler;
  onResizeStop?: ResizeHandler;
}[] = [];

jest.mock("react-resizable", () => {
  const actual = jest.requireActual("react-resizable");
  return {
    ...actual,
    Resizable: (props: Record<string, unknown>) => {
      captured.push({
        onResizeStart: props.onResizeStart as ResizeHandler | undefined,
        onResize: props.onResize as ResizeHandler | undefined,
        onResizeStop: props.onResizeStop as ResizeHandler | undefined
      });
      const { Resizable: ActualResizable } = actual;
      return <ActualResizable {...props} />;
    }
  };
});

// Import GridItem AFTER the mock is set up
import { GridItem, type GridItemProps } from "../../src/react/index";

describe("#2264 resize callback event", () => {
  beforeEach(() => {
    captured.length = 0;
  });

  function renderItem(overrides: Partial<GridItemProps> = {}) {
    const props: GridItemProps = {
      children: <div>child</div>,
      cols: 12,
      containerWidth: 1200,
      rowHeight: 30,
      margin: [10, 10] as const,
      maxRows: 10,
      containerPadding: [10, 10] as const,
      i: "0",
      x: 0,
      y: 0,
      w: 3,
      h: 2,
      isDraggable: false,
      isResizable: true,
      isBounded: false,
      useCSSTransforms: false,
      ...overrides
    };
    render(<GridItem {...props} />);
    const last = captured[captured.length - 1];
    if (!last) throw new Error("Resizable was never rendered");
    return last;
  }

  function resizeData(node: HTMLElement): ResizeCallbackData {
    return {
      node,
      size: { width: 300, height: 80 },
      handle: "se"
    } as ResizeCallbackData;
  }

  it.each(["onResizeStart", "onResize", "onResizeStop"] as const)(
    "%s receives the native event, not undefined",
    handlerName => {
      const received: unknown[] = [];
      const handlers = renderItem({
        [handlerName]: (
          _i: string,
          _w: number,
          _h: number,
          data: { e: unknown }
        ) => {
          received.push(data.e);
        }
      });

      const node = document.createElement("div");
      // What react-draggable actually delivers: a raw DOM event with no
      // `nativeEvent` property.
      const nativeEvent = new MouseEvent("mousemove", { bubbles: true });
      expect("nativeEvent" in nativeEvent).toBe(false);

      handlers[handlerName]?.(nativeEvent, resizeData(node));

      expect(received).toHaveLength(1);
      expect(received[0]).toBe(nativeEvent);
    }
  );

  it("still unwraps a React SyntheticEvent when given one", () => {
    const received: unknown[] = [];
    const handlers = renderItem({
      onResize: (_i: string, _w: number, _h: number, data: { e: unknown }) => {
        received.push(data.e);
      }
    });

    const node = document.createElement("div");
    const inner = new MouseEvent("mousemove", { bubbles: true });
    const synthetic = { nativeEvent: inner, type: "mousemove" };

    handlers.onResize?.(synthetic, resizeData(node));

    expect(received[0]).toBe(inner);
  });
});
