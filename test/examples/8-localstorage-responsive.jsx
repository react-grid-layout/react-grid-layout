'use strict';
var React = require('react');
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var WidthProvider = require('react-grid-layout').WidthProvider;
var ResponsiveReactGridLayout = require('react-grid-layout').Responsive;
ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

const originalLayouts = getFromLS('layouts') || {};
/**
 * This layout demonstrates how to sync multiple responsive layouts to localstorage.
 */
var ResponsiveLocalStorageLayout = React.createClass({
  mixins: [PureRenderMixin],

  getDefaultProps() {
    return {
      className: "layout",
      cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
      rowHeight: 30
    };
  },

  getInitialState() {
    return {
      layouts: JSON.parse(JSON.stringify(originalLayouts))
    };
  },

  resetLayout() {
    this.setState({layouts: {}});
  },

  onLayoutChange(layout, layouts) {
    saveToLS('layouts', layouts);
    this.setState({layouts});
    this.props.onLayoutChange(layout, layouts);
  },

  render() {
    return (
      <div>
        <button onClick={this.resetLayout}>Reset Layout</button>
        <ResponsiveReactGridLayout
            ref="rrgl"
            {...this.props}
            layouts={this.state.layouts}
            onLayoutChange={this.onLayoutChange}>
          <div key="1" data-grid={{w: 2, h: 3, x: 0, y: 0}}><span className="text">1</span></div>
          <div key="2" data-grid={{w: 2, h: 3, x: 2, y: 0}}><span className="text">2</span></div>
          <div key="3" data-grid={{w: 2, h: 3, x: 4, y: 0}}><span className="text">3</span></div>
          <div key="4" data-grid={{w: 2, h: 3, x: 6, y: 0}}><span className="text">4</span></div>
          <div key="5" data-grid={{w: 2, h: 3, x: 8, y: 0}}><span className="text">5</span></div>
        </ResponsiveReactGridLayout>
      </div>
    );
  }
});

module.exports = ResponsiveLocalStorageLayout;

function getFromLS(key) {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem('rgl-8')) || {};
    } catch(e) {/*Ignore*/}
  }
  return ls[key];
}

function saveToLS(key, value) {
  if (global.localStorage) {
    global.localStorage.setItem('rgl-8', JSON.stringify({
      [key]: value
    }));
  }
}

if (require.main === module) {
  require('../test-hook.jsx')(module.exports);
}
