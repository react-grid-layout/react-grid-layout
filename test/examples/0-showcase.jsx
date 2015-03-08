'use strict';
var React = require('react');
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var _ = require('lodash');
var ResponsiveReactGridLayout = require('react-grid-layout').Responsive;

var BasicLayout = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    onLayoutChange: React.PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      className: "layout",
      rowHeight: 30,
      cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}
    };
  },

  getInitialState() {
    return {
      layouts: {lg: this.generateLayout()},
      currentBreakpoint: 'lg'
    };
  },

  generateDOM() {
    return _.map(this.state.layouts.lg, function(l, i) {
      return (
        <div key={i} className={l.static ? 'static' : ''}>
          {l.static ?
            <span className="text" title="This item is static and cannot be removed or resized.">Static - {i}</span>
            : <span className="text">{i}</span>
          }
        </div>);
    });
  },

  generateLayout() {
    var p = this.props;
    return _.map(_.range(0, 25), function(item, i) {
      var y = _.result(p, 'y') || Math.ceil(Math.random() * 4) + 1;
      return {x: _.random(0, 5) * 2 % 12, y: Math.floor(i / 6) * y, w: 2, h: y, i: i, static: Math.random() < 0.05};
    });
  },

  onBreakpointChange(breakpoint) {
    this.setState({
      currentBreakpoint: breakpoint
    });
  },

  onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
  },

  onNewLayout() {
    this.setState({
      layouts: {lg: this.generateLayout()}
    });
  },

  render() {
    return (
      <div>
        <div>Current Breakpoint: {this.state.currentBreakpoint} ({this.props.cols[this.state.currentBreakpoint]} columns)</div>
        <button onClick={this.onNewLayout}>Generate New Layout</button>
        <ResponsiveReactGridLayout
            layouts={this.state.layouts}
            onBreakpointChange={this.onBreakpointChange}
            onLayoutChange={this.onLayoutChange}
            useCSSTransforms={true}
            {...this.props}>
          {this.generateDOM()}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
});

module.exports = BasicLayout;

if (require.main === module) {
  require('../test-hook.jsx')(module.exports);
}
