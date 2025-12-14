import React, { useState, useMemo } from "react";
import {
  GridLayout,
  useContainerWidth,
  gridBounds,
  minMaxSize,
  aspectRatio
} from "react-grid-layout";

/**
 * This example demonstrates the aspectRatio constraint factory.
 * Each item maintains its aspect ratio during resize operations.
 *
 * Note: Initial layout heights are approximate. The constraint enforces
 * the correct pixel aspect ratio when you resize.
 */
export default function AspectRatioLayout() {
  const { width, containerRef, mounted } = useContainerWidth();

  // Pre-create constraint instances to avoid recreating on each render
  const constraints16x9 = useMemo(() => [aspectRatio(16 / 9)], []);
  const constraints1x1 = useMemo(() => [aspectRatio(1)], []);
  const constraints4x3 = useMemo(() => [aspectRatio(4 / 3)], []);
  const constraints2x1 = useMemo(() => [aspectRatio(2)], []);

  const [layout, setLayout] = useState([
    // 16:9 widescreen items
    { i: "video1", x: 0, y: 0, w: 4, h: 6, constraints: constraints16x9 },
    { i: "video2", x: 4, y: 0, w: 4, h: 6, constraints: constraints16x9 },
    // Square items 1:1
    { i: "square1", x: 8, y: 0, w: 2, h: 5, constraints: constraints1x1 },
    { i: "square2", x: 10, y: 0, w: 2, h: 5, constraints: constraints1x1 },
    // 4:3 items
    { i: "photo1", x: 0, y: 6, w: 3, h: 6, constraints: constraints4x3 },
    { i: "photo2", x: 3, y: 6, w: 3, h: 6, constraints: constraints4x3 },
    // 2:1 wide items
    { i: "banner1", x: 6, y: 6, w: 6, h: 8, constraints: constraints2x1 },
    // Unconstrained item for comparison
    { i: "free", x: 0, y: 12, w: 4, h: 3 }
  ]);

  // Grid-level constraints (applied to all items)
  const gridConstraints = useMemo(() => [gridBounds, minMaxSize], []);

  const items = [
    { key: "video1", label: "16:9 Video", color: "#e74c3c" },
    { key: "video2", label: "16:9 Video", color: "#e74c3c" },
    { key: "square1", label: "1:1 Square", color: "#3498db" },
    { key: "square2", label: "1:1 Square", color: "#3498db" },
    { key: "photo1", label: "4:3 Photo", color: "#2ecc71" },
    { key: "photo2", label: "4:3 Photo", color: "#2ecc71" },
    { key: "banner1", label: "2:1 Banner", color: "#9b59b6" },
    { key: "free", label: "No Constraint", color: "#95a5a6" }
  ];

  const children = useMemo(
    () =>
      items.map((item) => (
        <div
          key={item.key}
          style={{
            backgroundColor: item.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <span className="text" style={{ color: "white", fontWeight: "bold" }}>
            {item.label}
          </span>
        </div>
      )),
    []
  );

  return (
    <div ref={containerRef}>
      <div style={{ marginBottom: 10, fontSize: "0.9em", color: "#666" }}>
        <p>
          Each item has a per-item <code>aspectRatio</code> constraint.
          Try resizing them - they will maintain their aspect ratio <strong>in pixels</strong>.
        </p>
        <p style={{ marginTop: 5, fontStyle: "italic" }}>
          Note: Initial heights are approximations. Resize any item to see the constraint enforce the correct pixel proportions.
        </p>
        <ul style={{ margin: "5px 0", paddingLeft: 20 }}>
          <li>
            <span style={{ color: "#e74c3c" }}>Red</span>: 16:9 (widescreen)
          </li>
          <li>
            <span style={{ color: "#3498db" }}>Blue</span>: 1:1 (square)
          </li>
          <li>
            <span style={{ color: "#2ecc71" }}>Green</span>: 4:3 (photo)
          </li>
          <li>
            <span style={{ color: "#9b59b6" }}>Purple</span>: 2:1 (banner)
          </li>
          <li>
            <span style={{ color: "#95a5a6" }}>Gray</span>: No constraint
          </li>
        </ul>
      </div>
      {mounted && (
        <GridLayout
          width={width}
          layout={layout}
          onLayoutChange={setLayout}
          gridConfig={{ cols: 12, rowHeight: 30 }}
          dragConfig={{ enabled: true }}
          resizeConfig={{ enabled: true }}
          constraints={gridConstraints}
        >
          {children}
        </GridLayout>
      )}
    </div>
  );
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then((fn) => fn.default(AspectRatioLayout));
}
