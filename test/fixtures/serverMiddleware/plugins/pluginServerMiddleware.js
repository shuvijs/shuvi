module.exports = api => {
  api.addServerMiddleware({
    path: 'pluginServerMiddleware',
    handler: async (ctx, next) => {
      await next();
      ctx.body = 'pluginServerMiddleware';
    }
  });
};
