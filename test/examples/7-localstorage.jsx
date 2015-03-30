'use strict';
var React = require('react');
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var ReactGridLayout = require('react-grid-layout');

/**
 * This layout demonstrates how to sync to localstorage.
 */
var LocalStorageLayout = React.createClass({
  mixins: [PureRenderMixin],

  getDefaultProps() {
    return {
      className: "layout",
      cols: 12,
      rowHeight: 30
    };
  },

  getInitialState() {
    var ls = {};
    if (global.localStorage) {
      try {
        ls = JSON.parse(global.localStorage.getItem('rgl-7')) || {};
      } catch(e) {}
    }
    return {layout: ls.layout || []};
  },

  componentDidUpdate(prevProps, prevState) {
    this._saveToLocalStorage();
  },

  resetLayout() {
    this.setState({layout: []});
  },

  _saveToLocalStorage() {
    if (global.localStorage) {
      global.localStorage.setItem('rgl-7', JSON.stringify({
        layout: this.state.layout
      }));
    }
  },

  onLayoutChange(layout) {
    console.log('layout changed', layout);
    this.props.onLayoutChange(layout); // updates status display
    this.setState({layout: layout});
  },

  render() {
    return (
      <div>
        <button onClick={this.resetLayout}>Reset Layout</button>
        <ReactGridLayout
            {...this.props}
            layout={this.state.layout}
            onLayoutChange={this.onLayoutChange}>
          <div key={1} _grid={{w: 2, h: 3, x: 0, y: 0}}><span className="text">1</span></div>
          <div key={2} _grid={{w: 2, h: 3, x: 2, y: 0}}><span className="text">2</span></div>
          <div key={3} _grid={{w: 2, h: 3, x: 4, y: 0}}><span className="text">3</span></div>
          <div key={4} _grid={{w: 2, h: 3, x: 6, y: 0}}><span className="text">4</span></div>
          <div key={5} _grid={{w: 2, h: 3, x: 8, y: 0}}><span className="text">5</span></div>
        </ReactGridLayout>
      </div>
    );
  }
});

module.exports = LocalStorageLayout;

if (require.main === module) {
  require('../test-hook.jsx')(module.exports);
}
