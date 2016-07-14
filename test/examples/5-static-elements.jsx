'use strict';
var React = require('react');
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var WidthProvider = require('react-grid-layout').WidthProvider;
var ReactGridLayout = require('react-grid-layout');
ReactGridLayout = WidthProvider(ReactGridLayout);

/**
 * This layout demonstrates how to use static grid elements.
 * Static elements are not draggable or resizable, and cannot be moved.
 */
var StaticElementsLayout = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState() {
    return {};
  },

  onLayoutChange: function(layout) {
    this.props.onLayoutChange(layout);
  },

  render() {
    return (
      <ReactGridLayout className="layout" onLayoutChange={this.onLayoutChange} rowHeight={30}>
        <div key="1" data-grid={{x: 0, y: 0, w: 2, h: 3}}><span className="text">1</span></div>
        <div key="2" data-grid={{x: 2, y: 0, w: 4, h: 3, static: true}}><span className="text">2 - Static</span></div>
        <div key="3" data-grid={{x: 6, y: 0, w: 2, h: 3}}><span className="text">3</span></div>
        <div key="4" data-grid={{x: 8, y: 0, w: 4, h: 3, draggableHandle: '.react-grid-dragHandleExample'}}>
          <span className="text">4 - Draggable with Handle
            <hr/><hr/>
            <span className="react-grid-dragHandleExample">[DRAG HERE]</span>
            <hr/><hr/>
          </span>
        </div>
      </ReactGridLayout>
    );
  }
});

module.exports = StaticElementsLayout;

if (require.main === module) {
  require('../test-hook.jsx')(module.exports);
}
