'use strict';
var React = require('react/addons');
var _ = require('lodash');
var ReactGridLayout = require('react-grid-layout');

var GridPropertyLayout = module.exports = React.createClass({
  displayName: 'GridPropertyLayout',
  mixins: [React.addons.PureRenderMixin],

  getDefaultProps() {
    return {
      isDraggable: true,
      isResizable: true,
      items: 20
    };
  },

  getInitialState() {
    return {
    };
  },

  generateDOM() {
    // Generate items with properties from the layout, rather than pass the layout directly
    var layout = this.generateLayout();
    return _.map(_.range(this.props.items), function(i) {
      return (<div key={i} _grid={layout[i]}><span className="text">{i}</span></div>);
    });
  },

  generateLayout() {
    var p = this.props;
    return _.map(new Array(p.items), function(item, i) {
      var w = _.result(p, 'w') || Math.ceil(Math.random() * 4);
      var y = _.result(p, 'y') || Math.ceil(Math.random() * 4) + 1;
      return {x: i * 2 % 12, y: Math.floor(i / 6) * y, w: w, h: y, i: i};
    });
  },

  onLayoutChange: function(layout) {
    this.props.onLayoutChange(layout);
    this.setState({layout: layout});
  },

  render() {
    var {layout, ...gridProps} = this.props;
    return (
      <ReactGridLayout className="layout" initialLayout={this.state.initialLayout} cols={12} onLayoutChange={this.onLayoutChange}
          rowHeight={30} {...gridProps}>
        {this.generateDOM()}
      </ReactGridLayout>
    );
  }
});

if (require.main === module) {
  require('../test-hook.jsx')(module.exports);
}
