export default {
  ssr: true,
  middlewareRoutes: [
    {
      path: '/a/:rest*',
      middlewares: ['a/m.js']
    },
    {
      path: '/a/a1',
      middlewares: ['a/a1/m.js']
    },
    {
      path: '/',
      middlewares: ['m.js']
    }
  ]
};
