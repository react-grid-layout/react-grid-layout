import React from 'react'
import {ResponsiveReactGridLayout} from 'react-grid-layout'
import {ResizableBox} from 'react-resizable'

export default class Example extends React.Component {

    static propTypes = {}

    static defaultProps = {}

    state = {
        initialHeight: 500
    }

    render = () =>
        <ResizableBox className='viewport'
                      height={this.state.initialHeight}
                      onResize={this.onResize}
                      width={500}>

            {this.renderGridLayout()}

        </ResizableBox>

    onResize = (event, data) =>
        this.setState({width: data.size.width})

    renderGridLayout = () =>
        <ResponsiveReactGridLayout width={this.state.width}//width
                                   cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}
                                   rowHeight={30}>

            <div key="1"
                 data-grid={{
                     xxs: {w: 4, h: 4, x: 0, y: 0},
                     xs: {w: 4, h: 4, x: 0, y: 0},
                     sm: {w: 8, h: 8, x: 0, y: 0},
                     md: {w: 10, h: 12, x: 0, y: 0},
                     lg: {w: 12, h: 2, x: 0, y: 0}
                 }}>
                <span className="text">1</span>
            </div>

            <div key="2"
                 data-grid={{
                     xxs: {w: 4, h: 4, x: 1, y: 1},
                     xs: {w: 4, h: 4, x: 1, y: 1},
                     sm: {w: 8, h: 8, x: 1, y: 1},
                     md: {w: 10, h: 12, x: 1, y: 1},
                     lg: {w: 12, h: 2, x: 0, y: 1}
                 }}>
                <span className="text">1</span>
            </div>
        </ResponsiveReactGridLayout>

}
