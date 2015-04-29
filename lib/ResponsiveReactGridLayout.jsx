'use strict';
var React = require('react');
var utils = require('./utils');
var responsiveUtils = require('./responsiveUtils');
var PureDeepRenderMixin = require('./mixins/PureDeepRenderMixin');
var WidthListeningMixin = require('./mixins/WidthListeningMixin');
var ReactGridLayout = require('./ReactGridLayout');

/**
 * A wrapper around ReactGridLayout to support responsive breakpoints.
 */
var ResponsiveReactGridLayout = React.createClass({
  mixins: [PureDeepRenderMixin, WidthListeningMixin],

  propTypes: {
    //
    // Basic props
    //

    // Optional, but if you are managing width yourself you may want to set the breakpoint
    // yourself as well.
    breakpoint: React.PropTypes.string,

    // {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
    breakpoints: React.PropTypes.object,

    // # of cols. This is a breakpoint -> cols map
    cols: React.PropTypes.object,

    // layouts is an object mapping breakpoints to layouts.
    // e.g. {lg: Layout, md: Layout, ...}
    layouts: function(props, propName, componentName) {
      React.PropTypes.object.isRequired.apply(this, arguments);

      var layouts = props.layouts;
      Object.keys(layouts).map(function(k) {
        utils.validateLayout(layouts[k], 'layouts.' + k);
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

  getDefaultProps() {
    return {
      breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0},
      cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
      layouts: {},
      onBreakpointChange: function(){},
      onLayoutChange: function(){}
    };
  },

  getInitialState() {
    var breakpoint = this.props.breakpoint ||
      responsiveUtils.getBreakpointFromWidth(this.props.breakpoints, this.props.initialWidth);
    var cols = responsiveUtils.getColsFromBreakpoint(breakpoint, this.props.cols);

    // Get the initial layout. This can tricky; we try to generate one however possible if one doesn't exist
    // for this layout.
    var initialLayout = responsiveUtils.findOrGenerateResponsiveLayout(
      this.props.layouts, this.props.breakpoints, breakpoint, breakpoint, cols, this.props.verticalCompact);

    return {
      layout: initialLayout,
      // storage for layouts obsoleted by breakpoints
      layouts: this.props.layouts || {},
      breakpoint: breakpoint,
      cols: cols,
      width: this.props.initialWidth
    };
  },

  componentWillReceiveProps(nextProps) {
    // This allows you to set the width manually if you like.
    // Use manual width changes in combination with `listenToWindowResize: false`
    if (nextProps.width) this.onWidthChange(nextProps.width);

    // Allow parent to set breakpoint directly.
    if (nextProps.breakpoint !== this.props.breakpoint) {
      this.onWidthChange(this.state.width);
    }

    // Allow parent to set layouts directly.
    if (nextProps.layouts && nextProps.layouts !== this.state.layouts) {
      // Since we're setting an entirely new layout object, we must generate a new responsive layout
      // if one does not exist.
      var newLayout = responsiveUtils.findOrGenerateResponsiveLayout(
        nextProps.layouts, nextProps.breakpoints, this.state.breakpoint, this.state.breakpoint, this.state.cols, this.props.verticalLayout);

      this.setState({
        layouts: nextProps.layouts,
        layout: newLayout
      });
    }
  },

  /**
   * Bubble this up, add `layouts` object.
   * @param  {Array} layout Layout from inner Grid.
   */
  onLayoutChange(layout) {
    this.state.layouts[this.state.breakpoint] = layout;
    this.setState({layout: layout, layouts: this.state.layouts});
    this.props.onLayoutChange(layout, this.state.layouts);
  },

  /**
   * When the width changes work through breakpoints and reset state with the new width & breakpoint.
   * Width changes are necessary to figure out the widget widths.
   */
  onWidthChange(width) {
    // Set new breakpoint
    var newState = {width: width};
    newState.breakpoint = this.props.breakpoint ||
      responsiveUtils.getBreakpointFromWidth(this.props.breakpoints, newState.width);
    newState.cols = responsiveUtils.getColsFromBreakpoint(newState.breakpoint, this.props.cols);

    // Breakpoint change
    if (newState.cols !== this.state.cols) {

      // Store the current layout
      newState.layouts = this.state.layouts;
      newState.layouts[this.state.breakpoint] = JSON.parse(JSON.stringify(this.state.layout));

      // Find or generate a new one.
      newState.layout = responsiveUtils.findOrGenerateResponsiveLayout(
        newState.layouts, this.props.breakpoints, newState.breakpoint, this.state.breakpoint, newState.cols, this.props.verticalLayout);

      // This adds missing items.
      newState.layout = utils.synchronizeLayoutWithChildren(newState.layout, this.props.children, newState.cols, this.props.verticalCompact);

      // Store this new layout as well.
      newState.layouts[newState.breakpoint] = newState.layout;

      this.props.onBreakpointChange(newState.breakpoint, newState.cols);
    }

    this.setState(newState);
  },


  render() {
    // Don't pass responsive props to RGL.
    /*jshint unused:false*/
    var {layouts, onBreakpointChange, breakpoints, ...props} = this.props;
    return (
      <ReactGridLayout {...props}
          layout={this.state.layout}
          cols={this.state.cols}
          listenToWindowResize={false}
          onLayoutChange={this.onLayoutChange}
          width={this.state.width}>
        {this.props.children}
      </ReactGridLayout>
    );
  }
});

module.exports = ResponsiveReactGridLayout;
