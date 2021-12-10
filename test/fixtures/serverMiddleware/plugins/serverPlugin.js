const { createServerPlugin } = require('shuvi');
module.exports = createServerPlugin({
  serverMiddleware: () => [
    {
      path: 'testorder',
      handler: (req, res, next) => {
        console.log(1);
        next();
      },
      order: 1
    },
    {
      path: 'testorder',
      handler: (req, res, next) => {
        console.log('plugin default order');
        next();
      }
    },
    {
      path: 'testorder',
      handler: async (req, res, next) => {
        console.log(-1);
        next();
      },
      order: -1
    },
    {
      path: 'testorder',
      handler: async (req, res, next) => {
        console.log(9);
        next();
      },
      order: 9
    },
    {
      path: 'pluginservermiddleware',
      handler: async (req, res, next) => {
        next();
        res.end('pluginServerMiddleware');
      }
    },
    {
      path: '/errorHandler',
      handler: async (req, res, next) => {
        next('errorHandler');
      }
    },
    {
      handler: async (error, req, res, next) => {
        const errorMessage = `catch => ${error}`;
        console.log(errorMessage);
        res.end(errorMessage);
      },
      order: 1
    }
  ]
});
