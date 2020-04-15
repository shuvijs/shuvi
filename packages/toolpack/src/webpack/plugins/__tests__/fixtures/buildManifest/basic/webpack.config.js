const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    main: path.resolve(__dirname, 'main.js'),
  },
  output: {
    filename: '[name].js',
    chunkFilename: 'static/chunks/[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        commons: {
          chunks: 'all',
          minChunks: 2,
          minSize: 0, // This is example is too small to create commons chunks
        },
      },
    },
    runtimeChunk: true,
  },
};
