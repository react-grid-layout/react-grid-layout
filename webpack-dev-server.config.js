var webpack = require("webpack");

module.exports = {
    context: __dirname,
    entry: [
      "webpack-dev-server/client?http://localhost:4002",
      "webpack/hot/dev-server", 
      "./test/test.js",
    ],
    output: {
        path: __dirname + "/dist",
        filename: "bundle.js",
        sourceMapFilename: "[file].map",
    },
    module: {
      loaders: [
        {test: /\.jsx$/, loader: 'jsx-loader?harmony'},
        {test: /\.jsx$/, loader: 'react-hot-loader'}
      ]
    },
    plugins: [
      new webpack.optimize.DedupePlugin(),
    ],
    debug: true,
    devtool: "#inline-source-map",
    publicPath: '/examples/',
    resolve: {
      extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
    }
};
