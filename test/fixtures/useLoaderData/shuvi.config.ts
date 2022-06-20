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
      path: '/parent',
      component: 'parent',
      children: [
        {
          path: '/:foo',
          component: 'parent/foo',
          children: [
            {
              path: '/a',
              component: 'parent/foo/a'
            }
          ]
        }
      ]
    }
  ]
});
