'use strict';
var Layout = require('./TestLayout.jsx');
var React = require('react');
document.addEventListener("DOMContentLoaded", function(event) { 
  var contentDiv = document.getElementById('content');
  React.render(React.createElement(Layout), contentDiv);
});
