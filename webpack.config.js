'use strict';
var webpack = require('webpack');

// Builds bundle usable <script>. Includes RGL and all deps, excluding React.
module.exports = {
    context: __dirname,
    entry: {
      'react-grid-layout': './index-dev.js'
    },
    output: {
      path: __dirname + "/dist",
      filename: "[name].min.js",
      libraryTarget: "umd",
      library: "ReactGridLayout"
    },
    devtool: 'source-map',
    externals: {
      // React dep should be available as window.React
      "react": "React",
      "react/addons": "React"
    },
    module: {
      loaders: [
        {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader?stage=0'}
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify('production')
        }
      }),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.DedupePlugin(),
      // See #40 - duplicated React modules don't play nice
      new webpack.NormalModuleReplacementPlugin(/\/react\/lib\/cloneWithProps/, '../../react-clonewithprops/index.js'),
      // Compress, but don't print warnings to console
      new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}})
    ],
    resolve: {
      extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
    }
};
