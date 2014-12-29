'use strict';
var React = require('react/addons');
typeof window !== "undefined" && (window.React = React); // for devtools
typeof window !== "undefined" && (window.Perf = React.addons.Perf); // for devtools
var _ = require('lodash');
var ReactGridLayout = require('../lib/ReactGridLayout.jsx');
require('style!css!../css/styles.css');
require('style!css!../examples/example-styles.css');
require('style!css!../node_modules/react-resizable/css/styles.css');

var TestLayout = module.exports = React.createClass({
  displayName: 'TestLayout',

  getDefaultProps() {
    return {
      items: 12
    };
  },

  getInitialState() {
    var layout = this.props.layout || this.generateLayout();
    return {
      layout: layout,
      initialLayout: layout
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
      var w = _.result(p, 'w') || Math.ceil(Math.random() * 4);
      var y = _.result(p, 'y') || Math.ceil(Math.random() * 4) + 1;
      return {x: i * 2 % 12, y: Math.floor(i / 6) * y, w: w, h: y, i: i};
    });
  },

  onLayoutChange: function(layout) {
    console.log(layout);
    this.setState({layout: layout});
  },

  stringifyLayout() {
    return _.map(this.state.layout, function(l) {
      return <div className="layoutItem"><b>{l.i}</b>: [{l.x}, {l.y}, {l.w}, {l.h}]</div>;
    });
  },

  render() {
    var {layout, ...gridProps} = this.props;
    return (
      <div>
        <div className="layoutJSON">
          Displayed as <code>[x, y, w, h]</code>:
          <div className="columns">
            {this.stringifyLayout()}
          </div>
        </div>
        <ReactGridLayout className="layout" initialLayout={this.state.initialLayout} cols={12} onLayoutChange={this.onLayoutChange}
            rowHeight={30} {...gridProps}>
          {this.generateDOM()}
        </ReactGridLayout>
      </div>
    );
  }
});
