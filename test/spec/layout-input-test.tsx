import React from "react";
import { act, render, renderHook, fireEvent } from "@testing-library/react";
import {
  validateLayoutInput,
  MAX_GRID_ROWS,
  noCompactor,
  verticalCompactor,
  horizontalCompactor,
  correctBounds,
  findOrGenerateResponsiveLayout
} from "../../src/core";
import type { Layout, LayoutItem } from "../../src/core/types";
import { GridLayout } from "../../src/react/components/GridLayout";
import { ResponsiveGridLayout } from "../../src/react/components/ResponsiveGridLayout";
import { useGridLayout } from "../../src/react/hooks/useGridLayout";
import { useResponsiveLayout } from "../../src/react/hooks/useResponsiveLayout";
import LegacyGridLayout from "../../src/legacy/ReactGridLayout";
import LegacyResponsive from "../../src/legacy/ResponsiveReactGridLayout";
import { dropExternal } from "../golden-react/drop";

const item: LayoutItem = { i: "a", x: 0, y: 0, w: 1, h: 1 };

test("child changes preserve static rows resolved beyond maxRows", () => {
  const input = Array.from({ length: 3 }, (_, i) => ({
    ...item,
    i: String(i),
    h: 2,
    static: true
  }));
  const changed = jest.fn();
  const element = (extra: boolean) => (
    <GridLayout
      width={800}
      gridConfig={{ cols: 1, maxRows: 2 }}
      layout={input}
      onLayoutChange={changed}
    >
      {input.map(l => (
        <div key={l.i} data-testid={l.i} />
      ))}
      {extra && <div key="new" />}
    </GridLayout>
  );
  const view = render(element(false));
  expect(changed.mock.calls[0][0].map((l: LayoutItem) => l.y)).toEqual([
    2, 4, 0
  ]);
  const positions = input.map(l => view.getByTestId(l.i).style.transform);
  view.rerender(element(true));
  expect(input.map(l => view.getByTestId(l.i).style.transform)).toEqual(
    positions
  );
});

test("responsive breakpoint generation keeps resolved static rows", () => {
  const input = Array.from({ length: 3 }, (_, i) => ({
    ...item,
    i: String(i),
    h: 2,
    static: true
  }));
  const element = (width: number) => (
    <ResponsiveGridLayout
      width={width}
      breakpoints={{ lg: 600, sm: 0 }}
      cols={{ lg: 1, sm: 1 }}
      maxRows={2}
      layouts={{ lg: input }}
    >
      {input.map(l => (
        <div key={l.i} data-testid={l.i} />
      ))}
    </ResponsiveGridLayout>
  );
  const view = render(element(800));
  const positions = input.map(l => view.getByTestId(l.i).style.transform);
  view.rerender(element(400));
  expect(input.map(l => view.getByTestId(l.i).style.transform)).toEqual(
    positions
  );
});

test("responsive lookups and generated layouts preserve resolved static rows", () => {
  const resolved = Array.from({ length: 3 }, (_, i) => ({
    ...item,
    i: String(i),
    y: [2, 4, 0][i]!,
    h: 2,
    static: true
  }));
  for (const bp of ["lg", "sm"]) {
    expect(
      findOrGenerateResponsiveLayout(
        { lg: resolved },
        { lg: 600, sm: 0 },
        bp,
        "lg",
        1,
        verticalCompactor
      ).map(l => l.y)
    ).toEqual([2, 4, 0]);
  }
});
const hostile: LayoutItem = {
  ...item,
  x: 1e9,
  y: 1e9,
  w: 1e9,
  h: 1e9,
  minW: 1e9,
  maxW: Infinity,
  minH: 1e9,
  maxH: Infinity
};
const bounded = {
  x: 0,
  y: 20,
  w: 4,
  h: 20,
  minW: 4,
  maxW: Infinity,
  minH: 20,
  maxH: Infinity
};

test("responsive props preserve stale layouts through updates and callbacks", () => {
  const changed = jest.fn();
  const stale = [{ ...hostile, x: 7, w: 3 }];
  const element = (width: number, saved: Layout) => (
    <ResponsiveGridLayout
      width={width}
      breakpoints={{ lg: 600, sm: 0 }}
      cols={{ lg: 4, sm: 2 }}
      maxRows={20}
      layouts={{ lg: [hostile], sm: [hostile], stale: saved }}
      compactor={noCompactor}
      onLayoutChange={changed}
    >
      <div key="a" />
    </ResponsiveGridLayout>
  );
  const view = render(element(800, stale));
  view.rerender(element(400, stale));
  expect(changed.mock.calls.at(-1)?.[1].stale).toEqual(stale);
  expect(changed.mock.calls.at(-1)?.[1].lg[0]).toMatchObject(bounded);
  expect(changed.mock.calls.at(-1)?.[1].sm[0]).toMatchObject({
    ...bounded,
    w: 2,
    minW: 2
  });
  const updated = [{ ...stale[0]!, x: 9 }];
  view.rerender(element(400, updated));
  view.rerender(element(800, updated));
  expect(changed.mock.calls.at(-1)?.[1].stale).toEqual(updated);
});

test.each(["initial", "prop-sync", "set-breakpoint", "set-all"])(
  "responsive hook preserves stale keys through %s while validating configured layouts",
  route => {
    const stale = [{ ...hostile, x: 7, w: 3 }];
    const saved = { lg: [hostile], sm: [hostile], stale };
    const initial = { ...saved, stale: route === "initial" ? stale : [] };
    const hook = renderHook(
      ({ input }) =>
        useResponsiveLayout({
          width: 800,
          breakpoints: { lg: 600, sm: 0 },
          cols: { lg: 4, sm: 2 },
          maxRows: 20,
          layouts: input,
          compactor: noCompactor
        }),
      { initialProps: { input: initial } }
    );
    if (route === "prop-sync") hook.rerender({ input: saved });
    if (route === "set-breakpoint")
      act(() => {
        hook.result.current.setLayoutForBreakpoint("stale", stale);
        hook.result.current.setLayoutForBreakpoint("lg", [hostile]);
        hook.result.current.setLayoutForBreakpoint("sm", [hostile]);
      });
    if (route === "set-all") act(() => hook.result.current.setLayouts(saved));
    expect(hook.result.current.layouts.stale).toEqual(stale);
    expect(hook.result.current.layouts.lg![0]).toMatchObject(bounded);
    expect(hook.result.current.layouts.sm![0]).toMatchObject({
      ...bounded,
      w: 2,
      minW: 2
    });
  }
);

test("responsive generation ignores a previous breakpoint after its columns are removed", () => {
  const changed = jest.fn();
  const element = (width: number, cols: Record<string, number>) => (
    <ResponsiveGridLayout
      width={width}
      breakpoints={{ lg: 600, sm: 0 }}
      cols={cols}
      layouts={{ lg: [{ ...item, x: 3, w: 2 }] }}
      compactor={noCompactor}
      onLayoutChange={changed}
    >
      <div key="a" />
    </ResponsiveGridLayout>
  );
  const view = render(element(800, { lg: 6, sm: 4 }));
  view.rerender(element(400, { sm: 4 }));
  expect(changed.mock.calls.at(-1)?.[0][0]).toMatchObject(item);
  expect(changed.mock.calls.at(-1)?.[1].lg).toEqual([{ ...item, x: 3, w: 2 }]);
});
let warning: jest.SpyInstance;
beforeEach(() => {
  warning = jest.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  warning.mockRestore();
});

describe("validateLayoutInput", () => {
  test.each(["x", "y", "w", "h", "minW", "maxW", "minH", "maxH"] as const)(
    "bounds %s and coerces non-finite input without mutation",
    field => {
      const upper =
        field === "x"
          ? 3
          : field === "y" || field.endsWith("H") || field === "h"
            ? 20
            : 4;
      const lower = field === "x" || field === "y" ? 0 : 1;
      for (const value of [-1e9, 1e9, Number.NaN, -Infinity, Infinity]) {
        const input = Object.freeze([{ ...item, [field]: value }]);
        const output = validateLayoutInput(input, { cols: 4, maxRows: 20 });
        const unbounded = field === "maxW" || field === "maxH";
        expect(output[0]![field]).toBe(
          (field === "y" || unbounded) && value === Infinity
            ? Infinity
            : unbounded && value === 1e9
              ? 1e9
              : value === Infinity || value === 1e9
                ? upper
                : lower
        );
        expect(input[0]![field]).toBe(value);
      }
    }
  );
  test.each(["x", "y", "w", "h", "minW", "maxW", "minH", "maxH"] as const)(
    "%s uses its lower bound for nonnumeric runtime values",
    field => {
      for (const value of ["bad", null, true, {}]) {
        const input = [{ ...item, [field]: value }] as unknown as Layout;
        const output = validateLayoutInput(input, { cols: 4, maxRows: 20 });
        expect(output[0]![field]).toBe(field === "x" || field === "y" ? 0 : 1);
        expect(input[0]![field]).toBe(value);
      }
    }
  );
  test("caps rows, preserves fractions and optional fields, and warns once per call", () => {
    expect(MAX_GRID_ROWS).toBe(10_000);
    expect(
      validateLayoutInput([hostile, hostile], { cols: 4 })[0]
    ).toMatchObject({ y: 10_000, h: 10_000, minH: 10_000, maxH: Infinity });
    expect(warning).toHaveBeenCalledTimes(1);
    warning.mockClear();
    const valid = [{ ...item, x: 0.5, y: 1.5, w: 1.5, h: 1.5 }];
    expect(validateLayoutInput(valid, { cols: 4, maxRows: Infinity })).toEqual(
      valid
    );
    expect(warning).not.toHaveBeenCalled();
    expect(
      validateLayoutInput([{ ...item, minW: 3, maxW: 2, minH: 4, maxH: 2 }], {
        cols: 4,
        maxRows: 20
      })[0]
    ).toMatchObject({ minW: 3, maxW: 3, minH: 4, maxH: 4 });
    expect(
      validateLayoutInput([hostile], { cols: 4, maxRows: 1e9 })[0]!.h
    ).toBe(10_000);
    expect(validateLayoutInput([hostile], { cols: 4, maxRows: 0 })[0]!.h).toBe(
      1
    );
  });
  test("keeps maxima above the grid so a later, wider grid is not capped", () => {
    const wide = [{ ...item, maxW: Infinity, maxH: 50 }];
    expect(validateLayoutInput(wide, { cols: 4, maxRows: 20 })).toBe(wide);
    expect(warning).not.toHaveBeenCalled();
  });
  test("suppresses warnings in production", () => {
    const previous = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = "production";
      validateLayoutInput([hostile], { cols: 4 });
      expect(warning).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = previous;
    }
  });
});

test.each(["props", "data-grid", "legacy", "responsive", "legacy-responsive"])(
  "%s intake bounds geometry on mount and prop sync",
  route => {
    const changed = jest.fn();
    const element = (input: Layout) => {
      const children = (
        <div
          key="a"
          data-testid="bounded-cell"
          data-grid={route === "data-grid" ? input[0] : undefined}
        />
      );
      if (route === "responsive")
        return (
          <ResponsiveGridLayout
            width={800}
            breakpoints={{ lg: 0 }}
            cols={{ lg: 4 }}
            maxRows={20}
            layouts={{ lg: input }}
            compactor={noCompactor}
            onLayoutChange={changed}
          >
            {children}
          </ResponsiveGridLayout>
        );
      if (route === "legacy-responsive")
        return (
          <LegacyResponsive
            width={800}
            breakpoints={{ lg: 0 }}
            cols={{ lg: 4 }}
            maxRows={20}
            layouts={{ lg: input }}
            compactType={null}
            onLayoutChange={changed}
          >
            {children}
          </LegacyResponsive>
        );
      if (route === "legacy")
        return (
          <LegacyGridLayout
            width={800}
            cols={4}
            maxRows={20}
            layout={input}
            compactType={null}
            onLayoutChange={changed}
          >
            {children}
          </LegacyGridLayout>
        );
      return (
        <GridLayout
          width={800}
          gridConfig={{ cols: 4, maxRows: 20 }}
          layout={route === "data-grid" ? [] : input}
          compactor={noCompactor}
          onLayoutChange={changed}
        >
          {children}
        </GridLayout>
      );
    };
    const view = render(element([hostile]));
    const expectBounded = () => {
      const cell = view.getByTestId("bounded-cell");
      expect(cell.style.width).toBe("780px");
      expect(cell.style.height).toBe("3190px");
      expect(cell.style.transform).toBe("translate(10px,3210px)");
      if (route !== "responsive" && route !== "legacy-responsive") {
        expect(changed.mock.calls.at(-1)?.[0][0]).toMatchObject(bounded);
      }
    };
    expectBounded();
    if (route !== "data-grid") {
      view.rerender(element([item]));
      view.rerender(element([hostile]));
      expectBounded();
    }
  }
);

test("useGridLayout validates initial, setter, prop sync, and external drop layouts", () => {
  const hook = renderHook(
    ({ input }) =>
      useGridLayout({
        layout: input,
        cols: 4,
        maxRows: 20,
        compactor: noCompactor
      }),
    { initialProps: { input: [hostile] as Layout } }
  );
  expect(hook.result.current.layout[0]).toMatchObject(bounded);
  act(() => hook.result.current.setLayout([hostile]));
  expect(hook.result.current.layout[0]).toMatchObject(bounded);
  hook.rerender({ input: [item] });
  hook.rerender({ input: [hostile] });
  expect(hook.result.current.layout[0]).toMatchObject(bounded);
  act(() =>
    hook.result.current.onDropDragOver(
      { ...hostile, i: "drop" },
      { left: 0, top: 0, e: new Event("dragover") }
    )
  );
  expect(hook.result.current.layout.find(l => l.i === "drop")).toMatchObject(
    bounded
  );
});

test("useResponsiveLayout bounds initial layouts, setters, prop sync and generated breakpoints", () => {
  const hook = renderHook(
    ({ input, width }) =>
      useResponsiveLayout({
        width,
        layouts: input,
        breakpoints: { lg: 600, sm: 0 },
        cols: { lg: 4, sm: 2 },
        maxRows: 20,
        compactor: noCompactor
      }),
    { initialProps: { input: { lg: [hostile] } as { lg: Layout }, width: 800 } }
  );
  expect(hook.result.current.layout[0]).toMatchObject(bounded);
  act(() => hook.result.current.setLayoutForBreakpoint("lg", [hostile]));
  expect(hook.result.current.layout[0]).toMatchObject(bounded);
  act(() => hook.result.current.setLayouts({ lg: [hostile] }));
  expect(hook.result.current.layouts.lg![0]).toMatchObject(bounded);
  hook.rerender({ input: { lg: [item] }, width: 800 });
  hook.rerender({ input: { lg: [hostile] }, width: 800 });
  expect(hook.result.current.layout[0]).toMatchObject(bounded);
  hook.rerender({ input: { lg: [hostile] }, width: 400 });
  expect(hook.result.current.layout[0]).toMatchObject({
    ...bounded,
    w: 2,
    minW: 4
  });
});

test.each(["prop", "default", "drag-over"])(
  "bounds dropping item from %s before rendering and committing",
  route => {
    const dropped = jest.fn();
    const view = render(
      <GridLayout
        width={800}
        gridConfig={{ cols: 4, maxRows: 20 }}
        compactor={noCompactor}
        dropConfig={{
          enabled: true,
          ...(route === "default" ? { defaultItem: { w: 1e9, h: 1e9 } } : {})
        }}
        droppingItem={route === "prop" ? hostile : undefined}
        onDropDragOver={
          route === "drag-over" ? () => ({ w: 1e9, h: 1e9 }) : undefined
        }
        onDrop={dropped}
      />
    );
    const drop = dropExternal(view.container);
    try {
      drop.enter({ x: 100, y: 100 });
      drop.over({ x: 100, y: 100 });
      drop.drop();
      expect(dropped.mock.calls[0]?.[1]).toMatchObject({ w: 4, h: 20 });
    } finally {
      drop.uninstall();
    }
  }
);

test("Infinity y still appends at the same bottom", () => {
  const input = [
    { ...item, static: true, h: 3 },
    { ...item, i: "b", y: Infinity }
  ];
  const hook = renderHook(() =>
    useGridLayout({ layout: input, cols: 4, compactor: verticalCompactor })
  );
  expect(hook.result.current.layout[1]).toMatchObject({ y: 3 });
});

test.each([verticalCompactor, horizontalCompactor])(
  "$type compaction resolves static and movable append sentinels",
  compactor => {
    const input = [
      { ...item, i: "normal", h: 2 },
      { ...item, i: "static", y: Infinity, static: true },
      { ...item, i: "movable", y: Infinity }
    ];
    const corrected = correctBounds(input, { cols: 1 });
    expect(corrected.map(l => l.y)).toEqual([0, 2, 3]);
    const output = compactor.compact(corrected, 1);
    expect(output.every(l => Number.isFinite(l.y))).toBe(true);
  }
);

test("GridLayout renders finite static and movable append sentinels", () => {
  const changed = jest.fn();
  const input = [
    { ...item, i: "normal", h: 2 },
    { ...item, i: "static", y: Infinity, static: true },
    { ...item, i: "movable", y: Infinity }
  ];
  render(
    <GridLayout
      width={800}
      layout={input}
      gridConfig={{ cols: 1 }}
      compactor={noCompactor}
      onLayoutChange={changed}
    >
      {input.map(l => (
        <div key={l.i} />
      ))}
    </GridLayout>
  );
  expect(changed.mock.calls[0][0].map((l: LayoutItem) => l.y)).toEqual([
    0, 2, 3
  ]);
});

test("a saved minH cannot restore a billion-row size during resize", () => {
  const resized = jest.fn();
  const view = render(
    <GridLayout
      width={800}
      gridConfig={{
        cols: 4,
        rowHeight: 10,
        margin: [0, 0],
        containerPadding: [0, 0],
        maxRows: 20
      }}
      layout={[{ ...item, minH: 1e9 }]}
      onResize={resized}
    >
      <div key="a" />
    </GridLayout>
  );
  const handle = view.container.querySelector(".react-resizable-handle-se")!;
  fireEvent.mouseDown(handle, { clientX: 10, clientY: 10, button: 0 });
  fireEvent.mouseMove(document, { clientX: 20, clientY: 20, buttons: 1 });
  fireEvent.mouseUp(document, { clientX: 20, clientY: 20, button: 0 });
  expect(resized.mock.calls.at(-1)?.[2].h).toBe(20);
});

test.each(["resize", "drop"])(
  "%s preserves resolved rows beyond the input limit",
  operation => {
    const input = [
      ...Array.from({ length: 3 }, (_, index) => ({
        ...item,
        i: `static-${index}`,
        h: 10_000,
        static: true
      })),
      { ...item, i: "dynamic", x: 1 }
    ];
    const hook = renderHook(() =>
      useGridLayout({ layout: input, cols: 2, compactor: noCompactor })
    );
    const before = hook.result.current.layout.filter(l => l.static);
    expect(before.map(l => l.y)).toEqual([10_000, 20_000, 0]);
    act(() => {
      if (operation === "resize") hook.result.current.onResize("dynamic", 1, 2);
      else
        hook.result.current.onDropDragOver(
          { ...item, i: "drop", x: 1, y: 3 },
          { left: 0, top: 0, e: new Event("dragover") }
        );
    });
    expect(hook.result.current.layout.filter(l => l.static)).toEqual(before);
  }
);

test.each(["maxW", "maxH"] as const)(
  "nonnumeric %s stays finite through a real resize",
  field => {
    for (const value of ["bad", null, true, {}]) {
      const resized = jest.fn();
      const view = render(
        <GridLayout
          width={800}
          gridConfig={{
            cols: 4,
            rowHeight: 10,
            margin: [0, 0],
            containerPadding: [0, 0]
          }}
          layout={[{ ...item, [field]: value }] as unknown as Layout}
          onResize={resized}
        >
          <div key="a" />
        </GridLayout>
      );
      const handle = view.container.querySelector(
        ".react-resizable-handle-se"
      )!;
      fireEvent.mouseDown(handle, { clientX: 10, clientY: 10, button: 0 });
      fireEvent.mouseMove(document, { clientX: 220, clientY: 40, buttons: 1 });
      fireEvent.mouseUp(document, { clientX: 220, clientY: 40, button: 0 });
      expect(resized).toHaveBeenCalled();
      expect(resized.mock.calls.at(-1)?.[2]).toMatchObject(
        field === "maxW" ? { w: 1, h: 4 } : { w: 2, h: 1 }
      );
      view.unmount();
    }
  }
);
