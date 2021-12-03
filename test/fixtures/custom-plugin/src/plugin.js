const { createCliPlugin } = require('shuvi');

module.exports = createCliPlugin({
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
  }
});
