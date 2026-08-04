"use strict";
const path = require("path");
const webpack = require("webpack");

/**
 * Builds the e2e harness into a single self-contained HTML file.
 *
 * Unlike the webpack-dev-server (which races the first compile and serves
 * via eval-devserver), this produces a static, deterministic artifact in
 * test/e2e/harness-dist/ that a plain static server can serve. Rebuild
 * after changing src/ with: make e2e-build
 */
module.exports = {
  mode: "production",
  context: __dirname,
  entry: "./harness-app.jsx",
  output: {
    path: __dirname + "/harness-dist",
    filename: "harness.js"
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: [
            "@babel/preset-env",
            "@babel/preset-react",
            "@babel/preset-typescript"
          ]
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    // Map the library to the source entry so the harness tests real code,
    // the same alias the examples build uses.
    alias: { "react-grid-layout": path.resolve(__dirname, "../../index-dev.js") },
    extensionAlias: {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"]
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production")
    })
  ],
  devtool: false
};
