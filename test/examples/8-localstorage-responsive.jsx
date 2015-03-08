'use strict';
var React = require('react');
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var ResponsiveReactGridLayout = require('react-grid-layout').Responsive;

/**
 * This layout demonstrates how to sync multiple responsive layouts to localstorage.
 */
var ResponsiveLocalStorageLayout = React.createClass({
  mixins: [PureRenderMixin],

  getDefaultProps() {
    var ls = {};
    if (global.localStorage) {
      try {
        ls = JSON.parse(global.localStorage.getItem('rgl-7')) || {};
      } catch(e) {}
    }
    return {
      className: "layout",
      cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
      rowHeight: 30,
      layouts: ls.layouts || {}
    };
  },

  getInitialState() {
    return {};
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
        layouts: this.state.layouts
      }));
    }
  },

  onLayoutChange(layout, layouts) {
    this.props.onLayoutChange(layout);
    this.setState({layout: layout, layouts: layouts});
  },

  render() {
    return (
      <div>
        <button onClick={this.resetLayout}>Reset Layout</button>
        <ResponsiveReactGridLayout
            {...this.props}
            onLayoutChange={this.onLayoutChange}>
          <div key={1} _grid={{w: 2, h: 3, x: 0, y: 0}}><span className="text">1</span></div>
          <div key={2} _grid={{w: 2, h: 3, x: 2, y: 0}}><span className="text">2</span></div>
          <div key={3} _grid={{w: 2, h: 3, x: 4, y: 0}}><span className="text">3</span></div>
          <div key={4} _grid={{w: 2, h: 3, x: 6, y: 0}}><span className="text">4</span></div>
          <div key={5} _grid={{w: 2, h: 3, x: 8, y: 0}}><span className="text">5</span></div>
        </ResponsiveReactGridLayout>
      </div>
    );
  }
});

module.exports = ResponsiveLocalStorageLayout;

if (require.main === module) {
  require('../test-hook.jsx')(module.exports);
}
