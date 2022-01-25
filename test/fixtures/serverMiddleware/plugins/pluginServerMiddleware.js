const { createPlugin } = require('shuvi');
module.exports = createPlugin({
  serverPlugin: () => require.resolve('./serverPlugin')
});
