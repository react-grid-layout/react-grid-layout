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

  getInitialState() {
    return {
      resizing: false,
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
      width: width * (p.w / p.cols) - p.margin[0],
      height: p.h * p.rowHeight - p.margin[1]
    };
    if (this.state.resizing) {
      out.width = this.state.resizing.width;
      out.height = this.state.resizing.height;
    }
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

  calcWH({height, width}) {
    var w = Math.round((width / this.props.containerWidth) * this.props.cols);
    var h = Math.round(height / this.props.rowHeight);
    w = Math.max(Math.min(w, this.props.cols - this.props.x), 0);
    h = Math.max(h, 0);
    return {w, h};
  },

  mixinDraggable(child, position) {
    return (
      <Draggable
        start={{x: position.left, y: position.top}}
        moveOnStartChange={this.props.moveOnStartChange} 
        onStop={this.onDragHandler('onDragStop')}
        onStart={this.onDragHandler('onDragStart')}
        onDrag={this.onDragHandler('onDrag')}
        handle={this.props.handle}
        cancel=".react-resizable-handle"
        >
        {child}
      </Draggable>
    );
  },

  mixinResizable(child, position) {
    var p = this.props;
    var colWidth = p.containerWidth / p.cols - p.margin[0];
    var maxWidth = (colWidth + p.margin[0]) * (p.cols - p.x) - p.margin[0] * 2;
    var rowHeight = p.rowHeight - p.margin[1];
    return (
      <Resizable
        width={position.width}
        height={position.height}
        minConstraints={[colWidth, rowHeight]}
        maxConstraints={[maxWidth, Infinity]}
        onResizeStop={this.onResizeHandler('onResizeStop')}
        onResizeStart={this.onResizeHandler('onResizeStart')}
        onResize={this.onResizeHandler('onResize')}
        >
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
  onDragHandler(handlerName) {
    var me = this;
    return function(e, {element, position}) {
      if (!me.props[handlerName]) return;
      // Get new XY
      var {x, y} = me.calcXY(element);

      // Cap x at numCols
      x = Math.min(x, me.props.cols - me.props.w);

      me.props[handlerName](me.props.i, x, y);
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
  onResizeHandler(handlerName) {
    var me = this;
    return function(e, {element, size}) {
      if (!me.props[handlerName]) return;

      // Get new XY
      var {w, h} = me.calcWH(size);

      // Cap w at numCols
      w = Math.min(w, me.props.cols - me.props.x);
      // Ensure w is at least 1
      w = Math.max(w, 1);

      me.setState({resizing: handlerName === 'onResizeStop' ? null : size});

      me.props[handlerName](me.props.i, w, h);
    };
  },

  render() {
    var p = this.props, pos = this.calcPosition();

    var child = React.addons.cloneWithProps(React.Children.only(this.props.children), {
      // Munge a classname. Use passed in classnames, child classnames, and resizing.
      className: ['react-grid-item', this.props.children.props.className || '', this.props.className,
        this.state.resizing ? 'resizing' : ''].join(' '),
      // We can set the width and height on the child, but unfortunately we can't set the position.
      style: {
        width: pos.width + 'px',
        height: pos.height + 'px',
        position: 'absolute'
      }
    });

    // If we're not mounted yet, use percentages; otherwise items won't fit the window properly
    // because this.props.width hasn't actually been populated with a real value
    if (!this.isMounted()) {
      pos.left = utils.perc(pos.left / p.containerWidth);
      child.props.style.width = utils.perc(pos.width / p.containerWidth);
    }

    // Resizable support. This is usually on but the user can toggle it off. 
    if (this.props.isResizable && this.isMounted()) {
      child = this.mixinResizable(child, pos);
    }

    // Draggable support. This is always on, except for with placeholders.
    if (this.props.isDraggable) {
      child = this.mixinDraggable(child, pos);
    } 
    // Place the element directly if draggability is turned off.
    else {
      child.props.style.left = pos.left, child.props.style.top = pos.top;
    }

    return child;
  }
});
