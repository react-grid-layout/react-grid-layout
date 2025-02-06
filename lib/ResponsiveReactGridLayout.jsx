/* @flow */
import * as React from "react";
import PropTypes from "prop-types";
import { deepEqual } from "fast-equals";

import {
  cloneLayout,
  synchronizeLayoutWithChildren,
  validateLayout,
  noop,
  type Layout
} from "./utils";
import {
  getBreakpointFromWidth,
  getColsFromBreakpoint,
  findOrGenerateResponsiveLayout,
  type ResponsiveLayout,
  type OnLayoutChangeCallback,
  type Breakpoints
} from "./responsiveUtils";
import ReactGridLayout from "./ReactGridLayout";
import type { Breakpoint } from "./responsiveUtils";

/**
 * Get a value of margin or containerPadding.
 *
 * @param  {Array | Object} param Margin | containerPadding, e.g. [10, 10] | {lg: [10, 10], ...}.
 * @param  {String} breakpoint   Breakpoint: lg, md, sm, xs etc.
 * @return {Array|null}
 */
function getIndentationValue(
  param: { [key: string]: ?[number, number] } | ?[number, number],
  breakpoint: string
): ?[number, number] {
  if (param == null) return null;
  return Array.isArray(param) ? param : param[breakpoint];
}

type Props<Breakpoint: string = string> = {|
  // Inherited props from ReactGridLayout
  ...React.ElementConfig<typeof ReactGridLayout>,

  // Responsive config
  breakpoint?: ?Breakpoint,
  breakpoints: Breakpoints<Breakpoint>,
  cols: { [key: Breakpoint]: number },
  layouts: ResponsiveLayout<Breakpoint>,
  width: number,
  margin: { [key: Breakpoint]: [number, number] } | [number, number],
  /* prettier-ignore */
  containerPadding: { [key: Breakpoint]: ?[number, number] } | ?[number, number],

  // Callbacks
  onBreakpointChange: (Breakpoint, cols: number) => void,
  onLayoutChange: OnLayoutChangeCallback,
  onWidthChange: (
    containerWidth: number,
    margin: [number, number],
    cols: number,
    containerPadding: ?[number, number]
  ) => void
|};

type State = {|
  layout: Layout,
  breakpoint: string,
  cols: number,
  layouts?: ResponsiveLayout<string>
|};

const ResponsiveReactGridLayout = (props: Props<Breakpoint>): React.Node => {
  const {
    width,
    breakpoints,
    layouts,
    cols: colsProp,
    children,
    margin,
    containerPadding,
    onBreakpointChange,
    onLayoutChange,
    onWidthChange,
    compactType,
    allowOverlap,
    breakpoint: propBreakpoint,
    ...other
  } = props;

  // Initialize state similar to generateInitialState()
  const [state, setState] = React.useState<State>(() => {
    const bp: string =
      propBreakpoint || getBreakpointFromWidth(breakpoints, width);
    const colNo: number = getColsFromBreakpoint(bp, colsProp);
    // If verticalCompact is false then compactType is null. (Note: verticalCompact is deprecated.)
    const ct = props.verticalCompact === false ? null : compactType;
    const initialLayout: Layout = findOrGenerateResponsiveLayout(
      layouts,
      breakpoints,
      bp,
      bp,
      colNo,
      ct
    );

    return {
      layout: initialLayout,
      breakpoint: bp,
      cols: colNo,
      layouts
    };
  });

  // getDerivedStateFromProps logic: Update layout if props.layouts changes
  React.useEffect(() => {
    if (!deepEqual(props.layouts, state.layouts)) {
      const bp = state.breakpoint;
      const colNo = state.cols;
      const newLayout: Layout = findOrGenerateResponsiveLayout(
        props.layouts,
        props.breakpoints,
        bp,
        bp,
        colNo,
        props.compactType
      );
      setState(prev => ({
        ...prev,
        layout: newLayout,
        layouts: props.layouts
      }));
    }
  }, [
    props.layouts,
    props.breakpoints,
    props.compactType,
    state.breakpoint,
    state.cols,
    state.layouts
  ]);

  // onWidthChange effect: Runs on changes to width and related responsive props.
  React.useEffect(() => {
    const newBreakpoint: string =
      props.breakpoint || getBreakpointFromWidth(props.breakpoints, width);
    const lastBreakpoint: string = state.breakpoint;
    // Only recalc if the breakpoint actually changes.
    if (lastBreakpoint !== newBreakpoint) {
      const newCols: number = getColsFromBreakpoint(newBreakpoint, colsProp);
      let newLayouts = { ...layouts };

      if (!(lastBreakpoint in newLayouts)) {
        newLayouts[lastBreakpoint] = cloneLayout(state.layout);
      }

      let layout: Layout = findOrGenerateResponsiveLayout(
        newLayouts,
        props.breakpoints,
        newBreakpoint,
        lastBreakpoint,
        newCols,
        props.compactType
      );

      layout = synchronizeLayoutWithChildren(
        layout,
        children,
        newCols,
        props.compactType,
        allowOverlap
      );

      newLayouts[newBreakpoint] = layout;

      onBreakpointChange(newBreakpoint, newCols);
      onLayoutChange(layout, newLayouts);

      setState(prev => ({
        ...prev,
        breakpoint: newBreakpoint,
        layout: layout,
        cols: newCols
      }));

      const bpMargin = getIndentationValue(margin, newBreakpoint);
      const bpContainerPadding = getIndentationValue(
        containerPadding,
        newBreakpoint
      );
      onWidthChange(width, bpMargin, newCols, bpContainerPadding);
    } else {
      // Even if breakpoint hasn't changed, we may need to report width changes.
      const bpMargin = getIndentationValue(margin, lastBreakpoint);
      const bpContainerPadding = getIndentationValue(
        containerPadding,
        lastBreakpoint
      );
      onWidthChange(width, bpMargin, state.cols, bpContainerPadding);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    width,
    props.breakpoint,
    props.breakpoints,
    children,
    margin,
    containerPadding,
    props.compactType,
    allowOverlap
  ]);

  // onLayoutChange callback wrapper so we don't pass layouts to child.
  const handleLayoutChange = React.useCallback(
    (layout: Layout) => {
      onLayoutChange(layout, { ...props.layouts, [state.breakpoint]: layout });
    },
    [onLayoutChange, props.layouts, state.breakpoint]
  );

  // Destructure props to remove responsive-specific props before passing to ReactGridLayout.
  const {
    breakpoint,
    breakpoints: _breakpoints,
    cols: _cols,
    layouts: _layouts,
    margin: _margin,
    containerPadding: _containerPadding,
    onBreakpointChange: _onBreakpointChange,
    onLayoutChange: _onLayoutChange,
    onWidthChange: _onWidthChange,
    ...rest
  } = props;

  return (
    <ReactGridLayout
      {...other}
      {...rest}
      margin={getIndentationValue(margin, state.breakpoint)}
      containerPadding={getIndentationValue(containerPadding, state.breakpoint)}
      onLayoutChange={handleLayoutChange}
      layout={state.layout}
      cols={state.cols}
    />
  );
};

ResponsiveReactGridLayout.propTypes = {
  // Basic props
  breakpoint: PropTypes.string,
  breakpoints: PropTypes.object.isRequired,
  allowOverlap: PropTypes.bool,
  cols: PropTypes.object.isRequired,
  margin: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  containerPadding: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  layouts(props: Props, propName: string) {
    if (Object.prototype.toString.call(props[propName]) !== "[object Object]") {
      throw new Error(
        "Layout property must be an object. Received: " +
          Object.prototype.toString.call(props[propName])
      );
    }
    Object.keys(props[propName]).forEach(key => {
      if (!(key in props.breakpoints)) {
        throw new Error(
          "Each key in layouts must align with a key in breakpoints."
        );
      }
      validateLayout(props.layouts[key], "layouts." + key);
    });
  },
  width: PropTypes.number.isRequired,

  // Callbacks
  onBreakpointChange: PropTypes.func,
  onLayoutChange: PropTypes.func,
  onWidthChange: PropTypes.func
};

ResponsiveReactGridLayout.defaultProps = {
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  containerPadding: { lg: null, md: null, sm: null, xs: null, xxs: null },
  layouts: {},
  margin: [10, 10],
  allowOverlap: false,
  onBreakpointChange: noop,
  onLayoutChange: noop,
  onWidthChange: noop
};

export default ResponsiveReactGridLayout;
