import React from "react";
import { WidthProvider, Responsive } from "react-grid-layout";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

/**
 * This example illustrates how to let grid items lay themselves out with a bootstrap-style specification.
 */
class BootstrapStyleLayout extends React.PureComponent {
  static defaultProps = {
    isDraggable: true,
    isResizable: true,
    items: 20,
    rowHeight: 30,
    onLayoutChange: function() {},
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }
  };

  onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
  }

  render() {
    return (
      <ResponsiveReactGridLayout
        onLayoutChange={this.onLayoutChange}
        {...this.props}
      >
        <div
          data-grid={{
            w: { lg: 6, md: 5, sm: 3, xs: 4, xxs: 2 },
            h: { lg: 4, xxs: 3 }
          }}
        >
          0
        </div>
      </ResponsiveReactGridLayout>
    );
  }
}

module.exports = BootstrapStyleLayout;

if (require.main === module) {
  require("../test-hook.jsx")(module.exports);
}
