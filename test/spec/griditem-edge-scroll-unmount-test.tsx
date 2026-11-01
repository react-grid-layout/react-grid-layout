/**
 * #2318: the edge auto-scroll controller started by a dropping item's fake
 * drag must be stopped when the item unmounts (the dropping placeholder is
 * removed without a drag stop), otherwise its rAF loop runs forever.
 */

import React from "react";
import { render } from "@testing-library/react";

const mockStop = jest.fn();
const mockFeed = jest.fn();
jest.mock("../../src/react/components/edgeScroll.js", () => ({
  createEdgeScrollController: jest.fn(() => ({
    feed: mockFeed,
    stop: mockStop
  }))
}));

import { createEdgeScrollController } from "../../src/react/components/edgeScroll.js";
import { GridItem, type GridItemProps } from "../../src/react/index";

describe("#2318 dropping item edge-scroll cleanup", () => {
  let offsetParentDesc: PropertyDescriptor | undefined;

  beforeEach(() => {
    mockStop.mockClear();
    mockFeed.mockClear();
    (createEdgeScrollController as jest.Mock).mockClear();
    // jsdom reports offsetParent as null, which makes onDragStart bail out.
    offsetParentDesc = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "offsetParent"
    );
    Object.defineProperty(HTMLElement.prototype, "offsetParent", {
      configurable: true,
      get() {
        return document.body;
      }
    });
  });

  afterEach(() => {
    if (offsetParentDesc) {
      Object.defineProperty(
        HTMLElement.prototype,
        "offsetParent",
        offsetParentDesc
      );
    } else {
      delete (HTMLElement.prototype as any).offsetParent;
    }
  });

  it("stops the edge-scroll controller when the dropping item unmounts", () => {
    const props: GridItemProps = {
      children: <div>child</div>,
      cols: 12,
      containerWidth: 1200,
      rowHeight: 30,
      margin: [10, 10] as const,
      maxRows: 10,
      containerPadding: [10, 10] as const,
      i: "__dropping-elem__",
      x: 0,
      y: 0,
      w: 2,
      h: 2,
      isDraggable: true,
      isResizable: false,
      isBounded: false,
      useCSSTransforms: false,
      droppingPosition: {
        left: 10,
        top: 10,
        e: { clientX: 10, clientY: 10 } as unknown as DragEvent
      } as GridItemProps["droppingPosition"],
      onDragStart: jest.fn(),
      onDrag: jest.fn()
    };
    const { unmount } = render(<GridItem {...props} />);
    // The dropping item's fake drag started a controller...
    expect(createEdgeScrollController).toHaveBeenCalledTimes(1);
    expect(mockStop).not.toHaveBeenCalled();
    unmount();
    expect(mockStop).toHaveBeenCalledTimes(1);
  });
});
