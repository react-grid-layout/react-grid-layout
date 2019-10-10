import React from "react";
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout";

const ReactGridLayout = WidthProvider(RGL);

export default class MinMaxLayout extends React.PureComponent {
  static defaultProps = {
    isDraggable: true,
    isResizable: true,
    items: 20,
    rowHeight: 30,
    onLayoutChange: function() {},
    cols: 12
  };

  generateDOM() {
    // Generate items with properties from the layout, rather than pass the layout directly
    const layout = this.generateLayout();
    return _.map(layout, function(l) {
      const mins = [l.minW, l.minH],
        maxes = [l.maxW, l.maxH];
      return (
        <div key={l.i} data-grid={l}>
          <span className="text">{l.i}</span>
          <div className="minMax">{"min:" + mins + " - max:" + maxes}</div>
        </div>
      );
    });
  }

  generateLayout() {
    const p = this.props;
    return _.map(new Array(p.items), function(item, i) {
      const minW = _.random(1, 6),
        minH = _.random(1, 6);
      const maxW = _.random(minW, 6),
        maxH = _.random(minH, 6);
      const w = _.random(minW, maxW);
      const y = _.random(minH, maxH);
      return {
        x: (i * 2) % 12,
        y: Math.floor(i / 6) * y,
        w,
        h: y,
        i: i.toString(),
        minW,
        maxW,
        minH,
        maxH
      };
    });
  }

  onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
  }

  render() {
    return (
      <ReactGridLayout onLayoutChange={this.onLayoutChange} {...this.props}>
        {this.generateDOM()}
      </ReactGridLayout>
    );
  }
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(MinMaxLayout));
}
