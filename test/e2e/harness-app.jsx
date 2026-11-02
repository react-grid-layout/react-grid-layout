import * as React from "react";
import { createRoot } from "react-dom/client";
import GridLayout, { Responsive, getCompactor } from "react-grid-layout";
import {
  absoluteStrategy,
  transformStrategy,
  createScaledStrategy
} from "react-grid-layout/core";
import LegacyGridLayout from "react-grid-layout/legacy";
import { wrapCompactor } from "react-grid-layout/extras";
import {
  browserScenarios,
  variants,
  gridConfig,
  initialLayout,
  liveLayout,
  desktopDropOverride
} from "../golden-react/scenarioDefinitions";
import "../../css/styles.css";

const query = new URLSearchParams(window.location.search);
const id = query.get("scenario") || "drag-directions";
const variantName = query.get("variant") || "none";
const scenario = browserScenarios.find(s => s.id === id);
const variant = variants.find(v => v.name === variantName) || {
  name: variantName,
  compact: null,
  strategy: variantName.includes("scaled") ? "scaled" : "transform",
  strict: variantName.includes("strict")
};
const scale = variant.strategy === "scaled" ? 0.5 : 1;
const padded = variantName.includes("padding");
const config = { ...gridConfig, containerPadding: padded ? [20, 20] : [0, 0] };
const baseLayout =
  scenario?.layout ||
  (id?.startsWith("preview-")
    ? liveLayout.map(i => ({ ...i, x: 2, y: 2 }))
    : initialLayout);
const callbacks = [];
const clone = value => JSON.parse(JSON.stringify(value));
const round = value => Math.round(value * 100) / 100;
const boxes = () =>
  [
    ...document.querySelectorAll(
      "#scenario-grid [data-item], #scenario-grid .react-grid-placeholder"
    )
  ].map(node => {
    const rect = node.getBoundingClientRect();
    return {
      i: node.dataset.item || "placeholder",
      x: round(rect.x),
      y: round(rect.y),
      width: round(rect.width),
      height: round(rect.height)
    };
  });
const api = (window.__rgl = {
  scale,
  ready: false,
  trace: [],
  frames: [],
  layout: clone(baseLayout),
  breakpoint: null,
  cellToClient(x, y) {
    const grid = document.querySelector("#scenario-grid .react-grid-layout");
    const rect = grid.getBoundingClientRect();
    const cols = api.breakpoint === "sm" ? 3 : config.cols;
    const width = grid.offsetWidth;
    const [mx, my] = config.margin;
    const [px, py] = config.containerPadding;
    const col = (width - 2 * px - (cols - 1) * mx) / cols;
    return {
      x: rect.left + (px + x * (col + mx)) * scale,
      y: rect.top + (py + y * (config.rowHeight + my)) * scale
    };
  },
  // Called once by the driver after each awaited move. rAF only settles React;
  // it never adds samples on its own, so frame counts depend solely on inputs.
  async sample(input, frame = false) {
    await new Promise(resolve => requestAnimationFrame(resolve));
    const entry = {
      input,
      callbacks: callbacks.splice(0),
      layout: clone(api.layout),
      boxes: boxes()
    };
    api.trace.push(entry);
    if (frame) api.frames.push(entry.boxes);
    return api.frames.length;
  }
});
for (const type of ["mousedown", "mousemove"]) {
  document.addEventListener(
    type,
    event => {
      api.pointer = { x: event.clientX, y: event.clientY };
    },
    true
  );
}
const record = (name, layout, oldItem, newItem) => {
  if (Array.isArray(layout)) api.layout = clone(layout);
  callbacks.push({
    name,
    ...(Array.isArray(layout) ? { layout: clone(layout) } : {}),
    ...(newItem ? { item: clone(newItem) } : {})
  });
};
const handlers = Object.fromEntries(
  [
    "onDragStart",
    "onDrag",
    "onDragStop",
    "onResizeStart",
    "onResize",
    "onResizeStop",
    "onLayoutChange",
    "onDrop"
  ].map(name => [name, (...args) => record(name, ...args)])
);

function ScenarioApp() {
  const responsive = id === "breakpoint-crossing";
  const [width, setWidth] = React.useState(
    responsive ? window.innerWidth : 600 + (padded ? 40 : 0)
  );
  React.useEffect(() => {
    const resize = () => setWidth(window.innerWidth);
    if (responsive) window.addEventListener("resize", resize);
    api.ready = true;
    return () => window.removeEventListener("resize", resize);
  }, [responsive]);
  const drop = id === "html5-drop" || id === "touch-drop";
  const edge = id === "edge-scroll";
  const layout = edge
    ? [...baseLayout, { i: "tail", x: 5, y: 15, w: 1, h: 1 }]
    : baseLayout;
  const compact = variant.compact === undefined ? "vertical" : variant.compact;
  const compactor =
    compact === "wrap"
      ? wrapCompactor
      : getCompactor(
          compact,
          !!variant.allowOverlap,
          !!variant.preventCollision
        );
  const axis = id?.startsWith("resize-")
    ? id.slice(7)
    : id?.startsWith("preview-")
      ? id.slice(8)
      : "se";
  const Component = responsive
    ? Responsive
    : variant.api === "legacy"
      ? LegacyGridLayout
      : GridLayout;
  const props =
    variant.api === "legacy"
      ? {
          cols: 6,
          rowHeight: 100,
          margin: config.margin,
          containerPadding: config.containerPadding,
          compactType: compact,
          preventCollision: !!variant.preventCollision,
          allowOverlap: !!variant.allowOverlap,
          isBounded: !!variant.bounded,
          useCSSTransforms: variant.strategy !== "absolute",
          transformScale: scale,
          resizeHandles: [axis],
          isDroppable: drop
        }
      : {
          gridConfig: config,
          compactor,
          positionStrategy:
            variant.strategy === "absolute"
              ? absoluteStrategy
              : variant.strategy === "scaled"
                ? createScaledStrategy(scale)
                : transformStrategy,
          dragConfig: {
            bounded: !!variant.bounded,
            ...(id?.startsWith("preview-") ? { threshold: 0 } : {})
          },
          resizeConfig: { handles: [axis === "drag" ? "se" : axis] },
          dropConfig: { enabled: drop }
        };
  return (
    <>
      <style>
        {
          "body { margin: 0; } .react-grid-item, .react-grid-placeholder { transition: none !important; } [data-item] { background: #ddd; } #touch-source { width: 100px; height: 40px; }"
        }
      </style>
      <div
        id="scenario-grid"
        style={{
          width,
          transform: `scale(${scale})`,
          transformOrigin: "top left"
        }}
      >
        <div
          id="scroll-container"
          style={edge ? { height: 300, overflow: "auto" } : {}}
        >
          <Component
            {...props}
            {...handlers}
            {...(id === "html5-drop"
              ? { onDropDragOver: () => desktopDropOverride }
              : {})}
            width={width}
            autoSize={false}
            style={{ height: edge ? 1700 : 600 }}
            {...(responsive
              ? {
                  layouts: { lg: layout },
                  breakpoints: { lg: 500, sm: 0 },
                  cols: { lg: 6, sm: 3 },
                  margin: config.margin,
                  containerPadding: config.containerPadding,
                  rowHeight: 100,
                  onBreakpointChange: bp => {
                    api.breakpoint = bp;
                  }
                }
              : { layout })}
          >
            {layout.map(item => (
              <div key={item.i} data-item={item.i}>
                {item.i}
              </div>
            ))}
          </Component>
        </div>
      </div>
      <div id="touch-source" data-rgl-draggable={true}>
        Drag source
      </div>
    </>
  );
}

createRoot(document.getElementById("grid")).render(
  variant.strict ? (
    <React.StrictMode>
      <ScenarioApp />
    </React.StrictMode>
  ) : (
    <ScenarioApp />
  )
);
