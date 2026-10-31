import React from "react";
import { render } from "@testing-library/react";
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { runInNewContext } from "node:vm";
import path from "node:path";
import { transformSync } from "@babel/core";
import { collides, getFirstCollision } from "../../src/core/collision";
import { cloneLayoutItem, getStatics } from "../../src/core/layout";
import { verticalCompactor } from "../../src/core/compactors";
import { GridLayout } from "../../src/react/components/GridLayout";
import { counterNames, measure, onItemRender, type Counts } from "./counters";
import { runScenarios } from "./scenarios";

// Put the Profiler inside the original memo boundary. Wrapping the exported
// memo from outside would count parent commits even when the item bails out.
jest.mock("../../src/react/components/GridItem", () => {
  const React = jest.requireActual("react") as typeof import("react");
  const actual = jest.requireActual("../../src/react/components/GridItem");
  const { onItemRender } = jest.requireActual("./counters");
  const GridItem = React.memo(
    (props: any) =>
      React.createElement(
        React.Profiler,
        {
          id: props.className?.includes("react-grid-placeholder")
            ? "placeholder"
            : props.i,
          onRender: onItemRender
        },
        React.createElement(actual.GridItem.type, props)
      ),
    actual.GridItem.compare
  );
  GridItem.displayName = "BenchGridItem";
  return { ...actual, GridItem, default: GridItem };
});

type Baseline = {
  scenarios: Record<string, Counts>;
};
const baselinePath = path.join(__dirname, "baseline.json");

beforeAll(() => {
  const fixtures = [
    {
      file: "collision.ts",
      code: "function collides() {} function getFirstCollision() { collides(); } getFirstCollision();",
      expected: [
        "core/collision.ts:getFirstCollision",
        "core/collision.ts:collides"
      ]
    },
    {
      file: "layout.ts",
      code: "function cloneLayoutItem() {} function cloneLayout() { cloneLayoutItem(); } cloneLayout();",
      expected: ["core/layout.ts:cloneLayout", "core/layout.ts:cloneLayoutItem"]
    },
    {
      file: "../extras/probe.ts",
      code: `const strategy = { run() {
        const named = function () { for (let i = 0; i < 2; i++) {} };
        const arrow = () => [1, 2].map(value => value);
        named(); arrow();
        let i = 0; while (i++ < 2) {} do { i--; } while (i > 0);
        for (const value of [1, 2]) { if (value === 2) continue; }
        for (const key in { a: 1, b: 2 }) {}
      } }; strategy.run();`,
      expected: [
        "extras/probe.ts:strategy.run",
        "extras/probe.ts:strategy.run.named",
        ...Array(2).fill("extras/probe.ts:strategy.run.named:loop1"),
        "extras/probe.ts:strategy.run.arrow",
        ...Array(2).fill("extras/probe.ts:strategy.run.arrow.callback1"),
        ...Array(2).fill("extras/probe.ts:strategy.run:loop1"),
        ...Array(3).fill("extras/probe.ts:strategy.run:loop2"),
        ...Array(2).fill("extras/probe.ts:strategy.run:loop3"),
        ...Array(2).fill("extras/probe.ts:strategy.run:loop4")
      ]
    },
    {
      file: "../react/components/GridItem.tsx",
      code: "function GridItemInner(renamed) { return renamed.i; } GridItemInner({ i: '0' });",
      expected: ["GridItemInner"]
    }
  ];
  for (const fixture of fixtures) {
    for (const lowered of [false, true]) {
      const entries: string[] = [];
      const transformed = transformSync(
        `// unrelated comment\n\n${fixture.code}`,
        {
          babelrc: false,
          configFile: false,
          filename: path.resolve(__dirname, "../../src/core", fixture.file),
          plugins: [require.resolve("./instrument.cjs")],
          presets: lowered
            ? [["@babel/preset-env", { targets: { ie: "11" } }]]
            : []
        }
      )!.code!;
      runInNewContext(transformed, {
        __RGL_BENCH__: {
          __RGL_BENCH_COUNT__: (name: string, props?: { i: string }) => {
            entries.push(name);
            if (name === "GridItemInner") expect(props).toEqual({ i: "0" });
          }
        }
      });
      expect(entries).toEqual(fixture.expected);
    }
  }
});

function regressions(
  actual: Record<string, Counts>,
  expected: Record<string, Counts>
): string[] {
  const diff: string[] = [];
  const scenarios = [
    ...new Set([...Object.keys(actual), ...Object.keys(expected)])
  ].sort();
  for (const scenario of scenarios) {
    if (!Object.hasOwn(actual, scenario)) {
      diff.push(`${scenario}: missing scenario in measurement`);
    }
    if (!Object.hasOwn(expected, scenario)) {
      diff.push(`${scenario}: missing scenario in baseline`);
    }
    for (const counter of new Set([
      ...Object.keys(actual[scenario] ?? {}),
      ...Object.keys(expected[scenario] ?? {})
    ])) {
      const before = expected[scenario]?.[counter];
      const after = actual[scenario]?.[counter];
      if (
        !Number.isSafeInteger(before) ||
        before < 0 ||
        !Number.isSafeInteger(after) ||
        after < 0
      ) {
        diff.push(
          `${scenario} ${counter}: missing/invalid budget or measurement (${before} -> ${after})`
        );
      } else if (after !== before) {
        diff.push(
          `${scenario} ${counter}: ${before} -> ${after} (${after > before ? "+" : ""}${after - before})`
        );
      }
    }
  }
  return diff;
}

// One scenario per line, sorted keys. No clocks, platform names, or Jest timings.
function serialize(baseline: Baseline): string {
  const lines = (value: Record<string, unknown>) =>
    Object.keys(value)
      .sort()
      .map(key => {
        const row = value[key] as Record<string, unknown>;
        const sorted = Object.fromEntries(
          Object.keys(row)
            .sort()
            .map(name => [name, row[name]])
        );
        return `    ${JSON.stringify(key)}: ${JSON.stringify(sorted)}`;
      })
      .join(",\n");
  return `{\n  "scenarios": {\n${lines(baseline.scenarios)}\n  }\n}\n`;
}

beforeAll(() => {
  const item = { i: "0", x: 0, y: 0, w: 1, h: 1 };
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetParent"
  );
  const rect = Element.prototype.getBoundingClientRect;
  const style = window.getComputedStyle;
  const arrayDescriptors = () =>
    Reflect.ownKeys(Array.prototype).map(key => [
      key,
      Object.getOwnPropertyDescriptor(Array.prototype, key)
    ]);
  const arrays = arrayDescriptors();
  const counts = measure(() => {
    collides(item, item);
    getFirstCollision([], item);
    cloneLayoutItem(item);
    getStatics([item]);
    [item].sort(() => 0);
    // Empty, primitive, and sparse arrays are work too.
    [].sort();
    [3, 2].sort();
    new Array(2).sort();
    const values = [1, 2];
    values.map(value => value);
    values.some(value => value === 1);
    values.find(value => value === 2);
    values.slice();
    values.includes(1);
    void [...values];
    [item].indexOf(item);
    [item].findIndex(value => value.i === "0");
    const element = document.createElement("div");
    element.getBoundingClientRect();
    void element.offsetParent;
    void element.clientHeight;
    window.getComputedStyle(element);
  });
  expect(counts).toMatchObject({
    collides: 1,
    getFirstCollision: 1,
    cloneLayoutItem: 1,
    getStatics: 1,
    filter: 1,
    sort: 4,
    map: 1,
    some: 1,
    find: 1,
    slice: 1,
    includes: 1,
    arrayIterator: 1,
    indexOf: 1,
    findIndex: 1,
    getBoundingClientRect: 1,
    offsetParent: 1,
    clientHeight: 1,
    getComputedStyle: 1
  });
  expect(() =>
    measure(() => {
      throw new Error("probe failure");
    })
  ).toThrow("probe failure");
  expect(arrayDescriptors()).toEqual(arrays);
  expect(Element.prototype.getBoundingClientRect).toBe(rect);
  expect(window.getComputedStyle).toBe(style);
  expect(
    Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetParent")
  ).toEqual(descriptor);
  expect(measure(() => {})).toEqual(
    Object.fromEntries(counterNames.map(key => [key, 0]))
  );
  expect(
    measure(() => {
      verticalCompactor.compact([], 12);
    }).compact
  ).toBe(1);
});

beforeAll(() => {
  const element = (text: string) =>
    React.createElement(
      React.Profiler,
      { id: "0", onRender: onItemRender },
      React.createElement("div", null, text)
    );
  const view = render(element("before"));
  try {
    const counts = measure(() => view.rerender(element("after")));
    expect(counts).toMatchObject({
      gridItemCommits: 1,
      gridItemMaxCommits: 1,
      idleItemCommits: 0,
      placeholderCommits: 0
    });
  } finally {
    view.unmount();
  }
});

beforeAll(() => {
  const layout = [{ i: "0", x: 0, y: 0, w: 1, h: 1 }];
  const child = React.createElement("div", { key: "0" });
  const element = (width: number) =>
    React.createElement(GridLayout, { width, layout }, child);
  const view = render(element(1200));
  try {
    const counts = measure(() => view.rerender(element(600)));
    expect(counts).toMatchObject({
      gridLayoutRenders: 1,
      gridItemRenders: 1,
      idleItemRenders: 0
    });
  } finally {
    view.unmount();
  }
});

test("baseline gate requires exact counts and reports missing counters", () => {
  const zero = Object.fromEntries(counterNames.map(key => [key, 0])) as Counts;
  const budget = { ...zero, sort: 2 };
  expect(
    regressions({ frame: { ...zero, sort: 1 } }, { frame: budget })
  ).toEqual(["frame sort: 2 -> 1 (-1)"]);
  expect(regressions({ frame: budget }, { frame: budget })).toEqual([]);
  expect(
    regressions({ frame: { ...zero, sort: 3 } }, { frame: budget })
  ).toEqual(["frame sort: 2 -> 3 (+1)"]);
  expect(regressions({}, { frame: budget })).toContain(
    "frame sort: missing/invalid budget or measurement (2 -> undefined)"
  );
  expect(regressions({ frame: {} }, { frame: { retired: 0 } })).toEqual([
    "frame retired: missing/invalid budget or measurement (0 -> undefined)"
  ]);
  expect(regressions({ frame: { added: 0 } }, { frame: {} })).toEqual([
    "frame added: missing/invalid budget or measurement (undefined -> 0)"
  ]);
  expect(regressions({}, { empty: {} })).toEqual([
    "empty: missing scenario in measurement"
  ]);
  expect(regressions({ empty: {} }, {})).toEqual([
    "empty: missing scenario in baseline"
  ]);
});

test("operation counts must equal the committed baseline", () => {
  if (process.env.BENCH_UPDATE === "1" && process.env.CI) {
    throw new Error("BENCH_UPDATE cannot rewrite operation budgets in CI.");
  }
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8")) as Baseline;
  const scenarios = runScenarios();
  if (process.env.BENCH_UPDATE === "1") {
    // Write only after every scenario and its interaction assertions succeed.
    const temporary = `${baselinePath}.tmp`;
    writeFileSync(temporary, serialize({ scenarios }));
    renameSync(temporary, baselinePath);
  } else {
    const diff = regressions(scenarios, baseline.scenarios);
    if (diff.length > 0)
      throw new Error(
        `Operation counts changed:\n${diff.join("\n")}\nFor decreases, run yarn bench:ops:update and commit the baseline to record the savings. Justify increases in the PR before updating the baseline.`
      );
  }
  // Stable JSON is useful for comparing consecutive fresh Jest processes.
  console.log(JSON.stringify(scenarios));
}, 120_000);
