import type { Layout } from "../../src/core/types";

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

// Grid-unit inputs shared by jsdom and the real-browser driver. The jsdom
// fixture's cells are 100 logical pixels; browsers derive them from the grid.
export const directionMoves = [
  [
    [0.07, 0],
    [1.1, 0]
  ],
  [
    [0, 0.07],
    [0, 1.1]
  ],
  [
    [-0.07, 0],
    [-1.1, 0]
  ],
  [
    [0, -0.07],
    [0, -1.1]
  ]
];
export const pushLayout: Layout = Array.from({ length: 4 }, (_, y) => ({
  i: String.fromCodePoint(97 + y),
  x: 0,
  y,
  w: 1,
  h: 1
}));
export const pushMoves = [
  [0.07, 0],
  [0, 1.1],
  [0, 2.1]
];
export const staticLayout: Layout = [
  { i: "a", x: 0, y: 0, w: 1, h: 1 },
  { i: "b", x: 1, y: 0, w: 1, h: 2, static: true }
];
export const boundsMoves = [
  [0.07, 0],
  [1.1, 0],
  [9, 9],
  [-3, -3]
];
export const netZeroMoves = [
  [0.07, 0],
  [3.1, 0],
  [0, 0]
];
export const resizeAxes = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
export const resizeLayout: Layout = [
  { i: "b", x: 2, y: 0, w: 2, h: 2, static: true },
  { i: "a", x: 2, y: 2, w: 2, h: 2 }
];
export const resizeDeltas = [0.07, 1.1, 7];
export const liveLayout: Layout = [{ i: "a", x: 0, y: 0, w: 2, h: 2 }];
export const liveDeltas = [0.07, 0.13, 0.21];

export interface BrowserScenario {
  id: string;
  variants: Variant[];
  layout: Layout;
  gestures: { axis?: string; moves: number[][]; origin: number[] }[];
}
const select = (names: string[]) =>
  variants.filter(v => names.includes(v.name));
export const browserScenarios: BrowserScenario[] = [
  {
    id: "drag-directions",
    layout: initialLayout,
    variants: variants.filter(
      v => !["prevent", "overlap", "bounded", "legacy-scaled"].includes(v.name)
    ),
    gestures: directionMoves.map(moves => ({ moves, origin: [0.2, 0.2] }))
  },
  {
    id: "drag-push-chain",
    layout: pushLayout,
    variants: select([
      "vertical",
      "horizontal",
      "wrap",
      "prevent",
      "overlap",
      "strict",
      "legacy"
    ]),
    gestures: [{ moves: pushMoves, origin: [0.2, 0.2] }]
  },
  {
    id: "drag-static-and-bounds",
    layout: staticLayout,
    variants: select(["vertical", "none", "prevent", "overlap", "bounded"]),
    gestures: [{ moves: boundsMoves, origin: [0.2, 0.2] }]
  },
  {
    id: "net-zero-drag",
    layout: initialLayout,
    variants: select(["vertical", "none", "legacy", "strict"]),
    gestures: [{ moves: netZeroMoves, origin: [0.2, 0.2] }]
  },
  ...resizeAxes.map(axis => ({
    id: `resize-${axis}`,
    layout: resizeLayout,
    variants: select(["vertical", "absolute", "scaled", "prevent"]),
    gestures: [
      {
        axis,
        origin: [0.05, 0.05],
        moves: resizeDeltas.map(d => [
          axis.includes("w") ? -d : axis.includes("e") ? d : 0,
          axis.includes("n") ? -d : axis.includes("s") ? d : 0
        ])
      }
    ]
  }))
];

/** Preserve the existing jsdom event coordinates and golden bytes. */
export const logicalPixels = (moves: number[][]) =>
  moves.map(pair => pair.map(n => Math.round(n * 100)));

export const desktopDropCells = [
  [1.5, 0.5],
  [2.6, 0.7]
];
export const desktopDropOverride = {
  w: 2,
  h: 1,
  dragOffsetX: 10,
  dragOffsetY: 5
};
export const touchDropCells = [
  [0.5, 0.5],
  [2.5, 0.5]
];
