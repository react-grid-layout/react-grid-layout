'use strict';
var React = require('react');
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var _ = require('lodash');
var ReactGridLayout = require('react-grid-layout');

/**
 * This layout demonstrates how to use the `onResize` handler to enforce a min/max width and height.
 *
 * In this grid, all elements are allowed a max width of 2 if the height < 3,
 * and a min width of 2 if the height >= 3.
 */
var DynamicMinMaxLayout = React.createClass({
  mixins: [PureRenderMixin],

  getDefaultProps() {
    return {
      isDraggable: true,
      isResizable: true,
      items: 20,
      rowHeight: 30,
      cols: 12,
    };
  },

  getInitialState() {
    return {};
  },

  generateDOM() {
    // Generate items with properties from the layout, rather than pass the layout directly
    var layout = this.generateLayout();
    return _.map(layout, function(l) {
      return (
        <div key={l.i} _grid={l}>
          <span className="text">{l.i}</span>
        </div>
      );
    });
  },

  generateLayout() {
    var p = this.props;
    return _.map(new Array(p.items), function(item, i) {
      var w = _.random(1, 2);
      var h = _.random(1, 3);
      return {
        x: i * 2 % 12, y: Math.floor(i / 6), w: w, h: h, i: i
      };
    });
  },

  onLayoutChange: function(layout) {
    this.props.onLayoutChange(layout);
  },

  onResize: function(layout, oldLayoutItem, layoutItem, placeholder, e) {
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
  },

  render() {
    return (
      <ReactGridLayout onLayoutChange={this.onLayoutChange} onResize={this.onResize}
          {...this.props}>
        {this.generateDOM()}
      </ReactGridLayout>
    );
  }
});

module.exports = DynamicMinMaxLayout;

if (require.main === module) {
  require('../test-hook.jsx')(module.exports);
}
