import React from "react";
import { render } from "@testing-library/react";
import { withRecorder } from "./recorder";
import GridLayout from "../../src/react/components/GridLayout";
import ResponsiveGridLayout from "../../src/react/components/ResponsiveGridLayout";
import LegacyGridLayout from "../../src/legacy/ReactGridLayout";
import LegacyResponsive from "../../src/legacy/ResponsiveReactGridLayout";
import {
  absoluteStrategy,
  transformStrategy,
  createScaledStrategy,
  getCompactor
} from "../../src/core";
import { wrapCompactor } from "../../src/extras/wrapCompactor";
import type { Layout, Compactor } from "../../src/core/types";
import { installGridGeometry, type GeometryOptions } from "./geometry";
import { createPointer } from "./pointer";

export type Variant = {
  name: string;
  strict?: boolean;
  api?: "v2" | "legacy";
  strategy?: "transform" | "absolute" | "scaled";
  compact?: "vertical" | "horizontal" | "wrap" | null;
  preventCollision?: boolean;
  allowOverlap?: boolean;
  bounded?: boolean;
};

export const variants: Variant[] = [
  { name: "vertical", compact: "vertical" },
  { name: "horizontal", compact: "horizontal" },
  { name: "none", compact: null },
  { name: "wrap", compact: "wrap" },
  { name: "prevent", compact: "vertical", preventCollision: true },
  { name: "overlap", compact: "vertical", allowOverlap: true },
  { name: "absolute", compact: null, strategy: "absolute" },
  { name: "scaled", compact: null, strategy: "scaled" },
  { name: "bounded", compact: null, bounded: true },
  { name: "strict", compact: "vertical", strict: true },
  { name: "legacy", compact: "vertical", api: "legacy" },
  { name: "legacy-scaled", compact: null, api: "legacy", strategy: "scaled" }
];

export const gridConfig = {
  cols: 6,
  rowHeight: 100,
  margin: [0, 0] as const,
  containerPadding: [0, 0] as const
};
export const initialLayout: Layout = [
  { i: "a", x: 0, y: 0, w: 1, h: 1 },
  { i: "b", x: 1, y: 0, w: 1, h: 1 },
  { i: "c", x: 2, y: 0, w: 1, h: 1 }
];

export function childrenFor(layout: Layout) {
  return layout.map(item => (
    <div key={item.i} data-item={item.i}>
      {item.i}
    </div>
  ));
}

export function mountGrid(
  options: {
    variant?: Variant;
    layout?: Layout;
    props?: Record<string, any>;
    children?: React.ReactNode;
    responsive?: boolean;
    handlers?: Record<string, (...args: any[]) => any>;
    geometry?: GeometryOptions;
  } = {}
) {
  const variant = options.variant ?? variants[0];
  const scale = variant.strategy === "scaled" ? 0.5 : 1;
  const strategy =
    variant.strategy === "absolute"
      ? absoluteStrategy
      : variant.strategy === "scaled"
        ? createScaledStrategy(scale)
        : transformStrategy;
  const compactor: Compactor =
    variant.compact === "wrap"
      ? {
          ...wrapCompactor,
          preventCollision: variant.preventCollision,
          allowOverlap: !!variant.allowOverlap
        }
      : getCompactor(
          variant.compact === undefined ? "vertical" : variant.compact,
          !!variant.allowOverlap,
          !!variant.preventCollision
        );
  const recorder = withRecorder(options.handlers);
  let children =
    options.children ?? childrenFor(options.layout ?? initialLayout);
  let props: Record<string, any> = {
    width: 600,
    autoSize: false,
    style: { height: 600 },
    ...(options.responsive
      ? {
          layouts: { lg: options.layout ?? initialLayout },
          breakpoints: { lg: 500, sm: 0 },
          cols: { lg: 6, sm: 3 }
        }
      : { layout: options.layout ?? initialLayout }),
    ...(variant.api === "legacy"
      ? {
          cols: options.responsive ? { lg: 6, sm: 3 } : 6,
          rowHeight: 100,
          margin: [0, 0],
          containerPadding: [0, 0],
          compactType:
            variant.compact === undefined ? "vertical" : variant.compact,
          preventCollision: !!variant.preventCollision,
          allowOverlap: !!variant.allowOverlap,
          isBounded: !!variant.bounded,
          useCSSTransforms: variant.strategy !== "absolute",
          transformScale: scale
        }
      : {
          gridConfig,
          compactor,
          positionStrategy: strategy,
          dragConfig: { bounded: !!variant.bounded },
          ...(options.responsive
            ? // Responsive reads a flat rowHeight and ignores gridConfig's, so
              // pass it here to match the legacy fixture's geometry.
              { margin: [0, 0], containerPadding: [0, 0], rowHeight: 100 }
            : {})
        }),
    ...options.props
  };
  if (props.dropConfig?.onDragOver) {
    props = {
      ...props,
      dropConfig: {
        ...props.dropConfig,
        onDragOver: recorder.traced(
          "dropConfig.onDragOver",
          props.dropConfig.onDragOver
        )
      }
    };
  }
  const Component: any = options.responsive
    ? variant.api === "legacy"
      ? LegacyResponsive
      : ResponsiveGridLayout
    : variant.api === "legacy"
      ? LegacyGridLayout
      : GridLayout;
  const tree = () =>
    recorder.wrap(
      variant.strict ? (
        <React.StrictMode>
          <Component {...recorder.props} {...props}>
            {children}
          </Component>
        </React.StrictMode>
      ) : (
        <Component {...recorder.props} {...props}>
          {children}
        </Component>
      )
    );
  let result: ReturnType<typeof render>;
  recorder.step({ kind: "mount", variant: variant.name }, () => {
    result = render(tree());
    recorder.attach(result.container);
  });
  const geometryOptions = {
    width: props.width,
    height: 600,
    scale,
    ...options.geometry
  };
  const geometry = installGridGeometry(result!.container, geometryOptions);
  const step = (input: object, action: () => void) => {
    geometry.refresh();
    recorder.step(input, action);
    geometry.refresh();
  };
  const pointer = createPointer({ step });
  return {
    recorder,
    container: result!.container,
    pointer,
    geometry,
    step,
    variant,
    scale,
    item(id: string) {
      const node = result!.container.querySelector<HTMLElement>(
        `[data-item="${id}"]`
      );
      if (!node) throw new Error(`Missing grid item ${id}`);
      return node;
    },
    rerenderProps(patch: Record<string, any>, nextChildren?: React.ReactNode) {
      step(
        {
          kind: "rerender",
          props: patch,
          ...(nextChildren ? { children: "changed" } : {})
        },
        () => {
          props = { ...props, ...patch };
          geometryOptions.width = props.width;
          if (nextChildren !== undefined) children = nextChildren;
          result!.rerender(tree());
        }
      );
    },
    unmount() {
      step({ kind: "unmount" }, () => result!.unmount());
      geometry.uninstall();
    }
  };
}

export type GridFixture = ReturnType<typeof mountGrid>;

/** Move relative to the live rect. Cell edges are 100 logical pixels here. */
export function drag(fixture: GridFixture, id: string, moves: number[][]) {
  const rect = fixture.item(id).getBoundingClientRect();
  const origin = {
    x: rect.left + 20 * fixture.scale,
    y: rect.top + 20 * fixture.scale
  };
  fixture.pointer.down(fixture.item(id), origin);
  for (const [x, y] of moves)
    fixture.pointer.move({
      x: origin.x + x * fixture.scale,
      y: origin.y + y * fixture.scale
    });
  fixture.pointer.up();
}
