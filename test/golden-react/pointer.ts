import { act } from "@testing-library/react";

export interface Point {
  x: number;
  y: number;
}
export type PointerKind = "mouse" | "touch";
export interface DriverInput extends Point {
  type: string;
  kind: PointerKind;
  target?: string;
}
export type DriverStep = (input: DriverInput, action: () => void) => void;

/** Touch coordinates belong to Touch objects, never to the TouchEvent itself. */
export function touchEvent(
  type: string,
  target: EventTarget,
  point: Point,
  identifier = 1
): Event {
  const touch = {
    identifier,
    target,
    clientX: point.x,
    clientY: point.y,
    pageX: point.x,
    pageY: point.y,
    screenX: point.x,
    screenY: point.y
  };
  const active = type !== "touchend" && type !== "touchcancel";
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    touches: { value: active ? [touch] : [] },
    targetTouches: { value: active ? [touch] : [] },
    changedTouches: { value: [touch] }
  });
  return event;
}

export function createPointer({
  kind = "mouse",
  step
}: { kind?: PointerKind; step?: DriverStep } = {}) {
  let target: HTMLElement | null = null;
  let point: Point = { x: 0, y: 0 };
  const identifier = 1;

  function dispatch(type: string, destination: EventTarget) {
    const event =
      kind === "touch"
        ? touchEvent(type, target!, point, identifier)
        : new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            button: 0,
            buttons: type === "mouseup" ? 0 : 1,
            clientX: point.x,
            clientY: point.y
          });
    const action = () => {
      destination.dispatchEvent(event);
    };
    const item = target?.closest<HTMLElement>(".react-grid-item");
    const id = item?.dataset.item ?? "external";
    const axis = target?.className.match(/react-resizable-handle-(\w+)/)?.[1];
    if (step)
      step(
        { type, kind, target: axis ? `${id}:handle:${axis}` : id, ...point },
        action
      );
    else act(action);
  }

  return {
    down(node: HTMLElement | null, at: Point) {
      if (!node)
        throw new Error("Pointer down needs an existing item or handle");
      if (target)
        throw new Error("Release the current pointer before starting another");
      target = node;
      point = { ...at };
      dispatch(kind === "touch" ? "touchstart" : "mousedown", node);
    },
    move(at: Point) {
      if (!target) throw new Error("Pointer move needs a preceding down");
      point = { ...at };
      dispatch(
        kind === "touch" ? "touchmove" : "mousemove",
        target.ownerDocument
      );
    },
    up() {
      if (!target) return;
      dispatch(kind === "touch" ? "touchend" : "mouseup", target.ownerDocument);
      target = null;
    },
    cancel() {
      if (!target) return;
      // Mouse has no cancel event. Its native release closes DraggableCore.
      dispatch(
        kind === "touch" ? "touchcancel" : "mouseup",
        target.ownerDocument
      );
      target = null;
    }
  };
}

export function resizeHandle(
  container: HTMLElement,
  id: string,
  axis: string
): HTMLElement {
  const item = Array.from(
    container.querySelectorAll<HTMLElement>(".react-grid-item")
  ).find(node => node.dataset["item"] === id);
  const handle = item?.querySelector<HTMLElement>(
    `.react-resizable-handle-${axis}`
  );
  if (!handle) throw new Error(`Missing resize handle ${axis} on item ${id}`);
  return handle;
}
