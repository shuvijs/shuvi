const path = require('path');

function resolvePlugin(name) {
  return path.join(__dirname, '..', 'plugins', name);
}

module.exports = (api, options) => {
  return {
    presets: [],
    plugins: [resolvePlugin('plugin-a'), resolvePlugin('plugin-b')]
  };
};
