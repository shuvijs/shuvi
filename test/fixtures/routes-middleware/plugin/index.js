const { createPlugin } = require('shuvi');
const path = require('path');

const resolveMiddleware = (...paths) =>
  path.join(__dirname, 'middlewares', ...paths);

const resolveMiddlewareConfig = (...paths) =>
  path.join(__dirname, 'middlewares-config', ...paths);

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
    },
    {
      path: '/*',
      middleware: resolveMiddlewareConfig('set-header/index.js')
    },
    {
      path: '/health-check:other(.*)',
      middleware: resolveMiddlewareConfig('set-cookie/index.js')
    },
    {
      path: '/health-check',
      middleware: resolveMiddlewareConfig('health-check/index.js')
    },
    {
      path: '/health-check2',
      middleware: resolveMiddlewareConfig('health-check/index.js')
    },
    {
      path: '/health-check3',
      middleware: resolveMiddlewareConfig('health-check/index.js')
    },
    {
      path: '/users/:id+',
      middleware: resolveMiddlewareConfig('user/index.js')
    },
    {
      path: '/profile/:id/setting:other(.*)',
      middleware: resolveMiddlewareConfig('setting/index.js')
    },
    {
      path: '/home',
      middleware: resolveMiddlewareConfig('modify-html/index.js')
    },
    {
      path: '/testorder',
      middleware: resolveMiddlewareConfig('testorder1.js')
    },
    {
      path: '/testorder',
      middleware: resolveMiddlewareConfig('testorder2.js')
    }
  ]
});
