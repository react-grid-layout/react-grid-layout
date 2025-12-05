// @flow
/* eslint-env jest */

import React from "react";
import _ from "lodash";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ReactGridLayout from "../../lib/ReactGridLayout";
import GridItem from "../../lib/GridItem";
import ResponsiveReactGridLayout from "../../lib/ResponsiveReactGridLayout";
import BasicLayout from "../examples/01-basic";
import ShowcaseLayout from "../examples/00-showcase";
import DroppableLayout from "../examples/15-drag-from-outside";
import ResizableLayout from "../examples/20-resizable-handles";
import deepFreeze from "../util/deepFreeze";

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

    describe("optional min/max dimension props log err", () => {
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
            // $FlowIgnore
            droppingPosition={{ left: 1, top: 1, e: {} }}
            onDragStart={mockFn}
          />
        );
        expect(mockFn).toHaveBeenCalledTimes(1);
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
      it("Renders with WidthProvider", async function () {
        const { container } = render(
          <BasicLayout measureBeforeMount={false} />
        );

        // Verify the grid layout is rendered
        expect(
          container.querySelector(".react-grid-layout")
        ).toBeInTheDocument();
      });
    });

    describe("Droppability", function () {
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

      expect(frozenLayouts).not.toContain("md");
    });
  });
});
