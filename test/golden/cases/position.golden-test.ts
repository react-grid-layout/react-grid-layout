import {
  setTransform,
  setTopLeft,
  perc,
  resizeItemInDirection,
  transformStrategy,
  absoluteStrategy,
  defaultPositionStrategy,
  createScaledStrategy
} from "../../../src/core/position";
import type { Position, ResizeHandleAxis } from "../../../src/core/types";
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
const current: Position = { top: 10, left: 30, width: 50, height: 50 };

// These tables pin caller-visible CSS strings, strategy arithmetic, resize
// anchoring and returned-reference behavior. Changing a bound to a clamp or
// dropping a CSS prefix must be an explicit golden change.
describe("position golden behavior", () => {
  it("pins exact style strings and all built-in strategy calculations", () => {
    const positions: Position[] = [
      { top: 0, left: 0, width: 0, height: 0 },
      { top: -2.5, left: 11.25, width: 80.125, height: 33.75 },
      { top: -0, left: -0, width: Infinity, height: -Infinity }
    ];
    const records = positions.flatMap((position, index) => [
      {
        id: `transform-${index}`,
        call: capture([position], ([p]) => setTransform(p))
      },
      {
        id: `top-left-${index}`,
        call: capture([position], ([p]) => setTopLeft(p))
      },
      ...[
        ["transform", transformStrategy],
        ["absolute", absoluteStrategy],
        ["default", defaultPositionStrategy]
      ].map(([name, strategy]) => ({
        id: `${name}-strategy-${index}`,
        call: capture(
          { strategy: strategy as typeof transformStrategy, position },
          a => a.strategy.calcStyle(a.position)
        )
      }))
    ]);
    const percentages = [-1, -0, 0, 1 / 3, 0.5, 1, 2, Infinity].map(value => ({
      id: `percentage-${String(value)}`,
      call: capture([value], ([v]) => perc(v))
    }));
    expectGolden("position/styles", [
      ...records,
      ...percentages,
      {
        id: "default-strategy-alias",
        call: capture(
          {
            transform: transformStrategy,
            default: defaultPositionStrategy,
            absolute: absoluteStrategy
          },
          a => ({
            sameDefault: a.default === a.transform,
            sameAbsolute: a.absolute === a.transform
          })
        )
      }
    ]);
  });

  it("pins scaled drag arithmetic including the zero-scale division bug", () => {
    const records = [0.5, 1, 2, 0].flatMap(scale =>
      [
        { id: "positive-offset", coordinates: [110.5, 84.25, 10, 4] },
        { id: "negative-offset", coordinates: [-15, 5, 10, 25] },
        { id: "exact-offset", coordinates: [10, 20, 10, 20] }
      ].map(({ id, coordinates }) => ({
        id: `scale-${scale}/${id}`,
        ...(scale === 0
          ? {
              knownBug: "r: createScaledStrategy(0) divides drag deltas by zero"
            }
          : {}),
        call: capture(
          {
            scale,
            coordinates: coordinates as [number, number, number, number],
            position: current
          },
          a => {
            const strategy = createScaledStrategy(a.scale);
            return {
              strategy,
              style: strategy.calcStyle(a.position),
              dragPosition: strategy.calcDragPosition!(...a.coordinates)
            };
          }
        )
      }))
    );
    expectGolden("position/scaled-strategy", records);
  });

  it("pins all eight resize handles through shrink, growth and crossed bounds", () => {
    const proposals: {
      id: string;
      size: Partial<Position>;
      containerWidth: number;
    }[] = [
      { id: "unchanged", size: {}, containerWidth: 200 },
      { id: "shrink", size: { width: 20, height: 25 }, containerWidth: 200 },
      { id: "grow", size: { width: 60, height: 55 }, containerWidth: 200 },
      { id: "past-top", size: { height: 100 }, containerWidth: 200 },
      { id: "past-left", size: { width: 110 }, containerWidth: 200 },
      { id: "past-right", size: { width: 250 }, containerWidth: 200 },
      {
        id: "proposed-negative-origin",
        size: { top: -7, left: -9, width: 60, height: 55 },
        containerWidth: 200
      },
      {
        id: "fractional",
        size: { top: 3.25, left: 8.75, width: 55.5, height: 54.25 },
        containerWidth: 85.5
      },
      { id: "zero-size", size: { width: 0, height: 0 }, containerWidth: 0 }
    ];
    const records = handles.flatMap(handle =>
      proposals.map(({ id, size, containerWidth }) => ({
        id: `${handle}/${id}`,
        call: capture(
          [handle, current, size, containerWidth] as Parameters<
            typeof resizeItemInDirection
          >,
          a => resizeItemInDirection(...a)
        )
      }))
    );
    expectGolden("position/resize-directions", [
      ...records,
      {
        id: "north-crosses-top",
        knownBug:
          "g: north resize past top retains old height and moves bottom edge (B7a)",
        call: capture(
          ["n", current, { height: 100 }, 200] as Parameters<
            typeof resizeItemInDirection
          >,
          a => resizeItemInDirection(...a)
        )
      },
      {
        id: "east-crosses-right",
        knownBug:
          "g: east resize past right snaps to old width instead of available width (B7b)",
        call: capture(
          [
            "e",
            { top: 10, left: 900, width: 50, height: 50 },
            { width: 200 },
            1000
          ] as Parameters<typeof resizeItemInDirection>,
          a => resizeItemInDirection(...a)
        )
      },
      {
        id: "unknown-handle-returns-unmerged-proposal",
        call: capture(
          ["invalid", current, { width: 20 }, 200] as unknown as Parameters<
            typeof resizeItemInDirection
          >,
          a => resizeItemInDirection(...a)
        )
      }
    ]);
  });
});
