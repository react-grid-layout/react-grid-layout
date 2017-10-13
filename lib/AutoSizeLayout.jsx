import React from 'react'
import PropTypes from 'prop-types'
import ResponsiveReactGridLayout from './ResponsiveReactGridLayout'
import {ResizableBox} from 'react-resizable'
import Dimensions from 'react-dimensions'

@Dimensions({
    containerStyle: {
        width: '100%',
        height: '100%',
        padding: 0,
        border: 0,
        display: 'flex',
        justifyContent: 'center'
    }
})
export default class AutoSizeLayout extends React.Component {

    static defaultProps = {
        width: 0,
        height: 0,
        minConstraints: undefined,
        maxConstraints: undefined,
        containerWidth: undefined,
        containerHeight: undefined,
        children: undefined,
        onMouseDown: () => {
        }
    }

    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        containerWidth: PropTypes.number,
        containerHeight: PropTypes.number,
        minConstraints: PropTypes.array,
        maxConstraints: PropTypes.array,
        onMouseDown: PropTypes.func,
        children: PropTypes.element
    }

    state = {
        width: this.props.containerWidth,
        height: this.props.containerHeight
    }

    componentDidMount = () =>
        window.addEventListener('resize', this.onBrowserResize)

    componentWillReceiveProps(nextProps) {
        if (nextProps.width !== this.props.width) {
            this.setState({width: nextProps.width})
        }
    }

    componentWillUnmount = () =>
        window.removeEventListener('resize', this.onBrowserResize)

    render = () =>
        <ResizableBox width={this.props.width || this.props.containerWidth}
                      height={this.props.height || this.props.containerHeight}
                      minConstraints={this.props.minConstraints}
                      maxConstraints={this.props.maxConstraints}
                      onResize={this.onResize}
                      onMouseDown={this.props.onMouseDown}>

            <ResponsiveReactGridLayout {...this.props}
                                       width={this.state.width}
                                       height={this.state.height}
                                       initialWidth={this.props.width}>
                {this.props.children}
            </ResponsiveReactGridLayout>

        </ResizableBox>

    onResize = (event, data) =>
        this.setState({width: data.size.width, height: data.size.height})

    onBrowserResize = () =>
        this.setState({width: this.props.containerWidth, height: this.props.containerHeight})

}