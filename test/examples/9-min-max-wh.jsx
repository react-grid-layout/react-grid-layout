'use strict';
var React = require('react');
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var _ = require('lodash');
var ReactGridLayout = require('react-grid-layout');

var MinMaxLayout = React.createClass({
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
      var mins = [l.minW, l.minH], maxes = [l.maxW, l.maxH];
      return (
        <div key={l.i} _grid={l}>
          <span className="text">{l.i}</span>
          <div className="minMax">{'min:' + mins + ' - max:' + maxes}</div>
        </div>
      );
    });
  },

  generateLayout() {
    var p = this.props;
    return _.map(new Array(p.items), function(item, i) {
      var minW = _.random(1, 6), minH = _.random(1, 6);
      var maxW = _.random(minW, 6), maxH = _.random(minH, 6);
      var w = _.random(minW, maxW);
      var y = _.random(minH, maxH);
      return {
        x: i * 2 % 12, y: Math.floor(i / 6) * y, w: w, h: y, i: i,
        minW: minW, maxW: maxW, minH: minH, maxH: maxH
      };
    });
  },

  onLayoutChange: function(layout) {
    this.props.onLayoutChange(layout);
  },

  render() {
    return (
      <ReactGridLayout onLayoutChange={this.onLayoutChange}
          {...this.props}>
        {this.generateDOM()}
      </ReactGridLayout>
    );
  }
});

module.exports = MinMaxLayout;

if (require.main === module) {
  require('../test-hook.jsx')(module.exports);
}
