import React from 'react'
import {ResponsiveReactGridLayout} from 'react-grid-layout'
import {Tabs, Tab} from 'material-ui/Tabs'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import map from 'lodash/map'
import find from 'lodash/find'

export default class Breakpoint extends React.Component {

    state = {
        width: 1000,
        breakpoint: 'lg',
        components: [{
            id: 1,
            grid: {
                xxs: {w: 4, h: 2, x: 0, y: 0},
                xs: {w: 4, h: 2, x: 0, y: 0},
                sm: {w: 3, h: 2, x: 0, y: 0},
                md: {w: 4, h: 1, x: 0, y: 0},
                lg: {w: 12, h: 2, x: 0, y: 0}
            }
        }, {
            id: 2,
            grid: {
                xxs: {w: 4, h: 2, x: 0, y: 0},
                xs: {w: 4, h: 2, x: 0, y: 0},
                sm: {w: 3, h: 2, x: 0, y: 0},
                md: {w: 4, h: 1, x: 0, y: 0},
                lg: {w: 12, h: 2, x: 0, y: 0}
            }
        }]
    }

    render = () =>
        <MuiThemeProvider>
            <div style={{width: this.state.width}}>

                {this.renderTabs()}

                <ResponsiveReactGridLayout onLayoutChange={this.updateLayout}
                                           cols={{lg: 12, md: 8, sm: 6, xs: 4, xxs: 4}}
                                           breakpoints={{lg: 992, md: 768, sm: 480, xs: 240, xxs: 180}}
                                           initialWidth={this.state.width}
                                           width={this.state.width}
                                           height={400}
                                           rowHeight={30}>

                    {this.renderComponents()}

                </ResponsiveReactGridLayout>
            </div>
        </MuiThemeProvider>

    renderTabs = () =>
        <Tabs value={this.state.breakpoint}
              onChange={this.updateBreakpoint}>
            <Tab label="xxs"
                 value='xxs'/>
            <Tab label="xs"
                 value='xs'/>
            <Tab label="sm"
                 value='sm'/>
            <Tab label="md"
                 value='md'/>
            <Tab label="lg"
                 value='lg'/>
        </Tabs>

    renderComponents = () =>
        map(this.state.components, (component) =>
            <div key={component.id}
                 data-grid={component.grid}>
                <span className="text">{Math.random()}</span>
            </div>)

    updateLayout = (currentLayout) => {
        const breakpoint = this.state.breakpoint
        const components = map(currentLayout, (layoutItem) => {
            const component = find(this.state.components, {id: parseInt(layoutItem.i)})
            component.grid[breakpoint].x = layoutItem.x
            component.grid[breakpoint].y = layoutItem.y
            component.grid[breakpoint].w = layoutItem.w
            component.grid[breakpoint].h = layoutItem.h
            return component
        })
        this.setState({components})
    }

    updateBreakpoint = (breakpoint) =>
        this.setState({breakpoint, width: width[breakpoint]})

}

const width = {
    lg: 1000, md: 800, sm: 500, xs: 300, xxs: 200
}

