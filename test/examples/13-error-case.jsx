import React from "react";
import RGL, { WidthProvider } from "react-grid-layout";

const ReactGridLayout = WidthProvider(RGL);

class BasicLayout extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    items: 3,
    rowHeight: 100,
    onLayoutChange: function() {},
    cols: 2
  };

  constructor(props) {
    super(props);

    const layout = this.generateLayout();
    this.state = { layout };
  }

  generateDOM() {
    return [
      <div key={"1"}>
        <span className="text">{"1"}</span>
      </div>,
      <div key={"2"}>
        <span className="text">{"2"}</span>
      </div>,
      <div key={"3"}>
        <span className="text">{"3"}</span>
      </div>
    ];
  }

  generateLayout() {
    return [
      {
        x: 0,
        y: 0,
        w: 1,
        h: 1,
        i: "1"
      },
      {
        x: 1,
        y: 0,
        w: 1,
        h: 1,
        i: "2"
      },
      {
        x: 0,
        y: 1,
        w: 2,
        h: 2,
        i: "3"
      }
    ];
  }

  onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
  }

  render() {
    return (
      <ReactGridLayout
        layout={this.state.layout}
        onLayoutChange={this.onLayoutChange}
        {...this.props}
      >
        {this.generateDOM()}
      </ReactGridLayout>
    );
  }
}

module.exports = BasicLayout;

if (require.main === module) {
  require("../test-hook.jsx")(module.exports);
}
