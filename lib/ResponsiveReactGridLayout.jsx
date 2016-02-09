import React from 'react';
import isEqual from 'lodash.isequal';
import forEach from 'lodash.foreach';

import {synchronizeLayoutWithChildren, validateLayout} from './utils';
import {getBreakpointFromWidth, getColsFromBreakpoint, findOrGenerateResponsiveLayout} from './responsiveUtils';
import ReactGridLayout from './ReactGridLayout';


class ResponsiveReactGridLayout extends React.Component {
  componentWillMount() {
    const {width, breakpoints, layouts, verticalCompact, cols} = this.props;
    const breakpoint = getBreakpointFromWidth(breakpoints, width);
    const colNo = getColsFromBreakpoint(breakpoint, cols);
    // Get the initial layout. This can tricky; we try to generate one however possible if one doesn't exist
    // for this layout.
    const initialLayout = findOrGenerateResponsiveLayout(layouts, breakpoints, breakpoint, breakpoint, colNo, verticalCompact);

    this.setState({
      layout: initialLayout,
      breakpoint: breakpoint,
      cols: colNo
    });
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.width != this.props.width) {
      const newBreakpoint = nextProps.breakpoint || getBreakpointFromWidth(nextProps.breakpoints, nextProps.width);
      this.onWidthChange(nextProps.width, newBreakpoint);
    }

    // Allow parent to set breakpoint directly.
    if (nextProps.breakpoint !== this.props.breakpoint) {
      this.onWidthChange(nextProps.width, nextProps.breakpoint);
    }

    // Allow parent to set layouts directly.
    if (!isEqual(nextProps.layouts, this.props.layouts)) {
      const {breakpoint, cols} = this.state;

      // Since we're setting an entirely new layout object, we must generate a new responsive layout
      // if one does not exist.
      const newLayout = findOrGenerateResponsiveLayout(
        nextProps.layouts, nextProps.breakpoints,
        breakpoint, breakpoint, cols, nextProps.verticalLayout
      );
      this.setState({layout: newLayout});
    }
  }

  /**
   * When the width changes work through breakpoints and reset state with the new width & breakpoint.
   * Width changes are necessary to figure out the widget widths.
   */
  onWidthChange(width, breakpoint) {
    const {breakpoints, verticalLayout, verticalCompact, cols} = this.props;

    const colNo = getColsFromBreakpoint(breakpoint, cols);

    // Store the current layout
    let layouts = this.props.layouts;
    layouts[breakpoint] = JSON.parse(JSON.stringify(this.state.layout));

    // Find or generate a new one.
    let layout = findOrGenerateResponsiveLayout(layouts, breakpoints, breakpoint, breakpoint, colNo, verticalLayout);

    // This adds missing items.
    layout = synchronizeLayoutWithChildren(layout, this.props.children, colNo, verticalCompact);

    // Store this new layout as well.
    layouts[breakpoint] = layout;

    // callbacks
    this.props.onLayoutChange(layout, layouts);
    this.props.onBreakpointChange(breakpoint, colNo);
    this.props.onWidthChange(width, this.props.margin, colNo);

    this.setState({breakpoint: breakpoint, layout: layout, cols: colNo});
  }

  render() {
    const {breakpoint, breakpoints, cols, layouts, onBreakpointChange, onLayoutChange, onWidthChange, ...other} = this.props;

    // wrap layouts so we do not need to pass layouts to child
    const onLayoutChangeWrapper = layout => onLayoutChange(layout, layouts);

    return <ReactGridLayout {...other} onLayoutChange={onLayoutChangeWrapper}
                                       layout={this.state.layout}
                                       cols={this.state.cols}/>;
  }
}

ResponsiveReactGridLayout.propTypes = {
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
  layouts: function (props) {
    React.PropTypes.object.isRequired.apply(this, arguments);
    forEach(props.layouts, (layout, key) => validateLayout(layout, 'layouts.' + key));
  },
  width: React.PropTypes.number.isRequired,
  offsetY: React.PropTypes.number.isRequired,
  offsetX: React.PropTypes.number.isRequired,

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

ResponsiveReactGridLayout.defaultProps = {
  breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0},
  cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
  layouts: {},
  onBreakpointChange: () => {
  },
  onLayoutChange: () => {
  },
  onWidthChange: () => {
  }
};


export default ResponsiveReactGridLayout;
