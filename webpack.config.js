var webpack = require("webpack");

// Builds bundle usable <script>. Includes RGL and all deps, excluding React.
module.exports = {
  context: __dirname,
  entry: {
    "react-grid-layout": "./index-dev.js"
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name].min.js",
    libraryTarget: "umd",
    library: "ReactGridLayout"
  },
  devtool: "source-map",
  externals: {
    "react": {
      "commonjs": "react",
      "commonjs2": "react",
      "amd": "react",
      // React dep should be available as window.React, not window.react
      "root": "React"
    },
    "react-dom": {
      "commonjs": "react-dom",
      "commonjs2": "react-dom",
      "amd": "react-dom",
      // React dep should be available as window.React, not window.react
      "root": "ReactDOM"
    }
  },
  module: {
    loaders: [
      {test: /\.jsx?$/, exclude: /node_modules/, loader: "babel-loader"}
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    // Compress, but don't print warnings to console
    new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}})
  ],
  resolve: {
    extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
  }
};
