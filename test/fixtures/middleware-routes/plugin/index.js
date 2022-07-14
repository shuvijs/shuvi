const { createPlugin } = require('shuvi');
const path = require('path');

const resolveMiddleware = (...paths) =>
  path.join(__dirname, 'middlewares', ...paths);

module.exports = createPlugin({
  addMiddlewareRoutes: () => [
    {
      path: '/testorder',
      middleware: resolveMiddleware('testorder1')
    },
    {
      path: '/testorder',
      middleware: resolveMiddleware('testorder2')
    },
    {
      path: '/pluginservermiddleware',
      middleware: resolveMiddleware('pluginservermiddleware')
    },
    {
      path: '/errorHandler',
      middleware: resolveMiddleware('errorHandler')
    }
  ]
});
