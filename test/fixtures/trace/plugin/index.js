const { createPlugin } = require('shuvi');
const path = require('path');
const { setReporter } = require('@shuvi/service/lib/trace');

const resolveMiddleware = (...paths) =>
  path.join(__dirname, 'middlewares', ...paths);

module.exports = createPlugin({
  configWebpack: (config, { name }) => {
    if (name === 'shuvi/client') {
      config
        .entry('static/main')
        .prepend(path.resolve(__dirname, './setReporter.js'));
    }
    return config;
  },
  afterInit: () => {
    global._reporterData = [];
    global._clearReporterData = () => {
      global._reporterData = [];
    };
    setReporter(data => {
      global._reporterData.push(data);
    });
  },
  addMiddlewareRoutes: () => [
    {
      path: '/middleware-success',
      middleware: resolveMiddleware('middleware-success.js')
    },
    {
      path: '/middleware-error',
      middleware: resolveMiddleware('middleware-error.js')
    },
    {
      path: '/*',
      middleware: resolveMiddleware('noop.js')
    }
  ]
});
