const { createPlugin } = require('shuvi');
const path = require('path');

const resolveApi = (...paths) => path.join(__dirname, 'apis', ...paths);

module.exports = createPlugin({
  addApiRoutes: () => [
    {
      path: '/api/hello-from-plugin',
      api: resolveApi('hello')
    }
  ]
});
