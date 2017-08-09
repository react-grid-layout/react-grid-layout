import React from "react"
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

/*
 * A simple HOC that provides facility for listening to container resizes.
 */
const WidthProvider = (ComposedComponent) => class extends React.Component {

    static defaultProps = {
        measureBeforeMount: false
    };

    static propTypes = {
        // If true, will not render children until mounted. Useful for getting the exact width before
        // rendering, to prevent any unsightly resizing.
        measureBeforeMount: PropTypes.bool
    };

    state = {
        width: 1280
    };

    mounted = false;

    componentDidMount() {
        this.mounted = true

        window.addEventListener('resize', this.onWindowResize)
        // Call to properly set the breakpoint and resize the elements.
        // Note that if you're doing a full-width element, this can get a little wonky if a scrollbar
        // appears because of the grid. In that case, fire your own resize event, or set `overflow: scroll`
        // on your body.
        this.onWindowResize()
    }

    componentWillUnmount() {
        this.mounted = false
        window.removeEventListener('resize', this.onWindowResize)
    }

    onWindowResize = () => {
        if (!this.mounted) return
        const node = ReactDOM.findDOMNode(this) // Flow casts this to Text | Element
        if (node instanceof HTMLElement) this.setState({width: node.offsetWidth})
    }

    render() {
        if (this.props.measureBeforeMount && !this.mounted) {
            return (<div className={this.props.className}
                        style={this.props.style}/>)
        }

        return <ComposedComponent {...this.props} {...this.state}/>
    }

}

export default WidthProvider
