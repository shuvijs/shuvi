module.exports = {
  ssr: false,
  platform: {
    name: 'mp',
    target: 'weapp'
  },
  router: {
    history: 'memory'
  },
  routes: [
    {
      path: '/',
      component: 'pages/index/index'
    },
    {
      path: '/pages/sub/:title',
      component: 'pages/sub/index'
    },
    {
      path: '/pages/detail/:id',
      component: 'pages/detail/index'
    },
    {
      path: '/:first/:detail/:id',
      component: 'pages/detail/index'
    },
    {
      path: '/:other(.*)',
      component: 'pages/my/index'
    }
  ]
};
