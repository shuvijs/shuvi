const path = require('path');

function resolvePlugin(name) {
  return path.join(__dirname, '..', 'plugins', name);
}

function resolvePreset(name) {
  return path.join(__dirname, '..', 'presets', name);
}

module.exports = (api, options) => {
  return {
    presets: [resolvePreset('a-b-preset')],
    plugins: [resolvePlugin('plugin-c')]
  };
};
