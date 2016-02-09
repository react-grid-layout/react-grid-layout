var webpack = require("webpack");

// Builds bundle usable <script>. Includes RGL and all deps, excluding React.
module.exports = {
  context: __dirname,
  entry: {
    "react-grid-layout": "./index-meteor.js"
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name].meteor.js",
    libraryTarget: "umd",
    library: "ReactGridLayout"
  },
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
  plugins: [],
  resolve: {
    extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
  }
};
