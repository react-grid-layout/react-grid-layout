import React from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import {
  gridBounds,
  minMaxSize,
  aspectRatio
} from "react-grid-layout/core";

const ReactGridLayout = WidthProvider(RGL);

/**
 * This example demonstrates the aspectRatio constraint factory.
 * Each item maintains its aspect ratio during resize operations.
 */
export default class AspectRatioLayout extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    rowHeight: 30,
    onLayoutChange: function () {},
    cols: 12
  };

  generateLayout() {
    // Each item has a different aspect ratio constraint
    return [
      // 16:9 widescreen items
      { i: "video1", x: 0, y: 0, w: 4, h: 2, constraints: [aspectRatio(16 / 9)] },
      { i: "video2", x: 4, y: 0, w: 4, h: 2, constraints: [aspectRatio(16 / 9)] },
      // Square items (1:1)
      { i: "square1", x: 8, y: 0, w: 2, h: 2, constraints: [aspectRatio(1)] },
      { i: "square2", x: 10, y: 0, w: 2, h: 2, constraints: [aspectRatio(1)] },
      // 4:3 items
      { i: "photo1", x: 0, y: 3, w: 3, h: 2, constraints: [aspectRatio(4 / 3)] },
      { i: "photo2", x: 3, y: 3, w: 3, h: 2, constraints: [aspectRatio(4 / 3)] },
      // 2:1 wide items
      { i: "banner1", x: 6, y: 3, w: 6, h: 3, constraints: [aspectRatio(2)] },
      // Unconstrained item for comparison
      { i: "free", x: 0, y: 6, w: 4, h: 3 }
    ];
  }

  generateDOM() {
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

    return items.map((item) => (
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
    ));
  }

  render() {
    // Grid-level constraints (applied to all items)
    const gridConstraints = [gridBounds, minMaxSize];

    return (
      <div>
        <div style={{ marginBottom: 10, fontSize: "0.9em", color: "#666" }}>
          <p>
            Each item has a per-item <code>aspectRatio</code> constraint. Try
            resizing them - they will maintain their aspect ratio.
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
        <ReactGridLayout
          layout={this.generateLayout()}
          onLayoutChange={this.props.onLayoutChange}
          constraints={gridConstraints}
          {...this.props}
        >
          {this.generateDOM()}
        </ReactGridLayout>
      </div>
    );
  }
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then((fn) => fn.default(AspectRatioLayout));
}
