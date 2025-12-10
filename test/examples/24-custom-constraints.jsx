import React from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import { gridBounds, minMaxSize, snapToGrid } from "react-grid-layout/core";

const ReactGridLayout = WidthProvider(RGL);

/**
 * Custom constraint: Items can only be placed in even columns.
 * Demonstrates how to create your own constraint functions.
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

/**
 * Custom constraint: Keep items in the top half of the grid.
 */
const topHalfOnly = {
  name: "topHalfOnly",
  constrainPosition(item, x, y, context) {
    const maxY = Math.floor(context.maxRows / 2) - item.h;
    return { x, y: Math.min(y, Math.max(0, maxY)) };
  }
};

/**
 * This example demonstrates custom constraint functions.
 * You can create any constraint logic you need.
 */
export default class CustomConstraintsLayout extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    rowHeight: 30,
    onLayoutChange: function () {},
    cols: 12,
    maxRows: 20
  };

  constructor(props) {
    super(props);
    this.state = {
      customConstraint: "none"
    };
  }

  getCustomConstraint() {
    switch (this.state.customConstraint) {
      case "evenColumns": {
        return evenColumnsOnly;
      }
      case "minHeightHalfWidth": {
        return minHeightHalfWidth;
      }
      case "maxArea12": {
        return maxArea(12);
      }
      case "topHalf": {
        return topHalfOnly;
      }
      case "snapToGrid3": {
        return snapToGrid(3);
      }
      default: {
        return null;
      }
    }
  }

  generateLayout() {
    return [
      { i: "0", x: 0, y: 0, w: 2, h: 2 },
      { i: "1", x: 2, y: 0, w: 3, h: 2 },
      { i: "2", x: 5, y: 0, w: 2, h: 3 },
      { i: "3", x: 7, y: 0, w: 3, h: 2 },
      { i: "4", x: 10, y: 0, w: 2, h: 2 },
      { i: "5", x: 0, y: 3, w: 4, h: 2 },
      { i: "6", x: 4, y: 3, w: 4, h: 2 },
      { i: "7", x: 8, y: 3, w: 4, h: 2 }
    ];
  }

  generateDOM() {
    return this.generateLayout().map((l) => (
      <div key={l.i}>
        <span className="text">{l.i}</span>
      </div>
    ));
  }

  onConstraintChange = (e) => {
    this.setState({ customConstraint: e.target.value });
  };

  render() {
    const customConstraint = this.getCustomConstraint();
    const constraints = customConstraint
      ? [gridBounds, minMaxSize, customConstraint]
      : [gridBounds, minMaxSize];

    return (
      <div>
        <div style={{ marginBottom: 10 }}>
          <label>
            Custom Constraint:{" "}
            <select
              value={this.state.customConstraint}
              onChange={this.onConstraintChange}
            >
              <option value="none">None (default behavior)</option>
              <option value="evenColumns">Even Columns Only</option>
              <option value="minHeightHalfWidth">Min Height = Width/2</option>
              <option value="maxArea12">Max Area = 12 units</option>
              <option value="topHalf">Top Half Only</option>
              <option value="snapToGrid3">Snap to Grid (3x3)</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: 10, fontSize: "0.9em", color: "#666" }}>
          <p>Active constraints: [{constraints.map((c) => c.name).join(", ")}]</p>
          <p style={{ marginTop: 5 }}>
            {this.state.customConstraint === "evenColumns" &&
              "Items can only be placed in even columns (0, 2, 4, 6, 8, 10)."}
            {this.state.customConstraint === "minHeightHalfWidth" &&
              "Item height must be at least half its width."}
            {this.state.customConstraint === "maxArea12" &&
              "Item area (w * h) cannot exceed 12 grid units."}
            {this.state.customConstraint === "topHalf" &&
              "Items can only be placed in the top half of the grid."}
            {this.state.customConstraint === "snapToGrid3" &&
              "Items snap to a 3x3 coarse grid."}
            {this.state.customConstraint === "none" &&
              "Select a custom constraint to see it in action."}
          </p>
        </div>
        <div
          style={{
            marginBottom: 10,
            padding: 10,
            backgroundColor: "#f8f9fa",
            borderRadius: 4,
            fontSize: "0.85em"
          }}
        >
          <strong>Creating custom constraints:</strong>
          <pre style={{ margin: "5px 0", overflow: "auto" }}>
            {`const myConstraint = {
  name: "myConstraint",
  constrainPosition(item, x, y, context) {
    // Return modified { x, y }
  },
  constrainSize(item, w, h, handle, context) {
    // Return modified { w, h }
  }
};`}
          </pre>
        </div>
        <ReactGridLayout
          layout={this.generateLayout()}
          onLayoutChange={this.props.onLayoutChange}
          constraints={constraints}
          maxRows={this.props.maxRows}
          {...this.props}
        >
          {this.generateDOM()}
        </ReactGridLayout>
      </div>
    );
  }
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then((fn) => fn.default(CustomConstraintsLayout));
}
