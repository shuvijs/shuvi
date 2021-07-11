module.exports = api => {
  api.addServerMiddleware({
    path: 'testorder',
    handler: (req, res, next) => {
      console.log(1);
      next();
    },
    order: 1
  });

  api.addServerMiddleware({
    path: 'testorder',
    handler: (req, res, next) => {
      console.log('plugin default order');
      next();
    }
  });

  api.addServerMiddleware({
    path: 'testorder',
    handler: async (req, res, next) => {
      console.log(-1);
      next();
    },
    order: -1
  });

  api.addServerMiddleware({
    path: 'testorder',
    handler: async (req, res, next) => {
      console.log(9);
      next();
    },
    order: 9
  });

  api.addServerMiddleware({
    path: 'pluginservermiddleware',
    handler: async (req, res, next) => {
      next();
      res.end('pluginServerMiddleware');
    }
  });
};
