// @flow
const webpack = require("webpack");

// Builds bundle usable <script>. Includes RGL and all deps, excluding React.
module.exports = {
  mode: "production",
  optimization: {
    minimize: true
  },
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
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "react",
      // React dep should be available as window.React, not window.react
      root: "React"
    },
    "react-dom": {
      commonjs: "react-dom",
      commonjs2: "react-dom",
      amd: "react-dom",
      root: "ReactDOM"
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          cacheDirectory: true
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ],
  resolve: {
    extensions: [".js", ".jsx"]
  }
};
