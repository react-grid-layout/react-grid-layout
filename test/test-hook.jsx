'use strict';
let React = require('react');
let ReactDOM = require('react-dom');
require('style!css!../css/styles.css');
require('style!css!../examples/example-styles.css');
typeof window !== "undefined" && (window.React = React); // for devtools

module.exports = function(Layout) {
  let ExampleLayout = React.createClass({

    getInitialState() {
      return {
        layout: []
      };
    },

    onLayoutChange(layout) {
      this.setState({layout: layout});
    },

    stringifyLayout() {
      return this.state.layout.map(function(l) {
        return <div className="layoutItem" key={l.i}><b>{l.i}</b>: [{l.x}, {l.y}, {l.w}, {l.h}]</div>;
      });
    },

    render(){
      return (
        <div>
          <div className="layoutJSON">
            Displayed as <code>[x, y, w, h]</code>:
            <div className="columns">
              {this.stringifyLayout()}
            </div>
          </div>
          <Layout onLayoutChange={this.onLayoutChange} />
        </div>
      );
    }

  });

  document.addEventListener("DOMContentLoaded", function() {
    let contentDiv = document.getElementById('content');
    let gridProps = window.gridProps || {};
    ReactDOM.render(React.createElement(ExampleLayout, gridProps), contentDiv);
  });
};

