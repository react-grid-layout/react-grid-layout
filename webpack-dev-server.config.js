"use strict";
const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  context: __dirname,
  entry: "./test/dev-hook.jsx",
  output: {
    path: "/",
    filename: "bundle.js",
    sourceMapFilename: "[file].map",
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          cacheDirectory: true,
          presets: ["@babel/preset-typescript"],
          plugins: [["react-hot-loader/babel"]]
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("development")
      }
    })
  ],
  devtool: "eval",
  devServer: {
    compress: true,
    port: 4002,
    host: "localhost",
    open: "index-dev.html",
    client: {
      overlay: true
    },
    static: {
      directory: "."
    }
  },
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".jsx"],
    extensionAlias: {
      ".js": [".ts", ".tsx", ".js", ".jsx"]
    },
    alias: {
      "react-grid-layout": path.join(__dirname, "/index-dev.js")
    }
  }
};
