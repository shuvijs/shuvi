const path = require('path');

function resolvePlugin(name) {
  return path.join(__dirname, '..', 'plugins', name);
}

function resolvePreset(name) {
  return path.join(__dirname, name);
}

module.exports = (_, options) => {
  return {
    plugins: [
      resolvePlugin('only-server-and-runtime'),
      [resolvePlugin('only-server-and-runtime-with-options'), options]
    ],
    presets: [
      resolvePreset('simple'),
      resolvePreset('multiple-plugins'),
      [resolvePreset('multiple-plugins-with-options'), options]
    ]
  };
};
