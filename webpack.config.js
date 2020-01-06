const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: "development",

  entry: "./src/index.ts",

  output: {
    path: '/',
    filename: "bundle.js"
  },

  // devtool: 'inline-source-map',

  devServer: {
    contentBase: './dist',
  },

  resolve: {
    alias: {
      'sitna': path.resolve(__dirname, 'src/'),
    },
    extensions: [".tsx", ".ts", ".js", ".json"],
  },

  plugins: [new HtmlWebpackPlugin()],

  module: {
    rules: [
      // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
      { test: /\.tsx?$/, use: ["ts-loader"], exclude: /node_modules/ }
    ]
  }
}
