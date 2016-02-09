// @flow
import React from 'react';
import Draggable from 'react-draggable';
import {Resizable} from 'react-resizable';
import {perc, setTransform} from './utils';

import type {Position} from './utils';

/**
 * An individual item within a ReactGridLayout.
 */
const GridItem = React.createClass({
  propTypes: {
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
    minW: function (props, propName, componentName, location, propFullName) {
      React.PropTypes.number(props, propName, componentName, location, propFullName);
      const value = props[propName];
      if (value > props.w || value > props.maxW) return new Error('minWidth bigger than item width/maxWidth');
    },
    maxW: function (props, propName, componentName, location, propFullName) {
      React.PropTypes.number(props, propName, componentName, location, propFullName);
      const value = props[propName];
      if (value < props.w || value < props.minW) return new Error('maxWidth smaller than item width/minWidth');

    },
    minH: function (props, propName, componentName, location, propFullName) {
      React.PropTypes.number(props, propName, componentName, location, propFullName);
      const value = props[propName];
      if (value > props.h || value > props.maxH) return new Error('minHeight bigger than item height/maxHeight');
    },
    maxH: function (props, propName, componentName, location, propFullName) {
      React.PropTypes.number(props, propName, componentName, location, propFullName);
      const value = props[propName];
      if (value < props.h || value < props.minH) return new Error('maxHeight smaller than item height/minHeight');
    },

    // ID is nice to have for callbacks
    i: React.PropTypes.string.isRequired,

    // Functions
    onDragStop: React.PropTypes.func,
    onDragStart: React.PropTypes.func,
    onDrag: React.PropTypes.func,
    onResizeStop: React.PropTypes.func,
    onResizeStart: React.PropTypes.func,
    onResize: React.PropTypes.func,

    // Flags
    isDraggable: React.PropTypes.bool.isRequired,
    isResizable: React.PropTypes.bool.isRequired,

    // Use CSS transforms instead of top/left
    useCSSTransforms: React.PropTypes.bool.isRequired,
    isPlaceholder: React.PropTypes.bool,

    // Others
    className: React.PropTypes.string,
    // Selector for draggable handle
    handle: React.PropTypes.string,
    // Selector for draggable cancel (see react-draggable)
    cancel: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      isPlaceholder: false,
      className: '',
      cancel: '',
      minH: 1,
      minW: 1,
      maxH: Infinity,
      maxW: Infinity
    };
  },

  getInitialState() {
    return {
      resizing: null,
      dragging: null,
      className: ''
    };
  },

  /**
   * Return position on the page given an x, y, w, h.
   * left, top, width, height are all in pixels.
   * @param  {Number}  x             X coordinate in grid units.
   * @param  {Number}  y             Y coordinate in grid units.
   * @param  {Number}  w             W coordinate in grid units.
   * @param  {Number}  h             H coordinate in grid units.
   * @return {Object}                Object containing coords.
   */
  calcPosition(x:number, y:number, w:number, h:number): Position {
    const {margin, containerWidth, cols, rowHeight} = this.props;

    const width = containerWidth - margin[0];
    const out = {
      left: Math.round(width * (x / cols) + margin[0]),
      top: Math.round(rowHeight * y + margin[1]),
      width: Math.round(width * (w / cols) - margin[0]),
      height: Math.round(h * rowHeight - margin[1])
    };

    if (this.state.resizing) {
      out.width = this.state.resizing.width;
      out.height = this.state.resizing.height;
    }

    if (this.state.dragging) {
      out.top = this.state.dragging.top;
      out.left = this.state.dragging.left;
    }

    return out;
  },

  /**
   * Translate x and y coordinates from pixels to grid units.
   * @param  {Number} top  Top position (relative to parent) in pixels.
   * @param  {Number} left Left position (relative to parent) in pixels.
   * @return {Object} x and y in grid units.
   */
  calcXY(top: number, left: number): {x: number, y: number} {
    const {margin, containerWidth, cols, rowHeight, w} = this.props;

    left -= margin[0];
    top -= margin[1];
    // This is intentional; because so much of the logic on moving boxes up/down relies
    // on an exact y position, we only round the x, not the y.
    let x = Math.round((left / containerWidth) * cols);
    let y = Math.floor(top / rowHeight);
    x = Math.max(Math.min(x, cols), 0);
    y = Math.max(y, 0);

    // Cap x at numCols
    x = Math.min(x, cols - w);

    return {x, y};
  },

  /**
   * Given a height and width in pixel values, calculate grid units.
   * @param  {Number} height Height in pixels.
   * @param  {Number} width  Width in pixels.
   * @return {Object} w, h as grid units.
   */
  calcWH({height, width}: {height: number, width: number}): {w: number, h: number} {
    const {margin, containerWidth, cols, rowHeight, x} = this.props;

    width += margin[0];
    height += margin[1];
    let w = Math.round((width / containerWidth) * cols);
    let h = Math.round(height / rowHeight);
    w = Math.max(Math.min(w, cols - x), 0);
    h = Math.max(h, 0);
    return {w, h};
  },

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
  createStyle(pos:Position): Object {
    const {usePercentages, containerWidth, useCSSTransforms} = this.props;

    let style = {
      width: pos.width + 'px',
      height: pos.height + 'px',
      left: pos.left + 'px',
      top: pos.top + 'px',
      position: 'absolute'
    };

    // This is used for server rendering.
    if (usePercentages) {
      style.left = perc(pos.left / containerWidth);
      style.width = perc(pos.width / containerWidth);
    }

    // CSS Transforms support
    if (useCSSTransforms) {
      setTransform(style, [pos.left, pos.top]);
      style.left = null;
      style.top = null;
    }

    return style;
  },

  /**
   * Mix a Draggable instance into a child.
   * @param  {Element} child    Child element.
   * @return {Element}          Child wrapped in Draggable.
   */
  mixinDraggable(child:ReactElement): ReactElement {
    return (
      <Draggable.DraggableCore
        onStart={this.onDragHandler('onDragStart')}
        onDrag={this.onDragHandler('onDrag')}
        onStop={this.onDragHandler('onDragStop')}
        handle={this.props.handle}
        cancel={".react-resizable-handle " + this.props.cancel}>
        {child}
      </Draggable.DraggableCore>
    );
  },

  /**
   * Mix a Resizable instance into a child.
   * @param  {Element} child    Child element.
   * @param  {Object} position  Position object (pixel values)
   * @return {Element}          Child wrapped in Resizable.
   */
  mixinResizable(child:ReactElement, position:Position): ReactElement {
    const {cols, x, minW, minH, maxW, maxH} = this.props;

    // This is the max possible width - doesn't go to infinity because of the width of the window
    const maxWidth = this.calcPosition(0, 0, cols - x, 0).width;

    // Calculate min/max constraints using our min & maxes
    const mins = this.calcPosition(0, 0, minW, minH);
    const maxes = this.calcPosition(0, 0, maxW, maxH);
    const minConstraints = [mins.width, mins.height];
    const maxConstraints = [Math.min(maxes.width, maxWidth), Math.min(maxes.height, Infinity)];
    return (
      <Resizable
        width={position.width}
        height={position.height}
        minConstraints={minConstraints}
        maxConstraints={maxConstraints}
        onResizeStop={this.onResizeHandler('onResizeStop')}
        onResizeStart={this.onResizeHandler('onResizeStart')}
        onResize={this.onResizeHandler('onResize')}>
        {child}
      </Resizable>
    );
  },

  /**
   * Wrapper around drag events to provide more useful data.
   * All drag events call the function with the given handler name,
   * with the signature (index, x, y).
   *
   * @param  {String} handlerName Handler name to wrap.
   * @return {Function}           Handler function.
   */
  onDragHandler(handlerName:string) {
    return (e:Event, {node, position}: {element: Node, position: Position}) => {
      if (!this.props[handlerName]) return;

      // Get new XY
      switch (handlerName) {
        case 'onDragStart':
          // ToDo this wont work on nested parents
          const parentRect = node.offsetParent.getBoundingClientRect();
          const clientRect = node.getBoundingClientRect();
          position.top = clientRect.top - parentRect.top;
          position.left = clientRect.left - parentRect.left;
          this.setState({dragging: position});
          break;
        case 'onDrag':
          position.left = this.state.dragging.left + position.deltaX;
          position.top = this.state.dragging.top + position.deltaY;
          this.setState({dragging: position});
          break;
        case 'onDragStop':
          position.left = this.state.dragging.left;
          position.top = this.state.dragging.top;
          this.setState({dragging: null});
          break;
        default:
          this.setState({dragging: null});
      }

      const {x, y} = this.calcXY(position.top, position.left);

      this.props[handlerName](this.props.i, x, y, {e, node, position});
    };
  },

  /**
   * Wrapper around drag events to provide more useful data.
   * All drag events call the function with the given handler name,
   * with the signature (index, x, y).
   *
   * @param  {String} handlerName Handler name to wrap.
   * @return {Function}           Handler function.
   */
  onResizeHandler(handlerName:string) {
    return (e:Event, {element, size}: {element: Node, size: Position}) => {
      if (!this.props[handlerName]) return;
      const {cols, x, i, maxW, minW, maxH, minH} = this.props;

      // Get new XY
      let {w, h} = this.calcWH(size);

      // Cap w at numCols
      w = Math.min(w, cols - x);
      // Ensure w is at least 1
      w = Math.max(w, 1);

      // Min/max capping
      w = Math.max(Math.min(w, maxW), minW);
      h = Math.max(Math.min(h, maxH), minH);

      this.setState({resizing: handlerName === 'onResizeStop' ? null : size});

      this.props[handlerName](i, w, h, {e, element, size});
    };
  },

  render() {
    const {x, y, w, h, className, style, isDraggable, isPlaceholder, isResizable, useCSSTransforms} = this.props;

    const pos = this.calcPosition(x, y, w, h);
    const child = React.Children.only(this.props.children);

    // Create the child element. We clone the existing element but modify its className and style.
    let newChild = React.cloneElement(child, {
      // Munge a classname. Use passed in classnames and resizing.
      // React with merge the classNames.
      className: [
        'react-grid-item',
        className,
        isDraggable || isPlaceholder ? '' : 'static',
        this.state.resizing ? 'resizing' : '',
        this.state.dragging ? 'react-draggable-dragging' : '',
        useCSSTransforms ? 'cssTransforms' : ''
      ].join(' '),
      // We can set the width and height on the child, but unfortunately we can't set the position.
      style: {style, ...this.createStyle(pos)}
    });

    // Resizable support. This is usually on but the user can toggle it off.
    if (isResizable) newChild = this.mixinResizable(newChild, pos);

    // Draggable support. This is always on, except for with placeholders.
    if (isDraggable) newChild = this.mixinDraggable(newChild);

    return newChild;
  }
});


export default GridItem;