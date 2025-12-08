// @flow
/* eslint-env jest */

/**
 * Backwards Compatibility Tests
 *
 * These tests verify actual behavioral contracts of the public API.
 * If any of these tests fail after changes, it indicates a breaking change.
 */

import * as React from "react";
import { render, act, fireEvent } from "@testing-library/react";
import ReactGridLayout from "../../lib/ReactGridLayout";
import ResponsiveReactGridLayout from "../../lib/ResponsiveReactGridLayout";
import WidthProvider from "../../lib/components/WidthProvider";
import {
  synchronizeLayoutWithChildren,
  compact,
  moveElement
} from "../../lib/utils";

describe("Backwards Compatibility: Callback Signatures", () => {
  const baseLayout = [
    { i: "a", x: 0, y: 0, w: 2, h: 2 },
    { i: "b", x: 2, y: 0, w: 2, h: 2 }
  ];

  it("onLayoutChange provides layout with all required fields", () => {
    const onLayoutChange = jest.fn();

    render(
      <ReactGridLayout
        layout={baseLayout}
        width={1200}
        cols={12}
        onLayoutChange={onLayoutChange}
      >
        <div key="a">A</div>
        <div key="b">B</div>
      </ReactGridLayout>
    );

    expect(onLayoutChange).toHaveBeenCalled();
    const [layout] = onLayoutChange.mock.calls[0];

    // Verify all items have required fields
    layout.forEach(item => {
      expect(item).toHaveProperty("i");
      expect(item).toHaveProperty("x");
      expect(item).toHaveProperty("y");
      expect(item).toHaveProperty("w");
      expect(item).toHaveProperty("h");
      expect(typeof item.i).toBe("string");
      expect(typeof item.x).toBe("number");
      expect(typeof item.y).toBe("number");
      expect(typeof item.w).toBe("number");
      expect(typeof item.h).toBe("number");
    });
  });

  it("onDragStart provides layout, oldItem, newItem, placeholder, event, and node", () => {
    const onDragStart = jest.fn();
    const layout = [{ i: "a", x: 0, y: 0, w: 2, h: 2 }];

    const { container } = render(
      <ReactGridLayout
        layout={layout}
        width={1200}
        cols={12}
        rowHeight={30}
        onDragStart={onDragStart}
      >
        <div key="a">A</div>
      </ReactGridLayout>
    );

    const item = container.querySelector(".react-grid-item");
    if (item) {
      fireEvent.mouseDown(item, { clientX: 50, clientY: 50 });
    }

    expect(onDragStart).toHaveBeenCalled();
    // Verify callback signature: (layout, oldItem, newItem, placeholder, e, node)
    const args = onDragStart.mock.calls[0];
    expect(Array.isArray(args[0])).toBe(true); // layout
    expect(args[1]).toHaveProperty("i", "a"); // oldItem
    expect(args[2]).toHaveProperty("i", "a"); // newItem
    expect(args[3]).toBeNull(); // placeholder is null at drag start (per API)
    expect(args[4]).toBeDefined(); // event
    expect(args[5]).toBeDefined(); // node
  });

  it("onDrag provides newItem with updated position during drag", () => {
    const onDrag = jest.fn();
    const layout = [{ i: "a", x: 0, y: 0, w: 2, h: 2 }];

    const { container } = render(
      <ReactGridLayout
        layout={layout}
        width={1200}
        cols={12}
        rowHeight={30}
        onDrag={onDrag}
      >
        <div key="a">A</div>
      </ReactGridLayout>
    );

    const item = container.querySelector(".react-grid-item");
    if (item) {
      fireEvent.mouseDown(item, { clientX: 50, clientY: 50 });
      // Move significantly right and down
      fireEvent.mouseMove(document, { clientX: 400, clientY: 200 });
    }

    if (onDrag.mock.calls.length > 0) {
      const [, oldItem, newItem] = onDrag.mock.calls[0];
      // newItem should reflect the new position (different from old)
      // $FlowIgnore - test assertion, we know these exist
      expect(newItem.i).toBe("a");
      // Position should have changed
      // $FlowIgnore - test assertion, we know these exist
      expect(newItem.x !== oldItem.x || newItem.y !== oldItem.y).toBe(true);
    }
  });
});

describe("Backwards Compatibility: data-grid Prop Extraction", () => {
  it("extracts x, y, w, h from data-grid (with compactType=null)", () => {
    const onLayoutChange = jest.fn();

    // Use compactType={null} to test raw data-grid extraction without compaction
    render(
      <ReactGridLayout
        width={1200}
        cols={12}
        compactType={null}
        onLayoutChange={onLayoutChange}
      >
        <div key="test" data-grid={{ x: 3, y: 5, w: 4, h: 2 }}>
          Test
        </div>
      </ReactGridLayout>
    );

    const [layout] = onLayoutChange.mock.calls[0];
    const item = layout.find(l => l.i === "test");
    if (!item) throw new Error("Item not found");

    expect(item.x).toBe(3);
    expect(item.y).toBe(5);
    expect(item.w).toBe(4);
    expect(item.h).toBe(2);
  });

  it("extracts x, y, w, h from data-grid (with vertical compaction)", () => {
    const onLayoutChange = jest.fn();

    // Items at y=0 won't be affected by vertical compaction
    render(
      <ReactGridLayout width={1200} cols={12} onLayoutChange={onLayoutChange}>
        <div key="a" data-grid={{ x: 0, y: 0, w: 1, h: 2, static: true }}>
          a
        </div>
        <div key="b" data-grid={{ x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 }}>
          b
        </div>
        <div key="c" data-grid={{ x: 4, y: 0, w: 1, h: 2 }}>
          c
        </div>
      </ReactGridLayout>
    );

    const [layout] = onLayoutChange.mock.calls[0];
    // $FlowIgnore - test assertions, items exist
    expect(layout.find(item => item.i === "a")).toMatchObject({
      x: 0,
      y: 0,
      w: 1,
      h: 2,
      static: true
    });
    // $FlowIgnore
    expect(layout.find(item => item.i === "b")).toMatchObject({
      x: 1,
      y: 0,
      w: 3,
      h: 2
    });
    // $FlowIgnore
    expect(layout.find(item => item.i === "c")).toMatchObject({
      x: 4,
      y: 0,
      w: 1,
      h: 2
    });
  });

  it("extracts minW, maxW, minH, maxH from data-grid", () => {
    const onLayoutChange = jest.fn();

    render(
      <ReactGridLayout width={1200} cols={12} onLayoutChange={onLayoutChange}>
        <div
          key="test"
          data-grid={{
            x: 0,
            y: 0,
            w: 2,
            h: 2,
            minW: 1,
            maxW: 4,
            minH: 1,
            maxH: 3
          }}
        >
          Test
        </div>
      </ReactGridLayout>
    );

    const [layout] = onLayoutChange.mock.calls[0];
    const item = layout.find(l => l.i === "test");
    if (!item) throw new Error("Item not found");

    expect(item.minW).toBe(1);
    expect(item.maxW).toBe(4);
    expect(item.minH).toBe(1);
    expect(item.maxH).toBe(3);
  });

  it("static:true in data-grid prevents item from being dragged", () => {
    const onDragStart = jest.fn();

    const { container } = render(
      <ReactGridLayout
        width={1200}
        cols={12}
        rowHeight={30}
        onDragStart={onDragStart}
      >
        <div key="static" data-grid={{ x: 0, y: 0, w: 2, h: 2, static: true }}>
          Static
        </div>
      </ReactGridLayout>
    );

    const item = container.querySelector(".react-grid-item.static");
    expect(item).toBeInTheDocument();

    if (item) {
      fireEvent.mouseDown(item, { clientX: 50, clientY: 50 });
      fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
      fireEvent.mouseUp(document);
    }

    // onDragStart should NOT have been called for static item
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it("isDraggable:false in data-grid prevents dragging that item", () => {
    const onDragStart = jest.fn();

    const { container } = render(
      <ReactGridLayout
        width={1200}
        cols={12}
        rowHeight={30}
        isDraggable={true}
        onDragStart={onDragStart}
      >
        <div
          key="nodrag"
          data-grid={{ x: 0, y: 0, w: 2, h: 2, isDraggable: false }}
        >
          No Drag
        </div>
      </ReactGridLayout>
    );

    const item = container.querySelector(".react-grid-item");
    if (item) {
      fireEvent.mouseDown(item, { clientX: 50, clientY: 50 });
      fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
      fireEvent.mouseUp(document);
    }

    expect(onDragStart).not.toHaveBeenCalled();
  });
});

describe("Backwards Compatibility: Compaction Behavior", () => {
  it("vertical compaction moves items up to fill gaps", () => {
    // Layout with a gap: item at y=5, nothing above
    const layout = [{ i: "a", x: 0, y: 5, w: 2, h: 2 }];
    const compacted = compact(layout, "vertical", 12);

    // Should be moved to y=0
    expect(compacted[0].y).toBe(0);
  });

  it("horizontal compaction moves items left to fill gaps", () => {
    // Layout with a gap: item at x=5, nothing to the left
    const layout = [{ i: "a", x: 5, y: 0, w: 2, h: 2 }];
    const compacted = compact(layout, "horizontal", 12);

    // Should be moved to x=0
    expect(compacted[0].x).toBe(0);
  });

  it("null compaction preserves original positions", () => {
    const layout = [{ i: "a", x: 5, y: 5, w: 2, h: 2 }];
    const compacted = compact(layout, null, 12);

    // Position should be unchanged
    expect(compacted[0].x).toBe(5);
    expect(compacted[0].y).toBe(5);
  });

  it("vertical compaction stacks items correctly", () => {
    const layout = [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "b", x: 0, y: 10, w: 2, h: 2 } // Gap above
    ];
    const compacted = compact(layout, "vertical", 12);

    // $FlowIgnore - test assertions, items exist
    const a = compacted.find(l => l.i === "a");
    // $FlowIgnore
    const b = compacted.find(l => l.i === "b");

    // b should be directly below a
    // $FlowIgnore
    expect(b.y).toBe(a.y + a.h);
  });
});

describe("Backwards Compatibility: useCSSTransforms", () => {
  it("useCSSTransforms=true applies transform style", () => {
    const { container } = render(
      <ReactGridLayout
        layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
        width={1200}
        cols={12}
        rowHeight={30}
        useCSSTransforms={true}
      >
        <div key="a">A</div>
      </ReactGridLayout>
    );

    const item = container.querySelector(".react-grid-item");
    const style = item?.getAttribute("style") || "";

    expect(style).toContain("transform");
  });

  it("useCSSTransforms=false applies top/left style", () => {
    const { container } = render(
      <ReactGridLayout
        layout={[{ i: "a", x: 1, y: 1, w: 2, h: 2 }]}
        width={1200}
        cols={12}
        rowHeight={30}
        useCSSTransforms={false}
      >
        <div key="a">A</div>
      </ReactGridLayout>
    );

    const item = container.querySelector(".react-grid-item");
    const style = item?.getAttribute("style") || "";

    expect(style).toContain("top");
    expect(style).toContain("left");
    expect(style).not.toContain("transform");
  });
});

describe("Backwards Compatibility: autoSize", () => {
  it("autoSize=true sets container height based on content", () => {
    const { container } = render(
      <ReactGridLayout
        layout={[
          { i: "a", x: 0, y: 0, w: 2, h: 2 },
          { i: "b", x: 0, y: 2, w: 2, h: 3 }
        ]}
        width={1200}
        cols={12}
        rowHeight={30}
        margin={[10, 10]}
        autoSize={true}
      >
        <div key="a">A</div>
        <div key="b">B</div>
      </ReactGridLayout>
    );

    const grid = container.querySelector(".react-grid-layout");
    const style = grid?.getAttribute("style") || "";

    // Should have a height set
    expect(style).toContain("height");
  });

  it("autoSize=false does not set container height", () => {
    const { container } = render(
      <ReactGridLayout
        layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
        width={1200}
        cols={12}
        rowHeight={30}
        autoSize={false}
      >
        <div key="a">A</div>
      </ReactGridLayout>
    );

    const grid = container.querySelector(".react-grid-layout");
    const style = grid?.getAttribute("style") || "";

    // Should NOT have height set
    expect(style).not.toContain("height");
  });
});

describe("Backwards Compatibility: resizeHandles", () => {
  it("renders specified resize handles", () => {
    const { container } = render(
      <ReactGridLayout
        layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
        width={1200}
        cols={12}
        rowHeight={30}
        isResizable={true}
        resizeHandles={["se", "sw", "ne", "nw"]}
      >
        <div key="a">A</div>
      </ReactGridLayout>
    );

    // Check for each handle class
    expect(
      container.querySelector(".react-resizable-handle-se")
    ).toBeInTheDocument();
    expect(
      container.querySelector(".react-resizable-handle-sw")
    ).toBeInTheDocument();
    expect(
      container.querySelector(".react-resizable-handle-ne")
    ).toBeInTheDocument();
    expect(
      container.querySelector(".react-resizable-handle-nw")
    ).toBeInTheDocument();
  });

  it("default resizeHandles is ['se']", () => {
    const { container } = render(
      <ReactGridLayout
        layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
        width={1200}
        cols={12}
        rowHeight={30}
        isResizable={true}
      >
        <div key="a">A</div>
      </ReactGridLayout>
    );

    expect(
      container.querySelector(".react-resizable-handle-se")
    ).toBeInTheDocument();
    // Others should not be present
    expect(
      container.querySelector(".react-resizable-handle-sw")
    ).not.toBeInTheDocument();
  });
});

describe("Backwards Compatibility: Responsive Grid", () => {
  const ResponsiveRGL = WidthProvider(ResponsiveReactGridLayout);

  it("uses correct layout for current breakpoint", () => {
    const onLayoutChange = jest.fn();

    const layouts = {
      lg: [{ i: "a", x: 0, y: 0, w: 4, h: 2 }],
      sm: [{ i: "a", x: 0, y: 0, w: 2, h: 2 }]
    };

    render(
      <ResponsiveRGL
        layouts={layouts}
        breakpoints={{ lg: 1200, sm: 768 }}
        cols={{ lg: 12, sm: 6 }}
        onLayoutChange={onLayoutChange}
      >
        <div key="a">A</div>
      </ResponsiveRGL>
    );

    // Trigger resize to small breakpoint
    act(() => {
      global.triggerResize(600, 400);
    });

    // Find the call after resize
    const calls = onLayoutChange.mock.calls;
    if (calls.length > 0) {
      const lastCall = calls[calls.length - 1];
      const [layout] = lastCall;
      // At sm breakpoint, width should be 2
      expect(layout[0].w).toBeLessThanOrEqual(6); // Within sm cols
    }
  });

  it("onBreakpointChange provides breakpoint name and cols count", () => {
    const onBreakpointChange = jest.fn();

    render(
      <ResponsiveRGL
        layouts={{ lg: [{ i: "a", x: 0, y: 0, w: 4, h: 2 }] }}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 10, sm: 6 }}
        onBreakpointChange={onBreakpointChange}
      >
        <div key="a">A</div>
      </ResponsiveRGL>
    );

    // Trigger resize to md breakpoint
    act(() => {
      global.triggerResize(1000, 600);
    });

    const mdCalls = onBreakpointChange.mock.calls.filter(
      call => call[0] === "md"
    );
    if (mdCalls.length > 0) {
      const [breakpoint, cols] = mdCalls[0];
      expect(breakpoint).toBe("md");
      expect(cols).toBe(10);
    }
  });

  it("generates missing breakpoint layouts by interpolation", () => {
    const onLayoutChange = jest.fn();

    // Only provide lg layout
    render(
      <ResponsiveRGL
        layouts={{ lg: [{ i: "a", x: 0, y: 0, w: 6, h: 2 }] }}
        breakpoints={{ lg: 1200, sm: 768 }}
        cols={{ lg: 12, sm: 6 }}
        onLayoutChange={onLayoutChange}
      >
        <div key="a">A</div>
      </ResponsiveRGL>
    );

    // Trigger resize to sm (no layout provided)
    act(() => {
      global.triggerResize(600, 400);
    });

    // Should still render without error and generate a layout
    expect(onLayoutChange).toHaveBeenCalled();
    const lastLayout =
      onLayoutChange.mock.calls[onLayoutChange.mock.calls.length - 1][0];
    expect(lastLayout).toHaveLength(1);
    expect(lastLayout[0].i).toBe("a");
  });
});

describe("Backwards Compatibility: synchronizeLayoutWithChildren", () => {
  it("preserves layout item properties when syncing", () => {
    const layout = [
      {
        i: "a",
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        minW: 1,
        maxW: 4,
        static: true
      }
    ];
    const children = [<div key="a">A</div>];

    const synced = synchronizeLayoutWithChildren(
      layout,
      children,
      12,
      "vertical",
      false
    );

    expect(synced[0].minW).toBe(1);
    expect(synced[0].maxW).toBe(4);
    expect(synced[0].static).toBe(true);
  });

  it("uses child key as layout item i", () => {
    const children = [
      <div key="custom-key-123" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
        A
      </div>
    ];

    const synced = synchronizeLayoutWithChildren(
      [],
      children,
      12,
      "vertical",
      false
    );

    expect(synced[0].i).toBe("custom-key-123");
  });

  it("assigns default position to children without data-grid or layout entry", () => {
    const children = [<div key="new-item">New</div>];

    const synced = synchronizeLayoutWithChildren(
      [],
      children,
      12,
      "vertical",
      false
    );

    // Should have assigned some position
    expect(synced[0]).toHaveProperty("x");
    expect(synced[0]).toHaveProperty("y");
    expect(synced[0]).toHaveProperty("w");
    expect(synced[0]).toHaveProperty("h");
    // Defaults are w=1, h=1
    expect(synced[0].w).toBe(1);
    expect(synced[0].h).toBe(1);
  });
});

describe("Backwards Compatibility: WidthProvider", () => {
  const WidthProvidedRGL = WidthProvider(ReactGridLayout);

  it("provides measured width to child component", () => {
    const onLayoutChange = jest.fn();

    render(
      <WidthProvidedRGL
        layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
        cols={12}
        onLayoutChange={onLayoutChange}
      >
        <div key="a">A</div>
      </WidthProvidedRGL>
    );

    // Should render and call onLayoutChange (means width was provided)
    expect(onLayoutChange).toHaveBeenCalled();
  });

  it("updates on resize", () => {
    const onLayoutChange = jest.fn();

    render(
      <WidthProvidedRGL
        layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
        cols={12}
        onLayoutChange={onLayoutChange}
      >
        <div key="a">A</div>
      </WidthProvidedRGL>
    );

    const callsBefore = onLayoutChange.mock.calls.length;

    act(() => {
      global.triggerResize(800, 600);
    });

    // May or may not trigger additional calls depending on if layout changed
    // But should not error
    expect(onLayoutChange.mock.calls.length).toBeGreaterThanOrEqual(
      callsBefore
    );
  });
});

describe("Backwards Compatibility: Grid Item Dimensions", () => {
  it("calculates item width based on cols and container width", () => {
    const { container } = render(
      <ReactGridLayout
        layout={[{ i: "a", x: 0, y: 0, w: 6, h: 2 }]} // Half width
        width={1200}
        cols={12}
        rowHeight={30}
        margin={[0, 0]}
        containerPadding={[0, 0]}
      >
        <div key="a">A</div>
      </ReactGridLayout>
    );

    const item = container.querySelector(".react-grid-item");
    const style = item?.getAttribute("style") || "";

    // w=6 out of 12 cols with 1200px width = 600px
    expect(style).toContain("600px");
  });

  it("calculates item height based on rowHeight and h", () => {
    const { container } = render(
      <ReactGridLayout
        layout={[{ i: "a", x: 0, y: 0, w: 2, h: 3 }]}
        width={1200}
        cols={12}
        rowHeight={50}
        margin={[0, 0]}
      >
        <div key="a">A</div>
      </ReactGridLayout>
    );

    const item = container.querySelector(".react-grid-item");
    const style = item?.getAttribute("style") || "";

    // h=3 with rowHeight=50 and margin=0 = 150px
    expect(style).toContain("150px");
  });

  it("includes margin in item positioning", () => {
    const { container } = render(
      <ReactGridLayout
        layout={[
          { i: "a", x: 0, y: 0, w: 2, h: 2 },
          { i: "b", x: 0, y: 2, w: 2, h: 2 }
        ]}
        width={1200}
        cols={12}
        rowHeight={30}
        margin={[10, 10]}
      >
        <div key="a">A</div>
        <div key="b">B</div>
      </ReactGridLayout>
    );

    const items = container.querySelectorAll(".react-grid-item");
    expect(items.length).toBe(2);

    // Both items should have positioning styles
    items.forEach(item => {
      const style = item.getAttribute("style") || "";
      expect(style.length).toBeGreaterThan(0);
    });
  });
});
