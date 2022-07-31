const path = require('path');
const { createPlugin } = require('shuvi');
const resolveLocal = m => {
  return path.dirname(require.resolve(`${m}/package.json`));
};
module.exports = createPlugin({
  configWebpack: (config, { name, webpack }, context) => {
    config.resolve.alias.set('@emotion/react', [
      resolveLocal('@emotion/react')
    ]);
    return config;
  }
});
