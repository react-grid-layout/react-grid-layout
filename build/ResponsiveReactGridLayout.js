"use strict";

var _objectWithoutProperties = function (obj, keys) {
  var target = {};
  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

"use strict";
var React = require("react/addons");
var utils = require("./utils");
var responsiveUtils = require("./responsiveUtils");
var PureDeepRenderMixin = require("./mixins/PureDeepRenderMixin");
var WidthListeningMixin = require("./mixins/WidthListeningMixin");
var ReactGridLayout = require("./ReactGridLayout.jsx");

/**
 * A wrapper around ReactGridLayout to support responsive breakpoints.
 */
var ResponsiveReactGridLayout = React.createClass({
  displayName: "ResponsiveReactGridLayout",
  mixins: [PureDeepRenderMixin, WidthListeningMixin],

  propTypes: {
    //
    // Basic props
    //

    // {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
    breakpoints: React.PropTypes.object,

    // # of cols. This is a breakpoint -> cols map
    cols: React.PropTypes.object,

    // initialLayouts is an object mapping breakpoints to layouts.
    // e.g. {lg: Layout, md: Layout, ...}
    initialLayouts: function (props, propName, componentName) {
      React.PropTypes.object.isRequired.apply(this, arguments);

      var layouts = props.initialLayouts;
      Object.keys(layouts).map(function (k) {
        utils.validateLayout(layouts[k], "initialLayouts." + k);
      });
    },

    //
    // Callbacks
    //

    // Calls back with breakpoint and new # cols
    onBreakpointChange: React.PropTypes.func,

    // Callback so you can save the layout.
    // Calls back with (currentLayout, allLayouts). allLayouts are keyed by breakpoint.
    onLayoutChange: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      initialLayouts: {},
      onBreakpointChange: function () {},
      onLayoutChange: function () {}
    };
  },

  getInitialState: function () {
    var breakpoint = responsiveUtils.getBreakpointFromWidth(this.props.breakpoints, this.props.initialWidth);
    var cols = responsiveUtils.getColsFromBreakpoint(breakpoint, this.props.cols);
    var initialLayout = this.props.initialLayouts[breakpoint];
    return {
      layout: utils.synchronizeLayoutWithChildren(initialLayout, this.props.children, cols),
      // storage for layouts obsoleted by breakpoints
      layouts: this.props.initialLayouts || {},
      breakpoint: breakpoint,
      cols: cols,
      width: this.props.initialWidth
    };
  },

  componentWillReceiveProps: function (nextProps) {
    // This allows you to set the width manually if you like.
    // Use manual width changes in combination with `listenToWindowResize: false`
    if (nextProps.width) this.onWidthChange(nextProps.width);

    // Allow parent to set layout directly.
    if (nextProps.layout && nextProps.layout !== this.state.layout) {
      this.setState({
        layout: utils.synchronizeLayoutWithChildren(nextProps.layout, nextProps.children, this.state.cols)
      });
    }
  },

  /**
   * Bubble this up, add `layouts` object.
   * @param  {Array} layout Layout from inner Grid.
   */
  onLayoutChange: function (layout) {
    this.props.onLayoutChange(layout, this.state.layouts);
  },

  /**
   * When the width changes work through breakpoints and reset state with the new width & breakpoint.
   * Width changes are necessary to figure out the widget widths.
   */
  onWidthChange: function (width) {
    // Set new breakpoint
    var newState = { width: width };
    newState.breakpoint = responsiveUtils.getBreakpointFromWidth(this.props.breakpoints, newState.width);
    newState.cols = responsiveUtils.getColsFromBreakpoint(newState.breakpoint, this.props.cols);

    // Breakpoint change
    if (newState.cols !== this.state.cols) {
      // Store the current layout
      newState.layouts = this.state.layouts;
      newState.layouts[this.state.breakpoint] = JSON.parse(JSON.stringify(this.state.layout));

      // Find or generate a new one.
      newState.layout = newState.layouts[newState.breakpoint];
      if (!newState.layout) {
        newState.layout = responsiveUtils.newResponsiveLayout(newState.layouts, this.props.breakpoints, newState.breakpoint, this.state.breakpoint, newState.cols);
      }

      // This adds missing items.
      newState.layout = utils.synchronizeLayoutWithChildren(newState.layout, this.props.children, newState.cols);

      // Store this new layout as well.
      newState.layouts[newState.breakpoint] = newState.layout;

      this.props.onBreakpointChange(newState.breakpoint, newState.cols);
    }

    this.setState(newState);
  },


  render: function () {
    // Don't pass responsive props to RGL.
    /*jshint unused:false*/
    var initialLayouts = this.props.initialLayouts;
    var onBreakpointChange = this.props.onBreakpointChange;
    var breakpoints = this.props.breakpoints;
    var props = _objectWithoutProperties(this.props, ["initialLayouts", "onBreakpointChange", "breakpoints"]);

    return React.createElement(ReactGridLayout, React.__spread({}, props, {
      initialLayout: this.props.initialLayouts[this.props.breakpoint],
      layout: this.state.layout,
      cols: this.state.cols,
      listenToWindowResize: false,
      onLayoutChange: this.onLayoutChange,
      width: this.state.width
    }), this.props.children);
  }
});

module.exports = ResponsiveReactGridLayout;