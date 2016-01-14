// @flow
import {default as React, Component} from 'react';
import {perc, setTransform} from './utils';
import Draggable from 'react-draggable';
import {Resizable} from 'react-resizable';
import assign from 'object-assign';

import type {Position, Size} from './utils';

/**
 * An individual item within a ReactGridLayout.
 */
export default class GridItem extends Component {

  static propTypes = {
    // Children must be only a single element
    children: React.PropTypes.element,

    // General grid attributes
    cols: React.PropTypes.number.isRequired,
    containerWidth: React.PropTypes.number.isRequired,
    rowHeight: React.PropTypes.number.isRequired,
    margin: React.PropTypes.array.isRequired,

    // These are all in grid units
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
    w: React.PropTypes.number.isRequired,
    h: React.PropTypes.number.isRequired,

    // All optional
    minW: function(props, propName, _componentName) {
      React.PropTypes.number.apply(this, arguments);
      if (props.minW > props.w || props.minW > props.maxW) constraintError('minW', props);
    },
    maxW: function(props, propName, _componentName) {
      React.PropTypes.number.apply(this, arguments);
      if (props.maxW < props.w || props.maxW < props.minW) constraintError('maxW', props);
    },
    minH: function(props, propName, _componentName) {
      React.PropTypes.number.apply(this, arguments);
      if (props.minH > props.h || props.minH > props.maxH) constraintError('minH', props);
    },
    maxH: function(props, propName, _componentName) {
      React.PropTypes.number.apply(this, arguments);
      if (props.maxH < props.h || props.maxH < props.minH) constraintError('maxH', props);
    },

    // ID is nice to have for callbacks
    i: React.PropTypes.string.isRequired,

    // If true, item will be repositioned when x/y/w/h change
    moveOnStartChange: React.PropTypes.bool,

    // Functions
    onDragStop: React.PropTypes.func,
    onDragStart: React.PropTypes.func,
    onDrag: React.PropTypes.func,
    onResizeStop: React.PropTypes.func,
    onResizeStart: React.PropTypes.func,
    onResize: React.PropTypes.func,

    // Flags
    isDraggable: React.PropTypes.bool,
    isResizable: React.PropTypes.bool,

    // Use CSS transforms instead of top/left
    useCSSTransforms: React.PropTypes.bool,
    isPlaceholder: React.PropTypes.bool,

    // Others
    className: React.PropTypes.string,
    // Selector for draggable handle
    handle: React.PropTypes.string,
    // Selector for draggable cancel (see react-draggable)
    cancel: React.PropTypes.string
  };

  static defaultProps = {
    isDraggable: true,
    isResizable: true,
    useCSSTransforms: true,
    className: '',
    cancel: '',
    minH: 1,
    minW: 1,
    maxH: Infinity,
    maxW: Infinity
  };

  state: {resizing: Size, className: string} = {
    resizing: null,
    className: ''
  };

  /**
   * Return position on the page given an x, y, w, h.
   * left, top, width, height are all in pixels.
   * @param  {Number}  x             X coordinate in grid units.
   * @param  {Number}  y             Y coordinate in grid units.
   * @param  {Number}  w             W coordinate in grid units.
   * @param  {Number}  h             H coordinate in grid units.
   * @return {Object}                Object containing coords.
   */
  calcPosition(x: number, y: number, w: number, h: number): Position {
    var p = this.props;
    var width = p.containerWidth - p.margin[0];
    var out = {
      left: Math.round(width * (x / p.cols) + p.margin[0]),
      top: Math.round(p.rowHeight * y + p.margin[1]),
      width: Math.round(width * (w / p.cols) - p.margin[0]),
      height: Math.round(h * p.rowHeight - p.margin[1])
    };
    return out;
  }

  /**
   * Translate x and y coordinates from pixels to grid units.
   * @param  {Number} options.left  Left offset in pixels.
   * @param  {Number} options.top   Top offset in pixels.
   * @return {Object}               x and y in grid units.
   */
  calcXY({left, top}: {left: number, top: number}): {x: number, y: number} {
    left = left - this.props.margin[0];
    top = top - this.props.margin[1];
    // This is intentional; because so much of the logic on moving boxes up/down relies
    // on an exact y position, we only round the x, not the y.
    var x = Math.round((left / this.props.containerWidth) * this.props.cols);
    var y = Math.floor(top / this.props.rowHeight);
    x = Math.max(Math.min(x, this.props.cols), 0);
    y = Math.max(y, 0);
    return {x, y};
  }

  /**
   * Given a height and width in pixel values, calculate grid units.
   * @param  {Number} options.height Height in pixels.
   * @param  {Number} options.width  Width in pixels.
   * @return {Object}                w, h as grid units.
   */
  calcWH({height, width}: {height: number, width: number}): {w: number, h: number} {
    width = width + this.props.margin[0];
    height = height + this.props.margin[1];
    var w = Math.round((width / this.props.containerWidth) * this.props.cols);
    var h = Math.round(height / this.props.rowHeight);
    w = Math.max(Math.min(w, this.props.cols - this.props.x), 0);
    h = Math.max(h, 0);
    return {w, h};
  }

  /**
   * This is where we set the grid item's absolute placement. It gets a little tricky because we want to do it
   * well when server rendering, and the only way to do that properly is to use percentage width/left because
   * we don't know exactly what the browser viewport is.
   * Unfortunately, CSS Transforms, which are great for performance, break in this instance because a percentage
   * left is relative to the item itself, not its container! So we cannot use them on the server rendering pass.
   *
   * @param  {Object} pos Position object with width, height, left, top.
   * @return {Object}     Style object.
   */
  createStyle(pos: Position): Object {
    var style = {
      width: pos.width + 'px',
      height: pos.height + 'px',
      left: pos.left + 'px',
      top: pos.top + 'px',
      position: 'absolute'
    };

    // This is used for server rendering.
    if (this.props.usePercentages) {
      style.left = perc(pos.left / this.props.containerWidth);
      style.width = perc(pos.width / this.props.containerWidth);
    }

    // CSS Transforms support
    if (this.props.useCSSTransforms) {
      setTransform(style, [pos.left, pos.top]);
      style.left = null;
      style.top = null;
    }

    return style;
  }

  /**
   * Mix a Draggable instance into a child.
   * @param  {Element} child    Child element.
   * @param  {Object} position  Position object (pixel values)
   * @return {Element}          Child wrapped in Draggable.
   */
  mixinDraggable(child: ReactElement, position: Position): ReactElement {
    var start = typeof position.left === "string" ? undefined : {x: position.left, y: position.top};
    return (
      <Draggable
        start={start}
        moveOnStartChange={this.props.moveOnStartChange}
        onStop={this.onDragHandler('onDragStop')}
        onStart={this.onDragHandler('onDragStart')}
        onDrag={this.onDragHandler('onDrag')}
        handle={this.props.handle}
        cancel={".react-resizable-handle " + this.props.cancel}
        useCSSTransforms={this.props.useCSSTransforms}
        >
        <span>{child}</span>
      </Draggable>
    );
  }

  /**
   * Mix a Resizable instance into a child.
   * @param  {Element} child    Child element.
   * @param  {Object} position  Position object (pixel values)
   * @return {Element}          Child wrapped in Resizable.
   */
  mixinResizable(child: ReactElement, position: Position): ReactElement {
    var p = this.props;
    // This is the max possible width - doesn't go to infinity because of the width of the window
    var maxWidth = this.calcPosition(0, 0, p.cols - p.x, 0).width;

    // Calculate min/max constraints using our min & maxes
    var mins = this.calcPosition(0, 0, p.minW, p.minH);
    var maxes = this.calcPosition(0, 0, p.maxW, p.maxH);
    var minConstraints = [mins.width, mins.height];
    var maxConstraints = [Math.min(maxes.width, maxWidth), Math.min(maxes.height, Infinity)];
    return (
      <Resizable
        width={position.width}
        height={position.height}
        minConstraints={minConstraints}
        maxConstraints={maxConstraints}
        onResizeStop={this.onResizeHandler('onResizeStop')}
        onResizeStart={this.onResizeHandler('onResizeStart')}
        onResize={this.onResizeHandler('onResize')}
        >
        {child}
      </Resizable>
    );
  }

  /**
   * Wrapper around drag events to provide more useful data.
   * All drag events call the function with the given handler name,
   * with the signature (index, x, y).
   *
   * @param  {String} handlerName Handler name to wrap.
   * @return {Function}           Handler function.
   */
  onDragHandler: Function = (handlerName: string) => {
    return (e: Event, {element, position}: {element: Node, position: Position}) => {
      if (!this.props[handlerName]) return;
      // Get new XY
      var {x, y} = this.calcXY(position);

      // Cap x at numCols
      x = Math.min(x, this.props.cols - this.props.w);

      this.props[handlerName](this.props.i, x, y, {e, element, position});
    };
  };

  /**
   * Wrapper around drag events to provide more useful data.
   * All drag events call the function with the given handler name,
   * with the signature (index, x, y).
   *
   * @param  {String} handlerName Handler name to wrap.
   * @return {Function}           Handler function.
   */
  onResizeHandler: Function = (handlerName: string) => {
    return (e: Event, {element, size}: {element: Node, size: Position}) => {
      if (!this.props[handlerName]) return;

      // Get new XY
      var {w, h} = this.calcWH(size);

      // Cap w at numCols
      w = Math.min(w, this.props.cols - this.props.x);
      // Ensure w is at least 1
      w = Math.max(w, 1);

      // Min/max capping
      w = Math.max(Math.min(w, this.props.maxW), this.props.minW);
      h = Math.max(Math.min(h, this.props.maxH), this.props.minH);

      this.setState({resizing: handlerName === 'onResizeStop' ? null : size});

      this.props[handlerName](this.props.i, w, h, {e, element, size});
    };
  };

  render(): ReactElement {
    var p = this.props, pos = this.calcPosition(p.x, p.y, p.w, p.h);
    if (this.state.resizing) {
      pos.width = this.state.resizing.width;
      pos.height = this.state.resizing.height;
    }

    // Create the child element. We clone the existing element but modify its className and style.
    var child = React.cloneElement(this.props.children, {
      // Munge a classname. Use passed in classnames and resizing.
      // React with merge the classNames.
      className: [
        'react-grid-item',
        this.props.className,
        this.props.isDraggable ? '' : 'static',
        this.state.resizing ? 'resizing' : '',
        this.props.useCSSTransforms ? 'cssTransforms' : '',
      ].join(' '),
      // We can set the width and height on the child, but unfortunately we can't set the position.
      style: assign({}, this.props.style, this.createStyle(pos))
    });

    // Resizable support. This is usually on but the user can toggle it off.
    if (this.props.isResizable) {
      child = this.mixinResizable(child, pos);
    }

    // Draggable support. This is always on, except for with placeholders.
    if (this.props.isDraggable) {
      child = this.mixinDraggable(child, pos);
    }

    return child;
  }
}

function constraintError(name: string, props: Object): void {
  delete props.children;
  throw new Error(name + ' overrides contraints on gridItem ' + props.i + '. Full props: ' + JSON.stringify(props));
}
