import React from "react";
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout";

const ReactGridLayout = WidthProvider(RGL);

export default class ResizeStepLayout extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    items: 6,
    rowHeight: 30,
    onLayoutChange: function() {},
    cols: 12,
    resizeStep: 3 // Test with resize step of 3
  };

  constructor(props) {
    super(props);

    const layout = this.generateLayout();
    this.state = { layout };
  }

  generateDOM() {
    return _.map(_.range(this.props.items), function(i) {
      return (
        <div key={i} className="grid-item">
          <span className="text">Item {i}</span>
          <div className="resize-info">
            <small>Resize with step: {this.props.resizeStep}</small>
          </div>
        </div>
      );
    });
  }

  generateLayout() {
    const p = this.props;
    return _.map(new Array(p.items), function(item, i) {
      const y = _.result(p, "y") || Math.ceil(Math.random() * 4) + 1;
      return {
        x: (i * 2) % 12,
        y: Math.floor(i / 6) * y,
        w: 3, // Start with width that's a multiple of resizeStep
        h: 3, // Start with height that's a multiple of resizeStep
        i: i.toString()
      };
    });
  }

  onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
    this.setState({ layout });
  }

  onResize(layout, oldItem, newItem) {
    console.log('Resize event:', {
      oldItem,
      newItem,
      resizeStep: this.props.resizeStep
    });
  }

  render() {
    return (
      <div>
        <div className="info">
          <h3>Resize Step Example</h3>
          <p>Try resizing the items below. They should snap to increments of {this.props.resizeStep}.</p>
          <p>Original sizes: 3x3. With resizeStep=3, valid sizes are: 3, 6, 9, 12, etc.</p>
        </div>
        <ReactGridLayout
          layout={this.state.layout}
          onLayoutChange={this.onLayoutChange}
          onResize={this.onResize}
          resizeStep={this.props.resizeStep}
          {...this.props}
        >
          {this.generateDOM()}
        </ReactGridLayout>
      </div>
    );
  }
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(ResizeStepLayout));
}
