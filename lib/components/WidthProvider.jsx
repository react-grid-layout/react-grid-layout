// @noflow
// Intentional; Flow can't handle the bind on L20
import React from "react";
import ReactDOM from 'react-dom';

type State = {width: number};

/*
 * A simple HOC that provides facility for listening to container resizes.
 */
export default (ComposedComponent: ReactClass): ReactClass => class extends React.Component {

  state: State = {
    // Intentional; Force RRGL to trigger onBreakpointChange() in any case when mounted
    width: 0
  };

  componentDidMount() {
    const node = ReactDOM.findDOMNode(this);
    // Bind here so we have the same reference when removing the listener on unmount.
    this.onWindowResize = this._onWindowResize.bind(this, node);

    window.addEventListener('resize', this.onWindowResize);
    // This is intentional. Once to properly set the breakpoint and resize the elements,
    // and again to compensate for any scrollbar that appeared because of the first step.
    this.onWindowResize();
    this.onWindowResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  _onWindowResize(node: HTMLElement, _event: Event) {
    this.setState({width: node.offsetWidth});
  }

  render() {
    return <ComposedComponent {...this.props} {...this.state} />;
  }
};
