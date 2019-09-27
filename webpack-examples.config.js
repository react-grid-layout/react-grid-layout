'use strict';
const webpack = require('webpack');
const fs = require('fs');

// Builds example bundles
module.exports = {
  mode: "development",
  context: __dirname,
  entry: {
    commons: ["lodash"]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: "commons",
          chunks: "initial",
          minChunks: 2
        }
      }
    }
  },
  output: {
      path: __dirname + "/dist",
      filename: "[name].js",
      sourceMapFilename: "[file].map",
  },
  module: {
    rules: [
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader', query: {
        cacheDirectory: true,
      }}
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    })
  ],
  resolve: {
    extensions: [".webpack.js", ".web.js", ".js", ".jsx"],
    alias: { "react-grid-layout": __dirname + "/index-dev.js" }
  }
};

// Load all entry points
const files = fs.readdirSync(__dirname + '/test/examples').filter(function(element, index, array){
  return element.match(/^.+\.jsx$/);
});

for (const file of files){
  const module_name = file.replace(/\.jsx$/,'');
  module.exports.entry[module_name] = './test/examples/' + file;
}
