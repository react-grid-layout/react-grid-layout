import {
  gridBounds,
  minMaxSize,
  containerBounds,
  boundedX,
  boundedY,
  aspectRatio,
  snapToGrid,
  minSize,
  maxSize,
  defaultConstraints,
  applyPositionConstraints,
  applySizeConstraints
} from "../../../src/core/constraints";
import type {
  ConstraintContext,
  LayoutConstraint,
  LayoutItem,
  ResizeHandleAxis
} from "../../../src/core/types";
import { capture } from "../capture";
import { expectGolden } from "../expectGolden";

const handles: ResizeHandleAxis[] = [
  "n",
  "ne",
  "e",
  "se",
  "s",
  "sw",
  "w",
  "nw"
];
const item: LayoutItem = { i: "active", x: 3, y: 2, w: 2, h: 3 };
const context: ConstraintContext = {
  cols: 12,
  maxRows: 10,
  containerWidth: 1200,
  containerHeight: 263,
  rowHeight: 30,
  margin: [10, 3],
  layout: [item, { i: "other", x: 0, y: 0, w: 1, h: 1 }]
};

type Factory = "aspectRatio" | "snapToGrid" | "minSize" | "maxSize";
interface FactorySpec {
  factory: Factory;
  args: [number, number?];
}

function makeConstraint({ factory, args }: FactorySpec): LayoutConstraint {
  switch (factory) {
    case "aspectRatio": {
      return aspectRatio(args[0]);
    }
    case "snapToGrid": {
      return snapToGrid(args[0], args[1]);
    }
    case "minSize": {
      return minSize(args[0], args[1]!);
    }
    case "maxSize": {
      return maxSize(args[0], args[1]!);
    }
  }
}

// Golden rows pin public constraint results, errors, method omission, and
// grid-before-item ordering. Credible regressions include using maxRows for
// visible bounds, ignoring a handle side, or reversing an ordered chain.
describe("constraint golden behavior", () => {
  it("pins each singleton's direct position limits and visible-row fallback", () => {
    const constraints = [
      gridBounds,
      minMaxSize,
      containerBounds,
      boundedX,
      boundedY
    ];
    const contexts = [
      { id: "visible", value: context },
      { id: "auto-height", value: { ...context, containerHeight: 0 } },
      { id: "negative-height", value: { ...context, containerHeight: -1 } },
      {
        id: "unbounded",
        value: { ...context, containerHeight: 0, maxRows: Infinity }
      },
      { id: "less-than-one-row", value: { ...context, containerHeight: 1 } }
    ];
    const proposals: [number, number][] = [
      [-3, -4],
      [5.5, 2.5],
      [100, 100]
    ];
    const records = constraints.flatMap(constraint =>
      contexts.flatMap(({ id, value }) =>
        proposals.map(([x, y], index) => ({
          id: `${constraint.name}/${id}/position-${index}`,
          call: capture({ constraint, item, x, y, context: value }, a =>
            a.constraint.constrainPosition?.(a.item, a.x, a.y, a.context)
          )
        }))
      )
    );
    const oversized: LayoutItem = {
      i: "oversized",
      x: 13,
      y: 11,
      w: 20,
      h: 20
    };
    expectGolden("constraints/position-singletons", [
      ...records,
      ...[gridBounds, containerBounds, boundedX, boundedY].map(constraint => ({
        id: `${constraint.name}/oversized`,
        call: capture({ constraint, item: oversized, context }, a =>
          a.constraint.constrainPosition?.(a.item, -10, 100, a.context)
        )
      }))
    ]);
  });

  it("pins direct size limits for every handle, item edge and height mode", () => {
    const items: { id: string; value: LayoutItem }[] = [
      { id: "interior", value: item },
      { id: "origin", value: { ...item, x: 0, y: 0 } },
      { id: "past-edge", value: { ...item, x: 13, y: 11 } }
    ];
    const records = [gridBounds, containerBounds].flatMap(constraint =>
      handles.flatMap(handle =>
        items.map(({ id, value }) => ({
          id: `${constraint.name}/${handle}/${id}`,
          call: capture(
            { constraint, item: value, handle, context, w: 100, h: 100 },
            a =>
              a.constraint.constrainSize!(a.item, a.w, a.h, a.handle, a.context)
          )
        }))
      )
    );
    const heights = [-1, 0, 1, 65, 65.5, 263];
    const heightCases = heights.flatMap(containerHeight =>
      ["se", "nw"].map(handle => ({
        id: `containerBounds/height-${containerHeight}/${handle}`,
        call: capture(
          {
            item,
            handle: handle as ResizeHandleAxis,
            context: { ...context, containerHeight, maxRows: Infinity }
          },
          a =>
            containerBounds.constrainSize!(
              a.item,
              Infinity,
              Infinity,
              a.handle,
              a.context
            )
        )
      }))
    );
    const proposals: [number, number][] = [
      [-3, 0],
      [0.5, 1.5],
      [100, Infinity]
    ];
    const minMaxItems: { id: string; value: LayoutItem }[] = [
      { id: "defaults", value: item },
      { id: "limits", value: { ...item, minW: 2, maxW: 5, minH: 3, maxH: 6 } },
      {
        id: "reversed-limits",
        value: { ...item, minW: 5, maxW: 2, minH: 6, maxH: 3 }
      },
      {
        id: "explicit-undefined",
        value: {
          ...item,
          minW: undefined,
          maxW: undefined,
          minH: undefined,
          maxH: undefined
        }
      },
      {
        id: "zero-and-fraction",
        value: { ...item, minW: 0, maxW: 0.5, minH: 0, maxH: Infinity }
      }
    ];
    const minMax = minMaxItems.flatMap(({ id, value }) =>
      proposals.map(([w, h], index) => ({
        id: `minMaxSize/${id}/${index}`,
        call: capture(
          { item: value, w, h, context, handle: "se" as ResizeHandleAxis },
          a => minMaxSize.constrainSize!(a.item, a.w, a.h, a.handle, a.context)
        )
      }))
    );
    const minimums = [gridBounds, containerBounds].map(constraint => ({
      id: `${constraint.name}/minimum-one`,
      call: capture({ constraint, item, context }, a =>
        a.constraint.constrainSize!(a.item, -5, 0, "se", a.context)
      )
    }));
    expectGolden("constraints/size-singletons", [
      ...records,
      ...heightCases,
      ...minMax,
      ...minimums
    ]);
  });

  it("pins every factory, accepted unusual arguments, and exact validation errors", () => {
    const specs: FactorySpec[] = [
      { factory: "aspectRatio", args: [1] },
      { factory: "aspectRatio", args: [16 / 9] },
      { factory: "aspectRatio", args: [0] },
      { factory: "aspectRatio", args: [-1] },
      { factory: "aspectRatio", args: [Infinity] },
      { factory: "snapToGrid", args: [2] },
      { factory: "snapToGrid", args: [2, 3] },
      { factory: "snapToGrid", args: [0.5, 1.5] },
      { factory: "snapToGrid", args: [0] },
      { factory: "snapToGrid", args: [-1, 2] },
      { factory: "snapToGrid", args: [2, 0] },
      { factory: "snapToGrid", args: [2, -3] },
      { factory: "snapToGrid", args: [Infinity] },
      { factory: "snapToGrid", args: [Number.NaN] },
      { factory: "minSize", args: [2, 3] },
      { factory: "minSize", args: [-1, 0] },
      { factory: "minSize", args: [Infinity, 0.5] },
      { factory: "maxSize", args: [5, 6] },
      { factory: "maxSize", args: [-1, 0] },
      { factory: "maxSize", args: [Infinity, 0.5] }
    ];
    expectGolden(
      "constraints/factories",
      specs.map((spec, index) => ({
        id: `${spec.factory}/factory-${index}`,
        call: capture(spec, a => makeConstraint(a))
      }))
    );
    const validSpecs = specs.filter(
      spec =>
        spec.factory !== "snapToGrid" ||
        (Number.isFinite(spec.args[0]) &&
          spec.args[0] > 0 &&
          (spec.args[1] === undefined || spec.args[1] > 0))
    );
    expectGolden(
      "constraints/factory-methods",
      validSpecs.flatMap(spec =>
        [
          [-2.5, 0],
          [4, 6]
        ].map(([w, h], index) => ({
          id: `${spec.factory}/${spec.args.join(",")}/proposal-${index}`,
          call: capture({ spec, item, context, w, h }, a => {
            const constraint = makeConstraint(a.spec);
            return {
              constraint,
              position: constraint.constrainPosition?.(
                a.item,
                a.w,
                a.h,
                a.context
              ),
              size: constraint.constrainSize?.(
                a.item,
                a.w,
                a.h,
                "se",
                a.context
              )
            };
          })
        }))
      )
    );
  });

  it("pins chain order, per-item precedence, and skipped constraint methods", () => {
    const positionChains: {
      id: string;
      grid: LayoutConstraint[];
      perItem?: LayoutConstraint[];
    }[] = [
      { id: "empty", grid: [] },
      { id: "default", grid: defaultConstraints },
      { id: "bounds-then-snap", grid: [gridBounds, snapToGrid(4)] },
      { id: "snap-then-bounds", grid: [snapToGrid(4), gridBounds] },
      {
        id: "grid-then-item-snap",
        grid: [gridBounds],
        perItem: [snapToGrid(4)]
      },
      {
        id: "grid-snap-then-item-bounds",
        grid: [snapToGrid(4)],
        perItem: [gridBounds]
      },
      { id: "only-item", grid: [], perItem: [boundedX, boundedY] },
      {
        id: "item-bounds-then-snap",
        grid: [],
        perItem: [gridBounds, snapToGrid(4)]
      },
      {
        id: "item-snap-then-bounds",
        grid: [],
        perItem: [snapToGrid(4), gridBounds]
      },
      {
        id: "skip-size-only",
        grid: [minSize(2, 3), minMaxSize, maxSize(5, 6)]
      },
      { id: "explicit-empty-item", grid: [boundedX], perItem: [] }
    ];
    const positions = positionChains.flatMap(({ id, grid, perItem }) =>
      [
        [11, 11],
        [-2.5, -3.5]
      ].map(([x, y], index) => ({
        id: `${id}/position-${index}`,
        call: capture(
          {
            constraints: grid,
            item: { ...item, constraints: perItem },
            x,
            y,
            context
          },
          a =>
            applyPositionConstraints(a.constraints, a.item, a.x, a.y, a.context)
        )
      }))
    );
    const sizeChains: {
      id: string;
      grid: LayoutConstraint[];
      perItem?: LayoutConstraint[];
    }[] = [
      { id: "empty", grid: [] },
      { id: "default", grid: defaultConstraints },
      { id: "bounds-then-minimum", grid: [gridBounds, minSize(20, 20)] },
      { id: "minimum-then-bounds", grid: [minSize(20, 20), gridBounds] },
      { id: "minimum-then-maximum", grid: [minSize(5, 6), maxSize(2, 3)] },
      { id: "maximum-then-minimum", grid: [maxSize(2, 3), minSize(5, 6)] },
      {
        id: "grid-then-item-minimum",
        grid: [gridBounds],
        perItem: [minSize(20, 20)]
      },
      {
        id: "grid-minimum-then-item-bounds",
        grid: [minSize(20, 20)],
        perItem: [gridBounds]
      },
      { id: "only-item", grid: [], perItem: [minMaxSize] },
      {
        id: "item-minimum-then-maximum",
        grid: [],
        perItem: [minSize(5, 6), maxSize(2, 3)]
      },
      {
        id: "item-maximum-then-minimum",
        grid: [],
        perItem: [maxSize(2, 3), minSize(5, 6)]
      },
      { id: "skip-position-only", grid: [boundedX, boundedY, snapToGrid(2)] },
      { id: "aspect-then-bounds", grid: [aspectRatio(1 / 4), gridBounds] },
      { id: "bounds-then-aspect", grid: [gridBounds, aspectRatio(1 / 4)] }
    ];
    const sizes = sizeChains.flatMap(({ id, grid, perItem }) =>
      ["se", "nw"].map(handle => ({
        id: `${id}/size-${handle}`,
        call: capture(
          {
            constraints: grid,
            item: {
              ...item,
              minW: 2,
              maxW: 5,
              minH: 3,
              maxH: 6,
              constraints: perItem
            },
            w: 100,
            h: 100,
            handle: handle as ResizeHandleAxis,
            context
          },
          a =>
            applySizeConstraints(
              a.constraints,
              a.item,
              a.w,
              a.h,
              a.handle,
              a.context
            )
        )
      }))
    );
    expectGolden("constraints/chains", [...positions, ...sizes]);
  });

  it("pins aspect ratio's ignored height/handle and omitted padding", () => {
    const records = handles.flatMap(handle =>
      [2, 6].map(h => ({
        id: `aspect-one/${handle}/height-${h}`,
        knownBug:
          "l: aspectRatio derives height only from width, ignores handle and container padding (B12)",
        call: capture(
          {
            item,
            w: 2,
            h,
            handle,
            ratio: 2,
            context: {
              ...context,
              containerWidth: 1000,
              margin: [10, 10] as const,
              containerPadding: [250, 50]
            }
          },
          a => {
            const constraint = aspectRatio(a.ratio);
            return constraint.constrainSize!(
              a.item,
              a.w,
              a.h,
              a.handle,
              a.context
            );
          }
        )
      }))
    );
    expectGolden("constraints/aspect-ratio-known-bug", records);
  });
});
