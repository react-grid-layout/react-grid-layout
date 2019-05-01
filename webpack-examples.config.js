'use strict';
var webpack = require('webpack');
var fs = require('fs');

// Builds example bundles
module.exports = {
  mode: 'development',
  context: __dirname,
  entry: {
    commons: ["lodash"],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'commons',
          chunks: 'initial',
          minChunks: 2
        }
      }
    }
  },
  output: {
      path: __dirname + "/dist",
      filename: "[name].bundle.js",
      sourceMapFilename: "[file].map",
  },
  module: {
    rules: [
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader', query: {
        cacheDirectory: true,
        plugins: [
          'transform-react-inline-elements',
          'transform-react-constant-elements',
        ]
      }}
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify('production')
      }
    }),
  ],
  resolve: {
    extensions: [".webpack.js", ".web.js", ".js", ".jsx"],
    alias: {'react-grid-layout': __dirname + '/index-dev.js'}
  }
};

// Load all entry points
var files = fs.readdirSync(__dirname + '/test/examples').filter(function(element, index, array){
    return element.match(/^.+\.jsx$/);
});

for(var idx in files){
    var file = files[idx];
    var module_name = file.replace(/\.jsx$/,'');
    module.exports.entry[module_name] = './test/examples/' + file;
}
