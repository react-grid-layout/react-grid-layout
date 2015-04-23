'use strict';
var deepEqual = require('deep-equal');

// Like PureRenderMixin, but with deep comparisons.
var PureDeepRenderMixin = {
  shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
    return !deepEqual(this.props, nextProps) || !deepEqual(this.state, nextState);
  }
};

module.exports = PureDeepRenderMixin;