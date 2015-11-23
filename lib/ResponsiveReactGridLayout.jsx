// @flow
import React from 'react';
import {synchronizeLayoutWithChildren, validateLayout} from './utils';
import {getBreakpointFromWidth, getColsFromBreakpoint, findOrGenerateResponsiveLayout} from './responsiveUtils';
import ReactGridLayout from './ReactGridLayout';
// import WidthListeningMixin from './mixins/WidthListeningMixin';

// Types
import type {Layout} from './utils';
import type {ResponsiveLayout} from './responsiveUtils';
type State = {
  layout: Layout,
  layouts: ResponsiveLayout,
  breakpoint: string,
  cols: number,
  width: number
};
// End Types

/**
 * A wrapper around ReactGridLayout to support responsive breakpoints.
 */
export default class ResponsiveReactGridLayout extends React.Component {
  // mixins: [PureDeepRenderMixin, WidthListeningMixin], // FIXME

  static propTypes = {
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
    layouts: function(props, propName, _componentName) {
      React.PropTypes.object.isRequired.apply(this, arguments);

      let layouts = props.layouts;
      Object.keys(layouts).map(function(k) {
        validateLayout(layouts[k], 'layouts.' + k);
      });
    },

    //
    // Callbacks
    //

    // Calls back with breakpoint and new # cols
    onBreakpointChange: React.PropTypes.func,

    // Callback so you can save the layout.
    // Calls back with (currentLayout, allLayouts). allLayouts are keyed by breakpoint.
    onLayoutChange: React.PropTypes.func,

    // Calls back with (containerWidth, margin, cols)
    onWidthChange: React.PropTypes.func
  };

  static defaultProps = {
    breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0},
    cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
    layouts: {},
    onBreakpointChange: function(){},
    onLayoutChange: function(){},
    onWidthChange: function(){}
  };

  state: State;

  constructor() {
    super();

    let breakpoint = this.props.breakpoint ||
      getBreakpointFromWidth(this.props.breakpoints, this.props.initialWidth);
    let cols = getColsFromBreakpoint(breakpoint, this.props.cols);

    // Get the initial layout. This can tricky; we try to generate one however possible if one doesn't exist
    // for this layout.
    let initialLayout = findOrGenerateResponsiveLayout(
      this.props.layouts, this.props.breakpoints, breakpoint, breakpoint, cols, this.props.verticalCompact);

    this.state = {
      layout: initialLayout,
      // storage for layouts obsoleted by breakpoints
      layouts: this.props.layouts || {},
      breakpoint: breakpoint,
      cols: cols,
      width: this.props.initialWidth
    };
  }

  // FIXME reconcile Flow types & PropTypes
  componentWillReceiveProps(nextProps: Object) {
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
      let newLayout = findOrGenerateResponsiveLayout(
        nextProps.layouts, nextProps.breakpoints, this.state.breakpoint, this.state.breakpoint, this.state.cols, this.props.verticalLayout);

      this.setState({
        layouts: nextProps.layouts,
        layout: newLayout
      });
    }
  }

  /**
   * Bubble this up, add `layouts` object.
   * @param  {Array} layout Layout from inner Grid.
   */
  onLayoutChange(layout: Layout) {
    this.state.layouts[this.state.breakpoint] = layout;
    this.setState({layout: layout, layouts: this.state.layouts});
    this.props.onLayoutChange(layout, this.state.layouts);
  }

  /**
   * When the width changes work through breakpoints and reset state with the new width & breakpoint.
   * Width changes are necessary to figure out the widget widths.
   */
  onWidthChange(width: number) {
    // Set new breakpoint
    let newState: Object = {
      width: width,
      breakpoint: this.props.breakpoint || getBreakpointFromWidth(this.props.breakpoints, width),
    };
    newState.cols = getColsFromBreakpoint(newState.breakpoint, this.props.cols);

    // Breakpoint change
    if (newState.cols !== this.state.cols) {

      // Store the current layout
      newState.layouts = this.state.layouts;
      newState.layouts[this.state.breakpoint] = JSON.parse(JSON.stringify(this.state.layout));

      // Find or generate a new one.
      newState.layout = findOrGenerateResponsiveLayout(
        newState.layouts, this.props.breakpoints, newState.breakpoint, this.state.breakpoint, newState.cols, this.props.verticalLayout);

      // This adds missing items.
      newState.layout = synchronizeLayoutWithChildren(newState.layout, this.props.children, newState.cols, this.props.verticalCompact);

      // Store this new layout as well.
      newState.layouts[newState.breakpoint] = newState.layout;

      this.props.onBreakpointChange(newState.breakpoint, newState.cols);
    }

    this.props.onWidthChange(width, this.props.margin, newState.cols);
    this.setState(newState);
  }

  render(): ReactElement {
    // Don't pass responsive props to RGL.
    /*eslint no-redeclare: 0*/ // bug?
    let {layouts, onBreakpointChange, breakpoints, ...props} = this.props;
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
}
