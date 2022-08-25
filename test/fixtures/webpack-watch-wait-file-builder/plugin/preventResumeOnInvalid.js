const { createPlugin } = require('shuvi');

module.exports = createPlugin({
  configWebpack: (config, _, context) => {
    if (context.mode === 'development') {
      const plugin = config.plugin(
        'webpack-watch-wait-for-file-builder-plugin'
      );
      plugin.tap(([arg]) => {
        arg.preventResumeOnInvalid = true;
        return [arg];
      });
      return config;
    }
  }
});
