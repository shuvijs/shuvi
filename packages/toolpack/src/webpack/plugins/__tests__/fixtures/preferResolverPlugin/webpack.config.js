const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    main: path.resolve(__dirname, 'main'),
  },
  output: {
    filename: '[name].js',
    chunkFilename: 'static/chunks/[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};
