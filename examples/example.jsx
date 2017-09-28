import React from 'react'
import {Tabs, Tab} from 'material-ui/Tabs'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Resizable from './view/resizable'
import ResizableWithComponent from './view/resizableWithComponent'
import Responsive from './view/responsive'
import Breakpoint from './view/breakpoint'

export default class Example extends React.Component {

    state = {
        example: 'resizable'
    }

    render = () =>
        <MuiThemeProvider>
            <div style={{width: this.state.width}}>

                {this.renderTabs()}

                {this.state.example === 'breakpoint' ?
                    <Breakpoint/> : null}

                {this.state.example === 'resizable' ?
                    <Resizable/> : null}

                {this.state.example === 'responsive' ?
                    <Responsive/> : null}

                {this.state.example === 'resizableWithComponent' ?
                    <ResizableWithComponent/> : null}

            </div>
        </MuiThemeProvider>

    renderTabs = () =>
        <Tabs value={this.state.example}
              onChange={this.updateExample}
              style={style.tabs}>
            <Tab label="Resizable"
                 value='resizable'/>
            <Tab label="ResizableWithComponent"
                 value='resizableWithComponent'/>
            <Tab label="Responsive"
                 value='responsive'/>
            <Tab label="Responsive with breakpoints"
                 value='breakpoint'/>
        </Tabs>

    updateExample = (example) =>
        this.setState({example})

}

const style = {
    tabs: {
        paddingBottom: '20px'
    }
}
