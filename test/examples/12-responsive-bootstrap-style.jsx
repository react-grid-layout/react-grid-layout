'use strict';
var React = require('react');
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var ResponsiveReactGridLayout = require('react-grid-layout').Responsive;

/**
 * This example illustrates how to let grid items lay themselves out with a bootstrap-style specification.
 */
var BootstrapStyleLayout = React.createClass({
  mixins: [PureRenderMixin],

  getDefaultProps() {
    return {
      isDraggable: true,
      isResizable: true,
      items: 20,
      rowHeight: 30,
      onLayoutChange: function() {},
      cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
    };
  },

  getInitialState() {
    return {};
  },

  onLayoutChange: function(layout) {
    this.props.onLayoutChange(layout);
  },

  render() {
    return (
      <ResponsiveReactGridLayout onLayoutChange={this.onLayoutChange}
          {...this.props}>
        <div data-grid={{w: {lg: 6, md: 5, sm: 3, xs: 4, xxs: 2}, h: {lg: 4, xxs: 3}}}>0</div>
      </ResponsiveReactGridLayout>
    );
  }
});

module.exports = BootstrapStyleLayout;

if (require.main === module) {
  require('../test-hook.jsx')(module.exports);
}
