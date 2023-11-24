// @flow
/* eslint-env jest */

import React from "react";
import _ from "lodash";
import TestUtils from "react-dom/test-utils";
import ReactGridLayout from "../../lib/ReactGridLayout";
import { calcGridItemPosition } from "../../lib/calculateUtils";
import GridItem from "../../lib/GridItem";
import ResponsiveReactGridLayout from "../../lib/ResponsiveReactGridLayout";
import BasicLayout from "../examples/1-basic";
import ShowcaseLayout from "../examples/0-showcase";
import DroppableLayout from "../examples/15-drag-from-outside";
import ResizableLayout from "../examples/20-resizable-handles";
import deepFreeze from "../util/deepFreeze";
import { mount } from "enzyme";

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
      const wrapper = mount(<GridItem {...mockProps} />);
      expect(wrapper).toMatchSnapshot();
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
          mount(<GridItem {...mockProps} minW={"apple"} />);
          expect(mockError).toHaveBeenCalledTimes(2);
        });
        it("1 err when larger than w prop", () => {
          mount(<GridItem {...mockProps} minW={400} />);
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
          mount(<GridItem {...mockProps} maxW={"apple"} />);
          expect(mockError).toHaveBeenCalledTimes(1);
        });
        it("1x err when smaller than w prop", () => {
          mount(<GridItem {...mockProps} w={4} maxW={2} />);
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
          mount(<GridItem {...mockProps} minH={"apple"} />);
          expect(mockError).toHaveBeenCalledTimes(2);
        });
        it("1x when larger than h prop", () => {
          mount(<GridItem {...mockProps} minH={200} />);
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
          mount(<GridItem {...mockProps} maxH={"apple"} />);
          expect(mockError).toHaveBeenCalledTimes(1);
        });
        it("1x when smaller than h prop", () => {
          mount(<GridItem {...mockProps} h={3} maxH={2} />);
          expect(mockError).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe("onDrag", () => {
      it("calls onDragStart prop when droppingPosition prop has expected content", () => {
        const mockFn = jest.fn();

        mount(
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
        const componentInstance = mount(
          <GridItem {...mockProps} onDrag={() => {}} />
        ).instance();

        expect(() => {
          // $FlowIgnore
          componentInstance.onDrag({}, {});
        }).toThrow("onDrag called before onDragStart.");
      });

      it("calls onDragStart prop callback fn", () => {
        const mockFn = jest.fn();

        const componentInstance = mount(
          <GridItem
            {...mockProps}
            // $FlowIgnore
            droppingPosition={{ left: 1, top: 1, e: {} }}
            onDragStart={mockFn}
          />
        ).instance();
        // $FlowIgnore
        componentInstance.onDrag({}, () => {});
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it("calls onDrag prop callback fn", () => {
        const mockOnDragStartCallback = jest.fn();
        const mockOnDrag = jest.fn();
        const renderedItem = mount(
          <GridItem
            {...mockProps}
            // $FlowIgnore
            isDraggable={true}
            isBounded={true}
            onDragStart={mockOnDragStartCallback}
            onDrag={mockOnDrag}
          />
        );
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
      const wrapper = mount(<BasicLayout />);
      expect(wrapper).toMatchSnapshot();
    });

    describe("data-grid", () => {
      it("Creates layout based on properties", async function () {
        const wrapper = mount(
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
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.state().layout).toMatchObject([
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
        const wrapper = mount(
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

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.state().layout).toHaveLength(2); // Only two truthy items
      });
    });

    describe("WidthProvider", () => {
      it("Renders with WidthProvider", async function () {
        const wrapper = mount(<BasicLayout measureBeforeMount={false} />);
        expect(wrapper).toMatchSnapshot();

        const widthProviderWrapper = wrapper.childAt(0);
        expect(widthProviderWrapper.name()).toEqual("WidthProvider");
        expect(widthProviderWrapper.childAt(0).name()).toEqual(
          "ReactGridLayout"
        );

        expect(widthProviderWrapper.state().width).toEqual(1280); // default
      });

      // FIXME: This doesn't work since we rewrote to use <ResizeObserver>
      // See https://github.com/react-grid-layout/react-grid-layout/pull/1839
      // eslint-disable-next-line no-undef
      xit("Renders with WidthProvider measureBeforeMount", async function () {
        const wrapper = mount(<BasicLayout measureBeforeMount={true} />);
        expect(wrapper).toMatchSnapshot();

        const widthProviderWrapper = wrapper.childAt(0);
        expect(widthProviderWrapper.name()).toEqual("WidthProvider");
        // Renders a div first
        expect(widthProviderWrapper.childAt(0).name()).toEqual("div");

        // Mock offsetWidth to return 500 and fire a resize
        const node = wrapper.getDOMNode();
        Object.defineProperty(node, "offsetWidth", {
          get: jest.fn(() => 500)
        });
        global.dispatchEvent(new Event("resize"));

        wrapper.setProps({}); // force a rerender synchronously

        // Should have removed the div, now has the RGL
        expect(wrapper.childAt(0).childAt(0).name()).toEqual("ReactGridLayout");
        expect(wrapper.childAt(0).state().width).toEqual(500);
      });

      // FIXME: This doesn't work since we rewrote to use <ResizeObserver>
      // See https://github.com/react-grid-layout/react-grid-layout/pull/1839
      // eslint-disable-next-line no-undef
      xit("WidthProvider responds to window resize events", async function () {
        const wrapper = mount(<BasicLayout />);
        const widthProviderWrapper = wrapper.childAt(0);

        // Original width
        expect(widthProviderWrapper.state().width).toEqual(1280);

        // Mock offsetWidth to return 500
        const node = wrapper.getDOMNode();
        Object.defineProperty(node, "offsetWidth", {
          get: jest.fn(() => 500)
        });

        // Trigger the window resize event.
        global.dispatchEvent(new Event("resize"));

        // State should now be 500
        expect(widthProviderWrapper.state().width).toEqual(500);
      });
    });

    describe("Droppability", function () {
      function dragDroppableTo(wrapper, x, y) {
        const gridLayout = wrapper.find("ReactGridLayout");
        const droppable = wrapper.find(".droppable-element");

        TestUtils.Simulate.dragOver(gridLayout.getDOMNode(), {
          currentTarget: {
            getBoundingClientRect: () => ({ left: 0, top: 0 })
          },
          clientX: x,
          clientY: y,
          nativeEvent: {
            target: droppable.getDOMNode()
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

    describe("Resizing", () => {
      const rowHeight = 30;
      const colWidth = 101;
      const gridPadding = 10;
      let gridLayout;

      /**
       * Simulate a movement; can't use TestUtils here because it uses react's event system only,
       * but <DraggableCore> attaches event listeners directly to the document.
       * Would love to new MouseEvent() here but it doesn't work with PhantomJS / old browsers.
       * var e = new MouseEvent('mousemove', {clientX: 100, clientY: 100});
       *
       * Taken from: https://github.com/react-grid-layout/react-draggable/blob/master/specs/draggable.spec.jsx#L1000C1-L1003C70
       */
      const mouseMove = (node, x, y) => {
        const doc = node ? node.ownerDocument : document;
        const mouseEvent = new MouseEvent("mousemove", {
          button: 0,
          clientX: x,
          clientY: y,
          screenX: 0,
          screenY: 0
        });
        doc.dispatchEvent(mouseEvent);
      };

      const getCurrentPosition = wrapper => {
        const { x, y, w, h } = wrapper.props();
        const positionParams = wrapper.instance()?.getPositionParams();

        if (!positionParams) {
          return {};
        }

        return calcGridItemPosition(
          positionParams,
          x,
          y,
          w,
          h,
          wrapper.state()
        );
      };

      const resizeTo = (wrapper, preventMouseUp, currentPosition, x, y) => {
        const node = wrapper.getDOMNode();
        TestUtils.Simulate.mouseDown(node, {
          clientX: currentPosition.left,
          clientY: currentPosition.top
        });
        mouseMove(node, x, y);

        // In some test cases we want to take measurements before mouseUp occurs
        if (!preventMouseUp) {
          TestUtils.Simulate.mouseUp(node);
        }
      };

      const findGridItemByText = (wrapper, id) =>
        wrapper.findWhere(node => {
          const isGridItem = node.instance() instanceof GridItem;
          const hasSpecifiedText = node.text() === `${id}`;

          return isGridItem && hasSpecifiedText;
        });

      const findHandleForGridItem = (wrapper, handle) =>
        wrapper.find(`.react-resizable-handle-${handle}`);

      const getGridItemData = (wrapper, id) =>
        wrapper.state("layout").find(item => item.i == id);

      beforeEach(() => {
        const wrapper = mount(<ResizableLayout />);
        gridLayout = wrapper.find("ReactGridLayout");
      });

      it("sets up resizable handles", () => {
        const gridItem0 = findGridItemByText(gridLayout, 0);
        // Ensure every handle is present on the target element
        ["n", "ne", "e", "se", "s", "sw", "w", "nw"].forEach(handle => {
          expect(findHandleForGridItem(gridItem0, handle).exists()).toEqual(
            true
          );
        });
      });

      it("resizes from n handle", () => {
        const itemId = 6;
        const gridItem6 = findGridItemByText(gridLayout, itemId);
        const handleElement = findHandleForGridItem(gridItem6, "n");
        const pos = getCurrentPosition(gridItem6);

        const positionBeforeResize = getGridItemData(gridLayout, itemId);
        // Resize up two rows
        resizeTo(handleElement, false, pos, pos.left, pos.top - rowHeight * 2);
        const positionAfterResize = getGridItemData(gridLayout, itemId);
        expect(positionAfterResize).toEqual({
          ...positionBeforeResize,
          h: positionBeforeResize.h + 2,
          y: positionBeforeResize.y - 2
        });
      });

      it("resizes from ne handle", () => {
        const itemId = 6;
        const gridItem6 = findGridItemByText(gridLayout, itemId);
        const handleElement = findHandleForGridItem(gridItem6, "ne");
        const pos = getCurrentPosition(gridItem6);

        const positionBeforeResize = getGridItemData(gridLayout, itemId);
        // Resize up two rows and right two columns
        resizeTo(
          handleElement,
          false,
          pos,
          pos.left + colWidth * 2,
          pos.top - rowHeight * 2
        );
        const positionAfterResize = getGridItemData(gridLayout, itemId);
        expect(positionAfterResize).toEqual({
          ...positionBeforeResize,
          w: positionBeforeResize.w + 2,
          h: positionBeforeResize.h + 2,
          y: positionBeforeResize.y - 2
        });
      });

      it("resizes from e handle", () => {
        const itemId = 6;
        const gridItem6 = findGridItemByText(gridLayout, itemId);
        const handleElement = findHandleForGridItem(gridItem6, "e");
        const pos = getCurrentPosition(gridItem6);

        const positionBeforeResize = getGridItemData(gridLayout, itemId);
        // Resize right two columns
        resizeTo(handleElement, false, pos, pos.left + colWidth * 2, pos.top);
        const positionAfterResize = getGridItemData(gridLayout, itemId);
        expect(positionAfterResize).toEqual({
          ...positionBeforeResize,
          w: positionBeforeResize.w + 2
        });
      });

      it("resizes from se handle", () => {
        const itemId = 6;
        const gridItem6 = findGridItemByText(gridLayout, itemId);
        const handleElement = findHandleForGridItem(gridItem6, "se");
        const pos = getCurrentPosition(gridItem6);

        const positionBeforeResize = getGridItemData(gridLayout, itemId);
        // Resize down two rows and right two columns
        resizeTo(
          handleElement,
          false,
          pos,
          pos.left + colWidth * 2,
          pos.top + rowHeight * 2
        );
        const positionAfterResize = getGridItemData(gridLayout, itemId);
        expect(positionAfterResize).toEqual({
          ...positionBeforeResize,
          w: positionBeforeResize.w + 2,
          h: positionBeforeResize.h + 2
        });
      });

      it("resizes from s handle", () => {
        const itemId = 6;
        const gridItem6 = findGridItemByText(gridLayout, itemId);
        const handleElement = findHandleForGridItem(gridItem6, "s");
        const pos = getCurrentPosition(gridItem6);

        const positionBeforeResize = getGridItemData(gridLayout, itemId);
        // Resize right two columns
        resizeTo(handleElement, false, pos, pos.left, pos.top + rowHeight * 2);
        const positionAfterResize = getGridItemData(gridLayout, itemId);
        expect(positionAfterResize).toEqual({
          ...positionBeforeResize,
          h: positionBeforeResize.h + 2
        });
      });

      it("resizes from sw handle", () => {
        const itemId = 1;
        const gridItem1 = findGridItemByText(gridLayout, itemId);
        const handleElement = findHandleForGridItem(gridItem1, "sw");
        const pos = getCurrentPosition(gridItem1);

        const positionBeforeResize = getGridItemData(gridLayout, itemId);
        // Resize down two rows and left two columns
        resizeTo(
          handleElement,
          false,
          pos,
          pos.left - colWidth * 2,
          pos.top + rowHeight * 2
        );
        const positionAfterResize = getGridItemData(gridLayout, itemId);
        expect(positionAfterResize).toEqual({
          ...positionBeforeResize,
          x: positionBeforeResize.x - 2,
          w: positionBeforeResize.w + 2,
          h: positionBeforeResize.h + 2
        });
      });

      it("resizes from w handle", () => {
        const itemId = 1;
        const gridItem1 = findGridItemByText(gridLayout, itemId);
        const handleElement = findHandleForGridItem(gridItem1, "w");
        const pos = getCurrentPosition(gridItem1);

        const positionBeforeResize = getGridItemData(gridLayout, itemId);
        // Resize left two columns
        resizeTo(handleElement, false, pos, pos.left - colWidth * 2, pos.top);
        const positionAfterResize = getGridItemData(gridLayout, itemId);
        expect(positionAfterResize).toEqual({
          ...positionBeforeResize,
          x: positionBeforeResize.x - 2,
          w: positionBeforeResize.w + 2
        });
      });

      it("resizes from nw handle", () => {
        const itemId = 7;
        const gridItem7 = findGridItemByText(gridLayout, itemId);
        const handleElement = findHandleForGridItem(gridItem7, "nw");
        const pos = getCurrentPosition(gridItem7);

        const positionBeforeResize = getGridItemData(gridLayout, itemId);
        // Resize up two rows and left two columns
        resizeTo(
          handleElement,
          false,
          pos,
          pos.left - colWidth * 2,
          pos.top - rowHeight * 2
        );
        const positionAfterResize = getGridItemData(gridLayout, itemId);
        expect(positionAfterResize).toEqual({
          ...positionBeforeResize,
          x: positionBeforeResize.x - 2,
          w: positionBeforeResize.w + 2,
          h: positionBeforeResize.h + 2,
          y: positionBeforeResize.y - 2
        });
      });

      describe("Out of bounds prevention", () => {
        it("prevents OOB from n handle", () => {
          const itemId = 0;
          const gridItem0 = findGridItemByText(gridLayout, itemId);
          const handleElement = findHandleForGridItem(gridItem0, "n");
          const pos = getCurrentPosition(gridItem0);

          // Attempt to resize up two rows outside of the container
          resizeTo(handleElement, true, pos, pos.left, pos.top - rowHeight * 2);
          const posAfter = getCurrentPosition(gridItem0);
          // We should prevent resizing outside container bounds
          expect(posAfter).toEqual({
            ...pos,
            top: 0
          });
        });

        it("prevents OOB from ne handle", () => {
          const itemId = 5;
          const gridItem5 = findGridItemByText(gridLayout, itemId);
          const handleElement = findHandleForGridItem(gridItem5, "ne");
          const pos = getCurrentPosition(gridItem5);

          // Attempt to resize up two rows and right two rows outside of the container
          resizeTo(
            handleElement,
            true,
            pos,
            pos.left + colWidth * 2,
            pos.top - rowHeight * 2
          );
          const posAfter = getCurrentPosition(gridItem5);
          // We should prevent resizing outside container bounds
          expect(posAfter).toEqual({
            ...pos,
            top: 0,
            left: gridLayout.props().width - gridPadding - pos.width
          });
        });

        it("prevents OOB from e handle", () => {
          const itemId = 5;
          const gridItem5 = findGridItemByText(gridLayout, itemId);
          const handleElement = findHandleForGridItem(gridItem5, "e");
          const pos = getCurrentPosition(gridItem5);

          // Attempt to resize right two rows outside of the container
          resizeTo(handleElement, true, pos, pos.left + colWidth * 2, pos.top);
          const posAfter = getCurrentPosition(gridItem5);
          // We should prevent resizing outside container bounds
          expect(posAfter).toEqual({
            ...pos,
            left: gridLayout.props().width - gridPadding - pos.width
          });
        });

        it("prevents OOB from se handle", () => {
          const itemId = 5;
          const gridItem5 = findGridItemByText(gridLayout, itemId);
          const handleElement = findHandleForGridItem(gridItem5, "se");
          const pos = getCurrentPosition(gridItem5);

          // Attempt to resize down two rows and right two rows outside of the container
          resizeTo(
            handleElement,
            true,
            pos,
            pos.left + colWidth * 2,
            pos.top + rowHeight * 2
          );
          const posAfter = getCurrentPosition(gridItem5);
          // We should prevent resizing outside container bounds
          expect(posAfter).toEqual({
            ...pos,
            // There is always room to grow south, so height should adjust as normal
            height: pos.height + rowHeight * 2,
            left: gridLayout.props().width - gridPadding - pos.width
          });
        });

        it("prevents OOB from sw handle", () => {
          const itemId = 0;
          const gridItem0 = findGridItemByText(gridLayout, itemId);
          const handleElement = findHandleForGridItem(gridItem0, "sw");
          const pos = getCurrentPosition(gridItem0);

          // Attempt to resize down two rows and left two rows outside of the container
          resizeTo(
            handleElement,
            true,
            pos,
            pos.left - colWidth * 2,
            pos.top + rowHeight * 2
          );
          const posAfter = getCurrentPosition(gridItem0);
          // We should prevent resizing outside container bounds
          expect(posAfter).toEqual({
            ...pos,
            // There is always room to grow south, so height should adjust as normal
            height: pos.height + rowHeight * 2,
            left: 0
          });
        });

        it("prevents OOB from w handle", () => {
          const itemId = 0;
          const gridItem0 = findGridItemByText(gridLayout, itemId);
          const handleElement = findHandleForGridItem(gridItem0, "w");
          const pos = getCurrentPosition(gridItem0);

          // Attempt to resize left two rows outside of the container
          resizeTo(handleElement, true, pos, pos.left - colWidth * 2, pos.top);
          const posAfter = getCurrentPosition(gridItem0);
          // We should prevent resizing outside container bounds
          expect(posAfter).toEqual({
            ...pos,
            left: 0
          });
        });

        it("prevents OOB from nw handle", () => {
          const itemId = 0;
          const gridItem0 = findGridItemByText(gridLayout, itemId);
          const handleElement = findHandleForGridItem(gridItem0, "nw");
          const pos = getCurrentPosition(gridItem0);

          // Attempt to resize up two rows and left two rows outside of the container
          resizeTo(
            handleElement,
            true,
            pos,
            pos.left - colWidth * 2,
            pos.top - rowHeight * 2
          );
          const posAfter = getCurrentPosition(gridItem0);
          // We should prevent resizing outside container bounds
          expect(posAfter).toEqual({
            ...pos,
            top: 0,
            left: 0
          });
        });
      });

      describe("Resizing first row when containerPadding is disabled (#1929)", () => {
        const rowHeight = 150;

        it("resizes from s handle when containerPadding=[0, 0]", () => {
          const wrapper = mount(
            <ResizableLayout rowHeight={rowHeight} containerPadding={[0, 0]} />
          );
          const gridLayout = wrapper.find("ReactGridLayout");
          const itemId = 0;
          const gridItem0 = findGridItemByText(gridLayout, itemId);
          const handleElement = findHandleForGridItem(gridItem0, "s");
          const pos = getCurrentPosition(gridItem0);
          const positionBeforeResize = getGridItemData(gridLayout, itemId);

          // Resize down two columns
          resizeTo(
            handleElement,
            false,
            pos,
            pos.left,
            pos.top + rowHeight * 2
          );
          const positionAfterResize = getGridItemData(gridLayout, itemId);
          expect(positionAfterResize).toEqual({
            ...positionBeforeResize,
            h: positionBeforeResize.h + 2
          });
        });
      });

      describe("preventCollision=true and no compaction (#1933)", () => {
        const resizeHandles = ["n", "e", "s", "w"];
        // eslint-disable-next-line react/prop-types
        const PreventCollisionContainer = ({ layoutA, layoutB }) => (
          <ReactGridLayout
            className="layout"
            cols={12}
            rowHeight={30}
            width={1200}
            preventCollision={true}
            compactType={null}
            resizeHandles={resizeHandles}
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
          const wrapper = mount(
            <PreventCollisionContainer
              layoutA={{ x: 0, y: 0, w: 1, h: 2, i: "0" }}
              layoutB={{ x: 1, y: 0, w: 7, h: 2, i: "1" }}
            />
          );
          const gridLayout = wrapper.find("ReactGridLayout");
          const itemId = 0;
          const gridItem0 = findGridItemByText(gridLayout, itemId);
          const handleElement = findHandleForGridItem(gridItem0, "e");
          const pos = getCurrentPosition(gridItem0);
          const positionBeforeResize = getGridItemData(gridLayout, itemId);

          // Resize right two columns
          resizeTo(handleElement, true, pos, pos.left + colWidth * 2, pos.top);
          const positionAfterResize = getGridItemData(gridLayout, itemId);
          // Position shouldn't change because the system should preventCollisions
          expect(positionAfterResize).toEqual(positionBeforeResize);
        });

        it("Allows elements to resize only within available free space", () => {
          const wrapper = mount(
            <PreventCollisionContainer
              layoutA={{ x: 0, y: 0, w: 1, h: 2, i: "0" }}
              layoutB={{ x: 2, y: 0, w: 7, h: 2, i: "1" }}
            />
          );
          const gridLayout = wrapper.find("ReactGridLayout");
          const itemId = 0;
          const gridItem0 = findGridItemByText(gridLayout, itemId);
          const handleElement = findHandleForGridItem(gridItem0, "e");
          const pos = getCurrentPosition(gridItem0);
          const positionBeforeResize = getGridItemData(gridLayout, itemId);

          // Resize right two columns
          resizeTo(handleElement, true, pos, pos.left + colWidth, pos.top);
          resizeTo(handleElement, false, pos, pos.left + colWidth * 2, pos.top);
          const positionAfterResize = getGridItemData(gridLayout, itemId);
          /**
           * Width should only increase by 1 column, not 2, because there is a
           * collision that occurs at x=2 when attempting to resize over it.
           **/
          expect(positionAfterResize).toEqual({
            ...positionBeforeResize,
            w: 2
          });
        });

        it("Allows elements to resize within free space", () => {
          const wrapper = mount(
            <PreventCollisionContainer
              layoutA={{ x: 0, y: 0, w: 1, h: 2, i: "0" }}
              layoutB={{ x: 10, y: 0, w: 2, h: 2, i: "1" }}
            />
          );
          const gridLayout = wrapper.find("ReactGridLayout");
          const itemId = 0;
          const gridItem0 = findGridItemByText(gridLayout, itemId);
          const handleElement = findHandleForGridItem(gridItem0, "e");
          const pos = getCurrentPosition(gridItem0);
          const positionBeforeResize = getGridItemData(gridLayout, itemId);

          // Resize right nine columns
          resizeTo(handleElement, true, pos, pos.left + colWidth * 9, pos.top);
          const positionAfterResize = getGridItemData(gridLayout, itemId);
          expect(positionAfterResize).toEqual({
            ...positionBeforeResize,
            w: 10
          });
        });
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
