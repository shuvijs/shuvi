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

  test('should output full content when includeMeta is true', () => {
    const content = serializeRoutes(routes, { includeMeta: true });
    expect(content).toMatchInlineSnapshot(`
      "[{path: \\"/\\",
      __componentRawRequest__: \\"Foo?shuvi-route\\",
      __componentSource__: \\"Foo\\",
      __import__: () => import(
        /* webpackChunkName: \\"Foo-0042\\" */
        /* webpackExports: \\"default\\" */
        \\"Foo?shuvi-route\\"),
      __resolveWeak__: () => [require.resolveWeak(\\"Foo?shuvi-route\\")],
      id: \\"0042\\",
      },
      {path: \\"/nested\\",
      __componentRawRequest__: \\"Foo?shuvi-route\\",
      __componentSource__: \\"Foo\\",
      __import__: () => import(
        /* webpackChunkName: \\"Foo-0c46\\" */
        /* webpackExports: \\"default\\" */
        \\"Foo?shuvi-route\\"),
      __resolveWeak__: () => [require.resolveWeak(\\"Foo?shuvi-route\\")],
      id: \\"0c46\\",
      children: [{path: \\"/a\\",
      __componentRawRequest__: \\"Bar?shuvi-route\\",
      __componentSource__: \\"Bar\\",
      __import__: () => import(
        /* webpackChunkName: \\"Bar-f571\\" */
        /* webpackExports: \\"default\\" */
        \\"Bar?shuvi-route\\"),
      __resolveWeak__: () => [require.resolveWeak(\\"Bar?shuvi-route\\")],
      id: \\"f571\\",
      },
      ],
      },
      ]"
    `);
    expect(content).toMatch('__componentSource__');
    expect(content).toMatch('__componentRawRequest__');
  });

  test('should not output meta info when includeMeta is false', () => {
    const content = serializeRoutes(routes, { includeMeta: false });
    expect(content).toMatchInlineSnapshot(`
      "[{path: \\"/\\",
      __import__: () => import(
        /* webpackChunkName: \\"Foo-0042\\" */
        /* webpackExports: \\"default\\" */
        \\"Foo?shuvi-route\\"),
      __resolveWeak__: () => [require.resolveWeak(\\"Foo?shuvi-route\\")],
      id: \\"0042\\",
      },
      {path: \\"/nested\\",
      __import__: () => import(
        /* webpackChunkName: \\"Foo-0c46\\" */
        /* webpackExports: \\"default\\" */
        \\"Foo?shuvi-route\\"),
      __resolveWeak__: () => [require.resolveWeak(\\"Foo?shuvi-route\\")],
      id: \\"0c46\\",
      children: [{path: \\"/a\\",
      __import__: () => import(
        /* webpackChunkName: \\"Bar-f571\\" */
        /* webpackExports: \\"default\\" */
        \\"Bar?shuvi-route\\"),
      __resolveWeak__: () => [require.resolveWeak(\\"Bar?shuvi-route\\")],
      id: \\"f571\\",
      },
      ],
      },
      ]"
    `);
    expect(content).not.toMatch('__componentSource__');
    expect(content).not.toMatch('__componentRawRequest__');
  });

  test('should be replaced with EmptyPageComponent', () => {
    const content = serializeRoutes(routes, {
      includeMeta: false,
      useEmptyComponent: true
    });
    expect(content).not.toMatch('Foo?shuvi-route');
    expect(content).toMatch('page/EmptyPageComponent');
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
