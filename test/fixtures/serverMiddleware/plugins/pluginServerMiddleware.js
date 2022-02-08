const { createPlugin } = require('shuvi');
module.exports = createPlugin({
  addServerPlugin: () => require.resolve('./serverPlugin')
});
