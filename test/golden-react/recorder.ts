import React from "react";
import { act } from "@testing-library/react";
import { normalize } from "../golden/serialize";

// Pass-through instrumentation: retain the real GridItem and its memo comparator.
// No drag/resize dependency is mocked. Profiler timings are deliberately omitted.
jest.mock("../../src/react/components/GridItem", () => {
  const React = jest.requireActual("react");
  const actual = jest.requireActual("../../src/react/components/GridItem");
  const Original = actual.default;
  const Profiled = React.memo((props: any) => {
    const id = props.className?.includes("react-grid-placeholder")
      ? `placeholder:${props.i}`
      : props.i;
    return React.createElement(
      React.Profiler,
      {
        id,
        onRender: () => jest.requireActual("./recorder").recordItemCommit(id)
      },
      React.createElement(Original, props)
    );
  }, Original.compare);
  Profiled.displayName = "ProfiledGridItem";
  return { ...actual, default: Profiled, GridItem: Profiled };
});

let activeRenders: Record<string, number> | undefined;
export function recordItemCommit(id: string) {
  if (activeRenders) activeRenders[id] = (activeRenders[id] ?? 0) + 1;
}

export function nodeId(node: Element | null | undefined): string | null {
  if (!node) return null;
  const item = node.closest<HTMLElement>(".react-grid-item");
  const id =
    item?.dataset.item ??
    (item?.classList.contains("dropping") ? "__dropping-elem__" : null);
  const axis = [...node.classList].find(name =>
    /^react-resizable-handle-\w+$/.test(name)
  );
  if (axis)
    return `${id ?? "placeholder"}:handle:${axis.replace("react-resizable-handle-", "")}`;
  if (node.classList.contains("react-grid-placeholder")) return "placeholder";
  return (
    id ??
    (node.classList.contains("react-grid-layout")
      ? "grid"
      : node.tagName.toLowerCase())
  );
}

function styleFrame(node: HTMLElement) {
  return {
    style: Object.fromEntries(
      ["transform", "top", "left", "width", "height"].map(key => [
        key,
        node.style.getPropertyValue(key)
      ])
    ),
    classNames: [...node.classList].sort(),
    handles: [...node.querySelectorAll(".react-resizable-handle")].map(handle =>
      nodeId(handle)
    )
  };
}

export function domFrame(container?: HTMLElement) {
  const grid = container?.querySelector<HTMLElement>(".react-grid-layout");
  if (!grid)
    return {
      items: [],
      placeholder: null,
      containerHeight: null,
      dropping: false
    };
  const nodes = [...grid.querySelectorAll<HTMLElement>(".react-grid-item")];
  const placeholder = nodes.find(node =>
    node.classList.contains("react-grid-placeholder")
  );
  return {
    items: nodes
      .filter(node => node !== placeholder)
      .map(node => ({ i: nodeId(node), ...styleFrame(node) })),
    placeholder: placeholder ? styleFrame(placeholder) : null,
    containerHeight: grid.style.height,
    dropping: nodes.some(node => node.classList.contains("dropping"))
  };
}

const interactionCallbacks = [
  "onDragStart",
  "onDrag",
  "onDragStop",
  "onResizeStart",
  "onResize",
  "onResizeStop"
];
const callbackNames = [
  ...interactionCallbacks,
  "onDrop",
  "onDropDragOver",
  "onLayoutChange",
  "onBreakpointChange",
  "onWidthChange"
];

export function withRecorder(
  handlers: Record<string, (...args: any[]) => any> = {}
) {
  const trace: any[] = [];
  const renders: Record<string, number> = {};
  let container: HTMLElement | undefined;
  let callbacks: any[] = [];
  let notes: unknown[] = [];
  const props = Object.fromEntries(
    callbackNames.map(name => [
      name,
      (...args: any[]) => {
        let payload: object;
        if (interactionCallbacks.includes(name)) {
          payload = {
            layout: args[0],
            oldItem: args[1],
            newItem: args[2],
            placeholder: args[3],
            eventType: args[4]?.type,
            node: nodeId(args[5])
          };
        } else if (name === "onDrop") {
          payload = {
            layout: args[0],
            item: args[1],
            eventType: args[2]?.type
          };
        } else if (name === "onDropDragOver") {
          payload = { eventType: args[0]?.type };
        } else {
          payload = { args };
        }
        const entry: any = normalize({ name, ...payload });
        callbacks.push(entry);
        const result = handlers[name]?.(...args);
        if (name === "onDropDragOver") entry.result = normalize(result);
        return result;
      }
    ])
  );
  return {
    props,
    trace,
    renders,
    attach(element: HTMLElement) {
      container = element;
    },
    note(value: unknown) {
      notes.push(normalize(value));
    },
    step(input: object, action: () => void) {
      activeRenders = renders;
      act(action);
      // Callbacks and notes were normalized at their capture boundary. Encoding
      // them again would escape generated sentinels as ordinary "$" objects.
      trace.push({
        input: normalize(input),
        callbacks,
        dom: normalize(domFrame(container)),
        renders: normalize({ ...renders }),
        ...(notes.length > 0 ? { notes } : {})
      });
      callbacks = [];
      notes = [];
    },
    wrap(child: React.ReactNode) {
      activeRenders = renders;
      return React.createElement(
        React.Profiler,
        { id: "grid", onRender: () => recordItemCommit("grid") },
        child
      );
    }
  };
}
