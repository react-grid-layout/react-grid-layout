'use strict';
var React = require('react/addons');
var Draggable = require('react-draggable');

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
    watchStart: React.PropTypes.bool,
    
    // Functions
    onDragStop: React.PropTypes.func,
    onDragStart: React.PropTypes.func,
    onDrag: React.PropTypes.func,

    // others
    className: React.PropTypes.string,
    isDraggable: React.PropTypes.bool
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
      width: (width * p.w / p.cols) - ((p.w - 1) * p.margin[0]) + 'px',
      height: p.h * p.rowHeight - p.margin[1] + 'px'
    };
    // If we're not mounted yet, use percentages; otherwise items won't fit the window properly
    // because this.props.width hasn't actually been populated with a real value
    if (!this.isMounted()) {
      out.left = perc(out.x / p.containerWidth);
      out.width = perc(out.width / p.containerWidth);
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

  dragHandler(handlerName, element) {
    if (!this.props[handlerName]) return;
    // Get new XY
    var {x, y} = this.calcXY(element);

    // Cap x at numCols
    if (x + this.props.w > this.props.cols) {
      x = this.props.cols - this.props.w;
    }

    this.props[handlerName](this.props.i, x, y);
  },

  onDrag(e, {element, position}) {
    this.dragHandler('onDrag', element);
  },

  onDragStart(e, {element, position}) {
    this.dragHandler('onDragStart', element);
  },

  onDragStop(e, {element, position}) {
    this.dragHandler('onDragStop', element);
  },

  render() {
    var child = React.Children.only(this.props.children);

    var p = this.props;
    var {left, top, width, height} = this.calcPosition();

    child = React.addons.cloneWithProps(child, {
      // We can set the width and height on the child, but unfortunately we can't set the position.
      style: {
        width: width,
        height: height,
        position: 'absolute'
      }
    });
    child.props.className = 'react-grid-item ' + (child.props.className || "") + " " + (this.props.className || '');
    
    if (this.props.isDraggable !== false) {
      return (
        <Draggable
          start={{x: left, y: top}}
          watchStart={this.props.watchStart} 
          onStop={this.onDragStop}
          onStart={this.onDragStart}
          onDrag={this.onDrag}>
          {child}
        </Draggable>
      );
    } else {
      child.props.style.left = left, child.props.style.top = top;
      return child;
    }

  }
});

/**
 * Helper to convert a number to a percentage string.
 * @param  {Number} num Any number
 * @return {String}     That number as a percentage.
 */
function perc(num) {
  return num * 100 + '%';
}
