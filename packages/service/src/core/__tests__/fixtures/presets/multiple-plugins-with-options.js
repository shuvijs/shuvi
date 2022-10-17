const path = require('path');

function resolvePlugin(name) {
  return path.join(__dirname, '..', 'plugins', name);
}

module.exports = (_, options) => {
  return {
    plugins: [
      [resolvePlugin('single-core-under-directory-with-options'), options.name],
      [resolvePlugin('all-three-plugins-with-options'), options]
    ]
  };
};
