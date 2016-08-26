// @noflow
// Intentional; Flow can't handle the bind on L20
import React from "react";
import ReactDOM from 'react-dom';

type State = {
  mounted: boolean,
  width: number,
  widthFound: boolean,
};

/*
 * A simple HOC that provides facility for listening to container resizes.
 */
export default (ComposedComponent: ReactClass): ReactClass => class extends React.Component {

  static defaultProps = {
    measureBeforeMount: false,
    awaitNonzeroWidth: false,
    nonzeroWidthRetryDelay: 50,
    nonzeroWidthMaxWait: 2000,
  };

  static propTypes = {
    // If true, will not render children until mounted. Useful for getting the exact width before
    // rendering, to prevent any unsightly resizing.
    measureBeforeMount: React.PropTypes.bool,

    // If true, will not render children until a nonzero width is detected (or maxDelay has been exceeded)
    awaitNonzeroWidth: React.PropTypes.bool,
    // Millisecond delay between checks for nonzero width
    nonzeroWidthRetryDelay: React.PropTypes.number,
    // Max time in milliseconds to check for nonzero width
    nonzeroWidthMaxWait: React.PropTypes.number,
  };

  state: State = {
    mounted: false,
    width: 1280,
    widthFound: false,
  };

  componentDidMount() {
    this.setState({mounted: true});

    window.addEventListener('resize', this.onWindowResize);
    // Call to properly set the breakpoint and resize the elements.
    // Note that if you're doing a full-width element, this can get a little wonky if a scrollbar
    // appears because of the grid. In that case, fire your own resize event, or set `overflow: scroll` on your body.
    this.onWindowResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize = (_event: Event, cb: ?Function) => {
    const node = ReactDOM.findDOMNode(this);
    const width = node.offsetWidth;
    if (!this.props.awaitNonzeroWidth || this.state.widthFound || width != 0) {
      this.setState({width, widthFound: true}, cb);
    }
    else {
      let loopCounter = 0;
      const that = this;
      const waitForNonZeroWidth = function() {
        const node = ReactDOM.findDOMNode(that);
        const width = node.offsetWidth;
        if (width == 0) {
          loopCounter++;
          const wait = loopCounter++ * that.props.nonzeroWidthRetryDelay;
          if (wait >= that.props.nonzeroWidthMaxWait) that.setState({widthFound: true}, cb);
          else setTimeout(waitForNonZeroWidth, that.props.nonzeroWidthRetryDelay);
        }
        else that.setState({width, widthFound: true}, cb);
      };
      waitForNonZeroWidth();
    }
  }

  render() {
    // the internal <div /> prevents child components from being rendered too early
    if (this.props.awaitNonzeroWidth && !this.state.widthFound) return <div {...this.props} {...this.state} ><div /></div>;
    else if (this.props.measureBeforeMount && !this.state.mounted) return <div {...this.props} {...this.state} />;
    return <ComposedComponent {...this.props} {...this.state} />;
  }
};
