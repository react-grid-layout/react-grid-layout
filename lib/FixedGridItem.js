// @flow
import React from 'react';
import PropTypes from 'prop-types';
import {DraggableCore} from 'react-draggable';
import {perc, setTopLeft, setTransform} from './utils';
import classNames from 'classnames';
import type {Element as ReactElement, Node as ReactNode} from 'react';

import type {ReactDraggableCallbackData, GridDragEvent, GridResizeEvent, Position} from './utils';

type PartialPosition = {top: number, left: number};
type GridItemCallback<Data: GridDragEvent | GridResizeEvent> = (i: string, w: number, h: number, Data) => void;

type State = {
  dragging: ?{top: number, left: number},
  className: string
};

type Props = {
  children: ReactElement<any>,
	colWidth: number,
  containerWidth: number,
  margin: [number, number],
  containerPadding: [number, number],
  rowHeight: number,
  maxRows: number,
  isDraggable: boolean,
  static?: boolean,
  useCSSTransforms?: boolean,
  usePercentages?: boolean,

  className: string,
  style?: Object,
  // Draggability
  cancel: string,
  handle: string,

  x: number,
  y: number,
  w: number,
  h: number,

  i: string,

  onDrag?: GridItemCallback<GridDragEvent>,
  onDragStart?: GridItemCallback<GridDragEvent>,
  onDragStop?: GridItemCallback<GridDragEvent>
};

/**
 * An individual item within a ReactGridLayout.
 */
export default class FixedGridItem extends React.Component<Props, State> {

  static propTypes = {
    // Children must be only a single element
    children: PropTypes.element,

    // General grid attributes
    containerWidth: PropTypes.number.isRequired,
    rowHeight: PropTypes.number.isRequired,
    margin: PropTypes.array.isRequired,
    maxRows: PropTypes.number.isRequired,
    containerPadding: PropTypes.array.isRequired,

    // These are all in grid units
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    w: PropTypes.number.isRequired,
    h: PropTypes.number.isRequired,

    // ID is nice to have for callbacks
    i: PropTypes.string.isRequired,

    // Functions
    onDragStop: PropTypes.func,
    onDragStart: PropTypes.func,
    onDrag: PropTypes.func,

    // Flags
    isDraggable: PropTypes.bool.isRequired,
    static: PropTypes.bool,

    // Use CSS transforms instead of top/left
    useCSSTransforms: PropTypes.bool.isRequired,

    // Others
    className: PropTypes.string,
    // Selector for draggable handle
    handle: PropTypes.string,
    // Selector for draggable cancel (see react-draggable)
    cancel: PropTypes.string
  };

  static defaultProps = {
    className: '',
    cancel: '',
    handle: ''
  };

  state: State = {
    dragging: null,
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
  calcPosition(x: number, y: number, w: number, h: number, state: ?Object): Position {

    const out = {
			left: x,
			top: y,
			width: w,
      height: h
    };

    if (state && state.dragging) {
      out.top = Math.round(state.dragging.top);
      out.left = Math.round(state.dragging.left);
    }

		// If we're dragging outside of the window, stop the dragging
		// 41px is the width of the right side menu
		if (out.left > window.innerWidth - 41) {
			out.left = window.innerWidth - 41;
		}

		return out;
  }

  /**
   * Translate x and y coordinates.
   * @param  {Number} top  Top position (relative to parent) in pixels.
   * @param  {Number} left Left position (relative to parent) in pixels.
   * @return {Object} x and y in px.
   */

  calcXY(top: number, left: number): {x: number, y: number} {
    const {
			colWidth,
			containerWidth,
			margin,
			rowHeight,
			w
		} = this.props;

		let x = left > 0 ? left : 0;
		if (x + w > containerWidth) {
			x = containerWidth - w;
		}
		while(x % (colWidth + margin[0]) !== 0) {
			x--;
		}

		let y = top > 0 ? top : 0;
		while(y % (rowHeight + margin[1]) !== 0) {
			y--;
		}

    return {x, y};
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
  createStyle(pos: Position): {[key: string]: ?string} {
    const {
			usePercentages,
			containerWidth,
			useCSSTransforms,
			h,
			w
		} = this.props;

    let style;
    // CSS Transforms support (default)
    if (useCSSTransforms) {
      style = setTransform(pos);
    }
    // top,left (slow)
    else {
      style = setTopLeft(pos);

      // This is used for server rendering.
      if (usePercentages) {
        style.left = perc(pos.left / containerWidth);
        style.width = perc(pos.width / containerWidth);
      }
    }

		style.height = h;
		style.width = w;

    return style;
  }

  /**
   * Mix a Draggable instance into a child.
   * @param  {Element} child    Child element.
   * @return {Element}          Child wrapped in Draggable.
   */
  mixinDraggable(child: ReactElement<any>): ReactElement<any> {
    return (
      <DraggableCore
        onStart={this.onDragHandler('onDragStart')}
        onDrag={this.onDragHandler('onDrag')}
        onStop={this.onDragHandler('onDragStop')}
        handle={this.props.handle}
        cancel={".react-resizable-handle" + (this.props.cancel ? "," + this.props.cancel : "")}>
        {child}
      </DraggableCore>
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
  onDragHandler(handlerName:string) {
    return (e:Event, {node, deltaX, deltaY}: ReactDraggableCallbackData) => {
      const handler = this.props[handlerName];
      if (!handler) return;

      const newPosition: PartialPosition = {top: 0, left: 0};

      // Get new XY
      switch (handlerName) {
        case 'onDragStart': {
          // ToDo this wont work on nested parents
          const parentRect = node.offsetParent.getBoundingClientRect();
          const clientRect = node.getBoundingClientRect();
          newPosition.left = clientRect.left - parentRect.left + node.offsetParent.scrollLeft;
          newPosition.top = clientRect.top - parentRect.top + node.offsetParent.scrollTop;
          this.setState({dragging: newPosition});
          break;
        }
        case 'onDrag':
          if (!this.state.dragging) throw new Error('onDrag called before onDragStart.');
          newPosition.left = this.state.dragging.left + deltaX;
          newPosition.top = this.state.dragging.top + deltaY;
          this.setState({dragging: newPosition});
          break;
        case 'onDragStop':
          if (!this.state.dragging) throw new Error('onDragEnd called before onDragStart.');
          newPosition.left = this.state.dragging.left;
          newPosition.top = this.state.dragging.top;
          this.setState({dragging: null});
          break;
        default:
          throw new Error('onDragHandler called with unrecognized handlerName: ' + handlerName);
      }

      const {x, y} = this.calcXY(newPosition.top, newPosition.left);

      handler.call(this, this.props.i, x, y, {e, node, newPosition});
    };
  }

  render(): ReactNode {
    const {
			x,
			y,
			w,
			h,
			isDraggable,
			useCSSTransforms
		} = this.props;

    const pos = this.calcPosition(x, y, w, h, this.state);
    const child = React.Children.only(this.props.children);

    // Create the child element. We clone the existing element but modify its className and style.
    let newChild = React.cloneElement(child, {
      className: classNames('react-grid-item', child.props.className, this.props.className, {
        static: this.props.static,
        'react-draggable': isDraggable,
        'react-draggable-dragging': Boolean(this.state.dragging),
        cssTransforms: useCSSTransforms
      }),
      // We can set the width and height on the child, but unfortunately we can't set the position.
      style: {...this.props.style, ...child.props.style, ...this.createStyle(pos)}
    });

    // Draggable support. This is always on, except for with placeholders.
    if (isDraggable) newChild = this.mixinDraggable(newChild);

    return newChild;
  }
}
