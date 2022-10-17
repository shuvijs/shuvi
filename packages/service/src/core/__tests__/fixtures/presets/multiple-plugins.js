const path = require('path');

function resolvePlugin(name) {
  return path.join(__dirname, '..', 'plugins', name);
}

module.exports = () => {
  return {
    plugins: [resolvePlugin('single-core'), resolvePlugin('all-three-plugins')]
  };
};
