'use strict';
var React = require('react/addons');
var utils = require('./utils');
var Draggable = require('react-draggable');
var Resizable = require('react-resizable').Resizable;

var GridItem = module.exports = React.createClass({
  displayName: 'GridItem',
  mixins: [React.addons.PureRenderMixin],

  propTypes: {
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

    // Index is nice to have for callbacks
    i: React.PropTypes.number.isRequired,

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

    // Others
    className: React.PropTypes.string,
    // Selector for draggable handle
    handle: React.PropTypes.string 
  },

  getDefaultProps() {
    return {
      isDraggable: true,
      isResizable: true,
      className: ''
    };
  },

  /**
   * Return position on the page given an x, y, w, h.
   * left, top, width, height are all in pixels.
   * @param  {Object}  l             Layout object.
   * @return {Object}                Object containing coords.
   */
  calcPosition(x, y, w, h) {
    var p = this.props;
    var width = p.containerWidth - p.margin[0];
    var out = {
      left: width * (p.x / p.cols) + p.margin[0],
      top: p.rowHeight * p.y + p.margin[1],
      width: (width * p.w / p.cols) - ((p.w - 1) * p.margin[0]),
      height: p.h * p.rowHeight - p.margin[1]
    };
    return out;
  },

  /**
   * Given an element, inspect its styles and generate new x,y coordinates.
   * @param  {DOMElement} element DOM Element.
   * @return {Object}             x and y coordinates.
   */
  calcXY(element) {
    var newX = parseInt(element.style.left, 10);
    var newY = parseInt(element.style.top, 10);

    var x = Math.round((newX / this.props.containerWidth) * this.props.cols);
    var y = Math.round(newY / this.props.rowHeight);
    x = Math.max(Math.min(x, this.props.cols), 0);
    y = Math.max(y, 0);
    return {x, y};
  },

  /**
   * Given a resize handle, figure out a new w and h for this element.
   * @param  {DOMElement} element DOM Element (resize handle)
   * @return {Object}             w and h.
   */
  calcWH(element) {

  },

  /**
   * Wrapper around drag events to provide more useful data.
   * All drag events call the function with the given handler name, 
   * with the signature (index, x, y).
   * 
   * @param  {String} handlerName Handler name to wrap.
   * @return {Function}           Handler function.
   */
  dragHandler(handlerName) {
    var me = this;
    return function(e, {element, position}) {
      if (!me.props[handlerName]) return;
      // Get new XY
      var {x, y} = me.calcXY(element);

      // Cap x at numCols
      if (x + me.props.w > me.props.cols) {
        x = me.props.cols - me.props.w;
      }

      me.props[handlerName](me.props.i, x, y);
    };
  },

  render() {
    var child = React.Children.only(this.props.children);

    var p = this.props;
    var {left, top, width, height} = this.calcPosition();

    // If we're not mounted yet, use percentages; otherwise items won't fit the window properly
    // because this.props.width hasn't actually been populated with a real value
    if (!this.isMounted()) {
      left = utils.perc(left / p.containerWidth);
      width = utils.perc(width / p.containerWidth);
    }

    child = React.addons.cloneWithProps(child, {
      // We can set the width and height on the child, but unfortunately we can't set the position.
      style: {
        width: typeof width === "number" ? width + 'px' : width,
        height: typeof height === "number" ? height + 'px' : height,
        position: 'absolute'
      }
    });

    // Place the element directly if draggability is turned off.
    if (!this.props.isDraggable) {
      child.props.style.left = left, child.props.style.top = top;
    }

    child.props.className = 'react-grid-item ' + (child.props.className || "") + " " + this.props.className;

    // Resizable support. This is usually on but the user can toggle it off. 
    if (this.props.isResizable && this.isMounted()) {
      child = (
        <Resizable
          width={width}
          height={height}
          onResize={this.props.onResize}
          onResizeStop={this.props.onResizeStop}
          >
          {child}
        </Resizable>
      );
    }

    // Draggable support. This is always on, except for with placeholders.
    if (this.props.isDraggable) {
      child = (
        <Draggable
          start={{x: left, y: top}}
          moveOnStartChange={this.props.moveOnStartChange} 
          onStop={this.dragHandler('onDragStop')}
          onStart={this.dragHandler('onDragStart')}
          onDrag={this.dragHandler('onDrag')}
          handle={this.props.handle}
          cancel=".react-resizable-handle"
          >
          {child}
        </Draggable>
      );
    }

    return child;
  }
});
