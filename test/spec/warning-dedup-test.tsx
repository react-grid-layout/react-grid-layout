import React from "react";
import { render } from "@testing-library/react";
import { validateLayoutInput } from "../../src/core";
import { resetDevWarnings } from "../../src/core/dev";
import type { Layout } from "../../src/core/types";
import {
  GridItem,
  GridLayout,
  ResponsiveGridLayout
} from "../../src/react/components";
import { useGridLayout } from "../../src/react/hooks/useGridLayout";
import { dropExternal } from "../golden-react/drop";

// RGL_W002 and RGL_W009 warn once per grid (or once per page for direct
// GridItems), not once per render, dragover or item. A console-guarded test
// suite fails on every repeat.

let warn: jest.SpyInstance;
beforeEach(() => {
  resetDevWarnings();
  warn = jest.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => warn.mockRestore());

const codes = () =>
  warn.mock.calls.map(
    call => /\((RGL_W\d{3})\)$/.exec(String(call[0]))?.[1] ?? "uncoded"
  );
const count = (code: string) => codes().filter(c => c === code).length;

const clamped: Layout = [{ i: "a", x: -5, y: 0, w: 2, h: 1 }];

describe("RGL_W002 once per grid", () => {
  test("rerendering a clamped layout prop with inline config warns once", () => {
    const grid = () => (
      <GridLayout width={1200} layout={clamped} gridConfig={{ cols: 12 }}>
        <div key="a" />
      </GridLayout>
    );
    const view = render(grid());
    for (let n = 0; n < 5; n++) view.rerender(grid());
    expect(count("RGL_W002")).toBe(1);
  });

  test("shrinking cols twice warns once", () => {
    const layout: Layout = [{ i: "a", x: 5, y: 0, w: 4, h: 1 }];
    const grid = (cols: number) => (
      <GridLayout width={1200} layout={layout} gridConfig={{ cols }}>
        <div key="a" />
      </GridLayout>
    );
    const view = render(grid(12));
    view.rerender(grid(6));
    view.rerender(grid(3));
    expect(count("RGL_W002")).toBe(1);
  });

  test("each grid still warns for its own input", () => {
    render(
      <>
        <GridLayout width={1200} layout={clamped} gridConfig={{ cols: 12 }}>
          <div key="a" />
        </GridLayout>
        <GridLayout width={1200} layout={clamped} gridConfig={{ cols: 12 }}>
          <div key="a" />
        </GridLayout>
      </>
    );
    expect(count("RGL_W002")).toBe(2);
  });

  test("dragover with an oversized onDragOver item warns once", () => {
    const view = render(
      <GridLayout
        width={1200}
        layout={[]}
        gridConfig={{ cols: 12, rowHeight: 30 }}
        dropConfig={{ enabled: true, onDragOver: () => ({ w: 40, h: 1 }) }}
      >
        {[]}
      </GridLayout>
    );
    const drop = dropExternal(view.container);
    try {
      drop.enter({ x: 20, y: 20 });
      for (let n = 0; n < 10; n++) drop.over({ x: 20 + n * 10, y: 20 });
      drop.leave();
    } finally {
      drop.uninstall();
    }
    expect(count("RGL_W002")).toBe(1);
  });

  test("Responsive with inline cols warns once across rerenders", () => {
    const layouts = { lg: clamped };
    const grid = () => (
      <ResponsiveGridLayout
        width={1300}
        layouts={layouts}
        breakpoints={{ lg: 1200, sm: 0 }}
        cols={{ lg: 12, sm: 2 }}
      >
        <div key="a" />
      </ResponsiveGridLayout>
    );
    const view = render(grid());
    for (let n = 0; n < 5; n++) view.rerender(grid());
    expect(count("RGL_W002")).toBe(1);
  });

  test("useGridLayout warns once across setLayout calls", () => {
    const api: { current?: ReturnType<typeof useGridLayout> } = {};
    function Probe() {
      const result = useGridLayout({ layout: clamped, cols: 12 });
      React.useEffect(() => {
        api.current = result;
      });
      return null;
    }
    const view = render(<Probe />);
    view.rerender(<Probe />);
    React.act(() => api.current!.setLayout(clamped));
    React.act(() => api.current!.setLayout([{ ...clamped[0]!, x: -9 }]));
    expect(count("RGL_W002")).toBe(1);
  });

  test("the public validateLayoutInput still warns on each call", () => {
    validateLayoutInput(clamped, { cols: 12 });
    validateLayoutInput(clamped, { cols: 12 });
    expect(count("RGL_W002")).toBe(2);
  });
});

describe("RGL_W002 is for geometry, not constraints", () => {
  // Responsive generation keeps minW, so a layout the grid itself reported
  // for a narrow breakpoint can carry minW above that breakpoint's cols.
  test("minW above cols alone is bounded silently", () => {
    const layout: Layout = [{ i: "a", x: 0, y: 0, w: 2, h: 1, minW: 4 }];
    const result = validateLayoutInput(layout, { cols: 2 });
    expect(result[0]!.minW).toBe(2);
    expect(warn).not.toHaveBeenCalled();
  });

  test("a responsive round trip of a minW item does not warn", () => {
    const layouts = {
      xxs: [{ i: "a", x: 0, y: 0, w: 2, h: 1, minW: 4 }]
    };
    render(
      <ResponsiveGridLayout
        width={300}
        layouts={layouts}
        breakpoints={{ lg: 1200, xxs: 0 }}
        cols={{ lg: 12, xxs: 2 }}
      >
        <div key="a" />
      </ResponsiveGridLayout>
    );
    expect(count("RGL_W002")).toBe(0);
  });
});

describe("RGL_W009 once per page", () => {
  test("many direct GridItems with live flags warn once", () => {
    const props = {
      cols: 12,
      containerWidth: 1200,
      margin: [10, 10] as const,
      containerPadding: [10, 10] as const,
      rowHeight: 30,
      maxRows: Infinity,
      isDraggable: false,
      isResizable: false,
      isBounded: false,
      x: 0,
      y: 0,
      w: 1,
      h: 1,
      useCSSTransforms: false
    };
    render(
      <>
        {["a", "b", "c", "d"].map(i => (
          <GridItem key={i} {...props} i={i}>
            <div />
          </GridItem>
        ))}
      </>
    );
    expect(count("RGL_W009")).toBe(1);
  });
});
