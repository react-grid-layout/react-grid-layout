import React from "react";
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout";

const ReactGridLayout = WidthProvider(RGL);

/**
 * This layout demonstrates how to use the `onResize` handler to enforce a min/max width and height.
 *
 * In this grid, all elements are allowed a max width of 2 if the height < 3,
 * and a min width of 2 if the height >= 3.
 */
class DynamicMinMaxLayout extends React.PureComponent {
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
      return (
        <div key={l.i} data-grid={l}>
          <span className="text">{l.i}</span>
        </div>
      );
    });
  }

  generateLayout() {
    const p = this.props;
    return _.map(new Array(p.items), function(item, i) {
      const w = _.random(1, 2);
      const h = _.random(1, 3);
      return {
        x: (i * 2) % 12,
        y: Math.floor(i / 6),
        w: w,
        h: h,
        i: i.toString()
      };
    });
  }

  onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
  }

  onResize(layout, oldLayoutItem, layoutItem, placeholder) {
    // `oldLayoutItem` contains the state of the item before the resize.
    // You can modify `layoutItem` to enforce constraints.

    if (layoutItem.h < 3 && layoutItem.w > 2) {
      layoutItem.w = 2;
      placeholder.w = 2;
    }

    if (layoutItem.h >= 3 && layoutItem.w < 2) {
      layoutItem.w = 2;
      placeholder.w = 2;
    }
  }

  render() {
    return (
      <ReactGridLayout
        onLayoutChange={this.onLayoutChange}
        onResize={this.onResize}
        {...this.props}
      >
        {this.generateDOM()}
      </ReactGridLayout>
    );
  }
}

module.exports = DynamicMinMaxLayout;

if (require.main === module) {
  require("../test-hook.jsx")(module.exports);
}
