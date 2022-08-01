const { createPlugin } = require('shuvi');

module.exports = createPlugin({
  configWebpack: chain => {
    chain.plugins.delete('webpack-watch-wait-for-file-builder-plugin');
    return chain;
  }
});
