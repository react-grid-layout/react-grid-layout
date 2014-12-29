var webpack = require("webpack");

module.exports = {
    context: __dirname,
    entry: {
      app: [
        "./test/test.js", 
      ],
      commons: ['react', 'react/addons', 'lodash']
    },
    output: {
        path: __dirname + "/dist",
        filename: "bundle.js",
        sourceMapFilename: "[file].map",
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin(
      "commons", "commons.js"),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin()
    ],
    module: {
      loaders: [
        {test: /\.jsx$/, loader: 'jsx-loader?harmony'}
      ]
    },
    resolve: {
      extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
    }
};
