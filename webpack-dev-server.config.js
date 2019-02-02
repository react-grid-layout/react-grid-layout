const path = require('path');
var webpack = require("webpack");

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: "./test/dev-hook.jsx",
  output: {
    path: '/',
    filename: "bundle.js",
    sourceMapFilename: "[file].map",
  },
  module: {
    rules: [
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          plugins: [
            ['react-transform',
              {
                transforms: [
                  {
                    transform: 'react-transform-hmr',
                    imports: ['react'],
                    locals: ['module']
                  }
                ]
              }
            ]
          ]
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify('development')
      }
    }),
  ],
  devtool: "eval",
  devServer: {
    publicPath: '/',
    compress: true,
    port: 4002
  },
  resolve: {
    extensions: [".webpack.js", ".web.js", ".js", ".jsx"],
    alias: {
      'react-grid-layout': path.join(__dirname, '/index-dev.js')
    }
  }
};
