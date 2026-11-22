import React from "react";
import { act, render } from "@testing-library/react";
import GridItem from "../../src/react/components/GridItem";
import { createScaledStrategy } from "../../src/core/position";

function mouse(target: EventTarget, type: string, x: number, y: number) {
  act(() => {
    target.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        button: 0,
        buttons: type === "mouseup" ? 0 : 1,
        clientX: x,
        clientY: y
      })
    );
  });
}

function fixture(scale: number, threshold: number) {
  const start = jest.fn(),
    drag = jest.fn(),
    stop = jest.fn();
  const content = (droppingPosition?: {
    left: number;
    top: number;
    e: Event;
  }) => (
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
        positionStrategy={createScaledStrategy(scale)}
        transformScale={scale}
        dragThreshold={threshold}
        droppingPosition={droppingPosition}
        onDragStart={start}
        onDrag={drag}
        onDragStop={stop}
      >
        <div data-testid="tile" />
      </GridItem>
    </div>
  );
  const { container, rerender } = render(content());
  const tile = container.querySelector<HTMLElement>('[data-testid="tile"]')!;
  const parent = tile.parentElement!;
  Object.defineProperty(tile, "offsetParent", { value: parent });
  parent.getBoundingClientRect = () => ({ left: 0, top: 0 }) as DOMRect;
  tile.getBoundingClientRect = () =>
    ({ left: 96 * scale, top: 68 * scale }) as DOMRect;
  return {
    tile,
    start,
    drag,
    stop,
    x: 120 * scale,
    y: 90 * scale,
    drop(dx: number, dy: number) {
      rerender(
        content({
          left: 96 + dx / scale,
          top: 68 + dy / scale,
          e: new MouseEvent("dragover", {
            clientX: 120 * scale + dx,
            clientY: 90 * scale + dy
          })
        })
      );
    }
  };
}

describe("pending drag deltas", () => {
  it.each([0.5, 1, 2])(
    "keeps dropping positions absolute at scale %s",
    scale => {
      const f = fixture(scale, 3);
      f.drop(0, 0);
      f.drop(1, 0);
      f.drop(2, 0);
      expect(f.start).not.toHaveBeenCalled();
      expect(f.drag).not.toHaveBeenCalled();
      f.drop(9, 4);
      expect(f.start).toHaveBeenCalledTimes(1);
      expect(f.drag).toHaveBeenCalledTimes(1);
      expect(f.drag.mock.lastCall[3].newPosition).toEqual({
        left: 96 + 9 / scale,
        top: 68 + 4 / scale
      });
      f.drop(15, 7);
      expect(f.drag).toHaveBeenCalledTimes(2);
      expect(f.drag.mock.lastCall[3].newPosition).toEqual({
        left: 96 + 15 / scale,
        top: 68 + 7 / scale
      });
      f.drop(-6, -4);
      expect(f.drag).toHaveBeenCalledTimes(3);
      expect(f.drag.mock.lastCall[3].newPosition).toEqual({
        left: 96 - 6 / scale,
        top: 68 - 4 / scale
      });
    }
  );

  it.each([0.5, 0.75, 1, 1.5, 2])(
    "retains movement across threshold and fresh gestures at scale %s",
    scale => {
      const f = fixture(scale, 8);
      // A completed click-sized gesture must not leak movement into the next drag.
      mouse(f.tile, "mousedown", f.x, f.y);
      mouse(document, "mousemove", f.x + 3, f.y + 2);
      mouse(document, "mouseup", f.x + 3, f.y + 2);
      expect(f.start).not.toHaveBeenCalled();
      expect(f.drag).not.toHaveBeenCalled();
      expect(f.stop).not.toHaveBeenCalled();
      for (const direction of [1, -1]) {
        f.start.mockClear();
        f.drag.mockClear();
        f.stop.mockClear();
        mouse(f.tile, "mousedown", f.x, f.y);
        mouse(document, "mousemove", f.x + direction * 3, f.y + direction * 2);
        // Reversing below threshold must accumulate signed displacement.
        mouse(document, "mousemove", f.x + direction, f.y + direction);
        expect(f.start).not.toHaveBeenCalled();
        expect(f.drag).not.toHaveBeenCalled();
        mouse(document, "mousemove", f.x + direction * 9, f.y + direction * 4);
        expect(f.start).toHaveBeenCalledTimes(1);
        expect(f.start.mock.lastCall[3].newPosition).toEqual({
          left: 96,
          top: 68
        });
        expect(f.drag).toHaveBeenCalledTimes(1);
        expect(f.drag.mock.lastCall[3].newPosition.left).toBeCloseTo(
          96 + (direction * 9) / scale
        );
        expect(f.drag.mock.lastCall[3].newPosition.top).toBeCloseTo(
          68 + (direction * 4) / scale
        );
        mouse(document, "mousemove", f.x + direction * 15, f.y + direction * 7);
        expect(f.drag.mock.lastCall[3].newPosition.left).toBeCloseTo(
          96 + (direction * 15) / scale
        );
        expect(f.drag.mock.lastCall[3].newPosition.top).toBeCloseTo(
          68 + (direction * 7) / scale
        );
        mouse(document, "mouseup", f.x + direction * 15, f.y + direction * 7);
        expect(f.stop).toHaveBeenCalledTimes(1);
        expect(f.stop.mock.lastCall[3].newPosition).toEqual(
          f.drag.mock.lastCall[3].newPosition
        );
      }
    }
  );

  it.each([0, 8])(
    "preserves a first move that immediately crosses threshold %s",
    threshold => {
      const f = fixture(0.5, threshold);
      mouse(f.tile, "mousedown", f.x, f.y);
      mouse(document, "mousemove", f.x + 12, f.y + 6);
      expect(f.start).toHaveBeenCalledTimes(1);
      expect(f.drag.mock.lastCall[3].newPosition).toEqual({
        left: 120,
        top: 80
      });
      mouse(document, "mouseup", f.x + 12, f.y + 6);
      expect(f.stop).toHaveBeenCalledTimes(1);
    }
  );
});
