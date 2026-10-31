import type { Layout, LayoutItem } from "../../../src/core/types";
import {
  collides,
  getAllCollisions,
  getFirstCollision
} from "../../../src/core/collision";
import {
  bottom,
  cloneLayout,
  cloneLayoutItem,
  correctBounds,
  getLayoutItem,
  getStatics,
  modifyLayout,
  validateLayout,
  withLayoutItem
} from "../../../src/core/layout";
import { assertLayout, capture } from "../capture";
import { expectGolden } from "../expectGolden";
import { samples } from "../generators";

const a: LayoutItem = { i: "a", x: 0, y: 0, w: 2, h: 2 };

function boundsCall(layout: LayoutItem[], cols = 12) {
  return capture({ layout, bounds: { cols } }, args => {
    const output = correctBounds(args.layout, args.bounds);
    assertLayout(layout, output, { bounds: cols });
    return output;
  });
}

describe("golden collision geometry", () => {
  it("pins AABB edges, symmetry, degenerate rectangles and non-finite numbers", () => {
    const peers = [
      { name: "self-alias", item: a },
      { name: "same-id-distinct-object", item: { ...a } },
      { name: "overlap", item: { ...a, i: "b", x: 1, y: 1 } },
      { name: "touch-right", item: { ...a, i: "b", x: 2 } },
      { name: "touch-bottom", item: { ...a, i: "b", y: 2 } },
      { name: "touch-corner", item: { ...a, i: "b", x: 2, y: 2 } },
      { name: "gap", item: { ...a, i: "b", x: 3 } },
      { name: "inside-zero-width", item: { ...a, i: "b", x: 1, w: 0 } },
      { name: "inside-zero-height", item: { ...a, i: "b", y: 1, h: 0 } },
      { name: "negative-size", item: { ...a, i: "b", w: -1 } },
      { name: "fractional", item: { ...a, i: "b", x: 1.5, w: 0.25 } },
      { name: "nan-x", item: { ...a, i: "b", x: Number.NaN } },
      { name: "nan-y", item: { ...a, i: "b", y: Number.NaN } },
      { name: "infinity", item: { ...a, i: "b", x: Infinity } },
      { name: "negative-infinity", item: { ...a, i: "b", x: -Infinity } }
    ];
    expectGolden(
      "collision/rectangles",
      peers.flatMap(peer =>
        [false, true].map(reverse => ({
          name: peer.name,
          reverse,
          call: capture(
            { a: reverse ? peer.item : a, b: reverse ? a : peer.item },
            args => collides(args.a, args.b)
          )
        }))
      )
    );
  });

  it("pins first-hit array order and collision output aliases", () => {
    const layout = [
      a,
      { ...a, i: "b", x: 1 },
      { ...a, i: "c", y: 1 },
      { ...a, i: "d", x: 8 }
    ];
    expectGolden(
      "collision/queries",
      [false, true].flatMap(reverse => {
        const ordered = reverse ? [...layout].reverse() : layout;
        return [
          capture({ layout: ordered, item: a }, args =>
            getFirstCollision(args.layout, args.item)
          ),
          capture({ layout: ordered, item: a }, args =>
            getAllCollisions(args.layout, args.item)
          ),
          capture(
            { layout: ordered, item: { ...a, i: "missing", x: 20 } },
            args => getFirstCollision(args.layout, args.item)
          ),
          capture(
            { layout: ordered, item: { ...a, i: "missing", x: 20 } },
            args => getAllCollisions(args.layout, args.item)
          )
        ];
      })
    );
  });

  it("pins generated first and all queries including empty layouts", () => {
    expectGolden(
      "collision/generated",
      samples
        .filter(sample => sample.seed === 1 && sample.family !== "large")
        .map(sample => ({
          family: sample.family,
          seed: sample.seed,
          call: capture(
            { layout: sample.layout, item: sample.layout[0] || a },
            args => ({
              first: getFirstCollision(args.layout, args.item),
              all: getAllCollisions(args.layout, args.item)
            })
          )
        }))
    );
  });

  it("knownBug n: duplicate IDs suppress overlap and validateLayout accepts them (B14)", () => {
    const layout = [a, { ...a, y: 1 }];
    expectGolden("knownBug/n-duplicate-id-collision", {
      knownBug:
        "n: Duplicate IDs are accepted and treated as self-collisions, hiding their overlap.",
      auditId: "B14",
      calls: [
        capture({ layout }, args =>
          getAllCollisions(args.layout, args.layout[0])
        ),
        capture({ layout }, args => validateLayout(args.layout, "DuplicateIDs"))
      ]
    });
  });
});

describe("golden layout query and cloning contracts", () => {
  it("pins bottom, first-ID lookup and strict static booleans over sparse arrays", () => {
    const sparse = new Array<LayoutItem>(5);
    sparse[1] = a;
    sparse[3] = { ...a, i: "tail", y: Infinity };
    const layouts: Layout[] = [
      [],
      sparse,
      [
        { ...a, y: -8 },
        { ...a, i: "nan", y: Number.NaN }
      ],
      [
        a,
        { ...a, y: 9 },
        { ...a, i: "s", static: true },
        { ...a, i: "truthy", static: 1 as unknown as boolean }
      ]
    ];
    expectGolden(
      "layout/queries",
      layouts.flatMap(layout => [
        capture({ layout }, args => bottom(args.layout)),
        capture({ layout, id: "a" }, args =>
          getLayoutItem(args.layout, args.id)
        ),
        capture({ layout, id: "absent" }, args =>
          getLayoutItem(args.layout, args.id)
        ),
        capture({ layout }, args => getStatics(args.layout))
      ])
    );
  });

  it("pins clone key presence, boolean normalization, holes and nested aliases", () => {
    const handles: LayoutItem["resizeHandles"] = ["se", "nw"];
    const constraints = [{ name: "fixture-constraint" }];
    const extra = { custom: ["metadata"] };
    const item = {
      ...a,
      moved: undefined,
      static: undefined,
      resizeHandles: handles,
      constraints,
      extra
    };
    const sparse = new Array<LayoutItem>(3);
    sparse[0] = item;
    sparse[2] = item;
    expectGolden("layout/clones", [
      capture({ item }, args => {
        const output = cloneLayoutItem(args.item);
        return {
          output,
          aliases: {
            sameItem: output === args.item,
            resizeHandles: output.resizeHandles === args.item.resizeHandles,
            constraints: output.constraints === args.item.constraints,
            constraintObject:
              output.constraints?.[0] === args.item.constraints?.[0],
            customKeyRetained: Object.hasOwn(output, "extra")
          }
        };
      }),
      capture({ layout: sparse }, args => {
        const output = cloneLayout(args.layout);
        assertLayout(args.layout, output, { statics: true });
        return {
          output,
          aliases: output.map((item, index) => ({
            sameItem: item === args.layout[index],
            resizeHandles:
              item.resizeHandles === args.layout[index].resizeHandles,
            constraints: item.constraints === args.layout[index].constraints
          })),
          repeatedOutputItem: output[0] === output[2]
        };
      }),
      capture(
        { layout: [a, { ...a, i: "b", moved: true, static: true }] },
        args => {
          const output = cloneLayout(args.layout);
          assertLayout(args.layout, output, { statics: true });
          return output;
        }
      )
    ]);
  });

  it("pins modifyLayout replacement aliases and withLayoutItem cloning/missing IDs", () => {
    const replacement = { ...a, x: 5 };
    const layouts = [
      [a, { ...a, i: "b" }],
      [a, { ...a, y: 3 }]
    ];
    expectGolden(
      "layout/modification",
      layouts.flatMap(layout => [
        capture({ layout, replacement }, args => {
          const output = modifyLayout(args.layout, args.replacement);
          assertLayout(args.layout, output);
          return output;
        }),
        capture({ layout, key: "a", x: 7 }, args => {
          const output = withLayoutItem(args.layout, args.key, item => ({
            ...item,
            x: args.x
          }));
          assertLayout(args.layout, output[0]);
          return output;
        }),
        capture({ layout, key: "missing" }, args => {
          const output = withLayoutItem(args.layout, args.key, item => item);
          assertLayout(args.layout, output[0], { statics: true });
          return output;
        })
      ])
    );
  });

  it("pins validation errors and accepted numeric edge cases without running unsafe loops", () => {
    const invalid = [
      { name: "not-array", value: {} },
      ...["x", "y", "w", "h"].flatMap(key =>
        [undefined, "1", Number.NaN].map(value => ({
          name: `${key}-${String(value)}`,
          value: [{ ...a, [key]: value }]
        }))
      ),
      { name: "nonstring-id", value: [{ ...a, i: 7 }] }
    ];
    const accepted = [
      [],
      [{ ...a, x: -1, y: Infinity, w: 0, h: -2 }],
      [{ ...a, x: 0.5, maxW: Infinity }],
      [{ x: 0, y: 0, w: 1, h: 1 }],
      new Array(2)
    ];
    expectGolden("layout/validation", [
      ...invalid.map(({ name, value }) => ({
        name,
        call: capture({ layout: value, context: "Fixture" }, args =>
          validateLayout(args.layout as Layout, args.context)
        )
      })),
      ...accepted.map(layout =>
        capture({ layout }, args => validateLayout(args.layout as Layout))
      )
    ]);
  });
});

describe("golden correctBounds", () => {
  it("pins clamp order, width constraints ignored and static correction order", () => {
    const fixtures = [
      [{ ...a, x: 11 }],
      [{ ...a, w: 14, minW: 20, maxW: 1 }],
      [{ ...a, y: -3 }],
      [{ ...a, y: -Infinity }],
      [{ ...a, y: Number.NaN }],
      [{ ...a, x: 0.5, w: 1.5 }],
      [
        { ...a, static: true },
        { ...a, i: "s", static: true }
      ],
      // Issue #2161: append after preceding finite geometry.
      [{ ...a }, { ...a, i: "append", x: 2, y: Infinity }]
    ];
    expectGolden(
      "correctBounds/edges",
      fixtures.flatMap(layout =>
        [false, true].map(reverse =>
          boundsCall(reverse ? [...layout].reverse() : layout)
        )
      )
    );
  });

  it("knownBug h: Infinity append only sees earlier nonstatics (B8)", () => {
    const layout = [
      { ...a, i: "append", y: Infinity },
      { ...a, h: 5 }
    ];
    expectGolden("knownBug/h-infinity-order", {
      knownBug:
        "h: Infinity append sees statics and preceding nonstatics, so input order can leave it overlapping later geometry.",
      auditId: "B8",
      calls: [boundsCall(layout), boundsCall([...layout].reverse())]
    });
  });

  it("knownBug i: a static item yields to an earlier nonstatic (B9)", () => {
    const layout = [a, { ...a, i: "s", static: true }];
    expectGolden("knownBug/i-static-yields-to-nonstatic", {
      knownBug:
        "i: correctBounds pushes statics below earlier nonstatic items despite its static-only documentation.",
      auditId: "B9",
      calls: [boundsCall(layout), boundsCall([...layout].reverse())]
    });
  });

  it("knownBug j: a negative x expands width to all columns (B10)", () => {
    expectGolden("knownBug/j-negative-x-expands-width", {
      knownBug:
        "j: Clamping a negative x expands the item to the full grid width.",
      auditId: "B10",
      call: boundsCall([{ ...a, x: -1 }])
    });
  });
});
