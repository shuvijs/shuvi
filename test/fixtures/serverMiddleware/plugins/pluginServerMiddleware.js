module.exports = api => {
  api.addServerMiddleware({
    path: 'testorder',
    handler: async (ctx, next) => {
      console.log(1);
      await next();
    },
    order: 1
  });

  api.addServerMiddleware({
    path: 'testorder',
    handler: async (ctx, next) => {
      console.log('plugin default order');
      await next();
    }
  });

  api.addServerMiddleware({
    path: 'testorder',
    handler: async (ctx, next) => {
      console.log(-1);
      await next();
    },
    order: -1
  });

  api.addServerMiddleware({
    path: 'testorder',
    handler: async (ctx, next) => {
      console.log(9);
      await next();
    },
    order: 9
  });

  api.addServerMiddleware({
    path: 'pluginservermiddleware',
    handler: async (ctx, next) => {
      await next();
      ctx.body = 'pluginServerMiddleware';
    }
  });
};
