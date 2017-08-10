'use strict'
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    context: __dirname,
    entry: ['./examples/app.jsx'],
    output: {
        path: __dirname + "/dist/",
        publicPath:  "/examples/",
        filename: "example.js"
    },
    devtool: "source-map",
    module: {
        loaders: [
            {
                enforce: 'pre',
                test: /.jsx?$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
                options: {fix: true}
            },
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: ['es2015', 'stage-0', 'react'],
                    plugins: [
                        'transform-react-inline-elements',
                        'transform-react-constant-elements'
                    ]
                }
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new CopyWebpackPlugin([{
            from: './examples/index.html',
            to: 'dist/index.html'
        }])
    ],
    resolve: {
        extensions: [".webpack.js", ".web.js", ".js", ".jsx"],
        alias: {'react-grid-layout': __dirname + '/index-dev.js'}
    }
}
