import React from "react";
import _ from "lodash";
import NestedGridLayout from "../../lib/NestedGridLayout"
import WidthProvider from '../../lib/components/WidthProvider';

const ResponsiveNestedGridLayout = WidthProvider(NestedGridLayout);

export default class NestedGridExample extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    rowHeight: 30,
    onLayoutChange: function() {},
    cols: 12
  };

  generateLayout() {
    return {
      "1": { x: 0, y: 0, w: 6, h: 4, i: "1" },
      "2": { x: 6, y: 0, w: 6, h: 4, i: "2" },
      "3": { 
        x: 0, 
        y: 4,
        w: 12,
        h: 4,
        i: "3",
       
        layouts: {
          "3-1": { x: 0, y: 0, w: 4, h: 2, i: "3-1" },
          "3-2": { x: 4, y: 0, w: 4, h: 2, i: "3-2" },
          "3-3": { x: 8, y: 0, w: 4, h: 2, i: "3-3" }
        }
      }
    };
  }

  // onLayoutChange(layout) {
  //   this.props.onLayoutChange(layout);
  // }

  render() {
    const layouts = this.generateLayout();
    return (
      <ResponsiveNestedGridLayout
        className="layout"
        layouts={layouts}
        cols={12}
        rowHeight={30}
        onLayoutChange={this.props.onLayoutChange}
      >
        <div key="1" className="grid-item">
          <span className="text">1</span>
        </div>
        <div key="2" className="grid-item">
          <span className="text">2</span>
        </div>
        <div key="3" className="grid-item">
          <div key="3-1" className="nested-grid-item">
            <span className="text">3-1</span>
          </div>
          <div key="3-2" className="nested-grid-item">
            <span className="text">3-2</span>
          </div>
          <div key="3-3" className="nested-grid-item">
            <span className="text">3-3</span>
          </div>
        </div>
      </ResponsiveNestedGridLayout>
    );
  }
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(NestedGridExample));
} 