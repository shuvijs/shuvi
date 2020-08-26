module.exports = {
  ssr: false,
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
