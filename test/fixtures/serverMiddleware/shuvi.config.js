const path = require('path');

module.exports = {
  ssr: true,
  serverMiddleware: [
    'koa-lowercase',
    './api/set-header.js', // Note: will be resolved from `src` directory and extension is optional.
    { path: '/health-check*', handler: 'api/set-cookie' },
    { path: '/health-check', handler: 'api/health-check' },
    { path: '/health-check', handler: 'api/health-check' }, // Note: duplicated middleware will be omitted
    { path: '/health-check2', handler: 'api/health-check' }, // Note: share handler with other path
    {
      path: '/health-check3',
      handler: path.resolve(__dirname, './src/api/health-check') // Note: absolute path
    },

    { path: '/users/:id', handler: 'api/user' },
    { path: '/profile/:id/setting*', handler: 'api/setting' }
  ]
};
