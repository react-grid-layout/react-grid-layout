import React from 'react'
import {ResponsiveReactGridLayout} from 'react-resizable'

export default class Example extends React.Component {

    static propTypes = {}

    static defaultProps = {}

    state = {}

    render = () =>
        <ResponsiveReactGridLayout width={1000}
                                   className="layout"
                                   cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}
                                   rowHeight={30}
                                   layouts={layout}
                                   onLayoutChange={this.onLayoutChange}>
            <div key="1"
                 data-grid={{lg: {w: 2, h: 6, x: 0, y: 0}, md: {w: 12, h: 16, x: 0, y: 0}}}>
                <span className="text">1</span></div>
            {/*<div key="2"><span className="text">2</span></div>*/}
            {/*<div key="3"><span className="text">3</span></div>*/}
            {/*<div key="4"><span className="text">4</span></div>*/}
            {/*<div key="5"><span className="text">5</span></div>*/}
        </ResponsiveReactGridLayout>

}

const style = {
    container: {
        height: 'calc(100% - 40px)',
        display: 'flex',
        justifyContent: 'center'
    }
}

// data-grid={{w: 2, h: 6, x: 0, y: 0}}
// data-grid={{w: 2, h: 3, x: 2, y: 0}}
// data-grid={{w: 2, h: 3, x: 4, y: 0}}
// data-grid={{w: 2, h: 3, x: 6, y: 0}}
// data-grid={{w: 2, h: 3, x: 8, y: 0}}

const layout = {
    lg: [{
        w: 12,
        h: 1,
        x: 0,
        y: 0,
        i: '1'
    }, {
        w: 12,
        h: 1,
        x: 0,
        y: 1,
        i: '2'
    }, {
        w: 12,
        h: 2,
        x: 0,
        y: 2,
        i: '3'
    }],
    md: [{
        w: 6,
        h: 2,
        x: 0,
        y: 0,
        i: '1'
    }, {
        w: 3,
        h: 1,
        x: 0,
        y: 2,
        i: '2'
    }, {
        w: 3,
        h: 1,
        x: 3,
        y: 2,
        i: '3'
    }]
}
