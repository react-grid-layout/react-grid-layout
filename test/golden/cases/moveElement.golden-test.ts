import { deepEqual } from "fast-equals";
import type { CompactType, Layout, LayoutItem } from "../../../src/core/types";
import {
  cloneLayoutItem,
  getLayoutItem,
  moveElement,
  moveElementAwayFromCollision
} from "../../../src/core/layout";
import { getCompactor } from "../../../src/core/compactors";
import { wrapCompactor } from "../../../src/extras/wrapCompactor";
import { assertLayout, capture, copy } from "../capture";
import { expectGolden } from "../expectGolden";
import { samples } from "../generators";

const modes: CompactType[] = ["vertical", "horizontal", "wrap", null];
const cross: LayoutItem[] = [
  { i: "a", x: 2, y: 2, w: 1, h: 1 },
  { i: "north", x: 2, y: 1, w: 1, h: 1 },
  { i: "south", x: 2, y: 3, w: 1, h: 1 },
  { i: "west", x: 1, y: 2, w: 1, h: 1 },
  { i: "east", x: 3, y: 2, w: 1, h: 1 }
];
const directions = [
  { name: "up", x: 2, y: 1 },
  { name: "down", x: 2, y: 3 },
  { name: "left", x: 1, y: 2 },
  { name: "right", x: 3, y: 2 }
];

function movement(
  layout: LayoutItem[],
  x: number | undefined,
  y: number | undefined,
  compactType: CompactType,
  options: {
    isUserAction?: boolean;
    preventCollision?: boolean;
    allowOverlap?: boolean;
    detached?: boolean;
  } = {}
) {
  const l = options.detached ? cloneLayoutItem(layout[0]) : layout[0];
  const args = {
    layout,
    l,
    x,
    y,
    isUserAction: options.isUserAction,
    preventCollision: options.preventCollision,
    compactType,
    cols: 12,
    allowOverlap: options.allowOverlap
  };
  return capture(args, a => {
    const output = moveElement(
      a.layout,
      a.l,
      a.x,
      a.y,
      a.isUserAction,
      a.preventCollision,
      a.compactType,
      a.cols,
      a.allowOverlap
    );
    assertLayout(layout, output, {
      statics: !layout.some(item => item.static && item.isDraggable === true)
    });
    return output;
  });
}

describe("golden movement", () => {
  it("pins all movement policy combinations in both input orders", () => {
    const records = [];
    for (const compactType of modes) {
      for (const preventCollision of [false, true]) {
        for (const allowOverlap of [false, true]) {
          for (const isUserAction of [false, true]) {
            for (const direction of directions) {
              for (const reverse of [false, true]) {
                // Keep a first so the target remains explicit; permute colliders.
                const target = cross.find(
                  item => item.x === direction.x && item.y === direction.y
                )!;
                const bystander = cross.find(
                  item => item !== cross[0] && item !== target
                )!;
                const layout = [cross[0], target, bystander];
                if (reverse) layout.splice(1, 2, ...layout.slice(1).reverse());
                records.push({
                  direction: direction.name,
                  reverse,
                  ...movement(layout, direction.x, direction.y, compactType, {
                    preventCollision,
                    allowOverlap,
                    isUserAction
                  })
                });
              }
            }
          }
        }
      }
    }
    expectGolden("moveElement/policy-matrix", records);
  });

  it("pins equal coordinates, undefined axes, moved flags and draggable statics", () => {
    const records = [];
    for (const compactType of modes) {
      for (const [x, y] of [
        [2, 2],
        [undefined, 2],
        [2, undefined],
        [undefined, undefined],
        [3, 2],
        [2, 3]
      ]) {
        records.push(
          movement(cross, x, y, compactType, { isUserAction: true })
        );
      }
      for (const isDraggable of [undefined, false, true]) {
        records.push(
          movement(
            [{ ...cross[0], static: true, isDraggable }],
            4,
            4,
            compactType
          )
        );
      }
      records.push(
        movement([{ ...cross[0], moved: true }, cross[4]], 3, 2, compactType, {
          preventCollision: true
        })
      );
    }
    expectGolden("moveElement/axis-and-early-return-edges", records);
  });

  it("pins equal-primary-axis reversal with multiple colliders", () => {
    const fixtures = [
      {
        name: "same-y-horizontal-drag",
        x: 3,
        y: 2,
        layout: [
          { i: "a", x: 2, y: 2, w: 2, h: 2 },
          { i: "b", x: 4, y: 2, w: 1, h: 1 },
          { i: "c", x: 4, y: 3, w: 1, h: 1 }
        ]
      },
      {
        name: "same-x-vertical-drag",
        x: 2,
        y: 3,
        layout: [
          { i: "a", x: 2, y: 2, w: 2, h: 2 },
          { i: "b", x: 2, y: 4, w: 1, h: 1 },
          { i: "c", x: 3, y: 4, w: 1, h: 1 }
        ]
      }
    ];
    expectGolden(
      "moveElement/equal-axis-multiple-colliders",
      fixtures.flatMap(fixture =>
        modes.flatMap(compactType =>
          [false, true].map(reverse => ({
            name: fixture.name,
            reverse,
            call: movement(
              [
                fixture.layout[0],
                ...(reverse
                  ? fixture.layout.slice(1).reverse()
                  : fixture.layout.slice(1))
              ],
              fixture.x,
              fixture.y,
              compactType,
              { isUserAction: true }
            )
          }))
        )
      )
    );
  });

  it("pins generated layouts without assuming intermediate moves de-overlap", () => {
    expectGolden(
      "moveElement/generated",
      samples
        .filter(
          sample =>
            sample.seed === 1 &&
            sample.family !== "large" &&
            sample.layout.length > 0
        )
        .map(sample => ({
          family: sample.family,
          seed: sample.seed,
          size: sample.size,
          cols: sample.cols,
          call: movement(sample.layout, undefined, 2, "vertical", {
            isUserAction: true,
            preventCollision: true
          })
        }))
    );
  });

  it("pins direct collision-away probes and primary-axis fallbacks", () => {
    const fixtures = [
      {
        name: "free-probe",
        layout: [
          { i: "a", x: 4, y: 4, w: 1, h: 1 },
          { i: "b", x: 6, y: 6, w: 1, h: 1 }
        ]
      },
      {
        name: "north-offset-issue-2173",
        layout: [
          { i: "block", x: 0, y: 0, w: 1, h: 6 },
          { i: "a", x: 0, y: 5, w: 1, h: 2 },
          { i: "b", x: 0, y: 7, w: 1, h: 2 }
        ]
      },
      {
        name: "partial-overlap-issue-1982",
        layout: [
          { i: "a", x: 0, y: 2, w: 2, h: 2 },
          { i: "b", x: 0, y: 0, w: 2, h: 2 }
        ]
      },
      {
        name: "west-probe",
        layout: [
          { i: "a", x: 2, y: 0, w: 2, h: 1 },
          { i: "b", x: 3, y: 0, w: 2, h: 1 }
        ]
      }
    ];
    const records = [];
    for (const fixture of fixtures) {
      for (const reverse of [false, true]) {
        for (const compactType of modes) {
          for (const isUserAction of [false, true]) {
            for (const isStatic of [false, true]) {
              const layout = fixture.layout.map(item => ({
                ...item,
                ...(item.i === "a" ? { static: isStatic } : {})
              }));
              if (reverse) layout.reverse();
              const args = {
                layout,
                collidesWith: layout.find(item => item.i === "a")!,
                itemToMove: layout.find(item => item.i === "b")!,
                isUserAction,
                compactType,
                cols: 12
              };
              const staticSwap =
                isStatic &&
                isUserAction &&
                compactType === null &&
                ["free-probe", "north-offset-issue-2173"].includes(
                  fixture.name
                );
              records.push({
                knownBug: staticSwap
                  ? "q-move-static: free-form swaps bypass the static movement guard"
                  : undefined,
                fixture: fixture.name,
                reverse,
                call: capture(args, a => {
                  const output = moveElementAwayFromCollision(
                    a.layout,
                    a.collidesWith,
                    a.itemToMove,
                    a.isUserAction,
                    a.compactType,
                    a.cols
                  );
                  assertLayout(layout, output, { statics: !staticSwap });
                  return output;
                })
              });
            }
          }
        }
      }
    }
    expectGolden("moveElementAwayFromCollision/probe-matrix", records);
  });

  it("knownBug f: free-form swaps leave a third item overlapped (B6)", () => {
    const layout = [
      { i: "a", x: 0, y: 0, w: 1, h: 1 },
      { i: "b", x: 0, y: 2, w: 1, h: 2 },
      { i: "c", x: 0, y: 4, w: 1, h: 1 }
    ];
    expectGolden("knownBug/f-free-form-swap-no-cascade", {
      knownBug:
        "f: The null-mode swap returns without cascading into the third item.",
      auditId: "B6",
      call: movement(layout, 0, 3, null, { isUserAction: true })
    });
  });

  it("knownBug p: detached item moves colliders while its layout entry stays put (B16)", () => {
    expectGolden("knownBug/p-detached-item", {
      knownBug:
        "p: Passing a detached clone mutates that clone and pushes colliders, leaving the stored dragged item in place.",
      auditId: "B16",
      call: movement(
        [
          { i: "a", x: 0, y: 0, w: 1, h: 1 },
          { i: "b", x: 0, y: 1, w: 1, h: 1 }
        ],
        0,
        1,
        "vertical",
        { detached: true, isUserAction: true }
      )
    });
  });

  it("knownBug q-move-static: free-form collision swap relocates a static obstacle", () => {
    const layout = [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "s", x: 0, y: 2, w: 2, h: 2, static: true }
    ];
    expectGolden("knownBug/q-move-static-free-form-swap", {
      knownBug:
        "q-move-static: The null-mode swap writes the static obstacle's y directly, bypassing the static movement guard.",
      call: capture(
        {
          layout,
          l: layout[0],
          x: 0,
          y: 1,
          isUserAction: true,
          preventCollision: false,
          compactType: null,
          cols: 12,
          allowOverlap: false
        },
        args =>
          moveElement(
            args.layout,
            args.l,
            args.x,
            args.y,
            args.isUserAction,
            args.preventCollision,
            args.compactType,
            args.cols,
            args.allowOverlap
          )
      )
    });
  });

  it("knownBug q-move: horizontal collision pushes can exceed cols", () => {
    expectGolden("knownBug/q-move-horizontal-overflow", {
      knownBug:
        "q-move: Movement forwards cols without constraining horizontal pushes to the grid width.",
      call: movement(
        [
          { i: "a", x: 0, y: 0, w: 6, h: 1 },
          { i: "b", x: 6, y: 0, w: 6, h: 1 }
        ],
        1,
        0,
        "horizontal",
        { isUserAction: false }
      )
    });
  });
});

type Gesture = {
  id: string;
  frames: [number, number][];
  stop: [number, number];
};

// This models the pure layout pipeline in GridLayout.tsx. Each frame commits
// setLayout before the following frame, and each callback captures its values
// immediately. The React effect's callback is outside this handler-level trace.
function dragTrace(
  initial: Layout,
  compactType: CompactType,
  gestures: Gesture[]
) {
  const compactor =
    compactType === "wrap" ? wrapCompactor : getCompactor(compactType);
  let layout = copy(initial) as LayoutItem[];
  const events: unknown[] = [];
  for (const gesture of gestures) {
    const l = getLayoutItem(layout, gesture.id)!;
    const oldDragItem = cloneLayoutItem(l);
    const oldLayout = layout; // Exact alias held by onDragStart.
    const trueOldLayout = copy(layout);
    events.push({
      phase: "start",
      callback: copy({ layout, oldItem: l, newItem: l, placeholder: null }),
      oldLayoutIsCurrent: oldLayout === layout
    });
    for (const [x, y] of gesture.frames) {
      const currentLayout = layout;
      const item = getLayoutItem(currentLayout, gesture.id)!;
      const placeholder = {
        w: item.w,
        h: item.h,
        x: item.x,
        y: item.y,
        i: item.i
      };
      let moved: LayoutItem[] = [];
      const move = capture(
        {
          layout: currentLayout,
          l: item,
          x,
          y,
          isUserAction: true,
          preventCollision: false,
          compactType,
          cols: 12,
          allowOverlap: false
        },
        a => {
          moved = moveElement(
            a.layout,
            a.l,
            a.x,
            a.y,
            a.isUserAction,
            a.preventCollision,
            a.compactType,
            a.cols,
            a.allowOverlap
          );
          assertLayout(initial, moved, { statics: true });
          return moved;
        },
        { clone: false }
      );
      // onDrag receives the moved layout before compaction; its item is the
      // live object looked up before moveElement and its placeholder is stale.
      const callback = copy({
        layout: moved,
        oldItem: oldDragItem,
        newItem: item,
        placeholder
      });
      const compact = capture(
        { layout: moved, cols: 12 },
        a => {
          layout = compactor.compact(a.layout, a.cols) as LayoutItem[];
          assertLayout(initial, layout, { statics: true });
          return layout;
        },
        { clone: false }
      );
      events.push({
        phase: "drag",
        move,
        callback,
        compact,
        oldLayout: copy(oldLayout)
      });
    }
    const item = getLayoutItem(layout, gesture.id)!;
    const [x, y] = gesture.stop;
    let moved: LayoutItem[] = [];
    const move = capture(
      {
        layout,
        l: item,
        x,
        y,
        isUserAction: true,
        preventCollision: false,
        compactType,
        cols: 12,
        allowOverlap: false
      },
      a => {
        moved = moveElement(
          a.layout,
          a.l,
          a.x,
          a.y,
          a.isUserAction,
          a.preventCollision,
          a.compactType,
          a.cols,
          a.allowOverlap
        );
        assertLayout(initial, moved, { statics: true });
        return moved;
      },
      { clone: false }
    );
    const compact = capture(
      { layout: moved, cols: 12 },
      a => {
        layout = compactor.compact(a.layout, a.cols) as LayoutItem[];
        assertLayout(initial, layout, { statics: true });
        return layout;
      },
      { clone: false }
    );
    const layoutChange = !deepEqual(oldLayout, layout);
    events.push({
      phase: "stop",
      move,
      compact,
      callback: copy({
        layout,
        oldItem: oldDragItem,
        newItem: item,
        placeholder: null
      }),
      oldLayout: copy(oldLayout),
      trueOldLayout,
      equalsTrueStart: deepEqual(trueOldLayout, layout),
      layoutChange,
      layoutChangeCallback: layoutChange ? copy(layout) : undefined
    });
  }
  return { events, layout };
}

describe("golden drag handler traces", () => {
  it("pins frame callbacks before compact and stop callbacks after compact", () => {
    expectGolden(
      "drag/modes-and-reversals",
      modes.map(compactType =>
        capture(
          {
            layout: cross,
            compactType,
            gestures: [
              {
                id: "a",
                frames: [
                  [2, 3],
                  [3, 2],
                  [2, 2]
                ] as [number, number][],
                stop: [2, 2] as [number, number]
              }
            ]
          },
          a => dragTrace(a.layout, a.compactType, a.gestures)
        )
      )
    );
  });

  it("knownBug a: moved survives noCompactor and a later drag skips it (B1)", () => {
    const layout = [
      { i: "a", x: 0, y: 0, w: 1, h: 1 },
      { i: "b", x: 2, y: 0, w: 1, h: 1 },
      { i: "c", x: 4, y: 0, w: 1, h: 1 }
    ];
    const gestures: Gesture[] = [
      { id: "a", frames: [[1, 0]], stop: [1, 0] },
      { id: "c", frames: [[1, 0]], stop: [1, 0] }
    ];
    expectGolden("knownBug/a-moved-leak-across-drags", {
      knownBug:
        "a: moved:true survives noCompactor across gestures, so the second drag skips its collider.",
      auditId: "B1",
      call: capture({ layout, gestures }, a =>
        dragTrace(a.layout, null, a.gestures)
      )
    });
  });

  it("knownBug b: mutating oldLayout produces a spurious layoutChange (B2)", () => {
    // Normalize once exactly as a mounted GridLayout does, so missing optional
    // keys do not masquerade as the bug when deepEqual compares the true start.
    const layout = getCompactor("vertical").compact(
      [{ i: "a", x: 0, y: 0, w: 2, h: 2 }],
      12
    );
    const gestures: Gesture[] = [
      {
        id: "a",
        frames: [
          [0, 2],
          [0, 0]
        ],
        stop: [0, 0]
      }
    ];
    expectGolden("knownBug/b-old-layout-alias", {
      knownBug:
        "b: The oldLayout alias is mutated although final geometry equals the true drag-start snapshot, causing a spurious handler onLayoutChange.",
      auditId: "B2",
      call: capture({ layout, gestures }, a =>
        dragTrace(a.layout, "vertical", a.gestures)
      )
    });
  });
});
