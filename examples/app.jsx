import React from 'react'
import ReactDOM from 'react-dom'
// import Example from './resizable'
// import Example from './resizableWithComponent'
// import Example from './responsive'
import Example from './breakpoint'
import injectTapEventPlugin from 'react-tap-event-plugin'

injectTapEventPlugin()
ReactDOM.render(<Example/>, document.getElementById('content'))
