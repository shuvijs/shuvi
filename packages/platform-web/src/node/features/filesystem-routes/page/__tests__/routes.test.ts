import { serializeRoutes, normalizeRoutes } from '../routes';

describe('serializeRoutes', () => {
  const routes = [
    {
      path: '/',
      component: 'Foo',
      id: '0042'
    },
    {
      path: '/nested',
      component: 'Foo',
      id: '0c46',
      children: [
        {
          path: '/a',
          component: 'Bar',
          id: 'f571'
        }
      ]
    }
  ];
  test('should work', () => {
    expect(serializeRoutes(routes)).toMatchInlineSnapshot(`
      "[{path: \\"/\\",
      __componentSourceWithAffix__: \\"Foo?shuvi-route&keep=default\\",
      __componentSource__: \\"Foo\\",
      __import__: () => import(
        /* webpackChunkName: \\"page-0042\\" */
        /* webpackExports: \\"default\\" */
        \\"Foo?shuvi-route&keep=default\\"),
      __resolveWeak__: () => [require.resolveWeak(\\"Foo?shuvi-route&keep=default\\")],
      id: \\"0042\\",
      },
      {path: \\"/nested\\",
      __componentSourceWithAffix__: \\"Foo?shuvi-route&keep=default\\",
      __componentSource__: \\"Foo\\",
      __import__: () => import(
        /* webpackChunkName: \\"page-0c46\\" */
        /* webpackExports: \\"default\\" */
        \\"Foo?shuvi-route&keep=default\\"),
      __resolveWeak__: () => [require.resolveWeak(\\"Foo?shuvi-route&keep=default\\")],
      id: \\"0c46\\",
      children: [{path: \\"/a\\",
      __componentSourceWithAffix__: \\"Bar?shuvi-route&keep=default\\",
      __componentSource__: \\"Bar\\",
      __import__: () => import(
        /* webpackChunkName: \\"page-f571\\" */
        /* webpackExports: \\"default\\" */
        \\"Bar?shuvi-route&keep=default\\"),
      __resolveWeak__: () => [require.resolveWeak(\\"Bar?shuvi-route&keep=default\\")],
      id: \\"f571\\",
      },
      ],
      },
      ]"
    `);
  });
});

describe('normalizeRoutes', () => {
  describe('component', () => {
    test('should convert relative path to absolute path', () => {
      const routes = normalizeRoutes(
        [
          {
            path: '/a',
            component: 'a',
            children: [
              {
                path: '/aa',
                component: 'aa'
              }
            ]
          },
          {
            path: '/b',
            component: '/b'
          }
        ],
        '/test'
      );

      expect(routes).toMatchObject([
        {
          path: '/a',
          component: '/test/a',
          children: [
            {
              path: '/aa',
              component: '/test/aa'
            }
          ]
        },
        {
          path: '/b',
          component: '/b'
        }
      ]);
    });
  });
});
