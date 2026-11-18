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
          mouse(f.tile, "mousedown", f.x, f.y);
          expect(f.start.mock.lastCall[3].newPosition).toEqual({
            left: 96,
            top: 68
          });
          mouse(document, "mousemove", f.x + 70, f.y + 45);
          expect(f.drag.mock.lastCall[3].newPosition.left).toBeCloseTo(
            96 + 70 / scale
          );
          expect(f.drag.mock.lastCall[3].newPosition.top).toBeCloseTo(
            68 + 45 / scale
          );
          mouse(document, "mouseup", f.x + 70, f.y + 45);
          expect(f.stop.mock.lastCall[3].newPosition).toEqual(
            f.drag.mock.lastCall[3].newPosition
          );
        }
      }
    );
  }
);
