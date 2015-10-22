'use strict';
var React = require('react');
var ReactDOM = require('react-dom');

/**
 * A simple mixin that provides facility for listening to container resizes.
 */
var WidthListeningMixin = {

  propTypes: {
    // This allows setting this on the server side
    initialWidth: React.PropTypes.number,

    // If false, you should supply width yourself. Good if you want to debounce resize events
    // or reuse a handler from somewhere else.
    listenToWindowResize: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      initialWidth: 1280,
      listenToWindowResize: true
    };
  },

  componentDidMount: function() {
    if (this.props.listenToWindowResize) {
      window.addEventListener('resize', this.onWindowResize);
      // This is intentional. Once to properly set the breakpoint and resize the elements,
      // and again to compensate for any scrollbar that appeared because of the first step.
      this.onWindowResize();
      this.onWindowResize();
    }
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  },

  /**
   * On window resize, update width.
   */
  onWindowResize: function() {
    this.onWidthChange(ReactDOM.findDOMNode(this).offsetWidth);
  }

};

module.exports = WidthListeningMixin;
