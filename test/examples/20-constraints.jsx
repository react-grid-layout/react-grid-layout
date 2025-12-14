import React, { useState, useMemo } from "react";
import {
  GridLayout,
  useContainerWidth,
  gridBounds,
  minMaxSize,
  containerBounds,
  boundedX,
  boundedY,
  defaultConstraints
} from "react-grid-layout";

/**
 * This example demonstrates the pluggable constraints system.
 * Select different constraint types from the dropdown to see how they affect
 * drag and resize behavior.
 */
export default function ConstraintsLayout() {
  const { width, containerRef, mounted } = useContainerWidth();
  const [constraintType, setConstraintType] = useState("default");
  const [layout, setLayout] = useState([
    { i: "0", x: 0, y: 0, w: 2, h: 2 },
    { i: "1", x: 2, y: 0, w: 2, h: 3 },
    { i: "2", x: 4, y: 0, w: 2, h: 2, minW: 2, maxW: 4 },
    { i: "3", x: 6, y: 0, w: 2, h: 4, minH: 2, maxH: 6 },
    { i: "4", x: 8, y: 0, w: 2, h: 2 },
    { i: "5", x: 10, y: 0, w: 2, h: 3 },
    { i: "6", x: 0, y: 4, w: 4, h: 2 },
    { i: "7", x: 4, y: 4, w: 4, h: 2 },
    { i: "8", x: 8, y: 4, w: 4, h: 2 }
  ]);

  const constraints = useMemo(() => {
    switch (constraintType) {
      case "boundedX": {
        // boundedX replaces gridBounds - only constrain X axis, Y is free
        return [boundedX, minMaxSize];
      }
      case "boundedY": {
        // boundedY replaces gridBounds - only constrain Y axis, X is free
        return [boundedY, minMaxSize];
      }
      case "containerBounds": {
        // containerBounds constrains to visible container
        return [containerBounds, minMaxSize];
      }
      case "gridBoundsOnly": {
        return [gridBounds];
      }
      case "none": {
        return [];
      }
      default: {
        return defaultConstraints;
      }
    }
  }, [constraintType]);

  const labels = [
    "Normal",
    "Normal",
    "minW:2, maxW:4",
    "minH:2, maxH:6",
    "Normal",
    "Normal",
    "Wide",
    "Wide",
    "Wide"
  ];

  const children = useMemo(
    () =>
      layout.map((l, i) => (
        <div key={l.i}>
          <span className="text">{labels[i]}</span>
        </div>
      )),
    [layout]
  );

  return (
    <div ref={containerRef}>
      <div style={{ marginBottom: 10 }}>
        <label>
          Constraint Type:{" "}
          <select
            value={constraintType}
            onChange={(e) => setConstraintType(e.target.value)}
          >
            <option value="default">Default (gridBounds + minMaxSize)</option>
            <option value="boundedX">Bounded X Only</option>
            <option value="boundedY">Bounded Y Only</option>
            <option value="containerBounds">Container Bounds</option>
            <option value="gridBoundsOnly">Grid Bounds Only (no min/max)</option>
            <option value="none">No Constraints</option>
          </select>
        </label>
      </div>
      <div style={{ marginBottom: 10, fontSize: "0.9em", color: "#666" }}>
        Active constraints: [{constraints.map((c) => c.name).join(", ")}]
      </div>
      {mounted && (
        <GridLayout
          width={width}
          layout={layout}
          onLayoutChange={setLayout}
          gridConfig={{ cols: 12, rowHeight: 30, maxRows: 10 }}
          dragConfig={{ enabled: true }}
          resizeConfig={{ enabled: true }}
          constraints={constraints}
        >
          {children}
        </GridLayout>
      )}
    </div>
  );
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then((fn) => fn.default(ConstraintsLayout));
}
