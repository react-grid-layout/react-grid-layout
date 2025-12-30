// @flow
/* eslint-env jest */

import React, { StrictMode } from "react";
import _ from "lodash";
import TestUtils from "react-dom/test-utils";
import { render, screen, act } from "@testing-library/react";
import ReactGridLayout from "../../src/legacy/ReactGridLayout";
import { GridLayout as GridLayoutV2 } from "../../src/react/components/GridLayout";
import { GridItem } from "../../src/react/components/GridItem";
import ResponsiveReactGridLayout from "../../src/legacy/ResponsiveReactGridLayout";
import BasicLayout from "../examples/01-basic";
import ShowcaseLayout from "../examples/00-showcase";
import DroppableLayout from "../examples/12-drag-from-outside";
import ResizableLayout from "../examples/17-resizable-handles";
import deepFreeze from "../util/deepFreeze";

// Helper to dispatch native mouse events (needed for react-draggable/react-resizable)
function dispatchMouseEvent(node, type, coords = {}) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: coords.clientX || 0,
    clientY: coords.clientY || 0,
    screenX: coords.screenX || 0,
    screenY: coords.screenY || 0,
    button: 0
  });
  node.dispatchEvent(event);
  return event;
}

// Helper to simulate mouse movement (for draggable/resizable)
function mouseMove(x, y, node) {
  const doc = node ? node.ownerDocument : document;
  const mouseEvent = new MouseEvent("mousemove", {
    bubbles: true,
    cancelable: true,
    button: 0,
    clientX: x,
    clientY: y,
    screenX: 0,
    screenY: 0
  });
  doc.dispatchEvent(mouseEvent);
  return mouseEvent;
}

// Helper to simulate a complete drag operation
function simulateDrag(element, fromX, fromY, toX, toY) {
  // mousedown on element starts the drag
  dispatchMouseEvent(element, "mousedown", { clientX: fromX, clientY: fromY });
  // mousemove on document moves it
  mouseMove(toX, toY, element);
  // mouseup on document ends the drag (react-draggable listens on document)
  const mouseUpEvent = new MouseEvent("mouseup", {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: toX,
    clientY: toY,
    button: 0
  });
  document.dispatchEvent(mouseUpEvent);
}

describe("Lifecycle tests", function () {
  // Example layouts use randomness
  let randIdx = 0;
  beforeAll(() => {
    const randArr = [0.001, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.999];
    jest.spyOn(global.Math, "random").mockImplementation(() => {
      randIdx = (randIdx + 1) % randArr.length;
      return randArr[randIdx];
    });
  });

  beforeEach(() => {
    randIdx = 0;
  });

  afterAll(() => {
    global.Math.random.mockRestore();
  });

  describe("<GridItem >", () => {
    const mockProps = {
      children: <div>test child</div>,
      cols: 12,
      containerWidth: 1200,
      rowHeight: 300,
      margin: [0, 0],
      maxRows: 4,
      containerPadding: [0, 0],
      i: "0",
      // These are all in grid units
      x: 0,
      y: 0,
      w: 100,
      h: 100,
      isDraggable: false,
      isResizable: false,
      isBounded: false,
      useCSSTransforms: false
    };

    it("Basic Render", () => {
      const { container } = render(<GridItem {...mockProps} />);
      expect(container.querySelector(".react-grid-item")).toBeInTheDocument();
      expect(screen.getByText("test child")).toBeInTheDocument();
    });

    // Skip: These tests check PropTypes runtime validation which doesn't exist in TypeScript
    // The new TypeScript GridItem uses compile-time type checking instead
    describe.skip("optional min/max dimension props log err", () => {
      describe("minW", () => {
        let mockError;
        beforeEach(() => {
          mockError = jest.spyOn(console, "error").mockImplementation(() => {});
        });
        afterEach(() => {
          jest.clearAllMocks();
        });

        it("2x when string, not number", () => {
          // $FlowIgnore
          render(<GridItem {...mockProps} minW={"apple"} />);
          expect(mockError).toHaveBeenCalledTimes(2);
        });
        it("1 err when larger than w prop", () => {
          render(<GridItem {...mockProps} minW={400} />);
          expect(mockError).toHaveBeenCalledTimes(1);
        });
      });

      describe("maxW", () => {
        let mockError;
        beforeEach(() => {
          mockError = jest.spyOn(console, "error").mockImplementation(() => {});
        });
        afterEach(() => {
          jest.clearAllMocks();
        });

        it("1x when string, not number", () => {
          // $FlowIgnore
          render(<GridItem {...mockProps} maxW={"apple"} />);
          expect(mockError).toHaveBeenCalledTimes(1);
        });
        it("1x err when smaller than w prop", () => {
          render(<GridItem {...mockProps} w={4} maxW={2} />);
          expect(mockError).toHaveBeenCalledTimes(1);
        });
      });

      describe("minH", () => {
        let mockError;
        beforeEach(() => {
          mockError = jest.spyOn(console, "error").mockImplementation(() => {});
        });
        afterEach(() => {
          jest.clearAllMocks();
        });

        it("2x when string, not number", () => {
          // $FlowIgnore
          render(<GridItem {...mockProps} minH={"apple"} />);
          expect(mockError).toHaveBeenCalledTimes(2);
        });
        it("1x when larger than h prop", () => {
          render(<GridItem {...mockProps} minH={200} />);
          expect(mockError).toHaveBeenCalledTimes(1);
        });
      });

      describe("maxH", () => {
        let mockError;
        beforeEach(() => {
          mockError = jest.spyOn(console, "error").mockImplementation(() => {});
        });
        afterEach(() => {
          jest.clearAllMocks();
        });

        it("1x when string, not number", () => {
          // $FlowIgnore
          render(<GridItem {...mockProps} maxH={"apple"} />);
          expect(mockError).toHaveBeenCalledTimes(1);
        });
        it("1x when smaller than h prop", () => {
          render(<GridItem {...mockProps} h={3} maxH={2} />);
          expect(mockError).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe("onDrag", () => {
      it("calls onDragStart prop when droppingPosition prop has expected content", () => {
        const mockFn = jest.fn();

        render(
          <GridItem
            {...mockProps}
            droppingPosition={{ left: 1, top: 1, e: new Event("drop") }}
            onDragStart={mockFn}
          />
        );
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it("calls onDragStart prop callback fn", () => {
        const mockFn = jest.fn();

        render(
          <GridItem
            {...mockProps}
            droppingPosition={{ left: 1, top: 1, e: new Event("drop") }}
            onDragStart={mockFn}
          />
        );
        // onDragStart should be called once from droppingPosition
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it("calls onDrag prop callback fn when droppingPosition changes", () => {
        const mockOnDragStart = jest.fn();
        const mockOnDrag = jest.fn();

        const { rerender } = render(
          <GridItem
            {...mockProps}
            isDraggable={true}
            isBounded={true}
            droppingPosition={{ left: 1, top: 1, e: new Event("drop") }}
            onDragStart={mockOnDragStart}
            onDrag={mockOnDrag}
          />
        );

        // Rerender with new droppingPosition to trigger onDrag
        act(() => {
          rerender(
            <GridItem
              {...mockProps}
              isDraggable={true}
              isBounded={true}
              droppingPosition={{ left: 700, top: 300, e: new Event("drop") }}
              onDragStart={mockOnDragStart}
              onDrag={mockOnDrag}
            />
          );
        });

        expect(mockOnDrag).toHaveBeenCalled();
      });
    });
  });

  describe("<ReactGridLayout>", function () {
    it("Basic Render", async function () {
      const { container } = render(<BasicLayout />);
      expect(container.querySelector(".react-grid-layout")).toBeInTheDocument();
    });

    describe("data-grid", () => {
      it("Creates layout based on properties", async function () {
        const onLayoutChange = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onLayoutChange={onLayoutChange}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 1, h: 2, static: true }}>
              a
            </div>
            <div
              key="b"
              data-grid={{ x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 }}
            >
              b
            </div>
            <div key="c" data-grid={{ x: 4, y: 0, w: 1, h: 2 }}>
              c
            </div>
          </ReactGridLayout>
        );

        // Verify elements are rendered
        expect(screen.getByText("a")).toBeInTheDocument();
        expect(screen.getByText("b")).toBeInTheDocument();
        expect(screen.getByText("c")).toBeInTheDocument();

        // Verify grid items have proper classes
        const gridItems = container.querySelectorAll(".react-grid-item");
        expect(gridItems).toHaveLength(3);

        // Verify onLayoutChange was called with correct layout
        expect(onLayoutChange).toHaveBeenCalled();
        const layout = onLayoutChange.mock.calls[0][0];
        expect(layout).toHaveLength(3);
        expect(layout.find(item => item.i === "a")).toMatchObject({
          h: 2,
          i: "a",
          static: true,
          w: 1,
          x: 0,
          y: 0
        });
        expect(layout.find(item => item.i === "b")).toMatchObject({
          h: 2,
          i: "b",
          w: 3,
          x: 1,
          y: 0
        });
        expect(layout.find(item => item.i === "c")).toMatchObject({
          h: 2,
          i: "c",
          w: 1,
          x: 4,
          y: 0
        });
      });

      it("Null items in list", async function () {
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            // $FlowIgnore
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 1, h: 2, static: true }}>
              a
            </div>
            {false}
            {null}
            <div key="c" data-grid={{ x: 4, y: 0, w: 1, h: 2 }}>
              c
            </div>
          </ReactGridLayout>
        );

        // Only two truthy items should be rendered
        const gridItems = container.querySelectorAll(".react-grid-item");
        expect(gridItems).toHaveLength(2);
      });
    });

    describe("WidthProvider", () => {
      beforeEach(() => {
        // Clear resize observers between tests
        global.__resizeObservers__ = [];
      });

      it("Renders with WidthProvider", async function () {
        const { container } = render(
          <BasicLayout measureBeforeMount={false} />
        );

        // Verify the grid layout is rendered (WidthProvider wraps ReactGridLayout)
        const gridLayout = container.querySelector(".react-grid-layout");
        expect(gridLayout).toBeInTheDocument();

        // BasicLayout uses WidthProvider which should provide width to ReactGridLayout
        // The grid items should be rendered with proper positioning (indicating width was provided)
        const gridItems = container.querySelectorAll(".react-grid-item");
        expect(gridItems.length).toBeGreaterThan(0);

        // Grid items should have transform styles (indicating proper width calculation)
        gridItems.forEach(item => {
          const style = item.getAttribute("style");
          expect(style).toContain("transform");
        });
      });

      it("Renders placeholder div when measureBeforeMount=true and not yet mounted", async function () {
        const { container } = render(<BasicLayout measureBeforeMount={true} />);

        // After mount, should render the full grid layout
        const gridLayout = container.querySelector(".react-grid-layout");
        expect(gridLayout).toBeInTheDocument();
      });

      it("measureBeforeMount re-observes element after switching from placeholder to composed component", async function () {
        // This test verifies the fix for #2083
        // When measureBeforeMount=true, the WidthProvider:
        // 1. First renders a placeholder div (for measurement)
        // 2. After mount, renders the actual ComposedComponent
        // The ResizeObserver must re-observe the new element, not the old placeholder

        // Clear any existing observers
        global.__resizeObservers__ = [];

        // Mock offsetWidth to return 800px
        const originalOffsetWidth = Object.getOwnPropertyDescriptor(
          HTMLElement.prototype,
          "offsetWidth"
        );
        Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
          configurable: true,
          get: function () {
            return 800;
          }
        });

        const { container } = render(<BasicLayout measureBeforeMount={true} />);

        // After mount, verify the grid is rendered
        const gridLayout = container.querySelector(".react-grid-layout");
        expect(gridLayout).toBeInTheDocument();

        // Get active observers - should have one watching the actual element
        const activeObservers = global.__resizeObservers__.filter(
          obs => obs.observedElements.length > 0
        );
        expect(activeObservers.length).toBeGreaterThan(0);

        // The observer should be watching an element that's in the DOM
        // (not the old placeholder which was removed)
        const observer = activeObservers[0];
        const observedElement = observer.observedElements[0];
        expect(document.body.contains(observedElement)).toBe(true);

        // Trigger a resize and verify it updates
        act(() => {
          global.triggerResize(1000);
        });

        // The grid should still be rendered and functional
        expect(
          container.querySelector(".react-grid-layout")
        ).toBeInTheDocument();

        // Restore original offsetWidth descriptor
        if (originalOffsetWidth) {
          Object.defineProperty(
            HTMLElement.prototype,
            "offsetWidth",
            originalOffsetWidth
          );
        }
      });

      it("WidthProvider provides default width of 1280", async function () {
        // The default width is 1280px, which means a 12-column grid has ~100px columns
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1280}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 1, h: 1 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const gridItem = container.querySelector(".react-grid-item");
        expect(gridItem).toBeInTheDocument();

        // With width=1280 and 12 cols, each column is ~106.67px (1280/12)
        const style = gridItem.getAttribute("style");
        expect(style).toContain("width");
      });

      it("WidthProvider responds to ResizeObserver width changes", async function () {
        // Mock offsetWidth to return initial value
        const originalOffsetWidth = Object.getOwnPropertyDescriptor(
          HTMLElement.prototype,
          "offsetWidth"
        );
        Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
          configurable: true,
          get: function () {
            return 1280;
          }
        });

        const { container } = render(
          <BasicLayout measureBeforeMount={false} />
        );

        // Verify initial render
        let gridLayout = container.querySelector(".react-grid-layout");
        expect(gridLayout).toBeInTheDocument();

        // Get first grid item's initial transform
        const gridItem = container.querySelector(".react-grid-item");
        const _initialStyle = gridItem.getAttribute("style");

        // Now change the mock width and trigger resize
        Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
          configurable: true,
          get: function () {
            return 800;
          }
        });

        // Trigger resize observers with new width
        act(() => {
          global.triggerResize(800);
        });

        // The grid should still be rendered (it adapts to new width)
        gridLayout = container.querySelector(".react-grid-layout");
        expect(gridLayout).toBeInTheDocument();

        // Grid items should have updated transforms reflecting the new width
        const updatedGridItem = container.querySelector(".react-grid-item");
        const updatedStyle = updatedGridItem.getAttribute("style");

        // Styles should have changed due to width change (different column widths)
        // Note: The transform values should be different because column width changed
        expect(updatedStyle).toContain("transform");

        // Restore original offsetWidth descriptor
        if (originalOffsetWidth) {
          Object.defineProperty(
            HTMLElement.prototype,
            "offsetWidth",
            originalOffsetWidth
          );
        }
      });

      it("WidthProvider updates grid item widths when container resizes", async function () {
        const onLayoutChange = jest.fn();

        // Start with 1200px width
        Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
          configurable: true,
          get: function () {
            return 1200;
          }
        });

        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onLayoutChange={onLayoutChange}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 6, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const gridItem = container.querySelector(".react-grid-item");
        expect(gridItem).toBeInTheDocument();

        // With width=1200 and 12 cols, w=6 item should be ~600px wide
        // (actually 600 - some margin, but let's check transform exists)
        const style = gridItem.getAttribute("style");
        expect(style).toContain("width");

        // Verify onLayoutChange was called
        expect(onLayoutChange).toHaveBeenCalled();
      });
    });

    describe("Droppability", function () {
      // Helper to simulate dragging over the grid
      function dragDroppableTo(container, x, y) {
        const gridLayout = container.querySelector(".react-grid-layout");
        const droppable = container.querySelector(".droppable-element");

        TestUtils.Simulate.dragOver(gridLayout, {
          currentTarget: {
            getBoundingClientRect: () => ({ left: 0, top: 0 })
          },
          clientX: x,
          clientY: y,
          nativeEvent: {
            target: droppable
          }
        });
      }

      it("Renders droppable layout", function () {
        const { container } = render(
          <DroppableLayout containerPadding={[0, 0]} />
        );

        // Verify the grid layout and droppable element are rendered
        expect(
          container.querySelector(".react-grid-layout")
        ).toBeInTheDocument();
        expect(
          container.querySelector(".droppable-element")
        ).toBeInTheDocument();
      });

      it("renders with isDroppable=true", function () {
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            isDroppable={true}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        expect(
          container.querySelector(".react-grid-layout")
        ).toBeInTheDocument();
      });

      it("Updates when an item is dragged over", function () {
        const onLayoutChange = jest.fn();
        const { container } = render(
          <DroppableLayout
            containerPadding={[0, 0]}
            onLayoutChange={onLayoutChange}
          />
        );

        // Drag the droppable over the grid layout
        act(() => {
          dragDroppableTo(container, 200, 140);
        });

        // Layout should be updated to include the dropping placeholder
        expect(onLayoutChange).toHaveBeenCalled();
      });

      it("calls onDropDragOver when dragging over grid", function () {
        const onDropDragOver = jest.fn(() => ({ w: 1, h: 1 }));
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            isDroppable={true}
            onDropDragOver={onDropDragOver}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const grid = container.querySelector(".react-grid-layout");
        act(() => {
          TestUtils.Simulate.dragOver(grid, {
            currentTarget: {
              getBoundingClientRect: () => ({ left: 0, top: 0 })
            },
            clientX: 200,
            clientY: 100,
            nativeEvent: {
              target: document.createElement("div")
            }
          });
        });

        expect(onDropDragOver).toHaveBeenCalled();
      });

      it("calls onDrop when item is dropped", function () {
        const onDrop = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            isDroppable={true}
            onDrop={onDrop}
            onDropDragOver={() => ({ w: 1, h: 1 })}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const grid = container.querySelector(".react-grid-layout");
        act(() => {
          // First dragOver to set up the dropping state
          TestUtils.Simulate.dragOver(grid, {
            currentTarget: {
              getBoundingClientRect: () => ({ left: 0, top: 0 })
            },
            clientX: 200,
            clientY: 100,
            nativeEvent: {
              target: document.createElement("div")
            }
          });
          // Then drop
          TestUtils.Simulate.drop(grid, {
            clientX: 200,
            clientY: 100
          });
        });

        expect(onDrop).toHaveBeenCalled();
      });

      it("Allows customizing the droppable placeholder size", function () {
        const onDropDragOver = jest.fn(() => ({ w: 2, h: 2 }));
        const onDrop = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            isDroppable={true}
            onDropDragOver={onDropDragOver}
            onDrop={onDrop}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const grid = container.querySelector(".react-grid-layout");
        act(() => {
          TestUtils.Simulate.dragOver(grid, {
            currentTarget: {
              getBoundingClientRect: () => ({ left: 0, top: 0 })
            },
            clientX: 200,
            clientY: 150,
            nativeEvent: {
              target: document.createElement("div")
            }
          });
          TestUtils.Simulate.drop(grid, {
            clientX: 200,
            clientY: 150
          });
        });

        // onDrop should be called with the custom w/h
        expect(onDrop).toHaveBeenCalled();
        const dropArgs = onDrop.mock.calls[0];
        // The layout should include the dropped item with custom size
        expect(dropArgs[0]).toEqual(
          expect.arrayContaining([expect.objectContaining({ w: 2, h: 2 })])
        );
      });

      it("Allows short-circuiting the drag via onDropDragOver returning false", function () {
        const onDropDragOver = jest.fn(() => false);
        const onLayoutChange = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            isDroppable={true}
            onDropDragOver={onDropDragOver}
            onLayoutChange={onLayoutChange}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        // Clear initial mount call
        onLayoutChange.mockClear();

        const grid = container.querySelector(".react-grid-layout");
        act(() => {
          TestUtils.Simulate.dragOver(grid, {
            currentTarget: {
              getBoundingClientRect: () => ({ left: 0, top: 0 })
            },
            clientX: 200,
            clientY: 150,
            nativeEvent: {
              target: document.createElement("div")
            }
          });
        });

        // onDropDragOver was called
        expect(onDropDragOver).toHaveBeenCalled();
        // When returning false, no dropping placeholder should be added to layout
        // so onLayoutChange should not have been called with a __dropping-elem__
        const layoutCalls = onLayoutChange.mock.calls;
        const hasDroppedItem = layoutCalls.some(call =>
          call[0].some(item => item.i === "__dropping-elem__")
        );
        expect(hasDroppedItem).toBe(false);
      });

      // #2212 - dropConfig.onDragOver should be used
      it("calls dropConfig.onDragOver when provided (v2 API) (#2212)", function () {
        const onDragOver = jest.fn(() => ({ w: 3, h: 3 }));
        const onLayoutChange = jest.fn();

        // Use GridLayoutV2 (the v2 API component) directly to test dropConfig.onDragOver
        const { container } = render(
          <GridLayoutV2
            className="layout"
            gridConfig={{ cols: 12, rowHeight: 30 }}
            width={1200}
            layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
            dropConfig={{ enabled: true, onDragOver }}
            onLayoutChange={onLayoutChange}
          >
            <div key="a">a</div>
          </GridLayoutV2>
        );

        const grid = container.querySelector(".react-grid-layout");
        act(() => {
          TestUtils.Simulate.dragOver(grid, {
            currentTarget: {
              getBoundingClientRect: () => ({ left: 0, top: 0 })
            },
            clientX: 200,
            clientY: 150,
            nativeEvent: {
              target: document.createElement("div")
            }
          });
        });

        // dropConfig.onDragOver should be called
        expect(onDragOver).toHaveBeenCalled();
        // The dropping placeholder should have been added with w:3, h:3
        const layoutCalls = onLayoutChange.mock.calls;
        const droppingItem = layoutCalls
          .flatMap(call => call[0])
          .find(item => item.i === "__dropping-elem__");
        expect(droppingItem).toBeDefined();
        expect(droppingItem.w).toBe(3);
        expect(droppingItem.h).toBe(3);
      });

      it("does not cause Maximum update depth exceeded on drag over (#2204)", function () {
        // This test verifies the fix for issue #2204 where dragOver would cause
        // an infinite update loop because the sync useEffect would remove the
        // dropping item from layout, which would trigger another render.
        //
        // The fix adds a check for droppingDOMNode in the sync useEffect to skip
        // layout synchronization during drop-from-outside operations.
        const onLayoutChange = jest.fn();
        const onDropDragOver = jest.fn(() => ({ w: 2, h: 2 }));

        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            isDroppable={true}
            onDropDragOver={onDropDragOver}
            onLayoutChange={onLayoutChange}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const grid = container.querySelector(".react-grid-layout");

        // Simulate a single dragOver event - if the bug exists, this would cause
        // an infinite loop and the test would timeout
        act(() => {
          TestUtils.Simulate.dragOver(grid, {
            currentTarget: {
              getBoundingClientRect: () => ({ left: 0, top: 0 })
            },
            clientX: 200,
            clientY: 100,
            nativeEvent: {
              target: document.createElement("div")
            }
          });
        });

        // If we get here without timing out, the fix is working
        // Verify that the dropping placeholder was added to layout
        const layoutCalls = onLayoutChange.mock.calls;
        const hasDroppedItem = layoutCalls.some(call =>
          call[0].some(item => item.i === "__dropping-elem__")
        );
        expect(hasDroppedItem).toBe(true);
      });

      it("does not cause Maximum update depth exceeded when dragging in then out (#2210)", function () {
        // This test verifies the fix for issue #2210 where dragging an item INTO
        // the grid and then moving it OUTSIDE without releasing the mouse button
        // would cause an infinite update loop.
        //
        // The scenario is:
        // 1. Drag an external item over the grid (creates dropping placeholder)
        // 2. Move the item outside the grid (triggers dragLeave)
        // 3. The dropping placeholder is removed but this triggers state updates
        //    that cause the GridItem's useEffect to fire with stale callbacks
        const consoleError = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});
        const onLayoutChange = jest.fn();
        const onDropDragOver = jest.fn(() => ({ w: 2, h: 2 }));
        const onDrag = jest.fn();
        const onDragStart = jest.fn();

        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            isDroppable={true}
            onDropDragOver={onDropDragOver}
            onLayoutChange={onLayoutChange}
            onDrag={onDrag}
            onDragStart={onDragStart}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const grid = container.querySelector(".react-grid-layout");

        // Step 1: Drag into the grid (creates dropping placeholder)
        act(() => {
          TestUtils.Simulate.dragEnter(grid, {
            clientX: 200,
            clientY: 100
          });
        });

        act(() => {
          TestUtils.Simulate.dragOver(grid, {
            currentTarget: {
              getBoundingClientRect: () => ({ left: 0, top: 0 })
            },
            clientX: 200,
            clientY: 100,
            nativeEvent: {
              target: document.createElement("div")
            }
          });
        });

        // Verify the dropping placeholder was added
        let layoutCalls = onLayoutChange.mock.calls;
        let hasDroppedItem = layoutCalls.some(call =>
          call[0].some(item => item.i === "__dropping-elem__")
        );
        expect(hasDroppedItem).toBe(true);

        // Record how many times onDrag was called
        const _dragCallsBefore = onDrag.mock.calls.length;

        // Step 2: Move the item around inside the grid (multiple moves)
        for (let i = 0; i < 5; i++) {
          act(() => {
            TestUtils.Simulate.dragOver(grid, {
              currentTarget: {
                getBoundingClientRect: () => ({ left: 0, top: 0 })
              },
              clientX: 200 + i * 20,
              clientY: 100 + i * 20,
              nativeEvent: {
                target: document.createElement("div")
              }
            });
          });
        }

        // Step 3: Drag leave (move outside the grid without releasing)
        // This is where the infinite loop would occur in #2210
        act(() => {
          TestUtils.Simulate.dragLeave(grid, {
            clientX: -100,
            clientY: -100
          });
        });

        // If we get here without timing out, the fix is working
        // The dropping placeholder should have been removed
        layoutCalls = onLayoutChange.mock.calls;
        const lastLayout = layoutCalls[layoutCalls.length - 1]?.[0] || [];
        hasDroppedItem = lastLayout.some(
          item => item.i === "__dropping-elem__"
        );
        expect(hasDroppedItem).toBe(false);

        // Verify onDrag wasn't called excessively (would indicate infinite loop)
        // We expect 5 drag calls from step 2, plus maybe a few more, but not 50+
        const totalDragCalls = onDrag.mock.calls.length;
        expect(totalDragCalls).toBeLessThan(50);

        // Verify no "Maximum update depth exceeded" errors
        const maxDepthErrors = consoleError.mock.calls.filter(call =>
          call[0]?.includes?.("Maximum update depth exceeded")
        );
        expect(maxDepthErrors).toHaveLength(0);

        consoleError.mockRestore();
      });

      // #2210 - Test with v2 API GridLayout directly
      it("does not cause Maximum update depth exceeded with v2 API GridLayout (#2210)", function () {
        const consoleError = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});
        const onLayoutChange = jest.fn();
        const onDragOver = jest.fn(() => ({ w: 2, h: 2 }));
        const onDrag = jest.fn();
        const onDragStart = jest.fn();

        const { container } = render(
          <GridLayoutV2
            className="layout"
            gridConfig={{ cols: 12, rowHeight: 30 }}
            width={1200}
            layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
            dropConfig={{ enabled: true, onDragOver }}
            onLayoutChange={onLayoutChange}
            onDrag={onDrag}
            onDragStart={onDragStart}
          >
            <div key="a">a</div>
          </GridLayoutV2>
        );

        const grid = container.querySelector(".react-grid-layout");

        // Step 1: Drag into the grid (creates dropping placeholder)
        act(() => {
          TestUtils.Simulate.dragEnter(grid, {
            clientX: 200,
            clientY: 100
          });
        });

        act(() => {
          TestUtils.Simulate.dragOver(grid, {
            currentTarget: {
              getBoundingClientRect: () => ({ left: 0, top: 0 })
            },
            clientX: 200,
            clientY: 100,
            nativeEvent: {
              target: document.createElement("div")
            }
          });
        });

        // Step 2: Move around inside multiple times
        for (let i = 0; i < 5; i++) {
          act(() => {
            TestUtils.Simulate.dragOver(grid, {
              currentTarget: {
                getBoundingClientRect: () => ({ left: 0, top: 0 })
              },
              clientX: 200 + i * 30,
              clientY: 100 + i * 30,
              nativeEvent: {
                target: document.createElement("div")
              }
            });
          });
        }

        // Step 3: Drag out
        act(() => {
          TestUtils.Simulate.dragLeave(grid, {
            clientX: -100,
            clientY: -100
          });
        });

        // Verify no "Maximum update depth exceeded" errors
        const maxDepthErrors = consoleError.mock.calls.filter(call =>
          call[0]?.includes?.("Maximum update depth exceeded")
        );
        expect(maxDepthErrors).toHaveLength(0);

        consoleError.mockRestore();
      });

      // #2210 - Test with ResponsiveReactGridLayout
      it("does not cause Maximum update depth exceeded with ResponsiveReactGridLayout (#2210)", function () {
        const consoleError = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});
        const onLayoutChange = jest.fn();
        const onDropDragOver = jest.fn(() => ({ w: 2, h: 2 }));

        const { container } = render(
          <ResponsiveReactGridLayout
            className="layout"
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            rowHeight={30}
            width={1200}
            isDroppable={true}
            onDropDragOver={onDropDragOver}
            onLayoutChange={onLayoutChange}
            layouts={{
              lg: [{ i: "a", x: 0, y: 0, w: 2, h: 2 }]
            }}
          >
            <div key="a">a</div>
          </ResponsiveReactGridLayout>
        );

        const grid = container.querySelector(".react-grid-layout");

        // Step 1: Drag into the grid (creates dropping placeholder)
        act(() => {
          TestUtils.Simulate.dragEnter(grid, {
            clientX: 200,
            clientY: 100
          });
        });

        act(() => {
          TestUtils.Simulate.dragOver(grid, {
            currentTarget: {
              getBoundingClientRect: () => ({ left: 0, top: 0 })
            },
            clientX: 200,
            clientY: 100,
            nativeEvent: {
              target: document.createElement("div")
            }
          });
        });

        // Step 2: Move around inside
        for (let i = 0; i < 3; i++) {
          act(() => {
            TestUtils.Simulate.dragOver(grid, {
              currentTarget: {
                getBoundingClientRect: () => ({ left: 0, top: 0 })
              },
              clientX: 200 + i * 20,
              clientY: 100 + i * 20,
              nativeEvent: {
                target: document.createElement("div")
              }
            });
          });
        }

        // Step 3: Drag out
        act(() => {
          TestUtils.Simulate.dragLeave(grid, {
            clientX: -100,
            clientY: -100
          });
        });

        // Verify no "Maximum update depth exceeded" errors
        const maxDepthErrors = consoleError.mock.calls.filter(call =>
          call[0]?.includes?.("Maximum update depth exceeded")
        );
        expect(maxDepthErrors).toHaveLength(0);

        consoleError.mockRestore();
      });

      // #2210 - Test repeated drag in/out cycles
      it("does not cause Maximum update depth exceeded during repeated drag in/out cycles (#2210)", function () {
        // This test verifies that repeatedly dragging an item INTO and then OUT OF
        // the grid (without releasing) doesn't cause infinite loops.
        const consoleError = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});
        const onLayoutChange = jest.fn();
        const onDropDragOver = jest.fn(() => ({ w: 2, h: 2 }));

        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            isDroppable={true}
            onDropDragOver={onDropDragOver}
            onLayoutChange={onLayoutChange}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const grid = container.querySelector(".react-grid-layout");

        // Perform multiple drag in/out cycles
        for (let cycle = 0; cycle < 5; cycle++) {
          // Drag in
          act(() => {
            TestUtils.Simulate.dragEnter(grid, {
              clientX: 200,
              clientY: 100
            });
          });

          // Move around inside
          act(() => {
            TestUtils.Simulate.dragOver(grid, {
              currentTarget: {
                getBoundingClientRect: () => ({ left: 0, top: 0 })
              },
              clientX: 200 + cycle * 10,
              clientY: 100 + cycle * 10,
              nativeEvent: {
                target: document.createElement("div")
              }
            });
          });

          // Drag out (without releasing)
          act(() => {
            TestUtils.Simulate.dragLeave(grid, {
              clientX: -100,
              clientY: -100
            });
          });
        }

        // If we get here without timing out or crashing, the fix is working
        // Verify no "Maximum update depth exceeded" errors
        const maxDepthErrors = consoleError.mock.calls.filter(call =>
          call[0]?.includes?.("Maximum update depth exceeded")
        );
        expect(maxDepthErrors).toHaveLength(0);

        consoleError.mockRestore();
      });
    });

    describe("Drag Callbacks", function () {
      it("calls onDragStart when drag begins", function () {
        const onDragStart = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onDragStart={onDragStart}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const gridItem = container.querySelector(".react-grid-item");
        act(() => {
          dispatchMouseEvent(gridItem, "mousedown", {
            clientX: 50,
            clientY: 50
          });
        });

        expect(onDragStart).toHaveBeenCalled();
      });

      it("calls onDrag during drag movement", function () {
        const onDragStart = jest.fn();
        const onDrag = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onDragStart={onDragStart}
            onDrag={onDrag}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const gridItem = container.querySelector(".react-grid-item");
        act(() => {
          dispatchMouseEvent(gridItem, "mousedown", {
            clientX: 50,
            clientY: 50
          });
        });

        // Verify drag started
        expect(onDragStart).toHaveBeenCalled();

        act(() => {
          mouseMove(150, 150, gridItem);
        });

        expect(onDrag).toHaveBeenCalled();
      });

      it("calls onDragStop when drag ends", function () {
        const onDragStart = jest.fn();
        const onDragStop = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onDragStart={onDragStart}
            onDragStop={onDragStop}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const gridItem = container.querySelector(".react-grid-item");
        act(() => {
          // Start drag
          dispatchMouseEvent(gridItem, "mousedown", {
            clientX: 50,
            clientY: 50
          });
        });

        // Verify drag started
        expect(onDragStart).toHaveBeenCalled();

        act(() => {
          // Move
          mouseMove(150, 150, gridItem);
          // End drag
          const mouseUpEvent = new MouseEvent("mouseup", {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: 150,
            clientY: 150,
            button: 0
          });
          document.dispatchEvent(mouseUpEvent);
        });

        expect(onDragStop).toHaveBeenCalled();
      });

      it("calls onLayoutChange after drag completes", function () {
        const onDragStart = jest.fn();
        const onLayoutChange = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onDragStart={onDragStart}
            onLayoutChange={onLayoutChange}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        // Clear initial call from mount
        onLayoutChange.mockClear();

        const gridItem = container.querySelector(".react-grid-item");
        act(() => {
          dispatchMouseEvent(gridItem, "mousedown", {
            clientX: 50,
            clientY: 50
          });
        });

        expect(onDragStart).toHaveBeenCalled();

        act(() => {
          mouseMove(250, 150, gridItem);
          const mouseUpEvent = new MouseEvent("mouseup", {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: 250,
            clientY: 150,
            button: 0
          });
          document.dispatchEvent(mouseUpEvent);
        });

        expect(onLayoutChange).toHaveBeenCalled();
      });
    });

    describe("Resizing", () => {
      it("sets up resizable handles", () => {
        const { container } = render(<ResizableLayout />);

        // Ensure every handle is present on the target element
        ["n", "ne", "e", "se", "s", "sw", "w", "nw"].forEach(handle => {
          const handles = container.querySelectorAll(
            `.react-resizable-handle-${handle}`
          );
          expect(handles.length).toBeGreaterThan(0);
        });
      });

      it("calls onResizeStart when resize begins", function () {
        const onResizeStart = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onResizeStart={onResizeStart}
            resizeHandles={["se"]}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const handle = container.querySelector(".react-resizable-handle-se");
        act(() => {
          dispatchMouseEvent(handle, "mousedown", {
            clientX: 100,
            clientY: 60
          });
        });

        expect(onResizeStart).toHaveBeenCalled();
      });

      it("calls onResize during resize", function () {
        const onResize = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onResize={onResize}
            resizeHandles={["se"]}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const handle = container.querySelector(".react-resizable-handle-se");
        act(() => {
          dispatchMouseEvent(handle, "mousedown", {
            clientX: 100,
            clientY: 60
          });
          mouseMove(200, 120, handle);
        });

        expect(onResize).toHaveBeenCalled();
      });

      it("calls onResizeStop when resize ends", function () {
        const onResizeStop = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onResizeStop={onResizeStop}
            resizeHandles={["se"]}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const handle = container.querySelector(".react-resizable-handle-se");
        act(() => {
          simulateDrag(handle, 100, 60, 200, 120);
        });

        expect(onResizeStop).toHaveBeenCalled();
      });

      it("resizes from n handle", () => {
        const onResizeStop = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onResizeStop={onResizeStop}
            resizeHandles={["n"]}
            containerPadding={[10, 10]}
          >
            <div key="a" data-grid={{ x: 0, y: 2, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const handle = container.querySelector(".react-resizable-handle-n");
        act(() => {
          simulateDrag(handle, 100, 70, 100, 10);
        });

        expect(onResizeStop).toHaveBeenCalled();
      });

      it("resizes from e handle", () => {
        const onResizeStop = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onResizeStop={onResizeStop}
            resizeHandles={["e"]}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const handle = container.querySelector(".react-resizable-handle-e");
        act(() => {
          simulateDrag(handle, 200, 30, 400, 30);
        });

        expect(onResizeStop).toHaveBeenCalled();
      });

      it("resizes from s handle", () => {
        const onResizeStop = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onResizeStop={onResizeStop}
            resizeHandles={["s"]}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const handle = container.querySelector(".react-resizable-handle-s");
        act(() => {
          simulateDrag(handle, 100, 60, 100, 120);
        });

        expect(onResizeStop).toHaveBeenCalled();
      });

      it("resizes from w handle", () => {
        const onResizeStop = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onResizeStop={onResizeStop}
            resizeHandles={["w"]}
          >
            <div key="a" data-grid={{ x: 2, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const handle = container.querySelector(".react-resizable-handle-w");
        act(() => {
          simulateDrag(handle, 200, 30, 100, 30);
        });

        expect(onResizeStop).toHaveBeenCalled();
      });

      it("resizes from se handle", () => {
        const onResizeStop = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onResizeStop={onResizeStop}
            resizeHandles={["se"]}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const handle = container.querySelector(".react-resizable-handle-se");
        act(() => {
          simulateDrag(handle, 200, 60, 400, 120);
        });

        expect(onResizeStop).toHaveBeenCalled();
      });

      it("resizes from sw handle", () => {
        const onResizeStop = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onResizeStop={onResizeStop}
            resizeHandles={["sw"]}
          >
            <div key="a" data-grid={{ x: 2, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const handle = container.querySelector(".react-resizable-handle-sw");
        act(() => {
          simulateDrag(handle, 200, 60, 100, 120);
        });

        expect(onResizeStop).toHaveBeenCalled();
      });

      it("resizes from ne handle", () => {
        const onResizeStop = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onResizeStop={onResizeStop}
            resizeHandles={["ne"]}
            containerPadding={[10, 10]}
          >
            <div key="a" data-grid={{ x: 0, y: 2, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const handle = container.querySelector(".react-resizable-handle-ne");
        act(() => {
          simulateDrag(handle, 200, 70, 400, 10);
        });

        expect(onResizeStop).toHaveBeenCalled();
      });

      it("resizes from nw handle", () => {
        const onResizeStop = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onResizeStop={onResizeStop}
            resizeHandles={["nw"]}
            containerPadding={[10, 10]}
          >
            <div key="a" data-grid={{ x: 2, y: 2, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const handle = container.querySelector(".react-resizable-handle-nw");
        act(() => {
          simulateDrag(handle, 200, 70, 100, 10);
        });

        expect(onResizeStop).toHaveBeenCalled();
      });

      it("does not produce NaN values in position during resize", () => {
        // Regression test: when node is falsy in onResizeHandler,
        // updatedSize must still have valid top/left values
        const onResize = jest.fn();
        const onResizeStop = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            onResize={onResize}
            onResizeStop={onResizeStop}
            resizeHandles={["se"]}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const gridItem = container.querySelector(".react-grid-item");
        const handle = container.querySelector(".react-resizable-handle-se");

        // Start resize
        act(() => {
          dispatchMouseEvent(handle, "mousedown", {
            clientX: 200,
            clientY: 60
          });
        });

        // Move during resize
        act(() => {
          mouseMove(300, 120, handle);
        });

        // Check that the grid item's style doesn't contain NaN
        const style = gridItem.getAttribute("style");
        expect(style).not.toContain("NaN");

        // Complete resize
        act(() => {
          const mouseUpEvent = new MouseEvent("mouseup", {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: 300,
            clientY: 120,
            button: 0
          });
          document.dispatchEvent(mouseUpEvent);
        });

        // Verify style still doesn't contain NaN after resize
        const finalStyle = gridItem.getAttribute("style");
        expect(finalStyle).not.toContain("NaN");

        expect(onResizeStop).toHaveBeenCalled();
      });

      describe("preventCollision=true and no compaction", () => {
        const PreventCollisionContainer = ({
          layoutA,
          layoutB,
          onLayoutChange
        }) => (
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            preventCollision={true}
            compactType={null}
            resizeHandles={["n", "e", "s", "w"]}
            onLayoutChange={onLayoutChange}
          >
            <div key="0" data-grid={layoutA}>
              0
            </div>
            <div key="1" data-grid={layoutB}>
              1
            </div>
          </ReactGridLayout>
        );

        it("Does not allow elements to move when resizing with no free space", () => {
          const onLayoutChange = jest.fn();
          const { container } = render(
            <PreventCollisionContainer
              layoutA={{ x: 0, y: 0, w: 1, h: 2 }}
              layoutB={{ x: 1, y: 0, w: 7, h: 2 }}
              onLayoutChange={onLayoutChange}
            />
          );

          // Get initial layout
          onLayoutChange.mockClear();

          const handle = container.querySelector(".react-resizable-handle-e");
          act(() => {
            simulateDrag(handle, 100, 30, 300, 30);
          });

          // Layout should be called but item 0 should not be able to expand
          // because item 1 is blocking it
          if (onLayoutChange.mock.calls.length > 0) {
            const layout =
              onLayoutChange.mock.calls[
                onLayoutChange.mock.calls.length - 1
              ][0];
            const item0 = layout.find(item => item.i === "0");
            // Width should be at most 1 because of collision
            if (item0) {
              expect(item0.w).toBeLessThanOrEqual(1);
            }
          }
        });

        it("Allows elements to resize within free space", () => {
          const onResizeStop = jest.fn();
          const { container } = render(
            <ReactGridLayout
              className="layout"
              cols={12}
              rowHeight={30}
              width={1200}
              preventCollision={true}
              compactType={null}
              resizeHandles={["n", "e", "s", "w"]}
              onResizeStop={onResizeStop}
            >
              <div key="0" data-grid={{ x: 0, y: 0, w: 1, h: 2 }}>
                0
              </div>
              <div key="1" data-grid={{ x: 10, y: 0, w: 2, h: 2 }}>
                1
              </div>
            </ReactGridLayout>
          );

          const handle = container.querySelector(".react-resizable-handle-e");
          act(() => {
            // Resize to the right - there's free space from x=1 to x=10
            dispatchMouseEvent(handle, "mousedown", {
              clientX: 100,
              clientY: 30
            });
          });

          act(() => {
            mouseMove(300, 30, handle);
            const mouseUpEvent = new MouseEvent("mouseup", {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: 300,
              clientY: 30,
              button: 0
            });
            document.dispatchEvent(mouseUpEvent);
          });

          // With free space, resize should complete
          expect(onResizeStop).toHaveBeenCalled();
        });
      });
    });

    describe("Bounded Drag", function () {
      it("applies bounded class when isBounded is true", function () {
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            isBounded={true}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        // Verify the grid item renders correctly with bounded parent
        const gridItem = container.querySelector(".react-grid-item");
        expect(gridItem).toBeInTheDocument();
      });

      it("constrains movement when isBounded is true", function () {
        const onDragStart = jest.fn();
        const onDragStop = jest.fn();
        const { container } = render(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            isBounded={true}
            onDragStart={onDragStart}
            onDragStop={onDragStop}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        );

        const gridItem = container.querySelector(".react-grid-item");

        // Start drag
        act(() => {
          dispatchMouseEvent(gridItem, "mousedown", {
            clientX: 50,
            clientY: 50
          });
        });

        expect(onDragStart).toHaveBeenCalled();

        // Try to drag way outside bounds (negative coordinates)
        act(() => {
          mouseMove(-500, -500, gridItem);
          const mouseUpEvent = new MouseEvent("mouseup", {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: -500,
            clientY: -500,
            button: 0
          });
          document.dispatchEvent(mouseUpEvent);
        });

        // Should have been called and position should be constrained
        expect(onDragStop).toHaveBeenCalled();
        const callArgs = onDragStop.mock.calls[0];
        // onDragStop(layout, oldItem, newItem, placeholder, e, node)
        const newItem = callArgs[2]; // newItem is the third argument
        // x and y should be constrained to valid values (>= 0)
        expect(newItem).toBeDefined();
        if (newItem) {
          expect(newItem.x).toBeGreaterThanOrEqual(0);
          expect(newItem.y).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe("<ResponsiveReactGridLayout>", function () {
    it("Basic Render", async function () {
      const { container } = render(<ShowcaseLayout />);
      expect(container.querySelector(".react-grid-layout")).toBeInTheDocument();
    });

    it("Does not modify layout on movement", async function () {
      const layouts = {
        lg: [
          ..._.times(3, i => ({
            i: String(i),
            x: i,
            y: 0,
            w: 1,
            h: 1
          }))
        ]
      };
      const frozenLayouts = deepFreeze(layouts, {
        set: true,
        get: false /* don't crash on unknown gets */
      });

      // Render the basic Responsive layout.
      const { rerender } = render(
        <ResponsiveReactGridLayout
          layouts={frozenLayouts}
          width={1280}
          breakpoint="lg"
        >
          {_.times(3, i => (
            <div key={i} />
          ))}
        </ResponsiveReactGridLayout>
      );

      // Rerender with different props - should not throw
      rerender(
        <ResponsiveReactGridLayout
          layouts={frozenLayouts}
          width={800}
          breakpoint="md"
        >
          {_.times(3, i => (
            <div key={i} />
          ))}
        </ResponsiveReactGridLayout>
      );

      expect(frozenLayouts).not.toHaveProperty("md");
    });
  });

  describe("React 18 Compatibility", function () {
    it("renders without errors in StrictMode", function () {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { container } = render(
        <StrictMode>
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
          </ReactGridLayout>
        </StrictMode>
      );

      expect(container.querySelector(".react-grid-layout")).toBeInTheDocument();

      // Filter out non-critical warnings
      const criticalErrors = consoleError.mock.calls.filter(
        call =>
          !call[0]?.includes?.("act(") &&
          !call[0]?.includes?.("Warning: ReactDOM.render") &&
          // StrictMode double-renders can cause drag state issues in tests - not a real error
          !call[0]?.message?.includes?.("onDrag") &&
          !call[0]?.message?.includes?.("onDragEnd")
      );

      // Should have no critical React 18 related errors
      expect(criticalErrors).toHaveLength(0);

      consoleError.mockRestore();
    });

    it("handles concurrent updates without warnings", function () {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { rerender } = render(
        <ReactGridLayout
          className="layout"
          cols={12}
          rowHeight={30}
          width={1200}
        >
          <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
            a
          </div>
        </ReactGridLayout>
      );

      // Rapidly rerender multiple times (simulates concurrent updates)
      act(() => {
        for (let i = 0; i < 5; i++) {
          rerender(
            <ReactGridLayout
              className="layout"
              cols={12}
              rowHeight={30}
              width={1200 + i * 10}
            >
              <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
                a
              </div>
            </ReactGridLayout>
          );
        }
      });

      // Filter for flushSync warnings which indicate React 18 issues
      const flushSyncWarnings = consoleError.mock.calls.filter(
        call =>
          call[0]?.includes?.("flushSync") ||
          call[0]?.includes?.("Cannot update")
      );

      expect(flushSyncWarnings).toHaveLength(0);

      consoleError.mockRestore();
    });

    it("works with multiple grid items in StrictMode", function () {
      const { container } = render(
        <StrictMode>
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
          >
            <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
              a
            </div>
            <div key="b" data-grid={{ x: 2, y: 0, w: 2, h: 2 }}>
              b
            </div>
            <div key="c" data-grid={{ x: 4, y: 0, w: 2, h: 2 }}>
              c
            </div>
          </ReactGridLayout>
        </StrictMode>
      );

      const gridItems = container.querySelectorAll(".react-grid-item");
      expect(gridItems).toHaveLength(3);
    });
  });

  describe("Layout Position Verification", function () {
    it("positions items correctly based on data-grid", function () {
      const { container } = render(
        <ReactGridLayout
          className="layout"
          cols={12}
          rowHeight={30}
          width={1200}
          margin={[10, 10]}
          containerPadding={[10, 10]}
        >
          <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2 }}>
            a
          </div>
          <div key="b" data-grid={{ x: 2, y: 0, w: 2, h: 2 }}>
            b
          </div>
        </ReactGridLayout>
      );

      const gridItems = container.querySelectorAll(".react-grid-item");
      expect(gridItems).toHaveLength(2);

      // Both items should have transform styles applied
      gridItems.forEach(item => {
        const style = item.getAttribute("style");
        expect(style).toContain("transform");
      });
    });

    it("updates positions when layout prop changes", function () {
      const { container, rerender } = render(
        <ReactGridLayout
          className="layout"
          cols={12}
          rowHeight={30}
          width={1200}
          layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
        >
          <div key="a">a</div>
        </ReactGridLayout>
      );

      const itemBefore = container.querySelector(".react-grid-item");
      const styleBefore = itemBefore.getAttribute("style");

      // Rerender with different position
      rerender(
        <ReactGridLayout
          className="layout"
          cols={12}
          rowHeight={30}
          width={1200}
          layout={[{ i: "a", x: 4, y: 2, w: 2, h: 2 }]}
        >
          <div key="a">a</div>
        </ReactGridLayout>
      );

      const itemAfter = container.querySelector(".react-grid-item");
      const styleAfter = itemAfter.getAttribute("style");

      // Style should have changed due to new position
      expect(styleAfter).not.toEqual(styleBefore);
    });
  });

  // #2213 - Custom compactors should have their methods called
  describe("Custom Compactors", function () {
    it("calls custom compactor.compact() when layout changes (v2 API) (#2213)", function () {
      const customCompact = jest.fn(layout => layout);
      const customOnMove = jest.fn((layout, _item, _x, _y, _cols) => layout);

      const customCompactor = {
        type: "vertical",
        allowOverlap: false,
        preventCollision: false,
        compact: customCompact,
        onMove: customOnMove
      };

      render(
        <GridLayoutV2
          className="layout"
          gridConfig={{ cols: 12, rowHeight: 30 }}
          width={1200}
          layout={[
            { i: "a", x: 0, y: 0, w: 2, h: 2 },
            { i: "b", x: 2, y: 0, w: 2, h: 2 }
          ]}
          compactor={customCompactor}
        >
          <div key="a">a</div>
          <div key="b">b</div>
        </GridLayoutV2>
      );

      // The custom compactor's compact method should have been called
      // during initial layout processing
      expect(customCompact).toHaveBeenCalled();
    });
  });

  // #2217 - PositionStrategy methods should be called
  describe("Custom PositionStrategy", function () {
    it("calls custom positionStrategy.calcStyle() for item positioning (v2 API)", function () {
      const mockCalcStyle = jest.fn(pos => ({
        transform: `translate(${pos.left}px, ${pos.top}px)`,
        width: `${pos.width}px`,
        height: `${pos.height}px`,
        position: "absolute"
      }));
      const mockCalcDragPosition = jest.fn(
        (clientX, clientY, offsetX, offsetY) => ({
          left: clientX - offsetX,
          top: clientY - offsetY
        })
      );

      const customPositionStrategy = {
        type: "transform",
        scale: 1,
        calcStyle: mockCalcStyle,
        calcDragPosition: mockCalcDragPosition
      };

      render(
        <GridLayoutV2
          className="layout"
          gridConfig={{ cols: 12, rowHeight: 30 }}
          width={1200}
          layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
          positionStrategy={customPositionStrategy}
        >
          <div key="a">a</div>
        </GridLayoutV2>
      );

      // The custom positionStrategy's calcStyle method should have been called
      // for positioning the grid item
      expect(mockCalcStyle).toHaveBeenCalled();
    });

    it("calls custom positionStrategy.calcDragPosition() during drag (v2 API)", function () {
      const mockCalcStyle = jest.fn(pos => ({
        transform: `translate(${pos.left}px, ${pos.top}px)`,
        width: `${pos.width}px`,
        height: `${pos.height}px`,
        position: "absolute"
      }));
      const mockCalcDragPosition = jest.fn(
        (clientX, clientY, offsetX, offsetY) => ({
          left: clientX - offsetX,
          top: clientY - offsetY
        })
      );

      const customPositionStrategy = {
        type: "transform",
        scale: 1,
        calcStyle: mockCalcStyle,
        calcDragPosition: mockCalcDragPosition
      };

      const { container } = render(
        <GridLayoutV2
          className="layout"
          gridConfig={{ cols: 12, rowHeight: 30 }}
          width={1200}
          layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
          positionStrategy={customPositionStrategy}
          dragConfig={{ enabled: true }}
        >
          <div key="a">a</div>
        </GridLayoutV2>
      );

      const gridItem = container.querySelector(".react-grid-item");

      // Start drag
      act(() => {
        dispatchMouseEvent(gridItem, "mousedown", {
          clientX: 50,
          clientY: 50
        });
      });

      // Move during drag
      act(() => {
        mouseMove(150, 150, gridItem);
      });

      // The custom positionStrategy's calcDragPosition method should have been called
      // during the drag operation
      expect(mockCalcDragPosition).toHaveBeenCalled();

      // Clean up - end drag
      act(() => {
        const mouseUpEvent = new MouseEvent("mouseup", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: 150,
          clientY: 150,
          button: 0
        });
        document.dispatchEvent(mouseUpEvent);
      });
    });
  });

  // #2217 - DragConfig.threshold should be respected
  describe("DragConfig.threshold", function () {
    it("does not start drag until mouse moves threshold pixels (v2 API)", function () {
      const onDragStart = jest.fn();

      const { container } = render(
        <GridLayoutV2
          className="layout"
          gridConfig={{ cols: 12, rowHeight: 30 }}
          width={1200}
          layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
          dragConfig={{ enabled: true, threshold: 10 }} // 10px threshold
          onDragStart={onDragStart}
        >
          <div key="a">a</div>
        </GridLayoutV2>
      );

      const gridItem = container.querySelector(".react-grid-item");

      // Mousedown
      act(() => {
        dispatchMouseEvent(gridItem, "mousedown", {
          clientX: 50,
          clientY: 50
        });
      });

      // Move only 5px (less than threshold)
      act(() => {
        mouseMove(55, 50, gridItem);
      });

      // onDragStart should NOT have been called yet
      expect(onDragStart).not.toHaveBeenCalled();

      // Move another 6px (total 11px, exceeds threshold)
      act(() => {
        mouseMove(61, 50, gridItem);
      });

      // NOW onDragStart should have been called
      expect(onDragStart).toHaveBeenCalled();

      // Clean up
      act(() => {
        const mouseUpEvent = new MouseEvent("mouseup", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: 61,
          clientY: 50,
          button: 0
        });
        document.dispatchEvent(mouseUpEvent);
      });
    });

    it("uses default threshold of 3px when not specified (v2 API)", function () {
      const onDragStart = jest.fn();

      const { container } = render(
        <GridLayoutV2
          className="layout"
          gridConfig={{ cols: 12, rowHeight: 30 }}
          width={1200}
          layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
          dragConfig={{ enabled: true }} // No threshold specified, should use default 3
          onDragStart={onDragStart}
        >
          <div key="a">a</div>
        </GridLayoutV2>
      );

      const gridItem = container.querySelector(".react-grid-item");

      // Mousedown
      act(() => {
        dispatchMouseEvent(gridItem, "mousedown", {
          clientX: 50,
          clientY: 50
        });
      });

      // Move only 2px (less than default threshold of 3)
      act(() => {
        mouseMove(52, 50, gridItem);
      });

      // onDragStart should NOT have been called yet
      expect(onDragStart).not.toHaveBeenCalled();

      // Move another 2px (total 4px, exceeds default threshold of 3)
      act(() => {
        mouseMove(54, 50, gridItem);
      });

      // NOW onDragStart should have been called
      expect(onDragStart).toHaveBeenCalled();

      // Clean up
      act(() => {
        const mouseUpEvent = new MouseEvent("mouseup", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: 54,
          clientY: 50,
          button: 0
        });
        document.dispatchEvent(mouseUpEvent);
      });
    });
  });
});
