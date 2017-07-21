'use strict';
var React = require('react');
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var _ = require('lodash');
var WidthProvider = require('react-grid-layout').WidthProvider;
var ReactGridLayout = require('react-grid-layout');
ReactGridLayout = WidthProvider(ReactGridLayout);

var MinMaxLayout = React.createClass({
  mixins: [PureRenderMixin],

  getDefaultProps() {
    return {
      isDraggable: true,
      isResizable: true,
      items: 144,
      rowHeight: 24,
      onLayoutChange: function() {},
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
        <div key={l.i} data-grid={l}>
          <span className="text">{l.i}</span>
         
        </div>
      );
    });
  },

  generateLayout() {
    var p = this.props;
    return _.map(new Array(p.items), function(item, i) {
      var minW = 1, minH = 2;
      var maxW = 1, maxH = 2;
      var w = 1;
      var y = 2;
      return {
        x: i % 12, y: Math.floor(i / 12), w: w, h: y, i: i.toString(),
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
