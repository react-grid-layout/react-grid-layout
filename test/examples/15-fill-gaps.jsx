import React from "react";
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class FillGapsLayout extends React.Component {
  static defaultProps = {
    className: "layout",
    rowHeight: 200,
    onLayoutChange: function() {},
    cols: { lg: 4, md: 3, sm:2, xs: 1, xxs: 1 },
    initialLayout: generateLayout()
  };

  state = {
    currentBreakpoint: "lg",
    compactType: "vertical",
    mounted: false,
    layouts: { lg: this.props.initialLayout }
  };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  generateDOM() {
    return _.map(this.state.layouts.lg, function(l, i) {
      return (
        <div key={i} className={l.hideOnDrag ? "static" : ""}>
          {l.hideOnDrag ? (
            <span
              className="text"
              title="This item is static and cannot be removed or resized."
            >
              hideOnDrag - {i}
            </span>
          ) : (
            <span className="text">{l.hideOnDrag ? `hideOnDrag-${i}` : i}</span>
          )}
        </div>
      );
    });
  }

  onBreakpointChange = breakpoint => {
    this.setState({
      currentBreakpoint: breakpoint
    });
  };

  onCompactTypeChange = () => {
    const { compactType: oldCompactType } = this.state;
    const compactType =
      oldCompactType === "horizontal"
        ? "vertical"
        : oldCompactType === "vertical" ? null : "horizontal";
    this.setState({ compactType });
  };

  onLayoutChange = (layout, layouts) => {
    this.props.onLayoutChange(layout, layouts);
  };

  onNewLayout = () => {
    this.setState({
      layouts: { lg: generateLayout() }
    });
  };

  render() {
    return (
      <div>
        <div>
          Current Breakpoint: {this.state.currentBreakpoint} ({
            this.props.cols[this.state.currentBreakpoint]
          }{" "}
          columns)
        </div>
        <div>
          Compaction type:{" "}
          {_.capitalize(this.state.compactType) || "No Compaction"}
        </div>
        <button onClick={this.onNewLayout}>Generate New Layout</button>
        <button onClick={this.onCompactTypeChange}>
          Change Compaction Type
        </button>
        <ResponsiveReactGridLayout
          {...this.props}
          layouts={this.state.layouts}
          onBreakpointChange={this.onBreakpointChange}
          onLayoutChange={this.onLayoutChange}
          heightUnits={3}
          // Gap props
          fillGaps={true}
          lastRowGap={true}
          gapRenderFunction={(gap) => {
              return (
                  <div style={{ height: 'inherit', backgroundColor: 'green' }}>{gap.i}</div>
              );
          }}
          // WidthProvider option
          measureBeforeMount={false}
          // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
          // and set `measureBeforeMount={true}`.
          useCSSTransforms={this.state.mounted}
          compactType={this.state.compactType}
          preventCollision={!this.state.compactType}
        >
          {this.generateDOM()}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

module.exports = FillGapsLayout;

function generateLayout() {
  return _.map(_.range(0, 4), function(item, i) {
    var y = Math.ceil(Math.random() * 4) + 1;
    const minH = Math.ceil(1);
    const maxH = Math.floor(3);
    return {
      x: (_.random(0, 4)) % 6,
      y: Math.floor(i / 6) * y,
      w: 1,
      h: Math.floor(Math.random() * (maxH - minH)) + minH,
      i: i.toString(),
    };

  });
}

if (require.main === module) {
  require("../test-hook.jsx")(module.exports);
}
