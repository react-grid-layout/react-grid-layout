/**
 * #2312: the edge auto-scroll loop started by an external drag must stop once
 * the drop is committed. The dropping placeholder is unmounted on drop without
 * ever going through onDragStop, so the loop has to be stopped on unmount.
 */

import React from "react";
import { act, render } from "@testing-library/react";
import { GridLayout } from "../../src/react/components/GridLayout";

// Queue rAF callbacks instead of running them synchronously (the global test
// setup runs them inline, which would recurse forever in the scroll loop).
let rafQueue = new Map<number, FrameRequestCallback>();
let nextRafId = 0;
const originalRAF = globalThis.requestAnimationFrame;
const originalCancel = globalThis.cancelAnimationFrame;

function flushFrame() {
  const callbacks = [...rafQueue.values()];
  rafQueue = new Map();
  callbacks.forEach(cb => cb(performance.now()));
}

function dispatchDragEvent(
  target: Element,
  type: "dragover" | "drop",
  clientX: number,
  clientY: number
) {
  act(() => {
    target.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX,
        clientY
      })
    );
  });
}

describe("#2312 edge auto-scroll after an external drop", () => {
  beforeEach(() => {
    rafQueue = new Map();
    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
      const id = ++nextRafId;
      rafQueue.set(id, cb);
      return id;
    };
    globalThis.cancelAnimationFrame = (id: number) => {
      rafQueue.delete(id);
    };
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRAF;
    globalThis.cancelAnimationFrame = originalCancel;
  });

  it("stops scrolling the container once the item is dropped", () => {
    const onDrop = jest.fn();
    const { container } = render(
      <div className="scroller" style={{ height: 200, overflowY: "auto" }}>
        <GridLayout
          width={1200}
          layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
          gridConfig={{ cols: 12, rowHeight: 30 }}
          dropConfig={{ enabled: true }}
          onDrop={onDrop}
        >
          <div key="a">a</div>
        </GridLayout>
      </div>
    );

    // jsdom has no layout, so give the wrapper a scrollable geometry.
    const scroller = container.querySelector(".scroller") as HTMLElement;
    let scrollTop = 0;
    Object.defineProperties(scroller, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 1000 },
      scrollTop: {
        configurable: true,
        get: () => scrollTop,
        set: (value: number) => {
          scrollTop = value;
        }
      }
    });

    const grid = container.querySelector(".react-grid-layout")!;
    // The first dragover mounts the placeholder, the second one moves it and
    // starts the edge scroll (the pointer is within the bottom edge zone).
    dispatchDragEvent(grid, "dragover", 100, 100);
    dispatchDragEvent(grid, "dragover", 100, 190);
    flushFrame();
    expect(scrollTop).toBeGreaterThan(0);

    dispatchDragEvent(grid, "drop", 100, 190);
    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".react-grid-placeholder")).toBeNull();

    const scrollTopAfterDrop = scrollTop;
    flushFrame();
    flushFrame();
    expect(scrollTop).toBe(scrollTopAfterDrop);
    expect(rafQueue.size).toBe(0);
  });
});
