module.exports = {
    context: __dirname,
    entry: [
      "./index", 
    ],
    output: {
        path: __dirname + "/dist",
        filename: "bundle.js",
        sourceMapFilename: "debugging/[file].map",
    },
    module: {
      loaders: [
        {test: /\.jsx$/, loader: 'jsx-loader?harmony'}
      ]
    },
    debug: true,
    resolve: {
      extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
    }
};
