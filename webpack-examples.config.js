"use strict";
const webpack = require("webpack");
const fs = require("fs");

// Builds example bundles
module.exports = {
  mode: "development",
  context: __dirname,
  entry: {},
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: "commons",
          chunks: "all",
          minChunks: 1
        }
      }
    }
  },
  output: {
    path: __dirname + "/examples",
    filename: "[name].js",
    sourceMapFilename: "[file].map",
    publicPath: "auto"
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          cacheDirectory: true
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.STATIC_EXAMPLES": JSON.stringify(true)
    })
  ],
  devServer: {
    compress: true,
    port: 4002,
    open: "examples/0-showcase.html",
    client: {
      overlay: true
    },
    static: {
      directory: "."
    }
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: { "react-grid-layout": __dirname + "/index-dev.js" }
  }
};

// Load all entry points
const files = fs
  .readdirSync(__dirname + "/test/examples")
  .filter(element => element.match(/^.+\.jsx$/));

for (const file of files) {
  const module_name = file.replace(/\.jsx$/, "");
  module.exports.entry[module_name] = "./test/examples/" + file;
}
