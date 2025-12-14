import React, { useState, useMemo, useCallback } from "react";
import {
  GridLayout,
  useContainerWidth,
  gridBounds,
  minMaxSize,
  snapToGrid
} from "react-grid-layout";

/**
 * Example 21: Custom Constraints
 *
 * This example demonstrates how to create your own constraint functions.
 * For full documentation, see:
 * https://github.com/react-grid-layout/react-grid-layout/blob/master/rfcs/0002-pluggable-constraints.md
 *
 * CREATING CUSTOM CONSTRAINTS:
 * ----------------------------
 * A constraint is an object with:
 * - name: string identifier for debugging
 * - constrainPosition?(item, x, y, context): constrain drag position
 * - constrainSize?(item, w, h, handle, context): constrain resize dimensions
 *
 * CONSTRAINT CONTEXT:
 * -------------------
 * The context parameter provides:
 * - cols: number of columns
 * - maxRows: maximum rows
 * - containerWidth/containerHeight: container dimensions in pixels
 * - rowHeight: row height in pixels
 * - margin: [horizontal, vertical] margins
 * - layout: current layout array
 *
 * RELATED EXAMPLES:
 * -----------------
 * - Example 19: Built-in constraints (gridBounds, boundedX, etc.)
 * - Example 20: Aspect ratio constraints (per-item)
 */

/**
 * Custom constraint: Items can only be placed in even columns.
 */
const evenColumnsOnly = {
  name: "evenColumnsOnly",
  constrainPosition(_item, x, y, _context) {
    // Round x to nearest even number
    const evenX = Math.round(x / 2) * 2;
    return { x: evenX, y };
  }
};

/**
 * Custom constraint: Height must be at least half the width.
 */
const minHeightHalfWidth = {
  name: "minHeightHalfWidth",
  constrainSize(_item, w, h, _handle, _context) {
    const minH = Math.ceil(w / 2);
    return { w, h: Math.max(h, minH) };
  }
};

/**
 * Custom constraint: Maximum combined area of 12 grid units.
 */
const maxArea = (area) => ({
  name: `maxArea(${area})`,
  constrainSize(_item, w, h, handle, _context) {
    const currentArea = w * h;
    if (currentArea <= area) {
      return { w, h };
    }
    // Reduce the dimension being resized
    if (handle.includes("e") || handle.includes("w")) {
      return { w: Math.floor(area / h), h };
    }
    return { w, h: Math.floor(area / w) };
  }
});

// Source code strings for display
const constraintSources = {
  evenColumns: `const evenColumnsOnly = {
  name: "evenColumnsOnly",
  constrainPosition(item, x, y, context) {
    // Round x to nearest even number
    const evenX = Math.round(x / 2) * 2;
    return { x: evenX, y };
  }
};`,
  minHeightHalfWidth: `const minHeightHalfWidth = {
  name: "minHeightHalfWidth",
  constrainSize(item, w, h, handle, context) {
    const minH = Math.ceil(w / 2);
    return { w, h: Math.max(h, minH) };
  }
};`,
  maxArea12: `const maxArea = (area) => ({
  name: \`maxArea(\${area})\`,
  constrainSize(item, w, h, handle, context) {
    const currentArea = w * h;
    if (currentArea <= area) {
      return { w, h };
    }
    // Reduce the dimension being resized
    if (handle.includes("e") || handle.includes("w")) {
      return { w: Math.floor(area / h), h };
    }
    return { w, h: Math.floor(area / w) };
  }
});`,
  snapToGrid3: `// Built-in factory function from react-grid-layout
snapToGrid(3)

// Equivalent to:
const snapToGrid = (stepX, stepY = stepX) => ({
  name: \`snapToGrid(\${stepX}, \${stepY})\`,
  constrainPosition(item, x, y, context) {
    return {
      x: Math.round(x / stepX) * stepX,
      y: Math.round(y / stepY) * stepY
    };
  }
});`
};

/**
 * This example demonstrates custom constraint functions.
 * You can create any constraint logic you need.
 */
export default function CustomConstraintsLayout(props) {
  const { width, containerRef, mounted } = useContainerWidth();
  const [customConstraint, setCustomConstraint] = useState("none");
  const [layout, setLayoutState] = useState([
    { i: "0", x: 0, y: 0, w: 2, h: 2 },
    { i: "1", x: 2, y: 0, w: 3, h: 2 },
    { i: "2", x: 5, y: 0, w: 2, h: 3 },
    { i: "3", x: 7, y: 0, w: 3, h: 2 },
    { i: "4", x: 10, y: 0, w: 2, h: 2 },
    { i: "5", x: 0, y: 3, w: 4, h: 2 },
    { i: "6", x: 4, y: 3, w: 4, h: 2 },
    { i: "7", x: 8, y: 3, w: 4, h: 2 }
  ]);

  const setLayout = useCallback((newLayout) => {
    setLayoutState(newLayout);
    props.onLayoutChange?.(newLayout);
  }, [props]);

  const getCustomConstraint = () => {
    switch (customConstraint) {
      case "evenColumns": {
        return evenColumnsOnly;
      }
      case "minHeightHalfWidth": {
        return minHeightHalfWidth;
      }
      case "maxArea12": {
        return maxArea(12);
      }
      case "snapToGrid3": {
        return snapToGrid(3);
      }
      default: {
        return null;
      }
    }
  };

  const constraints = useMemo(() => {
    const custom = getCustomConstraint();
    return custom ? [gridBounds, minMaxSize, custom] : [gridBounds, minMaxSize];
  }, [customConstraint]);

  const children = useMemo(
    () =>
      layout.map((l) => (
        <div key={l.i}>
          <span className="text">{l.i}</span>
        </div>
      )),
    [layout]
  );

  const descriptionText = {
    evenColumns: "Items can only be placed in even columns (0, 2, 4, 6, 8, 10).",
    minHeightHalfWidth: "Item height must be at least half its width.",
    maxArea12: "Item area (w × h) cannot exceed 12 grid units.",
    snapToGrid3: "Items snap to a 3×3 coarse grid.",
    none: "Select a custom constraint to see it in action."
  };

  return (
    <div ref={containerRef}>
      <div style={{ marginBottom: 10 }}>
        <label>
          Custom Constraint:{" "}
          <select
            value={customConstraint}
            onChange={(e) => setCustomConstraint(e.target.value)}
          >
            <option value="none">None (default behavior)</option>
            <option value="evenColumns">Even Columns Only</option>
            <option value="minHeightHalfWidth">Min Height = Width/2</option>
            <option value="maxArea12">Max Area = 12 units</option>
            <option value="snapToGrid3">Snap to Grid (3×3)</option>
          </select>
        </label>
      </div>
      <div style={{ marginBottom: 10, fontSize: "0.9em", color: "#666" }}>
        <p>Active constraints: [{constraints.map((c) => c.name).join(", ")}]</p>
        <p style={{ marginTop: 5 }}>{descriptionText[customConstraint]}</p>
      </div>
      {customConstraint !== "none" && constraintSources[customConstraint] && (
        <div
          style={{
            marginBottom: 10,
            padding: 10,
            backgroundColor: "#1e1e1e",
            borderRadius: 4,
            fontSize: "0.85em",
            overflow: "auto"
          }}
        >
          <pre style={{ margin: 0, color: "#d4d4d4", whiteSpace: "pre-wrap" }}>
            {constraintSources[customConstraint]}
          </pre>
        </div>
      )}
      {mounted && (
        <GridLayout
          width={width}
          layout={layout}
          onLayoutChange={setLayout}
          gridConfig={{ cols: 12, rowHeight: 30, maxRows: 20 }}
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
  import("../test-hook.jsx").then((fn) => fn.default(CustomConstraintsLayout));
}
