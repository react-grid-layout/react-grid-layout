import React from "react";
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout";
import {
  gridBounds,
  minMaxSize,
  containerBounds,
  boundedX,
  boundedY,
  defaultConstraints
} from "react-grid-layout/core";

const ReactGridLayout = WidthProvider(RGL);

/**
 * This example demonstrates the pluggable constraints system.
 * Different items have different constraint behaviors.
 */
export default class ConstraintsLayout extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    rowHeight: 30,
    onLayoutChange: function () {},
    cols: 12
  };

  constructor(props) {
    super(props);
    this.state = {
      constraintType: "default"
    };
  }

  getConstraints() {
    switch (this.state.constraintType) {
      case "boundedX": {
        return [gridBounds, minMaxSize, boundedX];
      }
      case "boundedY": {
        return [gridBounds, minMaxSize, boundedY];
      }
      case "containerBounds": {
        return [gridBounds, minMaxSize, containerBounds];
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
  }

  generateLayout() {
    return [
      { i: "0", x: 0, y: 0, w: 2, h: 2 },
      { i: "1", x: 2, y: 0, w: 2, h: 3 },
      { i: "2", x: 4, y: 0, w: 2, h: 2, minW: 2, maxW: 4 },
      { i: "3", x: 6, y: 0, w: 2, h: 4, minH: 2, maxH: 6 },
      { i: "4", x: 8, y: 0, w: 2, h: 2 },
      { i: "5", x: 10, y: 0, w: 2, h: 3 },
      { i: "6", x: 0, y: 4, w: 4, h: 2 },
      { i: "7", x: 4, y: 4, w: 4, h: 2 },
      { i: "8", x: 8, y: 4, w: 4, h: 2 }
    ];
  }

  generateDOM() {
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
    return this.generateLayout().map((l, i) => (
      <div key={l.i} className={l.static ? "static" : ""}>
        <span className="text">{labels[i]}</span>
      </div>
    ));
  }

  onConstraintChange = (e) => {
    this.setState({ constraintType: e.target.value });
  };

  render() {
    const constraints = this.getConstraints();

    return (
      <div>
        <div style={{ marginBottom: 10 }}>
          <label>
            Constraint Type:{" "}
            <select
              value={this.state.constraintType}
              onChange={this.onConstraintChange}
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
        <ReactGridLayout
          layout={this.generateLayout()}
          onLayoutChange={this.props.onLayoutChange}
          constraints={constraints}
          {...this.props}
        >
          {this.generateDOM()}
        </ReactGridLayout>
      </div>
    );
  }
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then((fn) => fn.default(ConstraintsLayout));
}
