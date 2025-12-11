/**
 * Tests for the new TypeScript React components in src/react/
 */

import React, { StrictMode } from "react";
import { render, screen, act } from "@testing-library/react";

// Import from the new TypeScript modules
import {
  GridItem,
  GridLayout,
  ResponsiveGridLayout,
  type GridItemProps,
  type GridLayoutProps,
  type ResponsiveGridLayoutProps,
  type Layout
} from "../../src/react/index";

// Import core utilities to verify they work
import {
  cloneLayout,
  bottom,
  calcGridItemPosition,
  calcXY,
  calcWH
} from "../../src/react/index";

// Helper to dispatch native mouse events
function dispatchMouseEvent(
  node: Element,
  type: string,
  coords: { clientX?: number; clientY?: number } = {}
) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: coords.clientX || 0,
    clientY: coords.clientY || 0,
    button: 0
  });
  node.dispatchEvent(event);
  return event;
}

describe("TypeScript Components", () => {
  describe("<GridItem>", () => {
    const mockProps: GridItemProps = {
      children: <div>test child</div>,
      cols: 12,
      containerWidth: 1200,
      rowHeight: 30,
      margin: [10, 10] as const,
      maxRows: 4,
      containerPadding: [10, 10] as const,
      i: "0",
      x: 0,
      y: 0,
      w: 2,
      h: 2,
      isDraggable: true,
      isResizable: true,
      isBounded: false,
      useCSSTransforms: true
    };

    it("renders correctly", () => {
      const { container } = render(<GridItem {...mockProps} />);
      expect(container.querySelector(".react-grid-item")).toBeInTheDocument();
      expect(screen.getByText("test child")).toBeInTheDocument();
    });

    it("applies correct CSS classes", () => {
      const { container } = render(<GridItem {...mockProps} />);
      const item = container.querySelector(".react-grid-item");
      expect(item).toHaveClass("react-draggable");
      expect(item).toHaveClass("cssTransforms");
    });

    it("renders with static class when static prop is true", () => {
      const { container } = render(<GridItem {...mockProps} static={true} />);
      const item = container.querySelector(".react-grid-item");
      expect(item).toHaveClass("static");
    });

    it("calls onDragStart when droppingPosition is provided", () => {
      const onDragStart = jest.fn();
      render(
        <GridItem
          {...mockProps}
          droppingPosition={{ left: 100, top: 100, e: new Event("drop") }}
          onDragStart={onDragStart}
        />
      );
      expect(onDragStart).toHaveBeenCalled();
    });

    it("handles resize handles prop", () => {
      const { container } = render(
        <GridItem {...mockProps} resizeHandles={["se", "sw", "ne", "nw"]} />
      );
      // Verify component renders (resize handles are added by Resizable)
      expect(container.querySelector(".react-grid-item")).toBeInTheDocument();
    });
  });

  describe("<GridLayout>", () => {
    const layout: Layout = [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "b", x: 2, y: 0, w: 2, h: 2 },
      { i: "c", x: 4, y: 0, w: 2, h: 2 }
    ];

    it("renders correctly with layout prop", () => {
      const { container } = render(
        <GridLayout
          className="layout"
          cols={12}
          rowHeight={30}
          width={1200}
          layout={layout}
        >
          <div key="a">a</div>
          <div key="b">b</div>
          <div key="c">c</div>
        </GridLayout>
      );

      expect(container.querySelector(".react-grid-layout")).toBeInTheDocument();
      const gridItems = container.querySelectorAll(".react-grid-item");
      expect(gridItems).toHaveLength(3);
    });

    it("renders correctly with data-grid on children", () => {
      const { container } = render(
        <GridLayout className="layout" cols={12} rowHeight={30} width={1200}>
          <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
            a
          </div>
          <div key="b" data-grid={{ x: 2, y: 0, w: 2, h: 2 }}>
            b
          </div>
        </GridLayout>
      );

      const gridItems = container.querySelectorAll(".react-grid-item");
      expect(gridItems).toHaveLength(2);
    });

    it("calls onLayoutChange when layout actually changes", () => {
      const onLayoutChange = jest.fn();
      const { rerender } = render(
        <GridLayout
          className="layout"
          cols={12}
          rowHeight={30}
          width={1200}
          layout={layout}
          onLayoutChange={onLayoutChange}
        >
          <div key="a">a</div>
          <div key="b">b</div>
          <div key="c">c</div>
        </GridLayout>
      );

      // Rerender with different layout to trigger change
      const newLayout: Layout = [
        { i: "a", x: 0, y: 0, w: 3, h: 2 },
        { i: "b", x: 3, y: 0, w: 3, h: 2 },
        { i: "c", x: 6, y: 0, w: 3, h: 2 }
      ];

      rerender(
        <GridLayout
          className="layout"
          cols={12}
          rowHeight={30}
          width={1200}
          layout={newLayout}
          onLayoutChange={onLayoutChange}
        >
          <div key="a">a</div>
          <div key="b">b</div>
          <div key="c">c</div>
        </GridLayout>
      );

      expect(onLayoutChange).toHaveBeenCalled();
    });

    it("handles null children gracefully", () => {
      const { container } = render(
        <GridLayout className="layout" cols={12} rowHeight={30} width={1200}>
          <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
            a
          </div>
          {null}
          {false}
          <div key="c" data-grid={{ x: 4, y: 0, w: 2, h: 2 }}>
            c
          </div>
        </GridLayout>
      );

      const gridItems = container.querySelectorAll(".react-grid-item");
      expect(gridItems).toHaveLength(2);
    });

    it("respects compactType prop", () => {
      // Test that horizontal compactType renders without errors
      const { container } = render(
        <GridLayout
          className="layout"
          cols={12}
          rowHeight={30}
          width={1200}
          compactType="horizontal"
        >
          <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
            a
          </div>
        </GridLayout>
      );

      expect(container.querySelector(".react-grid-layout")).toBeInTheDocument();
    });

    it("applies transforms when useCSSTransforms is true", () => {
      const { container } = render(
        <GridLayout
          className="layout"
          cols={12}
          rowHeight={30}
          width={1200}
          useCSSTransforms={true}
          layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
        >
          <div key="a">a</div>
        </GridLayout>
      );

      const item = container.querySelector(".react-grid-item");
      const style = item?.getAttribute("style");
      expect(style).toContain("transform");
    });

    it("calls onDragStart when drag begins", () => {
      const onDragStart = jest.fn();
      const { container } = render(
        <GridLayout
          className="layout"
          cols={12}
          rowHeight={30}
          width={1200}
          onDragStart={onDragStart}
          layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
        >
          <div key="a">a</div>
        </GridLayout>
      );

      const gridItem = container.querySelector(".react-grid-item");
      act(() => {
        dispatchMouseEvent(gridItem!, "mousedown", {
          clientX: 50,
          clientY: 50
        });
      });

      expect(onDragStart).toHaveBeenCalled();
    });
  });

  describe("<ResponsiveGridLayout>", () => {
    it("renders correctly", () => {
      const { container } = render(
        <ResponsiveGridLayout width={1200}>
          <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
            a
          </div>
          <div key="b" data-grid={{ x: 2, y: 0, w: 2, h: 2 }}>
            b
          </div>
        </ResponsiveGridLayout>
      );

      expect(container.querySelector(".react-grid-layout")).toBeInTheDocument();
    });

    it("handles breakpoint changes", () => {
      const onBreakpointChange = jest.fn();
      const { rerender } = render(
        <ResponsiveGridLayout
          width={1200}
          onBreakpointChange={onBreakpointChange}
        >
          <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
            a
          </div>
        </ResponsiveGridLayout>
      );

      // Rerender with different width to trigger breakpoint change
      rerender(
        <ResponsiveGridLayout
          width={500}
          onBreakpointChange={onBreakpointChange}
        >
          <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
            a
          </div>
        </ResponsiveGridLayout>
      );

      expect(onBreakpointChange).toHaveBeenCalled();
    });

    it("uses provided layouts", () => {
      const layouts = {
        lg: [{ i: "a", x: 0, y: 0, w: 4, h: 2 }],
        md: [{ i: "a", x: 0, y: 0, w: 3, h: 2 }]
      };

      const { container } = render(
        <ResponsiveGridLayout width={1200} layouts={layouts} breakpoint="lg">
          <div key="a">a</div>
        </ResponsiveGridLayout>
      );

      expect(container.querySelector(".react-grid-item")).toBeInTheDocument();
    });

    it("calls onLayoutChange with layouts object on width change", () => {
      const onLayoutChange = jest.fn();
      const { rerender } = render(
        <ResponsiveGridLayout width={1200} onLayoutChange={onLayoutChange}>
          <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
            a
          </div>
        </ResponsiveGridLayout>
      );

      // Trigger a width change to cause onLayoutChange
      rerender(
        <ResponsiveGridLayout width={500} onLayoutChange={onLayoutChange}>
          <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
            a
          </div>
        </ResponsiveGridLayout>
      );

      expect(onLayoutChange).toHaveBeenCalled();
      // onLayoutChange should receive (layout, layouts)
      const call = onLayoutChange.mock.calls[0];
      expect(Array.isArray(call![0])).toBe(true); // layout
      expect(typeof call![1]).toBe("object"); // layouts
    });

    it("should not flicker when item is removed and re-added (toolbox pattern)", () => {
      // Regression test for toolbox flickering bug
      // When an item is removed from layout and re-added, it should retain its original size
      // and not oscillate between sizes due to timing issues with useEffect vs useMemo.
      //
      // Bug manifestation: Before the fix, useEffect ran AFTER render, so GridLayout
      // saw new children with stale layout state, created items with default 1x1 size,
      // then effect fired updating to 2x2, triggering onLayoutChange callback, which
      // updated parent props, causing an infinite render loop.
      const onLayoutChange = jest.fn();

      const initialLayouts = {
        lg: [
          { i: "a", x: 0, y: 0, w: 4, h: 3 },
          { i: "b", x: 4, y: 0, w: 2, h: 2 }
        ]
      };

      const { rerender } = render(
        <ResponsiveGridLayout
          width={1200}
          layouts={initialLayouts}
          breakpoint="lg"
          onLayoutChange={onLayoutChange}
        >
          <div key="a">a</div>
          <div key="b">b</div>
        </ResponsiveGridLayout>
      );

      onLayoutChange.mockClear();

      // Simulate removing item "b" (like putting it in toolbox)
      const layoutsWithoutB = {
        lg: [{ i: "a", x: 0, y: 0, w: 4, h: 3 }]
      };

      rerender(
        <ResponsiveGridLayout
          width={1200}
          layouts={layoutsWithoutB}
          breakpoint="lg"
          onLayoutChange={onLayoutChange}
        >
          <div key="a">a</div>
        </ResponsiveGridLayout>
      );

      onLayoutChange.mockClear();

      // Simulate re-adding item "b" (like taking from toolbox)
      // The key bug was that the item would be created with default w:1, h:1
      // instead of the original w:2, h:2, causing infinite oscillation
      const layoutsWithBRestored = {
        lg: [
          { i: "a", x: 0, y: 0, w: 4, h: 3 },
          { i: "b", x: 4, y: 0, w: 2, h: 2 }
        ]
      };

      rerender(
        <ResponsiveGridLayout
          width={1200}
          layouts={layoutsWithBRestored}
          breakpoint="lg"
          onLayoutChange={onLayoutChange}
        >
          <div key="a">a</div>
          <div key="b">b</div>
        </ResponsiveGridLayout>
      );

      // Verify onLayoutChange was called a reasonable number of times (not infinite loop)
      // In the buggy version, this would be called many times rapidly
      expect(onLayoutChange.mock.calls.length).toBeLessThan(5);

      // Verify the layout contains item "b" with correct dimensions
      const lastCall =
        onLayoutChange.mock.calls[onLayoutChange.mock.calls.length - 1];
      if (lastCall) {
        const layout = lastCall[0] as Layout;
        const itemB = layout.find(item => item.i === "b");
        expect(itemB).toBeDefined();
        // The item should have its original size, not default 1x1
        expect(itemB?.w).toBe(2);
        expect(itemB?.h).toBe(2);
      }
    });

    it("should work correctly in StrictMode (double-render compatibility)", () => {
      // StrictMode in React 18+ intentionally double-renders components to detect side effects.
      // This test verifies that the layout synchronization fix works correctly with double-renders.
      const onLayoutChange = jest.fn();

      const layouts = {
        lg: [
          { i: "a", x: 0, y: 0, w: 2, h: 2 },
          { i: "b", x: 2, y: 0, w: 2, h: 2 }
        ]
      };

      const { rerender } = render(
        <StrictMode>
          <ResponsiveGridLayout
            width={1200}
            layouts={layouts}
            breakpoint="lg"
            onLayoutChange={onLayoutChange}
          >
            <div key="a">a</div>
            <div key="b">b</div>
          </ResponsiveGridLayout>
        </StrictMode>
      );

      // Clear initial render calls
      onLayoutChange.mockClear();

      // Update layouts (simulating toolbox add)
      const updatedLayouts = {
        lg: [
          { i: "a", x: 0, y: 0, w: 2, h: 2 },
          { i: "b", x: 2, y: 0, w: 2, h: 2 },
          { i: "c", x: 4, y: 0, w: 3, h: 3 }
        ]
      };

      rerender(
        <StrictMode>
          <ResponsiveGridLayout
            width={1200}
            layouts={updatedLayouts}
            breakpoint="lg"
            onLayoutChange={onLayoutChange}
          >
            <div key="a">a</div>
            <div key="b">b</div>
            <div key="c">c</div>
          </ResponsiveGridLayout>
        </StrictMode>
      );

      // In StrictMode, callbacks may be called more times due to double-rendering,
      // but should still be bounded (not infinite)
      expect(onLayoutChange.mock.calls.length).toBeLessThan(10);

      // Verify the new item has correct dimensions
      if (onLayoutChange.mock.calls.length > 0) {
        const lastCall =
          onLayoutChange.mock.calls[onLayoutChange.mock.calls.length - 1];
        const layout = lastCall![0] as Layout;
        const itemC = layout.find(item => item.i === "c");
        expect(itemC).toBeDefined();
        expect(itemC?.w).toBe(3);
        expect(itemC?.h).toBe(3);
      }
    });
  });

  describe("Core Utilities", () => {
    it("cloneLayout returns a copy with default values", () => {
      const original: Layout = [{ i: "a", x: 0, y: 0, w: 2, h: 2 }];
      const cloned = cloneLayout(original);

      // Core properties should match
      expect(cloned[0]?.i).toBe("a");
      expect(cloned[0]?.x).toBe(0);
      expect(cloned[0]?.y).toBe(0);
      expect(cloned[0]?.w).toBe(2);
      expect(cloned[0]?.h).toBe(2);

      // Should be distinct objects
      expect(cloned).not.toBe(original);
      expect(cloned[0]).not.toBe(original[0]);

      // Clone may add default values for optional properties
      expect(cloned[0]).toHaveProperty("static");
      expect(cloned[0]).toHaveProperty("moved");
    });

    it("bottom calculates correctly", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2 },
        { i: "b", x: 0, y: 2, w: 2, h: 3 }
      ];

      expect(bottom(layout)).toBe(5); // y + h of bottom item
    });

    it("calcGridItemPosition returns position object", () => {
      const params = {
        cols: 12,
        containerPadding: [10, 10] as [number, number],
        containerWidth: 1200,
        margin: [10, 10] as [number, number],
        maxRows: 10,
        rowHeight: 30
      };

      const pos = calcGridItemPosition(params, 0, 0, 2, 2);

      expect(pos).toHaveProperty("left");
      expect(pos).toHaveProperty("top");
      expect(pos).toHaveProperty("width");
      expect(pos).toHaveProperty("height");
      expect(typeof pos.left).toBe("number");
      expect(typeof pos.width).toBe("number");
    });

    it("calcXY converts pixels to grid units", () => {
      const params = {
        cols: 12,
        containerPadding: [10, 10] as [number, number],
        containerWidth: 1200,
        margin: [10, 10] as [number, number],
        maxRows: 10,
        rowHeight: 30
      };

      const result = calcXY(params, 100, 200, 2, 2);

      expect(result).toHaveProperty("x");
      expect(result).toHaveProperty("y");
      expect(typeof result.x).toBe("number");
      expect(typeof result.y).toBe("number");
    });

    it("calcWH converts pixels to grid units", () => {
      const params = {
        cols: 12,
        containerPadding: [10, 10] as [number, number],
        containerWidth: 1200,
        margin: [10, 10] as [number, number],
        maxRows: 10,
        rowHeight: 30
      };

      const result = calcWH(params, 200, 100, 0, 0, "se");

      expect(result).toHaveProperty("w");
      expect(result).toHaveProperty("h");
      expect(typeof result.w).toBe("number");
      expect(typeof result.h).toBe("number");
    });
  });

  describe("Type Safety", () => {
    it("GridItemProps type is correct", () => {
      // This test verifies TypeScript types compile correctly
      const props: GridItemProps = {
        children: <div>test</div>,
        cols: 12,
        containerWidth: 1200,
        rowHeight: 30,
        margin: [10, 10],
        maxRows: 10,
        containerPadding: [10, 10],
        i: "test",
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        isDraggable: true,
        isResizable: true,
        isBounded: false
      };

      expect(props.i).toBe("test");
    });

    it("GridLayoutProps type is correct", () => {
      const props: GridLayoutProps = {
        children: <div key="a">test</div>,
        width: 1200,
        cols: 12,
        rowHeight: 30
      };

      expect(props.cols).toBe(12);
    });

    it("ResponsiveGridLayoutProps type is correct", () => {
      const props: ResponsiveGridLayoutProps = {
        children: <div key="a">test</div>,
        width: 1200
      };

      expect(props.width).toBe(1200);
    });

    it("Layout type is correct", () => {
      const layout: Layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2 },
        { i: "b", x: 2, y: 0, w: 2, h: 2, minW: 1, maxW: 4, static: true }
      ];

      expect(layout).toHaveLength(2);
      expect(layout[0]?.i).toBe("a");
      expect(layout[1]?.static).toBe(true);
    });
  });
});
