module.exports = {
  ssr: true,
  routes: [
    {
      path: '/',
      exact: true,
      component: 'index'
    },
    {
      path: '/one',
      exact: true,
      component: 'one'
    },
    {
      path: '/two',
      exact: true,
      component: 'two'
    },
    {
      path: '/:foo',
      exact: true,
      component: 'getInitialProps'
    }
  ]
};
