// @flow
/* eslint-env jest */

import React from "react";
import _ from "lodash";
import TestUtils from "react-dom/test-utils";
import ReactGridLayout from "../../lib/ReactGridLayout";
import GridItem from "../../lib/GridItem";
import ResponsiveReactGridLayout from "../../lib/ResponsiveReactGridLayout";
import BasicLayout from "../examples/1-basic";
import ShowcaseLayout from "../examples/0-showcase";
import DroppableLayout from "../examples/15-drag-from-outside";
import deepFreeze from "../util/deepFreeze";
import { render, screen } from "@testing-library/react";
import { mount } from "enzyme";
import { renderWithInstance, rerenderWithInstance } from "../util/helpers";

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
    it("Basic Render to html", () => {
      const container = render(<GridItem {...mockProps} />);
      expect(container.asFragment()).toMatchSnapshot();
    });

    describe("optional min/max dimension props log err", () => {
      describe("minW", () => {
        const mockError = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});
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
        const mockError = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});
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
        const mockError = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});
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
        const mockError = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});
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

      it("throws err when calling onDrag without state set to dragging ", () => {
        const { instanceRef } = renderWithInstance(
          <GridItem {...mockProps} onDrag={() => {}} />
        );

        expect(() => {
          // $FlowIgnore
          instanceRef.current.onDrag({}, {});
        }).toThrow("onDrag called before onDragStart.");
      });

      it("calls onDragStart prop callback fn", () => {
        const mockFn = jest.fn();

        const { instanceRef } = renderWithInstance(
          <GridItem
            {...mockProps}
            // $FlowIgnore
            droppingPosition={{ left: 1, top: 1, e: {} }}
            onDragStart={mockFn}
          />
        );
        // $FlowIgnore
        instanceRef.current.onDrag({}, () => {});
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      // FIXME refactor this to be an RTL test, where we actually emulate the drag
      xit("calls onDrag prop callback fn", () => {
        const mockOnDragStartCallback = jest.fn();
        const mockOnDrag = jest.fn();
        const { instanceRef } = renderWithInstance(
          <GridItem
            {...mockProps}
            // $FlowIgnore
            isDraggable={true}
            isBounded={true}
            onDragStart={mockOnDragStartCallback}
            onDrag={mockOnDrag}
          />
        );
        const renderedItem = instanceRef.current;
        TestUtils.act(() => {
          renderedItem.setState({ dragging: true });
          renderedItem.setProps({
            droppingPosition: { left: 700, top: 300, e: {} }
          });
        });
        expect(mockOnDrag).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("<ReactGridLayout>", function () {
    it("Basic Render", async function () {
      const wrapper = render(<BasicLayout />);
      expect(wrapper.asFragment()).toMatchSnapshot();
    });

    describe("data-grid", () => {
      it("Creates layout based on properties", async function () {
        const wrapper = renderWithInstance(
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
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
        expect(wrapper.asFragment()).toMatchSnapshot();
        expect(wrapper.instanceRef.current.state.layout).toMatchObject([
          {
            h: 2,
            i: "a",
            static: true,
            w: 1,
            x: 0,
            y: 0
          },
          {
            h: 2,
            i: "b",
            static: false,
            w: 3,
            x: 1,
            y: 0
          },
          {
            h: 2,
            i: "c",
            static: false,
            w: 1,
            x: 4,
            y: 0
          }
        ]);
      });

      it("Null items in list", async function () {
        const wrapper = renderWithInstance(
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

        expect(wrapper.asFragment()).toMatchSnapshot();
        expect(wrapper.instanceRef.current.state.layout).toHaveLength(2); // Only two truthy items
      });
    });

    describe("WidthProvider", () => {
      function calculateItemWidth(wrapperWidth, cols, margin, itemCols) {
        // Width of each col is total width minus margins, divided by num of cols
        const colSize = Math.round((wrapperWidth - margin * (cols + 1)) / cols);
        // Total size of the element includes (cols - 1) margins between them
        return colSize * itemCols + (itemCols - 1) * margin;
      }

      it("Renders without width on initial WidthProvider mount", async function () {
        const wrapper = renderWithInstance(
          <BasicLayout measureBeforeMount={false} />
        );
        expect(
          wrapper.baseElement.querySelector(".react-grid-layout").style.width
        ).toBeFalsy();
        expect(wrapper.asFragment()).toMatchSnapshot();
        expect(wrapper.instanceRef.current.props.width).toBeFalsy(); // no width passed down before mount
      });

      it("Renders with a width when WidthProvider measureBeforeMount", async function () {
        const PAGE_WIDTH = 500;
        const wrapper = renderWithInstance(
          <BasicLayout measureBeforeMount={true} />
        );
        const instance = wrapper.instanceRef.current;
        expect(wrapper.asFragment()).toMatchSnapshot();

        // Since we're measuring before mount, it should be empty
        expect(
          wrapper.baseElement.querySelector(".react-grid-layout").children
        ).toHaveLength(0);

        // Mock offsetWidth to return 500 and fire a resize
        const node = wrapper.container.firstChild;
        Object.defineProperty(node, "offsetWidth", {
          get: jest.fn(() => PAGE_WIDTH)
        });

        // Trigger resize
        global.dispatchEvent(new Event("resize"));
        wrapper.rerender(<BasicLayout measureBeforeMount={true} />); // force a rerender synchronously

        // Should have removed the div, now has the RGL grid items
        expect(BasicLayout.defaultProps.items).toBeGreaterThan(0);
        expect(
          wrapper.baseElement.querySelector(".react-grid-layout").children
        ).toHaveLength(BasicLayout.defaultProps.items);

        //
        // Check that width was properly set
        //
        const desiredWidth = calculateItemWidth(
          PAGE_WIDTH,
          BasicLayout.defaultProps.cols,
          10,
          2
        );
        expect(
          wrapper.baseElement.querySelector(".react-grid-item").style.width
        ).toEqual(desiredWidth + "px");
      });

      it("WidthProvider responds to window resize events", async function () {
        const wrapper = render(<BasicLayout />);

        // Original width
        const originalItemWidth = calculateItemWidth(
          1280,
          BasicLayout.defaultProps.cols,
          10,
          2
        );
        expect(
          wrapper.baseElement.querySelector(".react-grid-item").style.width
        ).toEqual(originalItemWidth + "px");

        // Mock offsetWidth to return 500
        const node = wrapper.container.firstChild;
        Object.defineProperty(node, "offsetWidth", {
          get: jest.fn(() => 500)
        });

        // Trigger the window resize event.
        global.dispatchEvent(new Event("resize"));
        wrapper.rerender(<BasicLayout />);

        // State should now be 500
        const newItemWidth = calculateItemWidth(
          500,
          BasicLayout.defaultProps.cols,
          10,
          2
        );
        expect(
          wrapper.baseElement.querySelector(".react-grid-item").style.width
        ).toEqual(newItemWidth + "px");
      });
    });

    describe("Droppability", function () {
      function dragDroppableTo(wrapper, x, y) {
        const gridLayout = wrapper.find("ReactGridLayout");
        const droppable = wrapper.find(".droppable-element");

        TestUtils.Simulate.dragOver(gridLayout.getDOMNode(), {
          nativeEvent: {
            target: droppable.getDOMNode(),
            layerX: x,
            layerY: y
          }
        });
      }
      it("Updates when an item is dropped in", function () {
        const wrapper = mount(<DroppableLayout containerPadding={[0, 0]} />);
        const gridLayout = wrapper.find("ReactGridLayout");
        expect(gridLayout).toHaveLength(1);

        // Start: no dropping node.
        expect(gridLayout.state("droppingDOMNode")).toEqual(null);

        // Drag the droppable over the grid layout.
        dragDroppableTo(wrapper, 200, 150);

        // We should have the position in our state.
        expect(gridLayout.state("droppingPosition")).toHaveProperty(
          "left",
          200
        );
        expect(gridLayout.state("droppingPosition")).toHaveProperty("top", 150);
        // We should now have the placeholder element in our state.
        expect(gridLayout.state("droppingDOMNode")).toHaveProperty(
          "type",
          "div"
        );
        expect(gridLayout.state("droppingDOMNode")).toHaveProperty(
          "key",
          "__dropping-elem__"
        );

        // It should also have a layout item assigned to it.
        let layoutItem = gridLayout
          .state("layout")
          .find(item => item.i === "__dropping-elem__");
        expect(layoutItem).toEqual({
          i: "__dropping-elem__",
          h: 1,
          w: 1,
          x: 2,
          y: 4,
          static: false,
          isDraggable: true
        });

        // Let's move it some more.
        dragDroppableTo(wrapper, 0, 300);

        // State should change.
        expect(gridLayout.state("droppingPosition")).toHaveProperty("left", 0);
        expect(gridLayout.state("droppingPosition")).toHaveProperty("top", 300);

        layoutItem = gridLayout
          .state("layout")
          .find(item => item.i === "__dropping-elem__");
        // Using toMatchObject() here as this will inherit some undefined properties from the cloning
        expect(layoutItem).toMatchObject({
          i: "__dropping-elem__",
          h: 1,
          w: 1,
          x: 0,
          y: 10,
          static: false,
          isDraggable: true
        });
      });

      it("Allows customizing the droppable placeholder", function () {
        const wrapper = mount(
          <DroppableLayout onDropDragOver={() => ({ w: 2, h: 2 })} />
        );
        const gridLayout = wrapper.find("ReactGridLayout");

        // Find the droppable element and drag it over the grid layout.
        dragDroppableTo(wrapper, 200, 150);

        // It should also have a layout item assigned to it.
        const layoutItem = gridLayout
          .state("layout")
          .find(item => item.i === "__dropping-elem__");
        expect(layoutItem).toEqual({
          i: "__dropping-elem__",
          h: 2,
          w: 2,
          x: 2,
          y: 4,
          static: false,
          isDraggable: true
        });
      });

      it("Allows short-circuiting the drag", function () {
        const wrapper = mount(<DroppableLayout onDropDragOver={() => false} />);
        const gridLayout = wrapper.find("ReactGridLayout");

        // Find the droppable element and drag it over the grid layout.
        dragDroppableTo(wrapper, 200, 150);

        // It should also have a layout item assigned to it.
        const layoutItem = gridLayout
          .state("layout")
          .find(item => item.i === "__dropping-elem__");
        expect(layoutItem).toBeUndefined();
      });
    });
  });

  describe("<ResponsiveReactGridLayout>", function () {
    it("Basic Render", async function () {
      const wrapper = mount(<ShowcaseLayout />);
      expect(wrapper).toMatchSnapshot();
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
      const wrapper = mount(
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

      // Set that layout as state and ensure it doesn't change.
      wrapper.setState({ layouts: frozenLayouts });
      wrapper.setProps({ width: 800, breakpoint: "md" }); // will generate new layout
      wrapper.render();

      expect(frozenLayouts).not.toContain("md");
    });
  });
});
