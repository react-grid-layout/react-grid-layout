/**
 * Tests for resize visual constraints (#2235)
 *
 * In v2, the visual resize preview should be limited to minW/maxW/minH/maxH
 * just like in v1, rather than allowing infinite stretching.
 */

import React from "react";
import { render } from "@testing-library/react";

// Mock react-resizable to capture props passed to Resizable
type ResizeHandler = (
  e: unknown,
  data: {
    node: HTMLElement;
    size: { width: number; height: number };
    handle: string;
  }
) => void;

const mockResizableProps: {
  minConstraints?: [number, number];
  maxConstraints?: [number, number];
  onResize?: ResizeHandler;
}[] = [];

jest.mock("react-resizable", () => {
  const actual = jest.requireActual("react-resizable");
  return {
    ...actual,
    Resizable: (props: Record<string, unknown>) => {
      mockResizableProps.push({
        minConstraints: props.minConstraints as [number, number] | undefined,
        maxConstraints: props.maxConstraints as [number, number] | undefined,
        onResize: props.onResize as ResizeHandler | undefined
      });
      const { Resizable: ActualResizable } = actual;
      return <ActualResizable {...props} />;
    }
  };
});

// Import GridItem AFTER the mock is set up
import { GridItem, type GridItemProps } from "../../src/react/index";
import { calcGridItemWHPx, calcGridColWidth } from "../../src/core/calculate";
import { containerBounds } from "../../src/core/constraints";

describe("Resize Visual Constraints (#2235)", () => {
  beforeEach(() => {
    // Clear captured props before each test
    mockResizableProps.length = 0;
  });

  // #2235: Visual resize preview should be constrained to minW/maxW/minH/maxH
  it("should pass maxConstraints based on maxW/maxH, not [Infinity, Infinity]", () => {
    const mockProps: GridItemProps = {
      children: <div>test child</div>,
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
      minW: 2,
      maxW: 4,
      minH: 1,
      maxH: 3,
      isDraggable: true,
      isResizable: true,
      isBounded: false,
      useCSSTransforms: true
    };

    render(<GridItem {...mockProps} />);

    // Verify Resizable was rendered with constraints
    expect(mockResizableProps.length).toBeGreaterThan(0);
    const lastProps = mockResizableProps[mockResizableProps.length - 1];

    // The bug in v2: maxConstraints is [Infinity, Infinity]
    // After fix: maxConstraints should be based on maxW=4, maxH=3 in pixels
    expect(lastProps?.maxConstraints).toBeDefined();
    expect(lastProps?.maxConstraints![0]).not.toBe(Infinity);
    expect(lastProps?.maxConstraints![1]).not.toBe(Infinity);

    // Calculate expected values
    const positionParams = {
      cols: 12,
      containerPadding: [10, 10] as [number, number],
      containerWidth: 1200,
      margin: [10, 10] as [number, number],
      maxRows: 10,
      rowHeight: 30
    };

    const colWidth = calcGridColWidth(positionParams);
    const expectedMaxW = calcGridItemWHPx(4, colWidth, 10); // maxW=4
    const expectedMaxH = calcGridItemWHPx(3, 30, 10); // maxH=3

    // Verify max constraints match expected pixel values
    expect(lastProps?.maxConstraints![0]).toBe(expectedMaxW);
    expect(lastProps?.maxConstraints![1]).toBe(expectedMaxH);
  });

  it("should pass minConstraints based on minW/minH", () => {
    const mockProps: GridItemProps = {
      children: <div>test child</div>,
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
      minW: 2,
      maxW: 4,
      minH: 1,
      maxH: 3,
      isDraggable: true,
      isResizable: true,
      isBounded: false,
      useCSSTransforms: true
    };

    render(<GridItem {...mockProps} />);

    expect(mockResizableProps.length).toBeGreaterThan(0);
    const lastProps = mockResizableProps[mockResizableProps.length - 1];

    // Calculate expected min values
    const positionParams = {
      cols: 12,
      containerPadding: [10, 10] as [number, number],
      containerWidth: 1200,
      margin: [10, 10] as [number, number],
      maxRows: 10,
      rowHeight: 30
    };

    const colWidth = calcGridColWidth(positionParams);
    const expectedMinW = calcGridItemWHPx(2, colWidth, 10); // minW=2
    const expectedMinH = calcGridItemWHPx(1, 30, 10); // minH=1

    // Verify min constraints match expected pixel values
    expect(lastProps?.minConstraints![0]).toBe(expectedMinW);
    expect(lastProps?.minConstraints![1]).toBe(expectedMinH);
  });

  it("should use Infinity for maxConstraints when maxW/maxH are not set", () => {
    const mockProps: GridItemProps = {
      children: <div>test child</div>,
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
      // No minW/maxW/minH/maxH set - defaults to Infinity
      isDraggable: true,
      isResizable: true,
      isBounded: false,
      useCSSTransforms: true
    };

    render(<GridItem {...mockProps} />);

    expect(mockResizableProps.length).toBeGreaterThan(0);
    const lastProps = mockResizableProps[mockResizableProps.length - 1];

    // When maxW/maxH are not specified (defaults to Infinity),
    // maxConstraints should be [Infinity, Infinity]
    expect(lastProps?.maxConstraints![0]).toBe(Infinity);
    expect(lastProps?.maxConstraints![1]).toBe(Infinity);
  });
});

describe("Resize Bounded to Container (#1779)", () => {
  beforeEach(() => {
    mockResizableProps.length = 0;
  });

  // Build a resize node whose offsetParent is a fixed-height grid container.
  // setupTests mocks offsetParent to return parentNode, and clientHeight is 0 in
  // jsdom, so we define it explicitly (410px = 10 rows at rowHeight 30, margin 10).
  function buildNodeWithContainerHeight(containerHeight: number): HTMLElement {
    const container = document.createElement("div");
    Object.defineProperty(container, "clientHeight", {
      value: containerHeight,
      configurable: true
    });
    const node = document.createElement("div");
    container.append(node);
    return node;
  }

  function renderItem(overrides: Partial<GridItemProps> = {}) {
    const props: GridItemProps = {
      children: <div>test child</div>,
      cols: 12,
      containerWidth: 1200,
      rowHeight: 30,
      margin: [10, 10] as const,
      maxRows: Infinity, // Bounded grids rely on containerBounds, not maxRows
      containerPadding: [10, 10] as const,
      i: "0",
      x: 0,
      y: 8,
      w: 2,
      h: 2,
      isDraggable: true,
      isResizable: true,
      isBounded: true,
      useCSSTransforms: true,
      constraints: [containerBounds],
      ...overrides
    };
    render(<GridItem {...props} />);
    const last = mockResizableProps[mockResizableProps.length - 1];
    if (!last) throw new Error("Resizable was never rendered");
    return last;
  }

  function resize(
    onResize: ResizeHandler,
    node: HTMLElement,
    widthPx: number,
    heightPx: number,
    handle: string
  ) {
    onResize(new MouseEvent("mousemove", { bubbles: true }), {
      node,
      size: { width: widthPx, height: heightPx },
      handle
    });
  }

  it("clamps a south resize to the container bottom edge (#1779)", () => {
    const results: Array<{ w: number; h: number }> = [];
    const captured = renderItem({
      onResize: (_i: string, w: number, h: number) => {
        results.push({ w, h });
      }
    });
    const node = buildNodeWithContainerHeight(410); // 10 visible rows

    // Item sits at y=8, h=2 (bottom edge = row 10). A south resize to ~5 rows
    // must be clamped so the item cannot grow past the container.
    resize(captured.onResize!, node, 200, 200, "s");

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({ w: 2, h: 2 });
  });

  it("clamps an east resize to the container right edge (#1779)", () => {
    const results: Array<{ w: number; h: number }> = [];
    const captured = renderItem({
      x: 10,
      y: 0,
      w: 2,
      h: 2,
      onResize: (_i: string, w: number, h: number) => {
        results.push({ w, h });
      }
    });
    const node = buildNodeWithContainerHeight(410);

    // Item at x=10, w=2 in a 12-col grid. An east resize to ~6 cols must clamp
    // to cols - x = 2.
    resize(captured.onResize!, node, 600, 80, "e");

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({ w: 2, h: 2 });
  });

  it("does not clamp a south resize when the item fits in the container (#1779)", () => {
    const results: Array<{ w: number; h: number }> = [];
    const captured = renderItem({
      y: 0,
      h: 2,
      onResize: (_i: string, w: number, h: number) => {
        results.push({ w, h });
      }
    });
    const node = buildNodeWithContainerHeight(410); // 10 visible rows

    // Item at y=0 can grow south to row 10 without leaving the container.
    resize(captured.onResize!, node, 200, 200, "s"); // ~5 rows

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({ w: 2, h: 5 });
  });
});
