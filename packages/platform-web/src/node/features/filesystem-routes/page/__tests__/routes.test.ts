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

  test('should output full content when is server', () => {
    const content = serializeRoutes(routes, true);
    expect(content).toMatchInlineSnapshot(`
      "[{path: \\"/\\",
      __componentRawRequest__: \\"Foo?shuvi-route&keep=default\\",
      __componentSource__: \\"Foo\\",
      __import__: () => import(
        /* webpackChunkName: \\"page-0042\\" */
        /* webpackExports: \\"default\\" */
        \\"Foo?shuvi-route&keep=default\\"),
      __resolveWeak__: () => [require.resolveWeak(\\"Foo?shuvi-route&keep=default\\")],
      id: \\"0042\\",
      },
      {path: \\"/nested\\",
      __componentRawRequest__: \\"Foo?shuvi-route&keep=default\\",
      __componentSource__: \\"Foo\\",
      __import__: () => import(
        /* webpackChunkName: \\"page-0c46\\" */
        /* webpackExports: \\"default\\" */
        \\"Foo?shuvi-route&keep=default\\"),
      __resolveWeak__: () => [require.resolveWeak(\\"Foo?shuvi-route&keep=default\\")],
      id: \\"0c46\\",
      children: [{path: \\"/a\\",
      __componentRawRequest__: \\"Bar?shuvi-route&keep=default\\",
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
    expect(content).toMatch('__componentSource__');
    expect(content).toMatch('__componentRawRequest__');
  });

  test('should output full content when is client', () => {
    const content = serializeRoutes(routes, false);
    expect(content).toMatchInlineSnapshot(`
      "[{path: \\"/\\",
      __import__: () => import(
        /* webpackChunkName: \\"page-0042\\" */
        /* webpackExports: \\"default\\" */
        \\"Foo?shuvi-route&keep=default\\"),
      __resolveWeak__: () => [require.resolveWeak(\\"Foo?shuvi-route&keep=default\\")],
      id: \\"0042\\",
      },
      {path: \\"/nested\\",
      __import__: () => import(
        /* webpackChunkName: \\"page-0c46\\" */
        /* webpackExports: \\"default\\" */
        \\"Foo?shuvi-route&keep=default\\"),
      __resolveWeak__: () => [require.resolveWeak(\\"Foo?shuvi-route&keep=default\\")],
      id: \\"0c46\\",
      children: [{path: \\"/a\\",
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
    expect(content).not.toMatch('__componentSource__');
    expect(content).not.toMatch('__componentRawRequest__');
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
