import React from "react";
import { render, type RenderResult } from "@testing-library/react";
import { deepEqual } from "fast-equals";
import { withRecorder } from "../recorder";
import { GridLayout } from "../../../src/react/components/GridLayout";
import {
  useGridLayout,
  type UseGridLayoutResult
} from "../../../src/react/hooks/useGridLayout";
import {
  horizontalCompactor,
  noCompactor,
  verticalCompactor,
  verticalOverlapCompactor
} from "../../../src/core/compactors";
import type { Compactor, Layout } from "../../../src/core/types";
import { HookGrid, hookGridConfig, hookState } from "../hookHarness";
import { installGridGeometry } from "../geometry";
import { createPointer, resizeHandle } from "../pointer";
import { expectGolden } from "../expectGolden";
import { serialize } from "../serialize";

type Implementation = "component" | "hook";
type GridProps = {
  layout: Layout;
  cols: number;
  compactor: Compactor;
  preventCollision: boolean;
};
const initial: Layout = [
  { i: "a", x: 0, y: 0, w: 2, h: 2 },
  { i: "b", x: 2, y: 0, w: 2, h: 2 },
  { i: "c", x: 0, y: 2, w: 2, h: 2 }
];
const children = initial.map(item => (
  <div key={item.i} data-item={item.i}>
    {item.i}
  </div>
));

function mount(
  implementation: Implementation,
  strict: boolean,
  options: Partial<GridProps> = {}
) {
  const recorder = withRecorder();
  let props: GridProps = {
    layout: initial,
    cols: 6,
    compactor: verticalCompactor,
    preventCollision: false,
    ...options
  };
  let api: UseGridLayoutResult | undefined;
  let view: RenderResult;
  let geometry: ReturnType<typeof installGridGeometry>;
  const observe = (next: UseGridLayoutResult) => {
    api = next;
  };
  const tree = () => {
    const element =
      implementation === "component" ? (
        <GridLayout
          {...recorder.props}
          width={600}
          layout={props.layout}
          gridConfig={{ ...hookGridConfig, cols: props.cols }}
          dragConfig={{ threshold: 0 }}
          resizeConfig={{ handles: ["se", "n"] }}
          compactor={props.compactor}
        >
          {children}
        </GridLayout>
      ) : (
        <HookGrid {...props} recorder={recorder} observe={observe}>
          {children}
        </HookGrid>
      );
    return recorder.wrap(
      strict ? <React.StrictMode>{element}</React.StrictMode> : element
    );
  };
  function step(input: object, action: () => void) {
    recorder.step(input, action);
    geometry?.refresh();
    if (api)
      recorder.trace[recorder.trace.length - 1].hookState = serialize(
        hookState(api)
      );
  }
  step({ type: "mount" }, () => {
    view = render(tree());
    recorder.attach(view.container);
    geometry = installGridGeometry(view.container, { width: 600, height: 500 });
  });
  const pointer = createPointer({ step });
  return {
    recorder,
    step,
    pointer,
    item(id: string) {
      const node = view.container.querySelector<HTMLElement>(
        `[data-item="${id}"]`
      );
      if (!node) throw new Error(`Missing item ${id}`);
      return node;
    },
    handle(id: string, axis: string) {
      return resizeHandle(view.container, id, axis);
    },
    setProps(input: string, patch: Partial<GridProps>) {
      step({ type: "setProps", change: input }, () => {
        props = { ...props, ...patch };
        view.rerender(tree());
      });
    },
    finish() {
      step({ type: "unmount" }, () => view.unmount());
      geometry.uninstall();
      return recorder.trace;
    }
  };
}

type Fixture = ReturnType<typeof mount>;

/** The exact same client coordinates and document events reach both assemblies. */
function gestures(grid: Fixture) {
  grid.pointer.down(grid.item("a"), { x: 20, y: 20 });
  grid.pointer.move({ x: 24, y: 22 });
  grid.pointer.move({ x: 125, y: 20 });
  grid.pointer.move({ x: 225, y: 60 });
  grid.pointer.up();
  grid.pointer.down(grid.handle("b", "se"), { x: 380, y: 65 });
  grid.pointer.move({ x: 384, y: 68 });
  grid.pointer.move({ x: 480, y: 105 });
  grid.pointer.up();
  grid.pointer.down(grid.handle("c", "n"), { x: 90, y: 85 });
  grid.pointer.move({ x: 90, y: 45 });
  grid.pointer.up();
}

function disagreements(component: any[], hook: any[]) {
  expect(hook.map(step => step.input)).toEqual(
    component.map(step => step.input)
  );
  return component.map((step, index) => {
    const peer = hook[index];
    const componentChanges = step.callbacks.filter(
      (callback: any) => callback.name === "onLayoutChange"
    );
    const hookChanges = peer.callbacks.filter(
      (callback: any) => callback.name === "onLayoutChange"
    );
    const differences = [];
    if (!deepEqual(step.dom.items, peer.dom.items)) differences.push("items");
    if (!deepEqual(step.dom.placeholder, peer.dom.placeholder))
      differences.push("placeholder");
    if (step.dom.containerHeight !== peer.dom.containerHeight)
      differences.push("containerHeight");
    if (!deepEqual(componentChanges, hookChanges))
      differences.push("onLayoutChange");
    return {
      input: step.input,
      differences,
      onLayoutChange: {
        component: componentChanges.length,
        hook: hookChanges.length
      }
    };
  });
}

function differential(
  scenario: string,
  variant: string,
  strict: boolean,
  props: Partial<GridProps>,
  script: (grid: Fixture) => void
) {
  const run = (implementation: Implementation) => {
    const grid = mount(implementation, strict, props);
    try {
      script(grid);
      return grid.finish();
    } catch (error) {
      grid.finish();
      throw error;
    }
  };
  const component = run("component");
  const hook = run("hook");
  expectGolden(scenario, `${variant}-component`, component, {
    strict,
    boundary: "GridLayout"
  });
  expectGolden(scenario, `${variant}-hook`, hook, {
    strict,
    boundary: "useGridLayout assembled with real GridItems"
  });
  expectGolden(
    scenario,
    `${variant}-disagreements`,
    disagreements(component, hook),
    {
      strict,
      callbackComparison:
        "Only onLayoutChange is shared by both public APIs. Hook GridItem callbacks are native-event notes.",
      resizeAdapter:
        "Dimensions are forwarded. The public hook supplies no resize handle geometry or resize placeholder."
    }
  );
}

describe.each([false, true])(
  "native hook/component differential strict=%s",
  strict => {
    const strictName = strict ? "strict" : "normal";
    test.each([
      ["vertical", verticalCompactor, false],
      ["horizontal", horizontalCompactor, false],
      ["none", noCompactor, false],
      ["overlap", verticalOverlapCompactor, false],
      [
        "prevent-collision",
        { ...verticalCompactor, preventCollision: true },
        true
      ]
    ] as const)(
      "pins drag and resize drift with %s",
      (name, compactor, preventCollision) => {
        differential(
          "hook-native-gestures",
          `${strictName}-${name}`,
          strict,
          { compactor, preventCollision },
          gestures
        );
      }
    );

    test("pins a controlled layout update received during a drag", () => {
      differential(
        "hook-controlled-during-drag",
        strictName,
        strict,
        {},
        grid => {
          grid.pointer.down(grid.item("a"), { x: 20, y: 20 });
          grid.pointer.move({ x: 225, y: 20 });
          grid.setProps("layout-during-drag", {
            layout: initial.map(item =>
              item.i === "a" ? { ...item, x: 4, y: 5 } : item
            )
          });
          grid.pointer.move({ x: 325, y: 60 });
          grid.pointer.up();
          grid.setProps("parent-rerender-same-layout", {});
        }
      );
    });

    test("pins cols correction and compactor replacement drift", () => {
      const layout = initial.map(item =>
        item.i === "a" ? { ...item, x: 10, y: 5 } : item
      );
      differential(
        "hook-cols-and-compactor-sync",
        strictName,
        strict,
        { layout, cols: 12, compactor: noCompactor },
        grid => {
          grid.setProps("cols-12-to-6", { cols: 6 });
          grid.setProps("none-to-vertical", { compactor: verticalCompactor });
          grid.setProps("vertical-to-overlap-same-type", {
            compactor: verticalOverlapCompactor
          });
          grid.setProps("controlled-layout", { layout: initial });
        }
      );
    });
  }
);

const LOOP_SENTINEL = "golden inline layout render cap";
const RENDER_CAP = 12;

class LoopBoundary extends React.Component<
  { children: React.ReactNode; caught: (error: string) => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    if (error.message !== LOOP_SENTINEL) throw error;
    this.props.caught(error.message);
  }
  render() {
    return this.state.failed ? (
      <div data-loop-cap="caught" />
    ) : (
      this.props.children
    );
  }
}

describe.each([false, true])("guarded inline layout strict=%s", strict => {
  test("pins non-convergence with a finite render cap", () => {
    for (const implementation of ["component", "hook"] as const) {
      const recorder = withRecorder();
      let renders = 0;
      let caught: string | null = null;
      let view: RenderResult;
      function InlineLayout() {
        renders++;
        // Bail out before invoking the hook after the finite cap. The audit's
        // unbounded U probe must never run in this suite.
        if (renders > RENDER_CAP) throw new Error(LOOP_SENTINEL);
        const layout = [{ i: "a", x: 0, y: 5, w: 1, h: 1 }];
        if (implementation === "hook") {
          return <InlineHook layout={layout} />;
        }
        return (
          <GridLayout
            width={600}
            layout={layout}
            onLayoutChange={recorder.props.onLayoutChange}
          >
            <div key="a" data-item="a" />
          </GridLayout>
        );
      }
      function InlineHook({ layout }: { layout: Layout }) {
        // Put the inline literal at the hook owner. Its identity changes on
        // every state render, exactly as in the audit's U seed.
        renders++;
        if (renders > RENDER_CAP) throw new Error(LOOP_SENTINEL);
        const api = useGridLayout({
          layout: layout.map(item => ({ ...item })),
          cols: 12,
          onLayoutChange: recorder.props.onLayoutChange
        });
        return <div data-item="a" data-layout={JSON.stringify(api.layout)} />;
      }
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      try {
        recorder.step(
          { type: "mount-inline-layout", renderCap: RENDER_CAP },
          () => {
            const element = (
              <LoopBoundary
                caught={message => {
                  caught = message;
                }}
              >
                <InlineLayout />
              </LoopBoundary>
            );
            view = render(
              recorder.wrap(
                strict ? (
                  <React.StrictMode>{element}</React.StrictMode>
                ) : (
                  element
                )
              )
            );
            recorder.attach(view.container);
          }
        );
        recorder.step({ type: "record-termination" }, () =>
          recorder.note({
            renders,
            renderCap: RENDER_CAP,
            caught,
            bailedOut: caught === LOOP_SENTINEL
          })
        );
        expect(caught === LOOP_SENTINEL).toBe(implementation === "hook");
        if (implementation === "hook")
          expect(renders).toBeGreaterThan(RENDER_CAP);
        recorder.step({ type: "unmount" }, () => view.unmount());
        expectGolden(
          "hook-inline-layout-render-cap",
          `${strict ? "strict" : "normal"}-${implementation}`,
          recorder.trace,
          {
            renderCap: RENDER_CAP,
            expectedError: LOOP_SENTINEL,
            knownBug:
              "hook-inline-layout-loop: inline layout literal causes non-convergence, stopped by render cap"
          }
        );
      } finally {
        consoleError.mockRestore();
      }
    }
  });
});
