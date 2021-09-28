const path = require('path');

module.exports = {
  ssr: true,
  plugins: [['./plugins/pluginServerMiddleware.js']]
};
