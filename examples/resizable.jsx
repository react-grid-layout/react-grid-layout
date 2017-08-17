import React from 'react'
import {AutoSizeLayout} from 'react-grid-layout'

export default class Example extends React.Component {

    static propTypes = {}

    static defaultProps = {}

    state = {
        width: 400
    }

    render = () =>
        <div>
            Set width: <input value={this.state.width}
                              type='number'
                              onChange={this.updateWidth}/>

            <br/>
            <br/>

            <AutoSizeLayout cols={{lg: 12, md: 8, sm: 6, xs: 4, xxs: 4}}
                            width={this.state.width}
                            minConstraints={[10, 10]}
                            maxConstraints={[1000, 1000]}
                            rowHeight={30}>

                <div key="1"
                     data-grid={{
                         xxs: {w: 4, h: 2, x: 0, y: 0},
                         xs: {w: 4, h: 2, x: 0, y: 0},
                         sm: {w: 3, h: 2, x: 0, y: 0},
                         md: {w: 4, h: 2, x: 0, y: 0},
                         lg: {w: 6, h: 2, x: 0, y: 0}
                     }}>
                    <span className="text">1</span>
                </div>

                <div key="2"
                     data-grid={{
                         xxs: {w: 4, h: 2, x: 0, y: 1},
                         xs: {w: 4, h: 2, x: 0, y: 1},
                         sm: {w: 3, h: 2, x: 3, y: 0},
                         md: {w: 4, h: 2, x: 4, y: 0},
                         lg: {w: 6, h: 2, x: 6, y: 0}
                     }}>
                    <span className="text">2</span>
                </div>
            </AutoSizeLayout>
        </div>

    updateWidth = (event) =>
        this.setState({width: parseInt(event.currentTarget.value)})

}
