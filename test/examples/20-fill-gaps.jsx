import React from "react";
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout";

const ReactGridLayout = WidthProvider(RGL);

export default class FillGapsLayout extends React.Component {
  static defaultProps = {
    className: "layout",
    rowHeight: 200,
    onLayoutChange: function() {},
    cols: 8,
  };

  constructor(props) {
    super(props);

    const layout = this.generateLayout();
    this.state = { layout };
  }

  generateDOM() {
    return _.map(this.state.layout, function(item) {
      return (
        <div key={item.i}>
          <span className="text">{item.i}</span>
        </div>
      );
    });
  }

  generateLayout() {
    return _.map(_.range(0, 20), function(item, i) {
      var y = Math.ceil(Math.random() * 4) + 1;
      const minH = Math.ceil(1);
      const maxH = Math.floor(3);
      const maxW = Math.floor(4);
      return {
        x: (_.random(0, 4)) % 6,
        y: Math.floor(i / 6) * y,
        w: Math.floor(Math.random() * (maxW - minH)) + minH,
        h: Math.floor(Math.random() * (maxH - minH)) + minH,
        i: i.toString(),
      };
    });
  }

  addCard(item) {
    this.setState({ layout: [...this.state.layout, { ...item, i: this.state.layout.length.toString(), gap: false }] })
  }

  render() {
    return (
      <div>
        <ReactGridLayout
          {...this.props}
          layout={this.state.layout}
          onLayoutChange={this.props.onLayoutChange}
          useCSSTransforms={true}
          heightUnits={3}
          // Gap props
          fillGaps={true}
          lastRowGap={true}
          gapRenderFunction={(gap) => {
              return (
                  <div style={{ height: 'inherit', backgroundColor: 'gray' }} onClick={() => this.addCard(gap)}><span className="text">Gap filler: click to add</span></div>
              );
          }}
        >
          {this.generateDOM()}
        </ReactGridLayout>
      </div>
    );
  }
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(FillGapsLayout));
}
