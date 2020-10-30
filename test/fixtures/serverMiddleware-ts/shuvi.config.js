module.exports = {
  ssr: true,
  serverMiddleware: [
    'koa-lowercase',
    'api/set-header',
    { path: '/health-check', handler: 'api/health-check' },
  ]
};
