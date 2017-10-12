import React from 'react'
import ReactDOM from 'react-dom'
import Example from './example'
import injectTapEventPlugin from 'react-tap-event-plugin'

injectTapEventPlugin()
ReactDOM.render(<Example/>, document.getElementById('content'))
