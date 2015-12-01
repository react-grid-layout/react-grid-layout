// @flow
import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';

type Props = {initialWidth: number, listenToWindowResize: boolean};

/**
 * A simple HOC that provides facility for listening to container resizes.
 */
export default (ComposedComponent: ReactClass): ReactClass => {
  return class extends Component {
    static propTypes = {
      // This allows setting this on the server side
      initialWidth: PropTypes.number,

      // If false, you should supply width yourself. Good if you want to debounce resize events
      // or reuse a handler from somewhere else.
      listenToWindowResize: PropTypes.bool
    };

    static defaultProps: Props = {
      initialWidth: 1280,
      listenToWindowResize: true
    };

    componentDidMount() {
      if (!this.props.listenToWindowResize) return;
      window.addEventListener('resize', this.onWindowResize);
      // This is intentional. Once to properly set the breakpoint and resize the elements,
      // and again to compensate for any scrollbar that appeared because of the first step.
      this.onWindowResize();
      this.onWindowResize();
    }

    componentWillUnmount() {
      if (!this.props.listenToWindowResize) return;
      window.removeEventListener('resize', this.onWindowResize);
    }

    /**
     * On window resize, update width of child by calling listener directly.
     * TODO: cleaner way to do this?
     */
    onWindowResize = () => {
      this.refs.child.onWidthChange(ReactDOM.findDOMNode(this).offsetWidth);
    };

    render(): ReactElement {
      return <ComposedComponent {...this.props} ref="child" />;
    }
  };
};
