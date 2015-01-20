'use strict';
var React = require('react');
require('style!css!../css/styles.css');
require('style!css!../examples/example-styles.css');
require('style!css!../node_modules/react-resizable/css/styles.css');
typeof window !== "undefined" && (window.React = React); // for devtools

module.exports = function(Layout) {
  document.addEventListener("DOMContentLoaded", function(event) { 
    var contentDiv = document.getElementById('content');
    var gridProps = window.gridProps || {};
    React.render(React.createElement(ExampleLayout, gridProps), contentDiv);
  });

  var ExampleLayout = React.createClass({

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
};

