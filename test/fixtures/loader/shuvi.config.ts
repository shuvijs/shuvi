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
      path: '/no-loader',
      component: 'no-loader'
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
    },
    {
      path: '/loader-run',
      component: 'loader-run',
      children: [
        {
          path: '/:foo',
          component: 'loader-run/foo',
          children: [
            {
              path: '/a',
              component: 'loader-run/foo/a'
            }
          ]
        }
      ]
    },
    {
      path: '/context',
      children: [
        {
          path: 'error',
          component: 'context/error'
        },
        {
          path: 'redirect',
          component: 'context/redirect'
        },
        {
          path: 'static',
          component: 'context/static'
        }
      ]
    }
  ]
});
