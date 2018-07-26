const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: './src/index.ts',
  externals: [ nodeExternals() ],
  mode: process.env.WEBPACK_MODE || 'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          { loader: 'ts-loader' }
        ],
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.WatchIgnorePlugin([ /\.js$/, /\.d\.ts$/ ])
  ],
  resolve: {
    extensions: [ '.js', '.ts' ]
  },
  output: {
    filename: 'index.js',
    sourceMapFilename: 'index.map.js',
    library: 'gitbookPluginVariables',
    libraryTarget: 'umd',
    path: __dirname,
  },
  target: 'node'
};
