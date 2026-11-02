import { act, fireEvent } from "@testing-library/react";
import { touchEvent } from "./pointer";
import type { DriverStep, Point } from "./pointer";

/** Exercise desktop and touch external-drop adapters through native DOM events. */
export function dropExternal(
  container: HTMLElement,
  { step }: { step?: DriverStep } = {}
) {
  const grid = container.matches(".react-grid-layout")
    ? container
    : container.querySelector<HTMLElement>(".react-grid-layout");
  if (!grid) throw new Error("External drop needs a rendered grid");
  const document = grid.ownerDocument;
  const originalHitTest = Object.getOwnPropertyDescriptor(
    document,
    "elementFromPoint"
  );
  let hitTestInstalled = false;
  let source: HTMLElement | null = null;
  let point: Point = { x: 0, y: 0 };
  let hit: Element | null = grid;

  function run(type: string, kind: "mouse" | "touch", action: () => void) {
    if (step)
      step(
        {
          type,
          kind,
          target:
            kind === "touch" && type === "touchstart"
              ? "external-source"
              : "grid",
          ...point
        },
        action
      );
    else act(action);
  }

  function desktop(type: string, at: Point, target: HTMLElement = grid!) {
    point = { ...at };
    // jsdom may construct an Event for a DragEvent and discard its coordinates.
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperties(event, {
      clientX: { value: point.x },
      clientY: { value: point.y }
    });
    run(type, "mouse", () => {
      fireEvent(target, event);
    });
  }

  function setHitTest(nextHit: Element | null) {
    hit = nextHit;
    if (hitTestInstalled) return;
    Object.defineProperty(document, "elementFromPoint", {
      configurable: true,
      value: () => hit
    });
    hitTestInstalled = true;
  }

  function touch(type: string, destination: HTMLElement | Document) {
    const event = touchEvent(type, source!, point);
    run(type, "touch", () => {
      fireEvent(destination, event);
    });
  }

  function restoreHitTest() {
    if (!hitTestInstalled) return;
    if (originalHitTest)
      Object.defineProperty(document, "elementFromPoint", originalHitTest);
    else Reflect.deleteProperty(document, "elementFromPoint");
    hitTestInstalled = false;
  }

  return {
    enter: (at: Point, target?: HTMLElement) =>
      desktop("dragenter", at, target),
    over: (at: Point, target?: HTMLElement) => desktop("dragover", at, target),
    leave: (at: Point = point, target?: HTMLElement) =>
      desktop("dragleave", at, target),
    drop: (at: Point = point, target?: HTMLElement) =>
      desktop("drop", at, target),
    touchStart(node: HTMLElement | null, at: Point) {
      if (!node) throw new Error("Touch drop needs an existing source element");
      if (source)
        throw new Error(
          "Finish the current touch drop before starting another"
        );
      source = node;
      point = { ...at };
      setHitTest(node);
      touch("touchstart", node);
    },
    touchMove(at: Point, over: Element | null = grid) {
      if (!source) throw new Error("Touch drop move needs a preceding start");
      point = { ...at };
      setHitTest(over);
      touch("touchmove", document);
    },
    touchEnd(at: Point = point, over: Element | null = hit) {
      if (!source) return;
      point = { ...at };
      setHitTest(over);
      try {
        touch("touchend", document);
      } finally {
        source = null;
        restoreHitTest();
      }
    },
    touchCancel() {
      if (!source) return;
      try {
        touch("touchcancel", document);
      } finally {
        source = null;
        restoreHitTest();
      }
    },
    uninstall() {
      source = null;
      restoreHitTest();
    }
  };
}
