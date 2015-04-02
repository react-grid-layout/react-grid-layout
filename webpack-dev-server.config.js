var webpack = require("webpack");

module.exports = {
    context: __dirname,
    entry: [
      "webpack-dev-server/client?http://localhost:4002",
      "webpack/hot/dev-server",
      "./test/dev-hook.jsx",
    ],
    output: {
        path: __dirname + "/dist",
        filename: "bundle.js",
        sourceMapFilename: "[file].map",
    },
    module: {
      loaders: [
        {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader?experimental'},
        {test: /\.jsx$/, exclude: /node_modules/, loader: 'react-hot-loader'}
      ]
    },
    plugins: [
      new webpack.optimize.DedupePlugin(),
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify('development')
        }
      }),
    ],
    debug: true,
    devtool: 'eval',
    publicPath: '/examples/',
    resolve: {
      extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"],
      alias: {
        'react-grid-layout': __dirname + '/index-dev.js'
      }
    }
};
