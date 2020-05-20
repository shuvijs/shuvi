module.exports = {
  ssr: true,
  routes: [
    {
      path: '/',
      exact: true,
      component: 'index'
    },
    {
      path: '/:foo',
      exact: true,
      component: 'getInitialProps'
    }
  ]
};
