import {
  calcGridColWidth,
  calcGridItemWHPx,
  calcGridItemPosition,
  calcXY,
  calcXYRaw,
  calcWH,
  calcWHRaw,
  calcGridCellDimensions,
  clamp,
  type PositionParams,
  type GridCellConfig
} from "../../../src/core/calculate";
import type { ResizeHandleAxis } from "../../../src/core/types";
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
const base: PositionParams = {
  cols: 12,
  containerWidth: 1001,
  rowHeight: 30,
  margin: [7, 3],
  containerPadding: [13, 5],
  maxRows: 10
};
const grids: { id: string; params: PositionParams }[] = [
  { id: "odd-width", params: base },
  { id: "tiny-width", params: { ...base, containerWidth: 1 } },
  {
    id: "zero-gaps",
    params: { ...base, margin: [0, 0], containerPadding: [0, 0] }
  },
  {
    id: "fractional",
    params: {
      ...base,
      containerWidth: 333.5,
      rowHeight: 11.5,
      margin: [1.5, 2.5],
      containerPadding: [0.25, 4.75]
    }
  },
  { id: "unbounded-rows", params: { ...base, maxRows: Infinity } },
  {
    id: "one-column",
    params: { ...base, cols: 1, containerWidth: 31, maxRows: 1 }
  }
];

// Golden rows protect exact rounding, override precedence, and the observable
// difference between clamped and raw conversions. A changed rounding rule,
// dropped padding, or omitted north/west exception changes the recorded output.
describe("calculate golden behavior", () => {
  it("pins metrics, default padding, unit rounding, and reversed clamps", () => {
    const metrics = grids.map(({ id, params }) => ({
      id,
      call: capture([params], ([p]) => calcGridColWidth(p))
    }));
    const cellConfigs: GridCellConfig[] = [
      { width: 1001, cols: 12, rowHeight: 30 },
      { width: 1001, cols: 12, rowHeight: 30, margin: [7, 3] },
      {
        width: 1001,
        cols: 12,
        rowHeight: 30,
        margin: [7, 3],
        containerPadding: null
      },
      {
        width: 1001,
        cols: 12,
        rowHeight: 30,
        margin: [7, 3],
        containerPadding: undefined
      },
      ...grids.map(({ params: p }) => ({
        width: p.containerWidth,
        cols: p.cols,
        rowHeight: p.rowHeight,
        margin: p.margin,
        containerPadding: p.containerPadding
      })),
      {
        width: 100,
        cols: 0,
        rowHeight: 0,
        margin: [10, 10],
        containerPadding: [0, 0]
      }
    ];
    const cells = cellConfigs.map((config, index) => ({
      id: `cell-${index}`,
      call: capture([config], ([c]) => calcGridCellDimensions(c))
    }));
    const unitArgs: [number, number, number][] = [
      [0, 10, 3],
      [0.5, 11.5, 3],
      [1, 11.5, 3],
      [1.5, 11.5, 3],
      [2, 11.5, 3],
      [-1, 11.5, 3],
      [3, -10.25, 7],
      [Infinity, 0, 10],
      [-Infinity, 0, 10]
    ];
    const units = unitArgs.map((args, index) => ({
      id: `units-${index}`,
      call: capture(args, a => calcGridItemWHPx(...a))
    }));
    const clampArgs: [number, number, number][] = [
      [-1, 0, 10],
      [0, 0, 10],
      [3.5, 0, 10],
      [10, 0, 10],
      [11, 0, 10],
      [3, 5, 1],
      [Infinity, 0, 10],
      [-Infinity, 0, 10],
      [7, -Infinity, Infinity]
    ];
    const clamps = clampArgs.map((args, index) => ({
      id: `clamp-${index}`,
      call: capture(args, a => clamp(...a))
    }));
    expectGolden("calculate/metrics", [
      ...metrics,
      ...cells,
      ...units,
      ...clamps
    ]);
  });

  it("pins pixel/grid conversion at edges for every resize handle", () => {
    const locations: [number, number, number, number][] = [
      [-40, -100, 2, 3],
      [5, 13, 2, 3],
      [21.5, 54.25, 2, 3],
      [999, 2000, 2, 3],
      [Infinity, -Infinity, 2, 3],
      [50, 100, 20, 20],
      [35.5, 96.5, 1.5, 2.5]
    ];
    const positions = grids.flatMap(({ id, params }) =>
      locations.map((values, index) => ({
        id: `${id}/xy-${index}`,
        clamped: capture(
          [params, ...values] as [
            PositionParams,
            number,
            number,
            number,
            number
          ],
          a => calcXY(...a)
        ),
        raw: capture(
          [params, values[0], values[1]] as [PositionParams, number, number],
          a => calcXYRaw(...a)
        )
      }))
    );
    const sizes: [number, number][] = [
      [1, 1],
      [-20, -10],
      [170.5, 86.5],
      [2000, Infinity]
    ];
    const dimensions = grids
      .filter((_, index) => index < 5)
      .flatMap(({ id, params }) =>
        handles.flatMap(handle =>
          sizes.map(([width, height], index) => ({
            id: `${id}/${handle}/wh-${index}`,
            clamped: capture(
              [params, width, height, 3, 4, handle] as Parameters<
                typeof calcWH
              >,
              a => calcWH(...a)
            ),
            raw: capture(
              [params, width, height] as Parameters<typeof calcWHRaw>,
              a => calcWHRaw(...a)
            )
          }))
        )
      );
    expectGolden("calculate/conversions", [
      ...positions,
      ...dimensions,
      {
        id: "tiny-dimensions-allow-zero",
        knownBug:
          "k: calcWH permits zero dimensions while calcWHRaw enforces one (B11)",
        call: capture(
          [base, 1, 1, 0, 0, "se"] as Parameters<typeof calcWH>,
          a => calcWH(...a)
        )
      }
    ]);
  });

  it("pins adjacent rounding correction and drag/resize override precedence", () => {
    const shapes: [number, number, number, number][] = [
      [0, 0, 1, 1],
      [1, 1, 1, 1],
      [2, 2, 2, 3],
      [0.5, 1.5, 1.5, 2.5],
      [-0.5, -1, 0, 0],
      [1, 1, Infinity, Infinity]
    ];
    const records = grids.flatMap(({ id, params }) =>
      shapes.map((shape, index) => ({
        id: `${id}/position-${index}`,
        call: capture(
          [params, ...shape] as Parameters<typeof calcGridItemPosition>,
          a => calcGridItemPosition(...a)
        )
      }))
    );
    const overrides: {
      id: string;
      drag?: { top: number; left: number } | null;
      resize?: {
        top: number;
        left: number;
        width: number;
        height: number;
      } | null;
    }[] = [
      { id: "omitted" },
      { id: "explicit-null", drag: null, resize: null },
      { id: "drag", drag: { top: -2.5, left: 12.5 } },
      {
        id: "resize",
        resize: { top: 3.5, left: 9.5, width: 82.5, height: 99.5 }
      },
      {
        id: "drag-plus-resize",
        drag: { top: 22.5, left: -7.5 },
        resize: { top: 3.5, left: 9.5, width: 82.5, height: 99.5 }
      },
      {
        id: "zero-overrides",
        drag: { top: 0, left: 0 },
        resize: { top: 0, left: 0, width: 0, height: 0 }
      }
    ];
    const overridden = overrides.map(({ id, drag, resize }) => ({
      id,
      call: capture(
        [base, 2, 3, 2, 3, drag, resize] as Parameters<
          typeof calcGridItemPosition
        >,
        a => calcGridItemPosition(...a)
      )
    }));
    expectGolden("calculate/item-position", [...records, ...overridden]);
  });
});
