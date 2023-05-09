export default {
  ssr: true,
  routes: [
    {
      path: '/',
      component: 'layout',
      children: [
        { path: '/redirect0', redirect: '/' },
        { path: '', component: 'page' },
        { path: '/redirect1', redirect: '/redirect2' },
        { path: '/redirect2', redirect: '/about' },
        { path: '/about', component: 'about/page' }
      ]
    }
  ]
};
