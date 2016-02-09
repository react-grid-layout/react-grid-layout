// @flow
import React from "react";
import ReactDOM from 'react-dom';

/*
 * A simple HOC that provides facility for listening to container resizes.
 */
export default ComposedComponent => class extends React.Component {
  constructor() {
    super();
    this.state = {
      width: 1280,
      offsetY: 0,
      offsetX: 0
    };
  }
  componentDidMount() {
    const node = ReactDOM.findDOMNode(this);
    window.addEventListener('resize', () => this.onWindowResize(node));
    // This is intentional. Once to properly set the breakpoint and resize the elements,
    // and again to compensate for any scrollbar that appeared because of the first step.
    this.onWindowResize(node);
    this.onWindowResize(node);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize(node) {
    const {top, left, width} = node.getBoundingClientRect();
    this.setState({offsetY: top, offsetX: left, width: width});
  }

  render() {
    return <ComposedComponent {...this.props} {...this.state} />;
  }
};