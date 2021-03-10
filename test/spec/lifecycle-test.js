// @flow
/* eslint-env jest */

import * as React from "react";
import _ from "lodash";
import TestUtils from "react-dom/test-utils";
import ResponsiveReactGridLayout from "../../lib/ResponsiveReactGridLayout";
import BasicLayout from "../examples/1-basic";
import ShowcaseLayout from "../examples/0-showcase";
import DroppableLayout from "../examples/15-drag-from-outside";
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

  describe("<ReactGridLayout>", function () {
    it("Basic Render", async function () {
      const wrapper = mount(<BasicLayout />);
      expect(wrapper).toMatchSnapshot();
    });

    describe("Callbacks", function () {
      let fns, wrapper, draggable, draggableNode, gridLayout;

      beforeAll(() => {
        fns = {
          onDragStart: jest.fn(),
          onDrag: jest.fn(),
          onDragStop: jest.fn()
        };
        wrapper = mount(<BasicLayout {...fns} />);
        gridLayout = wrapper.find("ReactGridLayout");
        draggable = wrapper.find(".react-grid-item").at(0);
        draggableNode = draggable.getDOMNode();
      });

      // Reset mocks
      afterEach(() => {
        Object.keys(fns).forEach(key => fns[key].mockReset());
      });

      afterAll(() => {
        wrapper.unmount();
      });

      it("Calls onDragStart/onDrag/onDragStop", async function () {
        // Move
        simulateMovementFromTo(draggableNode, 100, 100, 200, 200);

        // All three will be called
        expect(fns.onDragStart).toHaveBeenCalled();
        expect(fns.onDrag).toHaveBeenCalled();
        expect(fns.onDragStop).toHaveBeenCalled();
      });

      it("Calls onDragStart with correct props", async function () {
        const originalLayout = gridLayout.state().layout;

        // Basic move
        simulateMovementFromTo(draggableNode, 100, 100, 200, 200);

        const onDragStartCall = fns.onDragStart.mock.calls[0];

        // type EventCallback = (
        //   Layout,
        //   oldItem: ?LayoutItem,
        //   newItem: ?LayoutItem,
        //   placeholder: ?LayoutItem,
        //   Event,
        //   ?HTMLElement
        // ) => void;
        expect(onDragStartCall[0]).toBe(originalLayout);
        expect(onDragStartCall[1]).toEqual(originalLayout[0]);
        expect(onDragStartCall[2]).toEqual(originalLayout[0]);
        expect(onDragStartCall[3]).toEqual(null);
        const event = onDragStartCall[4];
        expect(event.target).toBe(draggableNode);
        expect(event.type).toBe("mousedown");
        expect(onDragStartCall[5]).toBe(draggableNode);
      });

      it("Calls onDrag with correct props", async function () {
        const originalLayout = clone(gridLayout.state().layout);
        // Basic move
        simulateMovementFromTo(draggableNode, 100, 100, 200, 200);

        const onDragCall = fns.onDrag.mock.calls[0];

        // layout
        // There should be at least one item with `moved: true``
        expect(onDragCall[0].find(obj => obj.moved)).toBeTruthy();
        expect(onDragCall[0]).toMatchSnapshot();

        // oldItem
        expect(onDragCall[1]).toMatchObject(originalLayout[0]);

        // newItem
        const modifiedItem = { ...originalLayout[0], moved: true };
        delete modifiedItem.y; // it changed due to movement, let's not match on it
        expect(onDragCall[2]).toMatchObject(modifiedItem);

        // placeholder
        const placeholder = onDragCall[3];
        expect(placeholder).toMatchSnapshot();
        expect(placeholder.placeholder).toEqual(true);

        // event
        const event = onDragCall[4];
        expect(event).toBeInstanceOf(MouseEvent);
        expect(event.type).toBe("mousemove");

        // node
        expect(onDragCall[5]).toBe(draggableNode);
      });

      it("Calls onDragStop with correct props", async function () {
        const originalLayout = clone(gridLayout.state().layout);

        // Basic move
        simulateMovementFromTo(draggableNode, 100, 100, 200, 200);

        const onDragStopCall = fns.onDragStop.mock.calls[0];

        // layout
        // There should be at least one item with `moved: true``
        expect(onDragStopCall[0].find(obj => obj.moved)).toBeTruthy();
        expect(onDragStopCall[0]).toMatchSnapshot();

        // oldItem
        expect(onDragStopCall[1]).toMatchObject(originalLayout[0]);

        // newItem
        const modifiedItem = { ...originalLayout[0], moved: true };
        delete modifiedItem.y; // it changed due to movement, let's not match on it
        expect(onDragStopCall[2]).toMatchObject(modifiedItem);

        // placeholder
        expect(onDragStopCall[3]).toBeNull();

        // event
        const event = onDragStopCall[4];
        expect(event.target).toBe(draggableNode);
        expect(event.type).toBe("mouseup");
        expect(onDragStopCall[5]).toBe(draggableNode);
      });

      describe("ignoreClickOnly: true", function () {
        beforeEach(() => {
          wrapper.setProps({ ignoreClickOnly: true });
        });
        it("Does not call onDragStart/onDragStop when no movement occurs", async function () {
          // Mousedown/up, but no mousemove
          TestUtils.Simulate.mouseDown(draggableNode, {
            clientX: 0,
            clientY: 0
          });
          TestUtils.Simulate.mouseUp(draggableNode);
          expect(fns.onDragStart).not.toHaveBeenCalled();
          expect(fns.onDrag).not.toHaveBeenCalled(); // no mousemove
          expect(fns.onDragStop).not.toHaveBeenCalled();
        });

        it("Does not call onDragStart/onDragStop until movement occurs", async function () {
          TestUtils.Simulate.mouseDown(draggableNode, {
            clientX: 0,
            clientY: 0
          });
          // no events yet fired as no move has happened
          expect(fns.onDragStart).not.toHaveBeenCalled();
          expect(fns.onDrag).not.toHaveBeenCalled(); // no mousemove
          expect(fns.onDragStop).not.toHaveBeenCalled();

          // There's the move, we should get onDrag and onDragStart simultaneously`
          mouseMove(draggableNode, 1, 1);
          expect(fns.onDragStart).toHaveBeenCalled();
          expect(fns.onDrag).toHaveBeenCalled();
          expect(fns.onDragStop).not.toHaveBeenCalled();

          // Final stop event
          TestUtils.Simulate.mouseUp(draggableNode);
          expect(fns.onDragStop).toHaveBeenCalled();
        });
      });

      // TODO [>=2.0.0]: Eliminate this option
      describe("ignoreClickOnly: false (legacy)", function () {
        beforeEach(() => {
          wrapper.setProps({ ignoreClickOnly: false });
        });
        it("Still calls onDragStart/onDragStop when no movement occurs", async function () {
          // Mousedown/up, but no mousemove
          TestUtils.Simulate.mouseDown(draggableNode, {
            clientX: 0,
            clientY: 0
          });
          TestUtils.Simulate.mouseUp(draggableNode);
          expect(fns.onDragStart).toHaveBeenCalled();
          expect(fns.onDrag).not.toHaveBeenCalled(); // no mousemove
          expect(fns.onDragStop).not.toHaveBeenCalled(); // since there was no drag. not great
        });

        it("Calls onDragStart/onDragStop when movement occurs", async function () {
          TestUtils.Simulate.mouseDown(draggableNode, {
            clientX: 0,
            clientY: 0
          });
          // dragStart called on mouseDown
          expect(fns.onDragStart).toHaveBeenCalled();
          expect(fns.onDrag).not.toHaveBeenCalled(); // no mousemove
          expect(fns.onDragStop).not.toHaveBeenCalled();

          // There's the move, we should get onDrag and onDragStart simultaneously`
          mouseMove(draggableNode, 1, 1);
          expect(fns.onDrag).toHaveBeenCalled();
          expect(fns.onDragStop).not.toHaveBeenCalled();

          // Final stop event
          TestUtils.Simulate.mouseUp(draggableNode);
          expect(fns.onDragStop).toHaveBeenCalled();
        });
      });

      // TODO
      it("Does not mutate layout between calls", async function () {});
    });

    describe("Droppability", function () {
      it("Updates when an item is dropped in", function () {
        const wrapper = mount(<DroppableLayout containerPadding={[0, 0]} />);
        const gridLayout = wrapper.find("ReactGridLayout");
        expect(gridLayout).toHaveLength(1);

        // Start: no dropping node.
        expect(gridLayout.state("droppingDOMNode")).toEqual(null);

        // Find the droppable element and drag it over the grid layout.
        const droppable = wrapper.find(".droppable-element");
        TestUtils.Simulate.dragOver(gridLayout.getDOMNode(), {
          nativeEvent: {
            target: droppable.getDOMNode(),
            layerX: 200,
            layerY: 150
          }
        });

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
          x: 1,
          y: 4,
          static: false,
          isDraggable: true
        });

        // Let's move it some more.
        TestUtils.Simulate.dragOver(gridLayout.getDOMNode(), {
          nativeEvent: {
            target: droppable.getDOMNode(),
            layerX: 0,
            layerY: 300
          }
        });

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
          y: 9,
          static: false,
          isDraggable: true
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

function simulateMovementFromTo(node, fromX, fromY, toX, toY) {
  TestUtils.Simulate.mouseDown(node, { clientX: fromX, clientY: fromY });
  mouseMove(node, toX, toY);
  TestUtils.Simulate.mouseUp(node);
}

function mouseMove(node, x, y) {
  const doc = node ? node.ownerDocument : document;
  const evt = doc.createEvent("MouseEvents");
  // $FlowIgnore get with it, flow
  evt.initMouseEvent(
    "mousemove",
    true,
    true,
    window,
    0,
    0,
    0,
    x,
    y,
    false,
    false,
    false,
    false,
    0,
    null
  );
  doc.dispatchEvent(evt);
  return evt;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
