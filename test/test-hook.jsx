import React from 'react';
import ReactDOM from 'react-dom';
require('style!css!../css/styles.css');
require('style!css!../examples/example-styles.css');
typeof window !== "undefined" && (window.React = React); // for devtools

module.exports = function(Layout) {
  class ExampleLayout extends React.Component {

    state = {layout: []};

    onLayoutChange = (layout) => {
      this.setState({layout: layout});
    };

    stringifyLayout() {
      return this.state.layout.map(function(l) {
        return <div className="layoutItem" key={l.i}><b>{l.i}</b>: [{l.x}, {l.y}, {l.w}, {l.h}]</div>;
      });
    }

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
  }

  document.addEventListener("DOMContentLoaded", function() {
    const contentDiv = document.getElementById('content');
    const gridProps = window.gridProps || {};
    ReactDOM.render(React.createElement(ExampleLayout, gridProps), contentDiv);
  });
};

