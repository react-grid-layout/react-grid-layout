// @flow
/* eslint-env jest */

import React from "react";
import _ from "lodash";
import TestUtils from "react-dom/test-utils";
import ResponsiveReactGridLayout from "../../lib/ResponsiveReactGridLayout";
import ReactGridLayout from "../../lib/ReactGridLayout";
import BasicLayout from "../examples/1-basic";
import ShowcaseLayout from "../examples/0-showcase";
import DroppableLayout from "../examples/15-drag-from-outside";
import deepFreeze from "../util/deepFreeze";
import { shallow, mount } from "enzyme";

describe("Lifecycle tests", function() {
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

  describe("<ReactGridLayout>", function() {
    it("Basic Render", async function() {
      const wrapper = mount(<BasicLayout />);
      expect(wrapper).toMatchSnapshot();
    });

    describe("Droppability", function() {
      it("Updates when an item is dropped in", function() {
        const wrapper = mount(<DroppableLayout />);
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

  describe("<ResponsiveReactGridLayout>", function() {
    it("Basic Render", async function() {
      const wrapper = mount(<ShowcaseLayout />);
      expect(wrapper).toMatchSnapshot();
    });

    it("Does not modify layout on movement", async function() {
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
  TestUtils.Simulate.mouseDown(node, { clientX: fromX, clientY: fromX });
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
