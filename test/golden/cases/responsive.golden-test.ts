import type {
  CompactType,
  Compactor,
  Layout,
  LayoutItem
} from "../../../src/core/types";
import {
  findOrGenerateResponsiveLayout,
  getBreakpointFromWidth,
  getColsFromBreakpoint,
  getIndentationValue,
  sortBreakpoints
} from "../../../src/core/responsive";
import { getCompactor } from "../../../src/core/compactors";
import { wrapCompactor } from "../../../src/extras/wrapCompactor";
import { assertLayout, capture } from "../capture";
import { expectGolden } from "../expectGolden";

const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const modes: CompactType[] = ["vertical", "horizontal", "wrap", null];
const source: LayoutItem[] = [
  {
    i: "a",
    x: 8,
    y: 4,
    w: 2,
    h: 2,
    resizeHandles: ["se"],
    constraints: [{ name: "fixture" }]
  },
  { i: "b", x: 0, y: 8, w: 2, h: 1 }
];

function generateCall(
  layouts: Partial<Record<string, Layout>>,
  breakpoint: string,
  lastBreakpoint: string,
  cols: number,
  compactTypeOrCompactor: CompactType | Compactor
) {
  return capture(
    {
      layouts,
      breakpoints,
      breakpoint,
      lastBreakpoint,
      cols,
      compactTypeOrCompactor
    },
    args => {
      const output = findOrGenerateResponsiveLayout(
        args.layouts,
        args.breakpoints,
        args.breakpoint,
        args.lastBreakpoint,
        args.cols,
        args.compactTypeOrCompactor
      );
      const existing = args.layouts[args.breakpoint];
      const expectedSource =
        existing ||
        Object.values(args.layouts).find(layout => layout?.length) ||
        [];
      assertLayout(expectedSource, output);
      return output;
    }
  );
}

describe("golden responsive breakpoint helpers", () => {
  it("pins strict greater-than breakpoint edges and empty map errors", () => {
    const widths = [
      -Infinity,
      -1,
      0,
      1,
      479,
      480,
      481,
      767,
      768,
      769,
      995,
      996,
      997,
      1199,
      1200,
      1201,
      Infinity,
      Number.NaN
    ];
    expectGolden("responsive/widths", [
      ...widths.map(width =>
        capture({ breakpoints, width }, args =>
          getBreakpointFromWidth(args.breakpoints, args.width)
        )
      ),
      capture({ breakpoints: {}, width: 100 }, args =>
        getBreakpointFromWidth(args.breakpoints, args.width)
      )
    ]);
  });

  it("pins breakpoint sorting ties and integer-like key enumeration", () => {
    const maps = [
      breakpoints,
      Object.fromEntries(Object.entries(breakpoints).reverse()),
      { b: 100, a: 100, "2": 100, "1": 100 },
      { z: Infinity, n: -1, a: 0, b: 0 },
      {}
    ];
    expectGolden(
      "responsive/sort",
      maps.flatMap(map => [
        capture({ breakpoints: map }, args =>
          sortBreakpoints(args.breakpoints)
        ),
        capture({ breakpoints: map, width: 101 }, args =>
          getBreakpointFromWidth(args.breakpoints, args.width)
        )
      ])
    );
  });

  it("pins missing cols errors while preserving zero and non-finite values", () => {
    const cols = {
      lg: 12,
      md: 10,
      sm: 6,
      xs: 4,
      xxs: 2,
      zero: 0,
      infinite: Infinity,
      nan: Number.NaN
    };
    expectGolden(
      "responsive/cols",
      [...Object.keys(cols), "missing"].map(breakpoint =>
        capture({ cols, breakpoint }, args =>
          getColsFromBreakpoint(args.breakpoint, args.cols)
        )
      )
    );
  });

  it("pins indentation tuples, map aliases, enumeration fallback and defaults", () => {
    const values = [
      [3, 7] as const,
      { lg: [1, 2] as const, sm: [5, 6] as const },
      { sm: [5, 6] as const, lg: [1, 2] as const },
      { lg: undefined, md: [8, 9] as const },
      { b: [3, 4] as const, "2": [2, 2] as const, "1": [1, 1] as const },
      {},
      { lg: undefined }
    ];
    expectGolden(
      "responsive/indentation",
      values.flatMap(value =>
        ["lg", "sm", "missing"].map(breakpoint =>
          capture({ value, breakpoint }, args =>
            getIndentationValue(args.value, args.breakpoint)
          )
        )
      )
    );
  });
});

describe("golden responsive layout generation", () => {
  it("bounds existing layouts before bypassing compaction and preserves fresh item identities", () => {
    expectGolden(
      "responsive/existing",
      modes.flatMap(mode => [
        generateCall({ sm: source }, "sm", "lg", 2, mode),
        generateCall({ sm: [] }, "sm", "lg", 2, mode)
      ])
    );
  });

  it("pins nearest-larger selection, last-breakpoint fallback and unknown target", () => {
    const md = [{ ...source[0], i: "md", x: 0, y: 3 }];
    const lg = [{ ...source[0], i: "lg", x: 0, y: 5 }];
    const xs = [{ ...source[0], i: "xs", x: 0, y: 7 }];
    // Source IDs are deliberately distinct so the chosen fallback is visible.
    const cases = [
      { layouts: { md, lg, xs }, target: "sm", last: "xs", expected: md },
      { layouts: { lg, xs }, target: "md", last: "xs", expected: lg },
      { layouts: { xs }, target: "lg", last: "xs", expected: xs },
      { layouts: { lg, xs }, target: "unknown", last: "xs", expected: lg },
      { layouts: {}, target: "sm", last: "lg", expected: [] },
      { layouts: { xs: [], lg }, target: "md", last: "xs", expected: lg }
    ];
    expectGolden(
      "responsive/source-selection",
      cases.flatMap(fixture =>
        modes.map(compactType =>
          capture(
            {
              layouts: fixture.layouts,
              breakpoints,
              breakpoint: fixture.target,
              lastBreakpoint: fixture.last,
              cols: 6,
              compactType
            },
            args => {
              const output = findOrGenerateResponsiveLayout(
                args.layouts,
                args.breakpoints,
                args.breakpoint,
                args.lastBreakpoint,
                args.cols,
                args.compactType
              );
              assertLayout(fixture.expected, output);
              return output;
            }
          )
        )
      )
    );
  });

  it("pins string/object compaction policies and narrow-column bounds", () => {
    const custom: Compactor = {
      type: null,
      allowOverlap: false,
      compact(layout) {
        return [...layout].reverse();
      }
    };
    const policies = [
      ...modes,
      ...modes.filter(mode => mode !== "wrap").map(mode => getCompactor(mode)),
      wrapCompactor,
      custom
    ];
    expectGolden(
      "responsive/policies-and-cols",
      [1, 2, 12, 13].flatMap(cols =>
        policies.map(policy =>
          generateCall({ lg: source }, "sm", "lg", cols, policy)
        )
      )
    );
  });

  it("pins Infinity append correction before generated-layout compaction (#2161)", () => {
    const layout = [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "append", x: 2, y: Infinity, w: 2, h: 2 }
    ];
    expectGolden(
      "responsive/infinity-append",
      [false, true].flatMap(reverse =>
        modes.map(mode =>
          generateCall(
            { lg: reverse ? [...layout].reverse() : layout },
            "sm",
            "lg",
            6,
            mode
          )
        )
      )
    );
  });
});
