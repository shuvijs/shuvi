module.exports = api => {
  api.addServerMiddleware({
    path: 'pluginservermiddleware',
    handler: async (ctx, next) => {
      await next();
      ctx.body = 'pluginServerMiddleware';
    }
  });
};
