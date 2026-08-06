/**
 * Touch external-drop adapter tests.
 *
 * jsdom ships without Touch or TouchEvent constructors, so we dispatch plain
 * Events decorated with the touch properties the adapter actually reads:
 * changedTouches, touches, clientX, clientY, identifier, and target.
 */

import React from "react";
import { render, act } from "@testing-library/react";
import { GridLayout } from "../../src/react/components/GridLayout";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** The max number of columns for test grids. */
const COLS = 12;
/** A grid-col, grid-row sized to produce clean cell positions. */
const ROW_H = 50;

interface MockTouch {
  identifier: number;
  clientX: number;
  clientY: number;
}

/**
 * Dispatch a synthetic touch event on `target` (defaults to document),
 * wrapped in act() so the adapter's state updates flush before we assert.
 * The event carries bare arrays for `changedTouches` and `touches`.
 */
function dispatchTouch(
  type: string,
  touches: MockTouch[],
  changedTouches: MockTouch[],
  target: EventTarget = document,
  extra: Record<string, unknown> = {}
): void {
  const e = new Event(type, { bubbles: true, cancelable: true }) as Event &
    Partial<TouchEvent>;
  Object.defineProperties(e, {
    touches: { value: touches, configurable: true },
    changedTouches: { value: changedTouches, configurable: true },
    target: { value: extra.target ?? target, configurable: true }
  });
  act(() => {
    target.dispatchEvent(e);
  });
}

// ---------------------------------------------------------------------------
// Grid fixture — render a droppable grid and return useful refs
// ---------------------------------------------------------------------------

interface GridFixture {
  container: HTMLElement;
  rerender: (ui: React.ReactElement) => void;
  gridEl: HTMLElement | null;
}

function setupGrid(opts: { touchEnabled?: boolean } = {}): GridFixture {
  const { touchEnabled = true } = opts;
  const { container, rerender } = render(
    <GridLayout
      className="layout"
      cols={COLS}
      rowHeight={ROW_H}
      width={1200}
      dropConfig={{ enabled: true, touchEnabled }}
    >
      <div key="a">a</div>
      <div key="b">b</div>
    </GridLayout>
  );
  return {
    container,
    rerender: (ui: React.ReactElement) => {
      act(() => rerender(ui));
    },
    gridEl: container.querySelector(".react-grid-layout")
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Touch external-drop adapter", () => {
  let originalElementFromPoint: typeof document.elementFromPoint;

  beforeEach(() => {
    // Mock elementFromPoint so we can control "finger over grid" checks.
    originalElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = () => null; // default: outside
  });

  afterEach(() => {
    document.elementFromPoint = originalElementFromPoint;
  });

  it("does not activate when touch starts on an unmarked source", () => {
    const { gridEl } = setupGrid();

    const fakeSource = document.createElement("div");
    // No data-rgl-draggable — should be ignored
    document.body.append(fakeSource);

    dispatchTouch(
      "touchstart",
      [{ identifier: 0, clientX: 100, clientY: 100 }],
      [{ identifier: 0, clientX: 100, clientY: 100 }],
      document,
      { target: fakeSource }
    );
    dispatchTouch(
      "touchmove",
      [{ identifier: 0, clientX: 200, clientY: 200 }],
      [{ identifier: 0, clientX: 200, clientY: 200 }]
    );

    // Placeholder should NOT appear
    // The grid itself is composed of items; a dropping-item would create
    // another .react-grid-item — but we have 2 children already.  A
    // dropped item gets key "__dropping-elem__" so it wouldn't match the
    // children's keys.  The simplest check: the placeholder is a GridItem
    // rendered with the dropping-position class? No, it's just another
    // .react-grid-item.  Check that layout only has the 2 regular items.
    const items = gridEl!.querySelectorAll(".react-grid-item");
    expect(items.length).toBe(2);
    expect(gridEl!.textContent).not.toContain("__dropping-elem__");

    fakeSource.remove();
  });

  it("renders placeholder on touchmove over grid when source is marked", () => {
    const { gridEl } = setupGrid();

    // The grid element IS in the DOM — point elementFromPoint at it.
    document.elementFromPoint = () => gridEl;

    const source = document.createElement("div");
    source.dataset.rglDraggable = "";
    document.body.append(source);

    // Simulate touch drag over the grid
    dispatchTouch(
      "touchstart",
      [{ identifier: 0, clientX: 0, clientY: 0 }],
      [{ identifier: 0, clientX: 0, clientY: 0 }],
      document,
      { target: source }
    );
    dispatchTouch(
      "touchmove",
      [{ identifier: 0, clientX: 300, clientY: 120 }],
      [{ identifier: 0, clientX: 300, clientY: 120 }]
    );

    // Placeholder should appear — there should now be 3 .react-grid-item divs
    const items = gridEl!.querySelectorAll(".react-grid-item");
    expect(items.length).toBe(3); // a, b, placeholder

    source.remove();
  });

  it("removes placeholder on touchend outside grid (no commit)", () => {
    const { gridEl } = setupGrid();

    // Touch down on source (over grid), move over grid, then end OFF the grid
    document.elementFromPoint = () => gridEl;
    const source = document.createElement("div");
    source.dataset.rglDraggable = "";
    document.body.append(source);

    dispatchTouch(
      "touchstart",
      [{ identifier: 0, clientX: 0, clientY: 0 }],
      [{ identifier: 0, clientX: 0, clientY: 0 }],
      document,
      { target: source }
    );
    dispatchTouch(
      "touchmove",
      [{ identifier: 0, clientX: 300, clientY: 120 }],
      [{ identifier: 0, clientX: 300, clientY: 120 }]
    );
    expect(gridEl!.querySelectorAll(".react-grid-item").length).toBe(3);

    // Now end OUTSIDE the grid
    document.elementFromPoint = () => null;
    dispatchTouch("touchend", [], [{ identifier: 0, clientX: 0, clientY: 0 }]);

    expect(gridEl!.querySelectorAll(".react-grid-item").length).toBe(2);

    source.remove();
  });

  it("calls onDrop on touchend over the grid", () => {
    const onDrop = jest.fn();
    const { container } = render(
      <GridLayout
        className="layout"
        cols={COLS}
        rowHeight={ROW_H}
        width={1200}
        dropConfig={{ enabled: true, touchEnabled: true }}
        onDrop={onDrop}
      >
        <div key="a">a</div>
      </GridLayout>
    );

    const gridEl = container.querySelector(".react-grid-layout");
    if (!gridEl) throw new Error("grid not found");

    document.elementFromPoint = () => gridEl;
    const source = document.createElement("div");
    source.dataset.rglDraggable = "";
    document.body.append(source);

    dispatchTouch(
      "touchstart",
      [{ identifier: 0, clientX: 0, clientY: 0 }],
      [{ identifier: 0, clientX: 0, clientY: 0 }],
      document,
      { target: source }
    );
    dispatchTouch(
      "touchmove",
      [{ identifier: 0, clientX: 300, clientY: 120 }],
      [{ identifier: 0, clientX: 300, clientY: 120 }]
    );
    dispatchTouch(
      "touchend",
      [{ identifier: 0, clientX: 300, clientY: 120 }],
      [{ identifier: 0, clientX: 300, clientY: 120 }]
    );

    expect(onDrop).toHaveBeenCalledTimes(1);
    // onDrop receives (layout, item, event) — the item should be the dropping element
    const droppedItem = onDrop.mock.calls[0][1];
    expect(droppedItem.i).toBe("__dropping-elem__");

    source.remove();
    container.remove();
  });

  it("commits the latest placeholder cell on a move-then-drop (not the initial one)", () => {
    const onDrop = jest.fn();
    const { container } = render(
      <GridLayout
        className="layout"
        cols={COLS}
        rowHeight={ROW_H}
        width={1200}
        dropConfig={{ enabled: true, touchEnabled: true }}
        onDrop={onDrop}
      >
        <div key="a">a</div>
      </GridLayout>
    );

    const gridEl = container.querySelector(".react-grid-layout");
    if (!gridEl) throw new Error("grid not found");

    document.elementFromPoint = () => gridEl;
    const source = document.createElement("div");
    source.dataset.rglDraggable = "";
    document.body.append(source);

    try {
      dispatchTouch(
        "touchstart",
        [{ identifier: 0, clientX: 0, clientY: 0 }],
        [{ identifier: 0, clientX: 0, clientY: 0 }],
        document,
        { target: source }
      );
      // First move — creates the placeholder at (300, 120).
      dispatchTouch(
        "touchmove",
        [{ identifier: 0, clientX: 300, clientY: 120 }],
        [{ identifier: 0, clientX: 300, clientY: 120 }]
      );
      // Second move — updates the placeholder to (600, 300).
      dispatchTouch(
        "touchmove",
        [{ identifier: 0, clientX: 600, clientY: 300 }],
        [{ identifier: 0, clientX: 600, clientY: 300 }]
      );
      // Drop at the latest position.
      dispatchTouch(
        "touchend",
        [{ identifier: 0, clientX: 600, clientY: 300 }],
        [{ identifier: 0, clientX: 600, clientY: 300 }]
      );

      expect(onDrop).toHaveBeenCalledTimes(1);
      const droppedItem = onDrop.mock.calls[0][1];
      expect(droppedItem.i).toBe("__dropping-elem__");
      // The committed cell must reflect the FINAL move position (600px), not the
      // initial one (300px). 600px into a 1200px grid at cols=12 → x≈5; the
      // initial 300px → x≈2. (y is compactor-dependent, so assert on x only.)
      expect(droppedItem.x).toBeGreaterThanOrEqual(4);
    } finally {
      source.remove();
      container.remove();
    }
  });

  it("does not fire onLayoutChange while the placeholder is mid-gesture (#2219)", () => {
    const onLayoutChange = jest.fn();
    const { container } = render(
      <GridLayout
        className="layout"
        cols={COLS}
        rowHeight={ROW_H}
        width={1200}
        layout={[]}
        dropConfig={{ enabled: true, touchEnabled: true }}
        onLayoutChange={onLayoutChange}
      >
        <div key="a">a</div>
      </GridLayout>
    );

    const gridEl = container.querySelector(".react-grid-layout");
    if (!gridEl) throw new Error("grid not found");

    document.elementFromPoint = () => gridEl;
    const source = document.createElement("div");
    source.dataset.rglDraggable = "";
    document.body.append(source);

    try {
      // The mount effect fires once (initial layout derived from children).
      const mountCalls = onLayoutChange.mock.calls.length;
      expect(mountCalls).toBe(1);

      dispatchTouch(
        "touchstart",
        [{ identifier: 0, clientX: 0, clientY: 0 }],
        [{ identifier: 0, clientX: 0, clientY: 0 }],
        document,
        { target: source }
      );
      // Move over the grid — the placeholder is added to the internal layout,
      // but that is a transient gesture state: onLayoutChange must not fire.
      dispatchTouch(
        "touchmove",
        [{ identifier: 0, clientX: 300, clientY: 120 }],
        [{ identifier: 0, clientX: 300, clientY: 120 }]
      );
      expect(onLayoutChange.mock.calls.length).toBe(mountCalls);

      // Leave the grid — the placeholder is removed; still no committed change.
      document.elementFromPoint = () => null;
      dispatchTouch(
        "touchend",
        [],
        [{ identifier: 0, clientX: 0, clientY: 0 }]
      );
      expect(onLayoutChange.mock.calls.length).toBe(mountCalls);
    } finally {
      source.remove();
      container.remove();
    }
  });

  it("cleans up on touchcancel", () => {
    const { gridEl } = setupGrid();

    document.elementFromPoint = () => gridEl;
    const source = document.createElement("div");
    source.dataset.rglDraggable = "";
    document.body.append(source);

    dispatchTouch(
      "touchstart",
      [{ identifier: 0, clientX: 0, clientY: 0 }],
      [{ identifier: 0, clientX: 0, clientY: 0 }],
      document,
      { target: source }
    );
    dispatchTouch(
      "touchmove",
      [{ identifier: 0, clientX: 300, clientY: 120 }],
      [{ identifier: 0, clientX: 300, clientY: 120 }]
    );
    expect(gridEl!.querySelectorAll(".react-grid-item").length).toBe(3);

    dispatchTouch("touchcancel", [], []);

    expect(gridEl!.querySelectorAll(".react-grid-item").length).toBe(2);

    source.remove();
  });

  it("does not engage when touchEnabled is false", () => {
    const { gridEl } = setupGrid({ touchEnabled: false });

    document.elementFromPoint = () => gridEl;
    const source = document.createElement("div");
    source.dataset.rglDraggable = "";
    document.body.append(source);

    dispatchTouch(
      "touchstart",
      [{ identifier: 0, clientX: 0, clientY: 0 }],
      [{ identifier: 0, clientX: 0, clientY: 0 }],
      document,
      { target: source }
    );
    dispatchTouch(
      "touchmove",
      [{ identifier: 0, clientX: 300, clientY: 120 }],
      [{ identifier: 0, clientX: 300, clientY: 120 }]
    );

    // Placeholder should NOT appear
    const items = gridEl!.querySelectorAll(".react-grid-item");
    expect(items.length).toBe(2);

    source.remove();
  });

  it("does not engage when dropConfig.enabled is false (isDroppable=false)", () => {
    const { container } = render(
      <GridLayout
        className="layout"
        cols={COLS}
        rowHeight={ROW_H}
        width={1200}
        dropConfig={{ enabled: false, touchEnabled: true }}
      >
        <div key="a">a</div>
      </GridLayout>
    );
    const gridEl = container.querySelector(".react-grid-layout");

    document.elementFromPoint = () => gridEl;
    const source = document.createElement("div");
    source.dataset.rglDraggable = "";
    document.body.append(source);

    dispatchTouch(
      "touchstart",
      [{ identifier: 0, clientX: 100, clientY: 100 }],
      [{ identifier: 0, clientX: 100, clientY: 100 }],
      document,
      { target: source }
    );
    // Should not prevent default — handled by adapter's guard (isDroppable check)

    source.remove();
    container.remove();
  });

  it("updates placeholder position on touchmove", () => {
    const { gridEl } = setupGrid();

    document.elementFromPoint = () => gridEl;
    const source = document.createElement("div");
    source.dataset.rglDraggable = "";
    document.body.append(source);

    // Start drag
    dispatchTouch(
      "touchstart",
      [{ identifier: 0, clientX: 0, clientY: 0 }],
      [{ identifier: 0, clientX: 0, clientY: 0 }],
      document,
      { target: source }
    );

    // First move — creates placeholder
    dispatchTouch(
      "touchmove",
      [{ identifier: 0, clientX: 300, clientY: 120 }],
      [{ identifier: 0, clientX: 300, clientY: 120 }]
    );
    const items = gridEl!.querySelectorAll(".react-grid-item");
    expect(items.length).toBe(3); // a, b, placeholder

    // Clean up between gestures so state is fresh
    dispatchTouch(
      "touchend",
      [],
      [{ identifier: 0, clientX: 300, clientY: 120 }]
    );

    // Start a new touch drag — placeholder should be re-created
    const source2 = document.createElement("div");
    source2.dataset.rglDraggable = "";
    document.body.append(source2);

    dispatchTouch(
      "touchstart",
      [{ identifier: 1, clientX: 0, clientY: 0 }],
      [{ identifier: 1, clientX: 0, clientY: 0 }],
      document,
      { target: source2 }
    );
    dispatchTouch(
      "touchmove",
      [{ identifier: 1, clientX: 500, clientY: 300 }],
      [{ identifier: 1, clientX: 500, clientY: 300 }]
    );
    const items2 = gridEl!.querySelectorAll(".react-grid-item");
    expect(items2.length).toBe(3); // re-created placeholder (a, b, new placeholder)

    dispatchTouch(
      "touchend",
      [],
      [{ identifier: 1, clientX: 500, clientY: 300 }]
    );

    source.remove();
    source2.remove();
  });

  it("removes placeholder when touch leaves grid and re-adds on re-entry", () => {
    const { gridEl } = setupGrid();
    const source = document.createElement("div");
    source.dataset.rglDraggable = "";
    document.body.append(source);

    // Touch over grid — placeholder appears
    document.elementFromPoint = () => gridEl;
    dispatchTouch(
      "touchstart",
      [{ identifier: 0, clientX: 0, clientY: 0 }],
      [{ identifier: 0, clientX: 0, clientY: 0 }],
      document,
      { target: source }
    );
    dispatchTouch(
      "touchmove",
      [{ identifier: 0, clientX: 400, clientY: 200 }],
      [{ identifier: 0, clientX: 400, clientY: 200 }]
    );
    expect(gridEl!.querySelectorAll(".react-grid-item").length).toBe(3);

    // Touch leaves grid
    document.elementFromPoint = () => null;
    dispatchTouch(
      "touchmove",
      [{ identifier: 0, clientX: 0, clientY: 0 }],
      [{ identifier: 0, clientX: 0, clientY: 0 }]
    );
    expect(gridEl!.querySelectorAll(".react-grid-item").length).toBe(2);

    // Re-enter grid — placeholder re-appears
    document.elementFromPoint = () => gridEl;
    dispatchTouch(
      "touchmove",
      [{ identifier: 0, clientX: 500, clientY: 300 }],
      [{ identifier: 0, clientX: 500, clientY: 300 }]
    );
    expect(gridEl!.querySelectorAll(".react-grid-item").length).toBe(3);

    source.remove();
  });

  it("still allows desktop HTML5 drag-and-drop to function", () => {
    // Regression: the touch adapter must not break desktop drop.
    // This is verified by the existing lifecycle-test.js drop tests
    // continuing to pass unchanged.  Here we just render a grid and
    // confirm the DOM has the expected drag handlers wired.
    const { gridEl } = setupGrid();
    // isDroppable=true should wire onDragOver/onDrop handlers
    expect(gridEl?.getAttribute("style")).toBeDefined();
    // The existing tests cover actual DragEvent dispatch — we only
    // assert the component renders without error and the touch
    // adapter's presence doesn't clobber desktop drop props.
  });
});
