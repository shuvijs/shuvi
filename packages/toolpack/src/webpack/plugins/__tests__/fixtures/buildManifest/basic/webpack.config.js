const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    'page-1234': path.resolve(__dirname, 'page-1234.js'),
    index: path.resolve(__dirname, 'index.js'),
    another: path.resolve(__dirname, 'entry2.js'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};
