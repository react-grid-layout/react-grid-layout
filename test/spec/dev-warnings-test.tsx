import React from "react";
import { act, render } from "@testing-library/react";
import { devWarn, reportOnce, resetDevWarnings } from "../../src/core/dev";
import {
  assertLayoutStructure,
  validateLayout,
  validateLayoutInput,
  absoluteStrategy,
  verticalCompactor
} from "../../src/core";
import * as root from "../../src/index";
import type { DropConfig, Layout, LayoutItem } from "../../src/core/types";
import {
  GridItem,
  GridLayout,
  ResponsiveGridLayout
} from "../../src/react/components";
import ReactGridLayout from "../../src/legacy/ReactGridLayout";
import ResponsiveReactGridLayout from "../../src/legacy/ResponsiveReactGridLayout";
import { dropExternal } from "../golden-react/drop";

let warn: jest.SpyInstance;
let error: jest.SpyInstance;
beforeEach(() => {
  resetDevWarnings();
  warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  error = jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
  error.mockRestore();
});

function inProduction(run: () => void) {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    run();
  } finally {
    process.env.NODE_ENV = previous;
  }
}

/** The codes in console.warn calls, in order. */
const warnedCodes = () =>
  warn.mock.calls.map(
    call => /\((RGL_W\d{3})\)$/.exec(String(call[0]))?.[1] ?? "uncoded"
  );

describe("devWarn", () => {
  test("warns once per scope and code, and ends the message with the code", () => {
    const a = {};
    const b = {};
    devWarn(a, "RGL_W002", "first");
    devWarn(a, "RGL_W002", "again");
    devWarn(a, "RGL_W007", "other code");
    devWarn(b, "RGL_W002", "other scope");
    expect(warn.mock.calls.map(call => call[0])).toEqual([
      "first (RGL_W002)",
      "other code (RGL_W007)",
      "other scope (RGL_W002)"
    ]);
  });
  test("a null scope warns on every call", () => {
    devWarn(null, "RGL_W002", "x");
    devWarn(null, "RGL_W002", "x");
    expect(warn).toHaveBeenCalledTimes(2);
  });
  test("is silent in production and does not use up the scope", () => {
    const scope = {};
    inProduction(() => devWarn(scope, "RGL_W002", "x"));
    expect(warn).not.toHaveBeenCalled();
    devWarn(scope, "RGL_W002", "x");
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe("reportOnce", () => {
  test("reports through console.error once per scope, in production too", () => {
    const scope = {};
    inProduction(() => {
      reportOnce(scope, "RGL_W005", "bad result");
      reportOnce(scope, "RGL_W005", "bad result");
    });
    expect(error.mock.calls).toEqual([["bad result (RGL_W005)"]]);
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("intake codes", () => {
  const hostile = { i: "a", x: -5, y: 0, w: 1, h: 1 };
  test("RGL_W002: a clamp warns once per call with the code", () => {
    validateLayoutInput([hostile], { cols: 4 });
    validateLayoutInput([hostile], { cols: 4 });
    expect(warn.mock.calls.map(call => call[0])).toEqual([
      "ReactGridLayout: layout input was clamped to grid bounds. (RGL_W002)",
      "ReactGridLayout: layout input was clamped to grid bounds. (RGL_W002)"
    ]);
  });
  test("RGL_W007: duplicate ids warn and the layout is kept as is", () => {
    const layout: Layout = [
      { i: "a", x: 0, y: 0, w: 1, h: 1 },
      { i: "a", x: 0, y: 3, w: 1, h: 1 },
      { i: "b", x: 1, y: 0, w: 1, h: 1 }
    ];
    expect(validateLayoutInput(layout, { cols: 4 })).toBe(layout);
    expect(warnedCodes()).toEqual(["RGL_W007"]);
    expect(warn.mock.calls[0]![0]).toContain('"a"');
  });
  test("unique ids in bounds are silent", () => {
    validateLayoutInput(
      [
        { i: "a", x: 0, y: 0, w: 1, h: 1 },
        { i: "b", x: 1, y: 0, w: 1, h: 1 }
      ],
      { cols: 4 }
    );
    expect(warn).not.toHaveBeenCalled();
  });
  test("both are silent in production", () => {
    inProduction(() =>
      validateLayoutInput([hostile, hostile], { cols: 4, maxRows: 20 })
    );
    expect(warn).not.toHaveBeenCalled();
  });
  test("a grid with a duplicate id in its layout prop warns RGL_W007", () => {
    render(
      <GridLayout
        width={400}
        layout={[
          { i: "a", x: 0, y: 0, w: 1, h: 1 },
          { i: "a", x: 0, y: 3, w: 1, h: 1 }
        ]}
      >
        <div key="a" />
      </GridLayout>
    );
    expect(warnedCodes()).toContain("RGL_W007");
  });
});

describe("RGL_W010: legacy verticalCompact={false}", () => {
  const children = [<div key="a" data-grid={{ x: 0, y: 0, w: 1, h: 1 }} />];
  test.each([
    ["ReactGridLayout", ReactGridLayout],
    ["ResponsiveReactGridLayout", ResponsiveReactGridLayout]
  ] as const)(
    "<%s> warns once per grid, with the v1 text",
    (name, Component) => {
      const view = render(
        <Component width={1200} verticalCompact={false}>
          {children}
        </Component>
      );
      view.rerender(
        <Component width={1100} verticalCompact={false}>
          {children}
        </Component>
      );
      view.rerender(
        <Component width={1000} verticalCompact={false}>
          {children}
        </Component>
      );
      expect(warn.mock.calls.map(call => call[0])).toEqual([
        `\`verticalCompact\` on <${name}> is deprecated and will be removed soon. ` +
          'Use `compactType`: "horizontal" | "vertical" | null. (RGL_W010)'
      ]);
      // A second grid is a second scope.
      render(
        <Component width={1200} verticalCompact={false}>
          {children}
        </Component>
      );
      expect(warn).toHaveBeenCalledTimes(2);
    }
  );
  test("warns once under StrictMode", () => {
    render(
      <React.StrictMode>
        <ReactGridLayout width={1200} verticalCompact={false}>
          {children}
        </ReactGridLayout>
      </React.StrictMode>
    );
    expect(warnedCodes()).toEqual(["RGL_W010"]);
  });
  test("is silent in production", () => {
    inProduction(() => {
      render(
        <ReactGridLayout width={1200} verticalCompact={false}>
          {children}
        </ReactGridLayout>
      );
    });
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("modern-entry deprecations", () => {
  const all = ["RGL_W014", "RGL_W015", "RGL_W017"];
  // Every deprecated drop and data-grid prop at once.
  const deprecated = (
    Grid: React.ElementType,
    width = 1200
  ): React.ReactElement => (
    <Grid
      width={width}
      droppingItem={{ i: "drop", x: 0, y: 0, w: 1, h: 1 }}
      onDropDragOver={onDropDragOver}
    >
      <div key="a" data-grid={{ x: 0, y: 0, w: 1, h: 1 }} />
    </Grid>
  );
  const onDropDragOver = () => {};

  test("RGL_W014 onDropDragOver, RGL_W015 data-grid and RGL_W017 droppingItem warn once per grid", () => {
    const view = render(deprecated(GridLayout));
    view.rerender(deprecated(GridLayout, 1100));
    view.rerender(deprecated(GridLayout, 1000));
    expect(warnedCodes().sort()).toEqual(all);
  });

  test("each warns once under StrictMode", () => {
    render(<React.StrictMode>{deprecated(GridLayout)}</React.StrictMode>);
    expect(warnedCodes().sort()).toEqual(all);
  });

  test("a modern responsive grid warns each code once, not once per layer", () => {
    const view = render(deprecated(ResponsiveGridLayout));
    // Crossing a breakpoint must not warn again.
    view.rerender(deprecated(ResponsiveGridLayout, 500));
    expect(warnedCodes().sort()).toEqual(all);
  });

  test("the replacements are silent", () => {
    render(
      <GridLayout
        width={1200}
        layout={[{ i: "a", x: 0, y: 0, w: 1, h: 1 }]}
        dropConfig={{
          enabled: true,
          defaultItem: { i: "drop", w: 1, h: 1 },
          onDragOver: () => {}
        }}
      >
        <div key="a" />
      </GridLayout>
    );
    expect(warn).not.toHaveBeenCalled();
  });

  test.each([
    ["ReactGridLayout", ReactGridLayout],
    ["ResponsiveReactGridLayout", ResponsiveReactGridLayout]
  ] as const)("legacy <%s> with the same props is silent", (_name, Grid) => {
    render(deprecated(Grid));
    expect(warn).not.toHaveBeenCalled();
  });

  test("a modern grid nested in a legacy grid item still warns", () => {
    render(
      <ReactGridLayout width={1200}>
        <div key="a" data-grid={{ x: 0, y: 0, w: 4, h: 4 }}>
          <GridLayout width={400} onDropDragOver={onDropDragOver}>
            <div key="b" />
          </GridLayout>
        </div>
      </ReactGridLayout>
    );
    expect(warnedCodes()).toEqual(["RGL_W014"]);
  });

  test("a falsy data-grid, which the grid ignores, is silent", () => {
    render(
      <GridLayout width={1200} layout={[{ i: "a", x: 0, y: 0, w: 1, h: 1 }]}>
        <div key="a" data-grid={false} />
      </GridLayout>
    );
    expect(warn).not.toHaveBeenCalled();
  });

  test("all are silent in production", () => {
    inProduction(() => {
      render(deprecated(GridLayout));
    });
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("RGL_W009: direct GridItem flags", () => {
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
    i: "a"
  };

  test.each([
    ["useCSSTransforms", { useCSSTransforms: false }],
    ["usePercentages", { usePercentages: true }]
  ])("explicit %s without a strategy warns once", (_flag, flags) => {
    const view = render(
      <GridItem {...props} {...flags}>
        <div />
      </GridItem>
    );
    view.rerender(
      <GridItem {...props} {...flags} x={1}>
        <div />
      </GridItem>
    );
    expect(warnedCodes()).toEqual(["RGL_W009"]);
    const message = String(warn.mock.calls[0]![0]);
    expect(message).toContain("transformStrategy");
    expect(message).toContain("absoluteStrategy");
    expect(message).toContain("calcStyle");
  });

  test("flags behind a positionStrategy, or no flags at all, are silent", () => {
    render(
      <GridItem
        {...props}
        useCSSTransforms={false}
        positionStrategy={absoluteStrategy}
      >
        <div />
      </GridItem>
    );
    render(
      <GridItem {...props}>
        <div />
      </GridItem>
    );
    expect(warn).not.toHaveBeenCalled();
  });

  test("GridLayout's own items and placeholder are silent", () => {
    const view = render(
      <GridLayout width={1200} layout={[{ i: "a", x: 0, y: 0, w: 1, h: 1 }]}>
        <div key="a" />
      </GridLayout>
    );
    // Drag to render the placeholder GridItem, which passes useCSSTransforms
    // without a strategy.
    const mouse = (node: Element | Document, type: string, x: number) =>
      act(() => {
        node.dispatchEvent(
          new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            button: 0,
            buttons: type === "mouseup" ? 0 : 1,
            clientX: x,
            clientY: 5
          })
        );
      });
    const item = view.container.querySelector(".react-grid-item")!;
    mouse(item, "mousedown", 5);
    mouse(document, "mousemove", 200);
    expect(
      view.container.querySelector(".react-grid-placeholder")
    ).not.toBeNull();
    mouse(document, "mouseup", 200);
    expect(warn).not.toHaveBeenCalled();
  });

  test("is silent in production", () => {
    inProduction(() => {
      render(
        <GridItem {...props} useCSSTransforms={false}>
          <div />
        </GridItem>
      );
    });
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("assertLayoutStructure (RGL_W013 replacement)", () => {
  test("is exported from /core and the root next to validateLayout", () => {
    expect(typeof assertLayoutStructure).toBe("function");
    expect(root.assertLayoutStructure).toBe(assertLayoutStructure);
    expect(root.validateLayout).toBe(validateLayout);
  });

  const rejected: Array<[string, unknown, string | undefined, string]> = [
    ["a non-array", { length: 0 }, undefined, "Layout must be an array!"],
    [
      "a missing x",
      [{ i: "a", y: 0, w: 1, h: 1 }],
      undefined,
      "ReactGridLayout: Layout[0].x must be a number! Received: undefined (undefined)"
    ],
    [
      "a NaN h with a context name",
      [{ i: "a", x: 0, y: 0, w: 1, h: Number.NaN }],
      "layouts.lg",
      "ReactGridLayout: layouts.lg[0].h must be a number! Received: NaN (number)"
    ],
    [
      "a numeric i",
      [{ i: 7, x: 0, y: 0, w: 1, h: 1 }],
      undefined,
      "ReactGridLayout: Layout[0].i must be a string! Received: 7 (number)"
    ]
  ];
  test.each(rejected)(
    "rejects %s with validateLayout's message",
    (_name, input, contextName, message) => {
      expect(() => assertLayoutStructure(input as Layout, contextName)).toThrow(
        message
      );
      expect(() => validateLayout(input as Layout, contextName)).toThrow(
        message
      );
    }
  );

  test("accepts what validateLayout accepts, Infinity and out-of-bounds included, and never changes input", () => {
    const input: Layout = Object.freeze([
      Object.freeze({ i: "a", x: -50, y: Infinity, w: 1e9, h: 1 })
    ]);
    expect(assertLayoutStructure(input)).toBeUndefined();
    expect(() => validateLayout(input)).not.toThrow();
    expect(input[0]).toEqual({ i: "a", x: -50, y: Infinity, w: 1e9, h: 1 });
  });
});

describe("dropConfig.defaultItem.i (RGL_W017 replacement)", () => {
  function dropWith(defaultItem: DropConfig["defaultItem"]) {
    const onDrop = jest.fn();
    const view = render(
      <GridLayout
        width={1200}
        layout={[{ i: "a", x: 0, y: 0, w: 2, h: 2 }]}
        gridConfig={{ cols: 12, rowHeight: 30 }}
        compactor={verticalCompactor}
        dropConfig={{ enabled: true, defaultItem }}
        onDrop={onDrop}
      >
        <div key="a" />
      </GridLayout>
    );
    const drop = dropExternal(view.container);
    try {
      drop.enter({ x: 400, y: 15 });
      drop.over({ x: 400, y: 15 });
      drop.drop();
    } finally {
      drop.uninstall();
    }
    return onDrop.mock.calls[0] as [Layout, LayoutItem];
  }

  test("names the dropped item", () => {
    const [final, item] = dropWith({ i: "new", w: 2, h: 1 });
    expect(item).toMatchObject({ i: "new", w: 2, h: 1 });
    expect(final.map(l => l.i).sort()).toEqual(["a", "new"]);
    expect(warn).not.toHaveBeenCalled();
  });

  test("an undefined defaultItem falls back to the default item", () => {
    expect(() =>
      render(
        <GridLayout width={1200} dropConfig={{ defaultItem: undefined }}>
          <div key="a" />
        </GridLayout>
      )
    ).not.toThrow();
  });

  test("carries the rest of a droppingItem, such as minW", () => {
    const [, item] = dropWith({ i: "new", w: 2, h: 1, minW: 2 });
    expect(item).toMatchObject({ i: "new", w: 2, minW: 2 });
  });

  test("RGL_W018: an item that uses the dropping id warns once per grid", () => {
    const grid = (width: number) => (
      <GridLayout
        width={width}
        layout={[{ i: "new", x: 0, y: 0, w: 1, h: 1 }]}
        dropConfig={{ enabled: true, defaultItem: { i: "new", w: 1, h: 1 } }}
      >
        <div key="new" />
      </GridLayout>
    );
    const view = render(grid(1200));
    view.rerender(grid(1100));
    expect(warnedCodes()).toEqual(["RGL_W018"]);
    expect(String(warn.mock.calls[0]![0])).toContain('"new"');
  });

  test("RGL_W018 is silent when dropping is off or the ids differ", () => {
    render(
      <GridLayout
        width={1200}
        layout={[{ i: "new", x: 0, y: 0, w: 1, h: 1 }]}
        dropConfig={{ enabled: false, defaultItem: { i: "new", w: 1, h: 1 } }}
      >
        <div key="new" />
      </GridLayout>
    );
    render(
      <GridLayout
        width={1200}
        layout={[{ i: "a", x: 0, y: 0, w: 1, h: 1 }]}
        dropConfig={{ enabled: true, defaultItem: { i: "new", w: 1, h: 1 } }}
      >
        <div key="a" />
      </GridLayout>
    );
    expect(warn).not.toHaveBeenCalled();
  });

  test("an explicit i: undefined keeps the default id", () => {
    const [, item] = dropWith({ i: undefined, w: 1, h: 1 });
    expect(item.i).toBe("__dropping-elem__");
  });
});
