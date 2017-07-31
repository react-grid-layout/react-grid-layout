'use strict';
var React = require('react');
var PropTypes = require('prop-types');
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var _ = require('lodash');
var WidthProvider = require('react-grid-layout').WidthProvider;
var ReactGridLayout = require('react-grid-layout');
ReactGridLayout = WidthProvider(ReactGridLayout);

var NoRearrangingLayout = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    onLayoutChange: PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      className: "layout",
      items: 50,
      cols: 12,
      rowHeight: 30,
      onLayoutChange: function() {},
      // This turns off compaction so you can place items wherever.
      verticalCompact: false,
      // This turns off rearrangement so items will not be pushed arround.
      isRearrangeable: false
    };
  },

  getInitialState() {
    var layout = this.generateLayout();
    return {
      layout: layout
    };
  },

  generateDOM() {
    return _.map(_.range(this.props.items), function(i) {
      return (<div key={i}><span className="text">{i}</span></div>);
    });
  },

  generateLayout() {
    var p = this.props;
    return _.map(new Array(p.items), function(item, i) {
      var y = _.result(p, 'y') || Math.ceil(Math.random() * 4) + 1;
      return {x: i * 2 % 12, y: Math.floor(i / 6) * y, w: 2, h: y, i: i.toString()};
    });
  },

  onLayoutChange: function(layout) {
    this.props.onLayoutChange(layout);
  },

  render() {
    return (
      <ReactGridLayout layout={this.state.layout} onLayoutChange={this.onLayoutChange}
          {...this.props}>
        {this.generateDOM()}
      </ReactGridLayout>
    );
  }
});

module.exports = NoRearrangingLayout;

if (require.main === module) {
  require('../test-hook.jsx')(module.exports);
}
