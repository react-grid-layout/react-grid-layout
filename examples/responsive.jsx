import React from 'react'
import {ResponsiveReactGridLayout} from 'react-grid-layout'

export default class Example extends React.Component {

    static propTypes = {}

    static defaultProps = {}

    state = {}

    render = () =>
        <ResponsiveReactGridLayout width={1280}
                                   cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}
                                   rowHeight={10}>

            <div key="1"
                 data-grid={{
                     xs: {w: 4, h: 4, x: 0, y: 0},
                     sm: {w: 8, h: 8, x: 0, y: 0},
                     md: {w: 12, h: 12, x: 0, y: 0},
                     lg: {w: 8, h: 2, x: 0, y: 0}
                 }}>
                <span className="text">1</span>
            </div>

            <div key="2"
                 data-grid={{
                     xs: {w: 4, h: 4, x: 1, y: 1},
                     sm: {w: 8, h: 8, x: 1, y: 1},
                     md: {w: 12, h: 12, x: 1, y: 1},
                     lg: {w: 8, h: 2, x: 0, y: 1}
                 }}>
                <span className="text">1</span>
            </div>

        </ResponsiveReactGridLayout>

}
