// @flow
var deepEqual = require('deep-equal');

// Like PureRenderMixin, but with deep comparisons.
var PureDeepRenderMixin = {
  shouldComponentUpdate: function(nextProps: Object, nextState: Object): boolean {
    return !deepEqual(this.props, nextProps) ||
           !deepEqual(this.state, nextState);
  }
};

module.exports = PureDeepRenderMixin;
