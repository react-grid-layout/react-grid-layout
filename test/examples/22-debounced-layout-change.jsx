import * as React from "react";
import _ from "lodash";
import Responsive from '../../src/legacy/ResponsiveReactGridLayout';
import WidthProvider from '../../src/legacy/WidthProvider';

const debouncedTimeoutMs = 500;
const ResponsiveReactGridLayout = WidthProvider(Responsive);

export default class DebouncedLayout extends React.Component {
  static defaultProps = {
    className: "layout",
    rowHeight: 30,
    onLayoutChange: function() {},
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  };

  state = {
    currentBreakpoint: "lg",
    debouncedTimeout: debouncedTimeoutMs,
    mounted: false,
    layouts: { lg: generateLayout(['se']) },
    resizeHandles: ['se']
  };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  generateDOM() {
    return _.map(this.state.layouts.lg, function(l, i) {
      return (
        <div key={i} className={l.static ? "static" : ""}>
          {l.static ? (
            <span
              className="text"
              title="This item is static and cannot be removed or resized."
            >
              Static - {i}
            </span>
          ) : (
            <span className="text">{i}</span>
          )}
        </div>
      );
    });
  }

  onBreakpointChange = (breakpoint) => {
    this.setState({
      currentBreakpoint: breakpoint
    });
  };

  onDebouncedTimeoutChange = () => {
    const debouncedTimeout = this.state.debouncedTimeout === 0 ? debouncedTimeoutMs : 0;
    this.setState({debouncedTimeout});
  };

  onLayoutChange = (layout, layouts) => {
    console.log(`Layout changed after ${this.state.debouncedTimeout}ms`, layout, layouts);
    this.props.onLayoutChange(layout, layouts);
  };

  onNewLayout = () => {
    this.setState({
      layouts: { lg: generateLayout(this.state.resizeHandles) }
    });
  };

  onDrop = (elemParams) => {
    alert(`Element parameters: ${JSON.stringify(elemParams)}`);
  };

  render() {
    return (
      <div>
        <div>
          Current Breakpoint: {this.state.currentBreakpoint} (
          {this.props.cols[this.state.currentBreakpoint]} columns)
        </div>
        <button onClick={this.onNewLayout}>Generate New Layout</button>
        <button onClick={this.onDebouncedTimeoutChange}>
          {this.state.debouncedTimeout === 0 ? "No debouncing" : `Debouncing ${this.state.debouncedTimeout}ms`}
        </button>
        <ResponsiveReactGridLayout
          {...this.props}
          layouts={this.state.layouts}
          onBreakpointChange={this.onBreakpointChange}
          onLayoutChange={this.onLayoutChange}
          onDrop={this.onDrop}
          // WidthProvider option
          measureBeforeMount={false}
          // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
          // and set `measureBeforeMount={true}`.
          useCSSTransforms={this.state.mounted}
          debounceTimeout={this.state.debouncedTimeout}
        >
          {this.generateDOM()}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

function generateLayout(resizeHandles) {
  return _.map(_.range(0, 25), function(item, i) {
    var y = Math.ceil(Math.random() * 4) + 1;
    return {
      x: Math.round(Math.random() * 5) * 2,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      i: i.toString(),
      static: Math.random() < 0.05,
      resizeHandles
    };
  });
}

if (process.env.STATIC_EXAMPLES === "true") {
  import("../test-hook.jsx").then(fn => fn.default(DebouncedLayout));
}
