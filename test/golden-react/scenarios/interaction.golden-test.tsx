import { mountGrid, drag, variants } from "../fixture";
import { resizeHandle, createPointer } from "../pointer";
import { dropExternal } from "../drop";
import { expectGolden } from "../expectGolden";
import type { GridFixture } from "../fixture";

function finish(name: string, fixture: GridFixture, knownBug?: string) {
  fixture.unmount();
  expectGolden(
    name,
    fixture.variant.name,
    fixture.recorder.trace,
    knownBug ? { knownBug } : {}
  );
}

describe("native drag lifecycle", () => {
  it.each(
    variants.filter(
      v => !["prevent", "overlap", "bounded", "legacy-scaled"].includes(v.name)
    )
  )("pins all four directions: $name", variant => {
    const f = mountGrid({ variant });
    for (const moves of [
      [
        [7, 0],
        [110, 0]
      ],
      [
        [0, 7],
        [0, 110]
      ],
      [
        [-7, 0],
        [-110, 0]
      ],
      [
        [0, -7],
        [0, -110]
      ]
    ])
      drag(f, "a", moves);
    finish("drag-directions", f);
  });

  it.each(
    variants.filter(v =>
      [
        "vertical",
        "horizontal",
        "wrap",
        "prevent",
        "overlap",
        "strict",
        "legacy"
      ].includes(v.name)
    )
  )("pins a pushed chain: $name", variant => {
    const f = mountGrid({
      variant,
      layout: [
        { i: "a", x: 0, y: 0, w: 1, h: 1 },
        { i: "b", x: 0, y: 1, w: 1, h: 1 },
        { i: "c", x: 0, y: 2, w: 1, h: 1 },
        { i: "d", x: 0, y: 3, w: 1, h: 1 }
      ]
    });
    drag(f, "a", [
      [7, 0],
      [0, 110],
      [0, 210]
    ]);
    finish("drag-push-chain", f);
  });

  it.each(
    variants.filter(v =>
      ["vertical", "none", "prevent", "overlap", "bounded"].includes(v.name)
    )
  )("pins static collision and outer bounds: $name", variant => {
    const f = mountGrid({
      variant,
      layout: [
        { i: "a", x: 0, y: 0, w: 1, h: 1 },
        { i: "b", x: 1, y: 0, w: 1, h: 2, static: true }
      ]
    });
    drag(f, "a", [
      [7, 0],
      [110, 0],
      [900, 900],
      [-300, -300]
    ]);
    finish("drag-static-and-bounds", f);
  });

  it.each(
    variants.filter(v =>
      ["vertical", "none", "legacy", "strict"].includes(v.name)
    )
  )("pins net-zero notifications: $name", variant => {
    const f = mountGrid({ variant });
    drag(f, "a", [
      [7, 0],
      [310, 0],
      [0, 0]
    ]);
    finish(
      "net-zero-drag",
      f,
      "net-zero-layout-change: out-and-back drag still emits onLayoutChange twice"
    );
  });

  it("pins duplicate onLayoutChange on a changed drag and resize stop", () => {
    const f = mountGrid({ variant: { name: "none", compact: null } });
    drag(f, "a", [
      [7, 0],
      [310, 0]
    ]);
    const handle = resizeHandle(f.container, "a", "se");
    const r = handle.getBoundingClientRect();
    f.pointer.down(handle, { x: r.left, y: r.top });
    f.pointer.move({ x: r.left + 110, y: r.top + 110 });
    f.pointer.up();
    for (const step of f.recorder.trace.filter(
      step => step.input.type === "mouseup"
    )) {
      expect(
        step.callbacks.filter((cb: any) => cb.name === "onLayoutChange")
      ).toHaveLength(2);
    }
    finish(
      "duplicate-stop-notifications",
      f,
      "double-layout-change: each changed drag/resize stop notifies directly and again from its effect"
    );
  });

  it.each([false, true])(
    "pins click, below-threshold motion and discarded deltas, strict=%s",
    strict => {
      const f = mountGrid({
        variant: { name: strict ? "strict" : "normal", compact: null, strict }
      });
      drag(f, "a", []);
      drag(f, "a", [[1, 1]]);
      drag(f, "a", [
        [1, 0],
        [7, 0],
        [13, 0]
      ]);
      finish(
        "drag-threshold",
        f,
        "threshold-deltas: pending drag adds dragging class and discards sub-threshold deltas"
      );
    }
  );
});

describe("fixed live pixel preview (#2304)", () => {
  const liveVariants = [
    { name: "transform", compact: null as null },
    { name: "absolute", compact: null as null, strategy: "absolute" as const },
    { name: "scaled", compact: null as null, strategy: "scaled" as const },
    { name: "legacy", compact: null as null, api: "legacy" as const },
    {
      name: "legacy-absolute",
      compact: null as null,
      api: "legacy" as const,
      strategy: "absolute" as const
    },
    {
      name: "legacy-scaled",
      compact: null as null,
      api: "legacy" as const,
      strategy: "scaled" as const
    }
  ];
  it.each(liveVariants)("follows sub-cell drag and resize: $name", variant => {
    const f = mountGrid({
      variant,
      props: variant.api === "legacy" ? {} : { dragConfig: { threshold: 0 } },
      layout: [{ i: "a", x: 0, y: 0, w: 2, h: 2 }]
    });
    f.pointer.down(f.item("a"), { x: 0, y: 0 });
    for (const delta of [7, 13, 21]) {
      f.pointer.move({ x: delta * f.scale, y: delta * f.scale });
      const r = f.item("a").getBoundingClientRect();
      expect([r.left, r.top]).toEqual([delta * f.scale, delta * f.scale]);
    }
    f.pointer.up();
    const handle = resizeHandle(f.container, "a", "se");
    f.pointer.down(handle, { x: 200 * f.scale, y: 200 * f.scale });
    for (const delta of [7, 13, 21]) {
      f.pointer.move({
        x: (200 + delta) * f.scale,
        y: (200 + delta) * f.scale
      });
      expect([f.item("a").style.width, f.item("a").style.height]).toEqual([
        `${200 + delta}px`,
        `${200 + delta}px`
      ]);
    }
    f.pointer.up();
    finish("live-subcell-preview", f);
  });
});

describe("real resize handles", () => {
  for (const axis of ["n", "s", "e", "w", "ne", "nw", "se", "sw"]) {
    it.each(
      variants.filter(v =>
        ["vertical", "absolute", "scaled", "prevent"].includes(v.name)
      )
    )(`pins ${axis} anchoring and past-edge: $name`, variant => {
      const f = mountGrid({
        variant,
        props: { resizeConfig: { handles: [axis] } },
        layout: [
          { i: "b", x: 2, y: 0, w: 2, h: 2, static: true },
          { i: "a", x: 2, y: 2, w: 2, h: 2 }
        ]
      });
      const handle = resizeHandle(f.container, "a", axis);
      const r = handle.getBoundingClientRect();
      const start = { x: r.left + 5 * f.scale, y: r.top + 5 * f.scale };
      f.pointer.down(handle, start);
      for (const delta of [7, 110, 700])
        f.pointer.move({
          x:
            start.x +
            (axis.includes("w") ? -delta : axis.includes("e") ? delta : 0) *
              f.scale,
          y:
            start.y +
            (axis.includes("n") ? -delta : axis.includes("s") ? delta : 0) *
              f.scale
        });
      f.pointer.up();
      finish(
        `resize-${axis}`,
        f,
        axis.includes("n") && variant.name === "vertical"
          ? "north-overlap-snap: anchored north growth overlaps the item above then compaction snaps on stop"
          : undefined
      );
    });
  }

  it.each(["none", "prevent", "overlap", "bounded", "legacy"])(
    "pins min/max and bounded size: %s",
    name => {
      const variant = variants.find(v => v.name === name)!;
      const f = mountGrid({
        variant,
        layout: [
          {
            i: "a",
            x: 0,
            y: 0,
            w: 2,
            h: 2,
            minW: 1,
            maxW: 3,
            minH: 1,
            maxH: 3
          },
          { i: "b", x: 2, y: 0, w: 1, h: 1, static: true }
        ]
      });
      const handle = resizeHandle(f.container, "a", "se");
      f.pointer.down(handle, { x: 195, y: 195 });
      f.pointer.move({ x: 600, y: 600 });
      f.pointer.move({ x: -500, y: -500 });
      f.pointer.move({ x: 310, y: 310 });
      f.pointer.up();
      finish("resize-limits", f);
    }
  );

  it("pins legacy bounded resize measuring the handle's parent item", () => {
    const f = mountGrid({
      variant: { name: "legacy", api: "legacy", compact: null, bounded: true },
      layout: [{ i: "a", x: 0, y: 3, w: 2, h: 2 }]
    });
    const handle = resizeHandle(f.container, "a", "se");
    const rect = handle.getBoundingClientRect();
    f.pointer.down(handle, { x: rect.left, y: rect.top });
    f.pointer.move({ x: rect.left + 110, y: rect.top + 110 });
    f.pointer.up();
    finish(
      "legacy-bounded-resize-item-measurement",
      f,
      "legacy-bounded-resize: resize constraints measure the item height via the handle offsetParent"
    );
  });
});

describe("external drop pipeline", () => {
  it.each(["transform", "absolute", "scaled"])(
    "pins offset and scrolled geometry: %s",
    strategy => {
      const f = mountGrid({
        variant: {
          name: strategy,
          strategy: strategy as "transform" | "absolute" | "scaled",
          compact: null
        },
        props: { dropConfig: { enabled: true } },
        geometry: {
          gridOffset: { left: 80, top: 120 },
          scroll: { left: 30, top: 50 }
        }
      });
      drag(f, "b", [
        [7, 13],
        [110, 110]
      ]);
      const drop = dropExternal(f.container, { step: f.step });
      const at = { x: 80 + 250 * f.scale, y: 120 + 150 * f.scale };
      drop.enter(at);
      drop.over(at);
      drop.over({ x: at.x + 100 * f.scale, y: at.y });
      drop.drop();
      drop.uninstall();
      finish("offset-scrolled-geometry", f);
    }
  );

  it.each(["vertical", "scaled", "absolute", "legacy", "strict"])(
    "pins desktop hover and commit: %s",
    name => {
      const variant = variants.find(v => v.name === name)!;
      const f = mountGrid({
        variant,
        props:
          variant.api === "legacy"
            ? { isDroppable: true }
            : { dropConfig: { enabled: true } },
        handlers: {
          onDropDragOver: () => ({
            w: 2,
            h: 1,
            dragOffsetX: 10,
            dragOffsetY: 5
          })
        }
      });
      const drop = dropExternal(f.container, { step: f.step });
      drop.enter({ x: 150 * f.scale, y: 50 * f.scale });
      drop.over({ x: 150 * f.scale, y: 50 * f.scale });
      drop.over({ x: 260 * f.scale, y: 70 * f.scale });
      drop.drop();
      drop.uninstall();
      finish(
        "external-desktop-drop",
        f,
        "dropping-no-stop: dropping-elem fires onDragStart/onDrag without onDragStop"
      );
    }
  );

  it.each(["leave", "reject", "config-override"])(
    "pins external %s",
    action => {
      let rejected = false;
      const f = mountGrid({
        props: {
          dropConfig: {
            enabled: true,
            ...(action === "config-override"
              ? { onDragOver: () => ({ w: 2, h: 2 }) }
              : {})
          }
        },
        handlers: { onDropDragOver: () => (rejected ? false : undefined) }
      });
      const drop = dropExternal(f.container, { step: f.step });
      drop.enter({ x: 50, y: 50 });
      drop.over({ x: 50, y: 50 });
      rejected = true;
      if (action === "leave") drop.leave();
      else {
        drop.over({ x: 250, y: 50 });
        drop.drop();
      }
      drop.uninstall();
      finish(`external-${action}`, f);
    }
  );

  it.each(["commit", "leave", "cancel"])("pins touch adapter %s", action => {
    const f = mountGrid({
      props: { dropConfig: { enabled: true } },
      handlers: { onDropDragOver: () => ({ w: 3, h: 3 }) }
    });
    const source = document.createElement("div");
    source.dataset.rglDraggable = "true";
    document.body.append(source);
    const drop = dropExternal(f.container, { step: f.step });
    try {
      drop.touchStart(source, { x: 650, y: 50 });
      drop.touchMove({ x: 50, y: 50 });
      drop.touchMove({ x: 250, y: 50 });
      if (action === "leave") {
        drop.touchMove({ x: 650, y: 50 }, null);
        drop.touchEnd();
      } else if (action === "cancel") drop.touchCancel();
      else drop.touchEnd();
    } finally {
      drop.uninstall();
      source.remove();
    }
    finish(
      `external-touch-${action}`,
      f,
      "touch-drop-ignores-overrides: touch adapter bypasses onDropDragOver and its size/offset overrides"
    );
  });
});

describe("bounded probes of known bugs", () => {
  it("pins touchcancel leaving the internal drag active", () => {
    const f = mountGrid({ variant: { name: "touch", compact: null } });
    const pointer = createPointer({ kind: "touch", step: f.step });
    pointer.down(f.item("a"), { x: 20, y: 20 });
    pointer.move({ x: 130, y: 20 });
    pointer.cancel();
    expect(f.item("a").classList.contains("react-draggable-dragging")).toBe(
      true
    );
    expect(
      f.recorder.trace
        .flatMap(frame => frame.callbacks)
        .filter(cb => cb.name === "onDragStop")
    ).toHaveLength(0);
    finish(
      "internal-touch-cancel",
      f,
      "touch-cancel-no-stop: react-draggable ignores touchcancel, leaving the item dragging until unmount"
    );
  });

  it.each(["transform", "scaled"])(
    "pins touch threshold and NaN position: %s",
    strategy => {
      const f = mountGrid({
        variant: {
          name: strategy,
          compact: null,
          strategy: strategy as "transform" | "scaled"
        }
      });
      const pointer = createPointer({ kind: "touch", step: f.step });
      pointer.down(f.item("a"), { x: 20, y: 20 });
      pointer.move({ x: 21, y: 20 });
      pointer.move({ x: 70, y: 30 });
      pointer.up();
      finish(
        "touch-threshold-nan",
        f,
        "touch-mouse-coordinates: TouchEvent clientX/Y are undefined, skipping threshold and producing NaN with scaled strategy"
      );
    }
  );

  it("pins edge-scroll rAF left queued by unmount during drag", () => {
    const pending = new Map<number, FrameRequestCallback>();
    let nextId = 0;
    const raf = jest
      .spyOn(globalThis, "requestAnimationFrame")
      .mockImplementation(cb => {
        pending.set(++nextId, cb);
        return nextId;
      });
    const cancel = jest
      .spyOn(globalThis, "cancelAnimationFrame")
      .mockImplementation(id => {
        pending.delete(id);
      });
    const f = mountGrid({
      props: { style: { height: 600, overflowY: "auto" } }
    });
    const grid = f.container.querySelector<HTMLElement>(".react-grid-layout")!;
    Object.defineProperty(grid, "scrollHeight", {
      configurable: true,
      value: 1400
    });
    try {
      f.pointer.down(f.item("a"), { x: 20, y: 20 });
      f.pointer.move({ x: 20, y: 590 });
      f.step({ kind: "flush-one-animation-frame" }, () => {
        const [id, cb] = [...pending][0];
        pending.delete(id);
        cb(16);
        f.recorder.note({
          pendingFrames: pending.size,
          scrollTop: grid.scrollTop
        });
      });
      const edgeLoopId = [...pending.keys()][0];
      f.unmount();
      // DraggableCore also queues selection cleanup on unmount. Identify the
      // already-running edge loop rather than counting unrelated callbacks.
      f.step({ kind: "inspect-after-unmount" }, () =>
        f.recorder.note({
          edgeLoopStillQueued: pending.has(edgeLoopId),
          pendingFrames: pending.size
        })
      );
      expect(pending.has(edgeLoopId)).toBe(true);
      expectGolden("edge-scroll-unmount-leak", "queued-raf", f.recorder.trace, {
        knownBug:
          "edge-scroll-unmount-leak: GridItem unmount does not stop the active edge-scroll rAF loop"
      });
    } finally {
      pending.clear();
      raf.mockRestore();
      cancel.mockRestore();
    }
  });
});
