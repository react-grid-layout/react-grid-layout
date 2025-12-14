import React, { useState, useMemo } from "react";
import {
  GridLayout,
  useContainerWidth,
  gridBounds,
  minMaxSize,
  containerBounds,
  boundedX,
  boundedY,
  defaultConstraints,
  noCompactor,
  verticalCompactor
} from "react-grid-layout";

/**
 * Example 20: Pluggable Constraints
 *
 * This example demonstrates the pluggable constraints system introduced in v2.
 * For full documentation, see:
 * https://github.com/react-grid-layout/react-grid-layout/blob/master/rfcs/0002-pluggable-constraints.md
 *
 * WHAT ARE CONSTRAINTS?
 * ---------------------
 * Constraints are functions that limit where items can be positioned and how
 * they can be resized. They run during drag and resize operations to enforce
 * boundaries and rules.
 *
 * BUILT-IN CONSTRAINTS:
 * ---------------------
 * - gridBounds: Keeps items within the grid (0 to cols, 0 to maxRows)
 * - minMaxSize: Enforces per-item minW/maxW/minH/maxH properties
 * - containerBounds: Keeps items within the visible container height
 * - boundedX: Only constrains horizontal movement (Y is free)
 * - boundedY: Only constrains vertical movement (X is free)
 *
 * IMPORTANT: Compaction vs Constraints
 * ------------------------------------
 * Compaction (vertical/horizontal) runs AFTER constraints and can move items.
 * To see position constraints clearly, disable compaction with noCompactor.
 *
 * TRY IT:
 * -------
 * 1. Enable "No Compaction" to see position constraints in action
 * 2. Select different constraint types and drag items around
 * 3. With boundedY, items can move past column 12 (no X constraint)
 * 4. With boundedX, items can move below row 10 (no Y constraint)
 * 5. Try resizing items 2 and 3 with different constraint options
 *
 * RELATED EXAMPLES:
 * -----------------
 * - Example 21: Aspect ratio constraints (per-item)
 * - Example 22: Creating custom constraints
 */
export default function ConstraintsLayout() {
  const { width, containerRef, mounted } = useContainerWidth();
  const [constraintType, setConstraintType] = useState("default");
  const [useNoCompaction, setUseNoCompaction] = useState(false);
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

  const compactor = useNoCompaction ? noCompactor : verticalCompactor;

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
      <div style={{ marginBottom: 10, display: "flex", gap: 20, flexWrap: "wrap" }}>
        <label>
          Constraint Type:{" "}
          <select
            value={constraintType}
            onChange={(e) => setConstraintType(e.target.value)}
          >
            <option value="default">Default (gridBounds + minMaxSize)</option>
            <option value="boundedX">Bounded X Only (Y free)</option>
            <option value="boundedY">Bounded Y Only (X free)</option>
            <option value="containerBounds">Container Bounds</option>
            <option value="gridBoundsOnly">Grid Bounds Only (no min/max)</option>
            <option value="none">No Constraints</option>
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <input
            type="checkbox"
            checked={useNoCompaction}
            onChange={(e) => setUseNoCompaction(e.target.checked)}
          />
          No Compaction (enables free positioning)
        </label>
      </div>
      <div style={{ marginBottom: 10, fontSize: "0.9em", color: "#666" }}>
        <p style={{ margin: "0 0 8px 0" }}>
          <strong>Active constraints:</strong> [{constraints.map((c) => c.name).join(", ") || "none"}]
          {" | "}
          <strong>Compaction:</strong> {useNoCompaction ? "disabled" : "vertical"}
        </p>
        <p style={{ margin: 0 }}>
          {constraintType === "default" && (
            <>
              <strong>Default:</strong> Items stay within grid bounds (0-12 cols, 0-10 rows).
              Items 2 and 3 respect their minW/maxW/minH/maxH limits.
            </>
          )}
          {constraintType === "boundedX" && (
            <>
              <strong>Bounded X:</strong> Items cannot go past columns 0-12, but Y is unconstrained.
              {!useNoCompaction && " Enable 'No Compaction' to drag items below row 10!"}
            </>
          )}
          {constraintType === "boundedY" && (
            <>
              <strong>Bounded Y:</strong> Items cannot go past rows 0-10, but X is unconstrained.
              Try dragging items past column 12 (to the right)!
            </>
          )}
          {constraintType === "containerBounds" && (
            <>
              <strong>Container Bounds:</strong> Items stay within the visible container.
              Unlike gridBounds, this uses actual pixel height instead of maxRows.
            </>
          )}
          {constraintType === "gridBoundsOnly" && (
            <>
              <strong>Grid Bounds Only:</strong> Items stay within grid, but minW/maxW/minH/maxH
              are NOT enforced. Try resizing items 2 and 3 freely!
            </>
          )}
          {constraintType === "none" && (
            <>
              <strong>No Constraints:</strong> Items can be positioned and resized anywhere.
              Try resizing items 2 and 3 - no limits! Drag items past the grid edges!
            </>
          )}
        </p>
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
          compactor={compactor}
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
