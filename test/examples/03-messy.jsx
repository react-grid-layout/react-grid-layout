import * as React from "react";
import _ from "lodash";
import RGL from '../../src/legacy/ReactGridLayout';
import WidthProvider from '../../src/legacy/WidthProvider';

const ReactGridLayout = WidthProvider(RGL);

export default class MessyLayout extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    cols: 12,
    items: 20,
    onLayoutChange: function() {},
    rowHeight: 30,
  };

  state = {
    layout: this.generateLayout()
  };

  generateDOM() {
    return _.map(_.range(this.props.items), function(i) {
      return (
        <div key={i}>
          <span className="text">{i}</span>
        </div>
      );
    });
  }

  generateLayout() {
    const p = this.props;
    return _.map(new Array(p.items), function(item, i) {
      const w = Math.ceil(Math.random() * 4);
      const y = Math.ceil(Math.random() * 4) + 1;
      return {
        x: (i * 2) % 12,
        y: Math.floor(i / 6) * y,
        w: w,
        h: y,
        i: i.toString()
      };
    });
  }

  onLayoutChange = (layout) => {
    this.props.onLayoutChange(layout);
  };

  render() {
    // eslint-disable-next-line no-unused-vars
    const {items, ...props} = this.props;
    return (
      <ReactGridLayout
        layout={this.state.layout}
        onLayoutChange={this.onLayoutChange}
        {...props}
      >
        {this.generateDOM()}
      </ReactGridLayout>
    );
  }
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(MessyLayout));
}
