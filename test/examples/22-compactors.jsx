import React, { useState, useMemo, useCallback } from "react";
import ReactGridLayout, { useContainerWidth } from "react-grid-layout";
import {
  verticalCompactor,
  horizontalCompactor,
  noCompactor
} from "../../src/core/compactors";
import {
  fastVerticalCompactor,
  fastHorizontalCompactor
} from "../../src/extras";

// All available compactors with display names
const COMPACTORS = {
  vertical: { compactor: verticalCompactor, label: "Vertical (default)" },
  horizontal: { compactor: horizontalCompactor, label: "Horizontal" },
  fastVertical: {
    compactor: fastVerticalCompactor,
    label: "Fast Vertical (O(n log n))"
  },
  fastHorizontal: {
    compactor: fastHorizontalCompactor,
    label: "Fast Horizontal (O(n log n))"
  },
  none: { compactor: noCompactor, label: "None (free placement)" }
};

function generateLayout(count) {
  return Array.from({ length: count }, (_, i) => {
    const h = Math.ceil(Math.random() * 4) + 1;
    return {
      i: i.toString(),
      x: Math.round(Math.random() * 5) * 2,
      y: Math.floor(i / 6) * h,
      w: 2,
      h
    };
  });
}

export default function CompactorShowcase() {
  const { width, containerRef, mounted } = useContainerWidth();
  const [selectedCompactor, setSelectedCompactor] = useState("vertical");
  const [preventCollision, setPreventCollision] = useState(false);
  const [itemCount, setItemCount] = useState(20);
  const [layout, setLayout] = useState(() => generateLayout(20));

  const compactorConfig = COMPACTORS[selectedCompactor];

  // Build compactor with options
  const compactor = useMemo(() => {
    const base = compactorConfig.compactor;
    if (preventCollision) {
      return { ...base, preventCollision: true };
    }
    return base;
  }, [compactorConfig, preventCollision]);

  const onCompactorChange = useCallback((e) => {
    const newCompactor = e.target.value;
    setSelectedCompactor(newCompactor);
    // Auto-enable preventCollision when "none" is selected
    if (newCompactor === "none") {
      setPreventCollision(true);
    }
  }, []);

  const onPreventCollisionChange = useCallback((e) => {
    setPreventCollision(e.target.checked);
  }, []);

  const onItemCountChange = useCallback((e) => {
    const count = Number.parseInt(e.target.value, 10) || 20;
    setItemCount(count);
    setLayout(generateLayout(count));
  }, []);

  const onNewLayout = useCallback(() => {
    setLayout(generateLayout(itemCount));
  }, [itemCount]);

  const onLayoutChange = useCallback((newLayout) => {
    setLayout(newLayout);
  }, []);

  const children = useMemo(
    () =>
      layout.map((item) => (
        <div key={item.i}>
          <span className="text">{item.i}</span>
        </div>
      )),
    [layout]
  );

  return (
    <div ref={containerRef}>
      <div
        style={{
          marginBottom: 10,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center"
        }}
      >
        <label>
          Compactor:{" "}
          <select
            value={selectedCompactor}
            onChange={onCompactorChange}
            style={{ padding: "4px 8px", fontSize: 14 }}
          >
            {Object.entries(COMPACTORS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            checked={preventCollision}
            onChange={onPreventCollisionChange}
            style={{ marginRight: 4 }}
          />
          Prevent Collision
        </label>

        <label>
          Items:{" "}
          <input
            type="number"
            value={itemCount}
            onChange={onItemCountChange}
            min={1}
            max={500}
            style={{ width: 60, padding: "4px 8px", fontSize: 14 }}
          />
        </label>

        <button
          onClick={onNewLayout}
          style={{ padding: "4px 12px", fontSize: 14 }}
        >
          Generate New Layout
        </button>
      </div>

      <div
        style={{
          marginBottom: 10,
          padding: 10,
          background: "#f5f5f5",
          borderRadius: 4
        }}
      >
        <strong>Current:</strong> {compactorConfig.label}
        {preventCollision && " + Prevent Collision"}
        {selectedCompactor.startsWith("fast") && (
          <span style={{ marginLeft: 10, color: "#666" }}>
            (Optimized for large layouts with 200+ items)
          </span>
        )}
        {selectedCompactor === "none" && (
          <span style={{ marginLeft: 10, color: "#666" }}>
            (Items stay where placed, no auto-packing)
          </span>
        )}
      </div>

      {mounted && (
        <ReactGridLayout
          className="layout"
          layout={layout}
          onLayoutChange={onLayoutChange}
          compactor={compactor}
          width={width}
          gridConfig={{ cols: 12, rowHeight: 30 }}
          dragConfig={{ enabled: true }}
          resizeConfig={{ enabled: true }}
        >
          {children}
        </ReactGridLayout>
      )}
    </div>
  );
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then((fn) => fn.default(CompactorShowcase));
}
