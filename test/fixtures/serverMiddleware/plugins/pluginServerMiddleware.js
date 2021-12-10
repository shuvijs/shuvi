const { createCliPlugin } = require('shuvi');
module.exports = createCliPlugin({
  serverPlugin: () => require.resolve('./serverPlugin')
});
