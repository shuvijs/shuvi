const { createPlugin } = require('shuvi');

module.exports = createPlugin({
  serverPlugin: () => {
    return [
      {
        plugin: require.resolve('./serverPlugin'),
        options: 'world'
      }
    ];
  },
  runtimePlugin: () => {
    return {
      plugin: require.resolve('./runtimePlugin.jsx'),
      options: 'hello'
    };
  },
  appReady: () => {
    console.warn('appReady');
  },
  afterBuild: () => {
    console.warn('afterBuild');
  },
  bundlerDone: () => {
    console.warn('bundlerDone');
  },
  bundlerTargetDone: () => {
    console.warn('bundlerTargetDone');
  }
});
