import React from "react";
import { act, render } from "@testing-library/react";
import { GridItem } from "../../src/react/components/GridItem";
import { createScaledStrategy } from "../../src/core/position";

function mouse(node: EventTarget, type: string, x: number, y: number) {
  act(() => {
    node.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        button: 0,
        clientX: x,
        clientY: y
      })
    );
  });
}

function fixture(scale: number, customPosition: boolean) {
  const start = jest.fn(),
    drag = jest.fn(),
    stop = jest.fn();
  const strategy = createScaledStrategy(scale);
  if (!customPosition) delete strategy.calcDragPosition;
  const { container } = render(
    <div>
      <GridItem
        i="a"
        x={1}
        y={1}
        w={2}
        h={2}
        cols={12}
        containerWidth={960}
        rowHeight={40}
        margin={[10, 10]}
        containerPadding={[18, 18]}
        maxRows={Infinity}
        isDraggable={true}
        isResizable={false}
        isBounded={false}
        transformScale={scale}
        positionStrategy={strategy}
        dragThreshold={0}
        onDragStart={start}
        onDrag={drag}
        onDragStop={stop}
      >
        <div data-testid="tile" />
      </GridItem>
    </div>
  );
  const tile = container.querySelector('[data-testid="tile"]') as HTMLElement;
  const parent = tile.parentElement!;
  Object.defineProperties(parent, {
    clientLeft: { value: 6 },
    clientTop: { value: 6 },
    scrollLeft: { value: 40 },
    scrollTop: { value: 40 }
  });
  parent.getBoundingClientRect = () => ({ left: 220, top: 293 }) as DOMRect;
  tile.getBoundingClientRect = () =>
    ({
      left: 220 + (96 - 40 + 6) * scale,
      top: 293 + (68 - 40 + 6) * scale
    }) as DOMRect;
  const rect = tile.getBoundingClientRect();
  return {
    tile,
    start,
    drag,
    stop,
    x: rect.left + 43 * scale,
    y: rect.top + 31 * scale
  };
}

describe.each([false, true])(
  "parent borders (custom position: %s)",
  customPosition => {
    it.each([0.5, 0.75, 1, 1.5])(
      "keeps parent-local position with scale %s, border and scroll",
      scale => {
        const f = fixture(scale, customPosition);
        for (let attempt = 0; attempt < 2; attempt++) {
          f.start.mockClear();
          f.drag.mockClear();
          f.stop.mockClear();
          mouse(f.tile, "mousedown", f.x, f.y);
          expect(f.start).toHaveBeenCalledTimes(1);
          expect(f.start.mock.lastCall[3].newPosition).toEqual({
            left: 96,
            top: 68
          });
          mouse(document, "mousemove", f.x + 70, f.y + 45);
          expect(f.drag).toHaveBeenCalledTimes(1);
          expect(f.drag.mock.lastCall[3].newPosition.left).toBeCloseTo(
            96 + 70 / scale
          );
          expect(f.drag.mock.lastCall[3].newPosition.top).toBeCloseTo(
            68 + 45 / scale
          );
          mouse(document, "mouseup", f.x + 70, f.y + 45);
          expect(f.stop).toHaveBeenCalledTimes(1);
          expect(f.stop.mock.lastCall[3].newPosition).toEqual(
            f.drag.mock.lastCall[3].newPosition
          );
        }
      }
    );
  }
);

describe.each([false, true])(
  "body offset parent (custom position: %s)",
  customPosition => {
    it.each([
      ["position: static", false],
      ["position: relative", true],
      ["position: static; transform: translate(0px)", true],
      ["position: static; translate: 0px", true],
      ["position: static; perspective: 1000px", true],
      ["position: static; filter: blur(0px)", true],
      ["position: static; contain: layout", true],
      ["position: static; will-change: transform", true],
      ["position: static; transform-style: preserve-3d", true],
      ["position: static; transform-style: preserve-3d; opacity: 0.9", true],
      ["position: static; transform-style: preserve-3d; overflow: hidden", true]
    ])("handles %s", (style, containingBlock) => {
      const f = fixture(1, customPosition);
      const body = document.body;
      const oldStyle = body.style.cssText;
      const properties = [
        [body, "clientLeft", 6],
        [body, "clientTop", 10],
        [window, "scrollX", 40],
        [window, "scrollY", 55]
      ] as const;
      const descriptors = properties.map(([target, name]) =>
        Object.getOwnPropertyDescriptor(target, name)
      );
      const rect = jest.spyOn(body, "getBoundingClientRect");
      try {
        body.style.cssText = style as string;
        properties.forEach(([target, name, value]) =>
          Object.defineProperty(target, name, { configurable: true, value })
        );
        // A body margin and page scrolling must not become item offsets.
        rect.mockReturnValue({ left: 13 - 40, top: 17 - 55 } as DOMRect);
        Object.defineProperty(f.tile, "offsetParent", { value: body });
        f.tile.getBoundingClientRect = () =>
          ({
            left: 96 - 40 + (containingBlock ? 13 + 6 : 0),
            top: 68 - 55 + (containingBlock ? 17 + 10 : 0)
          }) as DOMRect;
        const tileRect = f.tile.getBoundingClientRect();
        mouse(f.tile, "mousedown", tileRect.left + 20, tileRect.top + 20);
        expect(f.start).toHaveBeenCalledTimes(1);
        expect(f.start.mock.lastCall[3].newPosition).toEqual({
          left: 96,
          top: 68
        });
        mouse(document, "mouseup", tileRect.left + 20, tileRect.top + 20);
      } finally {
        rect.mockRestore();
        body.style.cssText = oldStyle;
        properties.forEach(([target, name], i) => {
          const descriptor = descriptors[i];
          if (descriptor) Object.defineProperty(target, name, descriptor);
          else Reflect.deleteProperty(target, name);
        });
      }
    });
  }
);

// Auto insets retain the static position, including body margins and borders.
describe.each([false, true])(
  "body static origin (custom position: %s)",
  customPosition => {
    it("keeps a translated item at its static origin", () => {
      const f = fixture(1, customPosition);
      const body = document.body;
      const previousStyle = body.style.cssText;
      const rect = jest.spyOn(body, "getBoundingClientRect");
      try {
        body.style.cssText =
          "position:static;margin:17px 13px;border-left:6px solid;border-top:10px solid";
        rect.mockReturnValue({ left: 13, top: 17 } as DOMRect);
        Object.defineProperties(f.tile, {
          offsetParent: { value: body },
          offsetLeft: { value: 19 },
          offsetTop: { value: 27 }
        });
        f.tile.getBoundingClientRect = () =>
          ({ left: 96 + 19, top: 68 + 27 }) as DOMRect;
        mouse(f.tile, "mousedown", 135, 115);
        expect(f.start).toHaveBeenCalledTimes(1);
        expect(f.start.mock.lastCall[3].newPosition).toEqual({
          left: 96,
          top: 68
        });
        mouse(document, "mouseup", 135, 115);
      } finally {
        rect.mockRestore();
        body.style.cssText = previousStyle;
      }
    });
  }
);
