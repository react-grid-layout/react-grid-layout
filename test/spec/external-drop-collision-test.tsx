import React from "react";
import { act, render } from "@testing-library/react";
import { GridLayout } from "../../src/react/components/GridLayout";
import { verticalCompactor } from "../../src/core/compactors";
import type { Compactor } from "../../src/core/types";

describe.each(["mouse", "touch"] as const)(
  "%s external drop collisions",
  input => {
    const originalElementFromPoint = document.elementFromPoint;

    afterEach(() => {
      document.elementFromPoint = originalElementFromPoint;
    });

    function setup(compactor: Compactor = verticalCompactor) {
      const onDrop = jest.fn();
      const onLayoutChange = jest.fn();
      const initialLayout = [{ i: "a", x: 0, y: 0, w: 1, h: 1 }];
      const { container } = render(
        <>
          <div data-rgl-draggable="" data-testid="source">
            Drag me
          </div>
          <GridLayout
            width={200}
            layout={initialLayout}
            gridConfig={{
              cols: 2,
              rowHeight: 100,
              margin: [0, 0],
              containerPadding: [0, 0]
            }}
            dropConfig={{ enabled: true }}
            compactor={compactor}
            onDrop={onDrop}
            onLayoutChange={onLayoutChange}
          >
            <div key="a" data-testid="existing">
              a
            </div>
          </GridLayout>
        </>
      );
      const grid = container.querySelector<HTMLElement>(".react-grid-layout")!;
      const source = container.querySelector<HTMLElement>(
        '[data-testid="source"]'
      )!;
      document.elementFromPoint = () => grid;
      onLayoutChange.mockClear();

      function touch(type: string, clientX: number, clientY: number) {
        const event = new Event(type, { bubbles: true, cancelable: true });
        const point = { identifier: 1, clientX, clientY, target: source };
        Object.defineProperties(event, {
          touches: { value: type === "touchend" ? [] : [point] },
          changedTouches: { value: [point] }
        });
        act(() => source.dispatchEvent(event));
      }

      if (input === "touch") touch("touchstart", -50, -50);

      return {
        onDrop,
        onLayoutChange,
        initialLayout,
        existing: container.querySelector<HTMLElement>(
          '[data-testid="existing"]'
        )!,
        move(x: number, y: number) {
          if (input === "touch") touch("touchmove", x, y);
          else
            act(() =>
              grid.dispatchEvent(
                new MouseEvent("dragover", {
                  bubbles: true,
                  clientX: x,
                  clientY: y
                })
              )
            );
        },
        drop(x: number, y: number) {
          if (input === "touch") touch("touchend", x, y);
          else
            act(() =>
              grid.dispatchEvent(
                new MouseEvent("drop", {
                  bubbles: true,
                  clientX: x,
                  clientY: y
                })
              )
            );
        }
      };
    }

    it.each([false, true])(
      "pushes the top item and commits above it (direct entry: %s)",
      direct => {
        const { move, drop, existing, onDrop, onLayoutChange, initialLayout } =
          setup();
        if (!direct) move(150, 50); // Start in the empty column, then move over a.
        move(50, 50);

        expect(existing.style.transform).toBe("translate(0px,100px)");
        expect(onLayoutChange).not.toHaveBeenCalled();
        drop(50, 50);

        expect(onDrop).toHaveBeenCalledTimes(1);
        const [layout, item] = onDrop.mock.calls[0];
        expect(item).toMatchObject({ i: "__dropping-elem__", x: 0, y: 0 });
        expect(layout).toContainEqual(
          expect.objectContaining({ i: "a", x: 0, y: 1 })
        );
        expect(initialLayout).toEqual([{ i: "a", x: 0, y: 0, w: 1, h: 1 }]);
      }
    );

    it("preserves the last free cell when collisions are prevented", () => {
      const { move, drop, existing, onDrop } = setup({
        ...verticalCompactor,
        preventCollision: true
      });
      move(150, 50);
      move(50, 50);
      expect(existing.style.transform).toBe("translate(0px,0px)");
      drop(50, 50);
      expect(onDrop.mock.calls[0][1]).toMatchObject({ x: 1, y: 0 });
    });

    it("does not push existing items when overlap is allowed", () => {
      const { move, drop, existing, onDrop } = setup({
        ...verticalCompactor,
        allowOverlap: true,
        compact: layout => layout
      });
      move(150, 50);
      move(50, 50);
      expect(existing.style.transform).toBe("translate(0px,0px)");
      drop(50, 50);
      expect(onDrop.mock.calls[0][1]).toMatchObject({ x: 0, y: 0 });
    });
  }
);
