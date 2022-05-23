import { defineConfig } from 'shuvi';
export default defineConfig({
  ssr: true,
  routes: [
    {
      path: '/',
      component: 'index'
    },
    {
      path: '/one',
      component: 'one'
    },
    {
      path: '/two',
      component: 'two'
    },
    {
      path: '/server-fail',
      component: 'server-fail'
    },
    {
      path: '/:foo',
      component: 'foo'
    },
    {
      path: '/loader',
      component: 'loader',
      children: [
        {
          path: '/child',
          component: 'loader/child'
        }
      ]
    }
  ]
});
