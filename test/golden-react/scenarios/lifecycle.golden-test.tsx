import React from "react";
import { horizontalCompactor } from "../../../src/core/compactors";
import type { Layout } from "../../../src/core/types";
import { expectGolden } from "../expectGolden";
import {
  childrenFor,
  drag,
  gridConfig,
  mountGrid,
  type GridFixture,
  type Variant
} from "../fixture";

const free: Variant = { name: "v2", api: "v2", compact: null };
const legacy: Variant = { name: "legacy", api: "legacy", compact: null };
const pair: Layout = [
  { i: "a", x: 0, y: 0, w: 1, h: 1 },
  { i: "b", x: 3, y: 2, w: 1, h: 1 }
];

function startDrag(fixture: GridFixture, id = "a") {
  const rect = fixture.item(id).getBoundingClientRect();
  const origin = { x: rect.left + 20, y: rect.top + 20 };
  fixture.pointer.down(fixture.item(id), origin);
  fixture.pointer.move({ x: origin.x + 110, y: origin.y });
  return origin;
}

function finish(fixture: GridFixture, scenario: string, knownBug?: string) {
  fixture.unmount();
  expectGolden(scenario, fixture.variant.name, fixture.recorder.trace, {
    ...(knownBug ? { knownBug } : {})
  });
}

function dataChildren(layout: Layout) {
  return layout.map(item => (
    <div key={item.i} data-item={item.i} data-grid={item}>
      {item.i}
    </div>
  ));
}

// Characterization at the DOM boundary: every native event has a callback,
// style, placeholder and committed-render frame in the golden trace.
describe("React lifecycle golden traces", () => {
  for (const variant of [free, { ...free, name: "strict", strict: true }]) {
    it(`defers a controlled layout update until drag stop (${variant.name})`, () => {
      const fixture = mountGrid({ variant, layout: pair });
      const origin = startDrag(fixture);
      fixture.rerenderProps({
        layout: [
          { ...pair[0], x: 4, y: 1 },
          { ...pair[1], x: 2, y: 3 }
        ]
      });
      fixture.pointer.move({ x: origin.x + 210, y: origin.y + 100 });
      fixture.pointer.up();
      drag(fixture, "a", [[110, 0]]);
      finish(fixture, "controlled-layout-mid-drag");
    });
  }

  it("uses a new controlled layout between successive drags", () => {
    const fixture = mountGrid({ variant: legacy, layout: pair });
    drag(fixture, "a", [[110, 0]]);
    fixture.rerenderProps({
      layout: [
        { ...pair[0], x: 2, y: 1 },
        { ...pair[1], x: 4, y: 3 }
      ]
    });
    drag(fixture, "a", [[110, 100]]);
    finish(fixture, "controlled-layout-between-drags");
  });

  for (const variant of [free, legacy]) {
    it(`initializes uncontrolled data-grid children and retains movement (${variant.name})`, () => {
      const fixture = mountGrid({
        variant,
        props: { layout: undefined },
        children: dataChildren(pair)
      });
      drag(fixture, "a", [[110, 100]]);
      fixture.rerenderProps({ className: "parent-rerender" });
      drag(fixture, "a", [[110, 0]]);
      finish(fixture, "uncontrolled-data-grid");
    });
  }

  it("synchronizes added, removed and reordered child keys", () => {
    const fixture = mountGrid({ variant: free, layout: pair });
    const added: Layout = [...pair, { i: "c", x: 5, y: 4, w: 1, h: 2 }];
    fixture.rerenderProps({}, dataChildren(added));
    fixture.rerenderProps({}, dataChildren([added[2], added[0], added[1]]));
    fixture.rerenderProps({}, childrenFor([added[2], added[0]]));
    drag(fixture, "c", [[-110, -100]]);
    finish(fixture, "children-add-remove-reorder");
  });

  it("removes the dragged child while its native gesture is active", () => {
    const fixture = mountGrid({ variant: free, layout: pair });
    const origin = startDrag(fixture);
    fixture.rerenderProps({}, childrenFor([pair[1]]));
    fixture.pointer.move({ x: origin.x + 210, y: origin.y + 100 });
    fixture.pointer.up();
    fixture.rerenderProps({ className: "after-removed-drag" });
    finish(fixture, "dragged-child-removed-mid-drag");
  });

  it("ignores data-grid changes when the existing keys stay equal", () => {
    const fixture = mountGrid({
      variant: free,
      props: { layout: undefined },
      children: dataChildren(pair)
    });
    fixture.rerenderProps(
      {},
      dataChildren([{ ...pair[0], x: 4, y: 3, w: 2, h: 2 }, pair[1]])
    );
    expect(fixture.item("a").style.width).toBe("100px");
    finish(
      fixture,
      "existing-data-grid-change-ignored",
      "data-grid-key-only-sync: edits to existing data-grid children are ignored until the key list changes"
    );
  });

  for (const variant of [free, legacy]) {
    it(`bounds an item when nonresponsive cols shrink (${variant.name})`, () => {
      const fixture = mountGrid({
        variant,
        layout: [{ i: "a", x: 5, y: 0, w: 1, h: 1 }]
      });
      fixture.rerenderProps(
        variant.api === "legacy"
          ? { cols: 3 }
          : { gridConfig: { ...gridConfig, cols: 3 } }
      );
      expect(fixture.item("a").style.transform).toBe("translate(400px,0px)");
      // x=5 is outside the new three-column input bounds.
      finish(fixture, "cols-no-resync");
    });
  }

  for (const variant of [free, legacy]) {
    it(`walks Responsive widths within and across breakpoints (${variant.name})`, () => {
      const fixture = mountGrid({ variant, layout: pair, responsive: true });
      fixture.rerenderProps({ width: 550 });
      fixture.rerenderProps({ width: 300 });
      drag(fixture, "a", [[110, 100]]);
      fixture.rerenderProps({ width: 600 });
      drag(fixture, "b", [[-110, 0]]);
      finish(fixture, "responsive-breakpoint-roundtrip");
    });
  }

  it("crosses a Responsive breakpoint in the middle of a drag", () => {
    const fixture = mountGrid({
      variant: { ...free, name: "strict", strict: true },
      layout: pair,
      responsive: true
    });
    const origin = startDrag(fixture);
    fixture.rerenderProps({ width: 300 });
    fixture.pointer.move({ x: origin.x + 160, y: origin.y + 100 });
    fixture.pointer.up();
    fixture.rerenderProps({ width: 600 });
    finish(fixture, "responsive-breakpoint-mid-drag");
  });

  for (const variant of [free, legacy]) {
    it(`reseeds a generated Responsive layout from data-grid (${variant.name})`, () => {
      const seeded: Layout = [{ i: "a", x: 0, y: 0, w: 4, h: 2 }];
      const fixture = mountGrid({
        variant,
        responsive: true,
        props: {
          width: 300,
          layouts: { sm: [{ ...seeded[0], w: 2 }] }
        },
        children: dataChildren(seeded)
      });
      fixture.rerenderProps({ width: 600 });
      fixture.rerenderProps({ width: 300 });
      fixture.rerenderProps({ width: 600 });
      expect(fixture.item("a").style.width).toBe("400px");
      finish(fixture, "responsive-generated-data-grid");
    });
  }

  for (const responsive of [false, true]) {
    const name = responsive ? "legacy-responsive" : "legacy-rgl";
    it(`records the legacy drag threshold (${name})`, () => {
      const fixture = mountGrid({
        variant: { ...legacy, name },
        layout: pair,
        responsive
      });
      const rect = fixture.item("a").getBoundingClientRect();
      const origin = { x: rect.left + 20, y: rect.top + 20 };
      fixture.pointer.down(fixture.item("a"), origin);
      fixture.pointer.move({ x: origin.x + 1, y: origin.y });
      fixture.pointer.up();
      finish(
        fixture,
        "legacy-responsive-threshold",
        responsive
          ? "legacy-responsive-threshold: legacy Responsive keeps the v2 3px threshold while legacy RGL starts immediately"
          : undefined
      );
    });
  }

  for (const responsive of [false, true]) {
    const name = responsive ? "legacy-responsive" : "legacy-rgl";
    it(`records legacy bounded resizing through a real south handle (${name})`, () => {
      const fixture = mountGrid({
        variant: { ...legacy, name, bounded: true },
        layout: [{ i: "a", x: 0, y: 3, w: 1, h: 2 }],
        responsive,
        props: { resizeHandles: ["s"] }
      });
      const handle = fixture
        .item("a")
        .querySelector<HTMLElement>(".react-resizable-handle-s")!;
      const rect = handle.getBoundingClientRect();
      fixture.pointer.down(handle, { x: rect.left + 5, y: rect.top + 5 });
      fixture.pointer.move({ x: rect.left + 5, y: rect.top + 215 });
      fixture.pointer.up();
      finish(
        fixture,
        "legacy-responsive-bounds",
        responsive
          ? "legacy-responsive-bounds: legacy Responsive omits containerBounds and permits growth beyond the visible grid"
          : "legacy-bounded-resize: legacy RGL measures the handle parent item as the resize container"
      );
    });
  }

  it("keeps stale resize handles until another compared prop changes", () => {
    const fixture = mountGrid({ variant: free, layout: pair });
    fixture.rerenderProps({ resizeConfig: { handles: ["se", "sw"] } });
    expect(
      fixture.item("a").querySelectorAll(".react-resizable-handle")
    ).toHaveLength(1);
    fixture.rerenderProps({ width: 601 });
    expect(
      fixture.item("a").querySelectorAll(".react-resizable-handle")
    ).toHaveLength(2);
    finish(
      fixture,
      "memo-ignored-resize-handles",
      "memo-ignored-props: resize handles do not update until a compared geometry prop changes"
    );
  });

  it("keeps a stale static class when interactivity is already disabled", () => {
    const layout: Layout = [
      {
        i: "a",
        x: 0,
        y: 0,
        w: 1,
        h: 1,
        static: false,
        isDraggable: false,
        isResizable: false
      }
    ];
    const fixture = mountGrid({ variant: free, layout });
    fixture.rerenderProps({ layout: [{ ...layout[0], static: true }] });
    expect(fixture.item("a").classList.contains("static")).toBe(false);
    fixture.rerenderProps({ width: 601 });
    expect(fixture.item("a").classList.contains("static")).toBe(true);
    finish(
      fixture,
      "memo-ignored-static",
      "memo-ignored-props: static class stays stale when the static flag alone changes"
    );
  });

  it("calls the old drag-start closure after a callback-only rerender", () => {
    const fixture = mountGrid({
      variant: free,
      layout: pair,
      handlers: {
        onDragStart: () => fixture.recorder.note({ consumer: "initial" })
      }
    });
    const recordedStart = fixture.recorder.props.onDragStart;
    fixture.rerenderProps({
      onDragStart: (...args: any[]) => {
        recordedStart(...args);
        fixture.recorder.note({ consumer: "replacement" });
      }
    });
    drag(fixture, "a", [[110, 0]]);
    const notes = fixture.recorder.trace.flatMap(frame => frame.notes ?? []);
    expect(notes).toEqual([{ consumer: "initial" }]);
    finish(
      fixture,
      "memo-ignored-drag-start-callback",
      "memo-ignored-props: callback-only onDragStart changes retain the previous consumer closure"
    );
  });

  it("fires duplicate layout changes when Responsive changes compactor type", () => {
    const fixture = mountGrid({
      variant: { name: "v2", api: "v2", compact: "vertical" },
      responsive: true,
      layout: [
        { i: "a", x: 4, y: 0, w: 1, h: 1 },
        { i: "b", x: 3, y: 1, w: 1, h: 1 }
      ]
    });
    fixture.rerenderProps({ compactor: horizontalCompactor });
    const last = fixture.recorder.trace[fixture.recorder.trace.length - 1];
    expect(
      last.callbacks.filter((cb: any) => cb.name === "onLayoutChange")
    ).toHaveLength(2);
    finish(
      fixture,
      "responsive-compactor-double-layout-change",
      "double-layout-change: Responsive compactor swaps notify directly and again through GridLayout synchronization"
    );
  });
});
