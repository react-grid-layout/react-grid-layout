/**
 * Tests for touch/drag prop forwarding:
 * - #1793: allowMobileScroll must reach DraggableCore so child onClick fires
 *   on touch devices (react-draggable preventDefaults touchstart otherwise).
 */

import React from "react";
import { render } from "@testing-library/react";

// Capture the props passed to DraggableCore.
const captured: Record<string, unknown>[] = [];
jest.mock("react-draggable", () => {
  return {
    DraggableCore: (props: Record<string, unknown>) => {
      captured.push(props);
      return <div data-testid="draggable-core" />;
    }
  };
});

import { GridItem, type GridItemProps } from "../../src/react/index";

describe("#1793 allowMobileScroll forwarding", () => {
  beforeEach(() => {
    captured.length = 0;
  });

  function renderItem(props: Partial<GridItemProps> = {}) {
    const base: GridItemProps = {
      children: <div>child</div>,
      cols: 12,
      containerWidth: 1200,
      rowHeight: 30,
      margin: [10, 10] as const,
      maxRows: 10,
      containerPadding: [10, 10] as const,
      i: "0",
      x: 0,
      y: 0,
      w: 2,
      h: 2,
      isDraggable: true,
      isResizable: false,
      isBounded: false,
      useCSSTransforms: false,
      ...props
    };
    render(<GridItem {...base} />);
    return captured[captured.length - 1];
  }

  it("does not pass allowMobileScroll when not provided (default off)", () => {
    const coreProps = renderItem();
    expect(coreProps.allowMobileScroll).toBeUndefined();
  });

  it("forwards allowMobileScroll to DraggableCore when set", () => {
    const coreProps = renderItem({ allowMobileScroll: true });
    expect(coreProps.allowMobileScroll).toBe(true);
  });
});
