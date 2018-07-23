const path = require('path');
const nodeExternals = require('webpack-node-externals');

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
  resolve: {
    extensions: [ '.js', '.ts' ]
  },
  target: 'node',
  output: {
    filename: path.join('lib', 'index.js'),
    sourceMapFilename: path.join('lib', 'index.map.js'),
    libraryTarget: 'commonjs2',
    path: __dirname,
  }
};
