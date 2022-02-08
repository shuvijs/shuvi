const { createPlugin } = require('shuvi');

module.exports = createPlugin({
  addServerPlugin: () => {
    return [
      {
        plugin: require.resolve('./serverPlugin'),
        options: 'world'
      }
    ];
  },
  addRuntimePlugin: () => {
    return {
      plugin: require.resolve('./runtimePlugin.jsx'),
      options: 'hello'
    };
  },
  afterInit: () => {
    console.warn('afterInit');
  },
  afterBuild: () => {
    console.warn('afterBuild');
  },
  afterBundlerDone: () => {
    console.warn('bundlerDone');
  },
  afterBundlerTargetDone: () => {
    console.warn('bundlerTargetDone');
  }
});
