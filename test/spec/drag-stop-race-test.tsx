import React from "react";
import { act, render } from "@testing-library/react";
import GridLayout from "../../src/react/components/GridLayout";

declare const globalThis: { IS_REACT_ACT_ENVIRONMENT?: boolean };

function mouse(type: string, clientX: number) {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    buttons: type === "mouseup" ? 0 : 1,
    clientX,
    clientY: 10
  });
}

describe("#2291 onDragStop when the release beats the threshold render", () => {
  const prevActEnv = globalThis.IS_REACT_ACT_ENVIRONMENT;

  afterEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = prevActEnv;
  });

  it("ends a drag whose mouseup arrives before the drag start renders", async () => {
    const onDragStart = jest.fn();
    const onDragStop = jest.fn();
    const { container } = render(
      <GridLayout
        width={1200}
        layout={[
          { i: "a", x: 0, y: 0, w: 4, h: 2 },
          { i: "b", x: 4, y: 0, w: 4, h: 2 }
        ]}
        gridConfig={{
          cols: 24,
          rowHeight: 64,
          margin: [16, 16],
          containerPadding: [0, 0]
        }}
        dragConfig={{ enabled: true }}
        onDragStart={onDragStart}
        onDragStop={onDragStop}
      >
        <div key="a">a</div>
        <div key="b">b</div>
      </GridLayout>
    );
    const item = container.querySelector(".react-grid-item")!;

    act(() => {
      item.dispatchEvent(mouse("mousedown", 10));
    });

    globalThis.IS_REACT_ACT_ENVIRONMENT = false;
    item.dispatchEvent(mouse("mousemove", 60));
    expect(onDragStart).toHaveBeenCalledTimes(1);
    item.dispatchEvent(mouse("mouseup", 60));
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(onDragStop).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".react-grid-placeholder")).toBeNull();
  });
});
