'use strict';
var React = require('react');
require('style!css!../css/styles.css');
require('style!css!../examples/example-styles.css');
require('style!css!../node_modules/react-resizable/css/styles.css');
typeof window !== "undefined" && (window.React = React); // for devtools
typeof window !== "undefined" && (window.Perf = React.addons.Perf); // for devtools

module.exports = function(Layout) {
  document.addEventListener("DOMContentLoaded", function(event) { 
    var contentDiv = document.getElementById('content');
    var gridProps = window.gridProps || {};
    React.render(React.createElement(Layout, gridProps), contentDiv);
  });
};
