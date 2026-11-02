"use strict";
const path = require("path");
const fs = require("fs");
const webpack = require("webpack");

// Emits index.html referencing the built harness.js, so the harness-dist
// directory is self-contained for the static e2e server (and CI).
class HtmlPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap("HtmlPlugin", () => {
      const html =
        '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n' +
        "    <title>RGL E2E Harness</title>\n  </head>\n  <body>\n" +
        '    <div id="grid"></div>\n    <script src="harness.js"></script>\n' +
        "  </body>\n</html>\n";
      fs.writeFileSync(
        path.join(compiler.options.output.path, "index.html"),
        html
      );
    });
  }
}

/**
 * Builds the e2e harness into a single self-contained HTML file.
 *
 * Unlike the webpack-dev-server (which races the first compile and serves
 * via eval-devserver), this produces a static, deterministic artifact in
 * test/e2e/harness-dist/ that a plain static server can serve. Rebuild
 * after changing src/ with: make e2e-build
 */
const sourceConfig = {
  name: "source",
  mode: "development",
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
    alias: {
      "react-grid-layout$": path.resolve(__dirname, "../../src/index.ts"),
      "react-grid-layout/core$": path.resolve(
        __dirname,
        "../../src/core/index.ts"
      ),
      "react-grid-layout/legacy$": path.resolve(
        __dirname,
        "../../src/legacy/index.ts"
      ),
      "react-grid-layout/extras$": path.resolve(
        __dirname,
        "../../src/extras/index.ts"
      )
    },
    extensionAlias: {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"]
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development")
    }),
    new HtmlPlugin()
  ],
  devtool: false
};

module.exports = [
  sourceConfig,
  ...["import", "require"].map(condition => ({
    ...sourceConfig,
    name: condition,
    output: {
      ...sourceConfig.output,
      path: path.join(__dirname, "harness-dist", condition)
    },
    resolve: {
      ...sourceConfig.resolve,
      alias: {},
      conditionNames: [condition, "default"]
    }
  }))
];
