const path = require('path');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = {
  entry: './bin/www',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  target: 'node',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.html$/,
        use: ['html-loader'],
      },
    ],
  },
  plugins: [
    new ZipPlugin({
      path: '../dist',
      filename: 'dist.zip',
    }),
  ],
};
