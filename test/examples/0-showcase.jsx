'use strict';
var React = require('react');
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var _ = require('lodash');
var WidthProvider = require('react-grid-layout').WidthProvider;
var ResponsiveReactGridLayout = require('react-grid-layout').Responsive;
ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

var BasicLayout = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    onLayoutChange: React.PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      className: "layout",
      rowHeight: 30,
      cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
      initialLayout: generateLayout()
    };
  },

  getInitialState() {
    return {
      compactType: 'vertical',
      currentBreakpoint: 'lg',
      layouts: {lg: this.props.initialLayout},
    };
  },

  generateDOM() {
    return _.map(this.state.layouts.lg, function (l, i) {
      return (
        <div key={i} className={l.static ? 'static' : ''}>
          {l.static ?
            <span className="text" title="This item is static and cannot be removed or resized.">Static - {i}</span>
            : <span className="text">{i}</span>
          }
        </div>);
    });
  },

  onBreakpointChange(breakpoint) {
    this.setState({
      currentBreakpoint: breakpoint
    });
  },

  onCompactTypeChange() {
    this.setState({
      compactType: this.state.compactType === 'horizontal' ? 'vertical' :
                   this.state.compactType === 'vertical' ? null : 'horizontal'
    });
  },

  onLayoutChange(layout, layouts) {
    this.props.onLayoutChange(layout, layouts);
  },

  onNewLayout() {
    this.setState({
      layouts: {lg: generateLayout()}
    });
  },

  render() {
    return (
      <div>
        <div>
          Current Breakpoint: {this.state.currentBreakpoint} ({this.props.cols[this.state.currentBreakpoint]} columns)
        </div>
        <div>Compaction type: {_.capitalize(this.state.compactType) || 'No Compaction'}</div>
        <button onClick={this.onNewLayout}>Generate New Layout</button>
        <button onClick={this.onCompactTypeChange}>Change Compaction Type</button>
        <ResponsiveReactGridLayout
          {...this.props}
          layouts={this.state.layouts}
          onBreakpointChange={this.onBreakpointChange}
          onLayoutChange={this.onLayoutChange}
          compactType={this.state.compactType}
          useCSSTransforms={true}>
          {this.generateDOM()}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
});

function generateLayout() {
  return _.map(_.range(0, 25), function (item, i) {
    var y = Math.ceil(Math.random() * 4) + 1;
    return {
      x: _.random(0, 5) * 2 % 12,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      i: i.toString(),
      static: Math.random() < 0.05
    };
  });
}

module.exports = BasicLayout;

if (require.main === module) {
  require('../test-hook.jsx')(module.exports);
}
