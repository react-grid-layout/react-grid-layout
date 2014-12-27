'use strict';
var React = require('react/addons');
typeof window !== "undefined" && (window.React = React) // for devtools
var _ = require('lodash');
var ReactGridLayout = require('../lib/ReactGridLayout.jsx');

var TestLayout = module.exports = React.createClass({
  displayName: 'TestLayout',

  generate() {
    return _.map(_.range(12), function(i) {
      return (<div key={i} className="gridItem">{i}</div>);
    });
  },

  render() {
    var items = this.generate();
    var layout = _.map(items, function(item, i) {
      return {x: i * 2 % 12, y: Math.floor(i / 6) * 2, w: 2, h: 2};
    });
    return (
      <ReactGridLayout className="layout" initialLayout={layout} cols={12} rowHeight={150}>
        {this.generate()}
      </ReactGridLayout>
    );
  }
});
