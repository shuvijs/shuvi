import { serializePageRoutes, serializeApiRoutes } from '../serializeRoutes';
import { getPageRoutes, getApiRoutes } from '../serverRoutes';

describe('serializeApiRoutes', () => {
  const routes = [
    {
      path: '/',
      apiModule: 'Foo'
    },
    {
      path: '/nested',
      apiModule: 'Foo',
      children: [
        {
          path: '/a',
          apiModule: 'Bar'
        }
      ]
    }
  ];
  test('should work', () => {
    expect(serializeApiRoutes(routes)).toMatchInlineSnapshot(`
      "[
      {
            path: \\"/nested/a\\",
            apiModule: require(\\"Bar\\"),
          },
      {
            path: \\"/\\",
            apiModule: require(\\"Foo\\"),
          },
      {
            path: \\"/nested\\",
            apiModule: require(\\"Foo\\"),
          },]"
    `);
  });
});

describe('normalizeApiRoutes', () => {
  describe('handler', () => {
    test('should convert relative path to absolute path', () => {
      const routes = getApiRoutes(
        [
          {
            path: '/a',
            filepath: 'a'
          },
          {
            path: '/b',
            filepath: '/b'
          }
        ],
        { apisDir: '/test' }
      );

      expect(routes).toMatchObject([
        {
          path: '/a',
          apiModule: '/test/a',
          children: [
            {
              path: '/aa',
              apiModule: '/test/a/aa'
            }
          ]
        },
        {
          path: '/b',
          apiModule: '/b'
        }
      ]);
    });
  });
});

describe('serializePageRoutes', () => {
  const routes = [
    {
      path: '/',
      component: 'Foo'
    },
    {
      path: '/nested',
      component: 'Foo',
      children: [
        {
          path: '/a',
          component: 'Bar'
        }
      ]
    }
  ];
  test('should work', () => {
    expect(serializePageRoutes(routes)).toMatchInlineSnapshot(`
      "[{id: \\"0042\\",
      path: \\"/\\",
      __componentSourceWithAffix__: \\"Foo?shuvi-route\\",
      __componentSource__: \\"Foo\\",
      __import__: () => import(/* webpackChunkName: \\"page-0042\\" */\\"Foo?shuvi-route\\"),
      __resolveWeak__: () => [require.resolveWeak(\\"Foo?shuvi-route\\")],
      },
      {id: \\"0c46\\",
      path: \\"/nested\\",
      __componentSourceWithAffix__: \\"Foo?shuvi-route\\",
      __componentSource__: \\"Foo\\",
      __import__: () => import(/* webpackChunkName: \\"page-0c46\\" */\\"Foo?shuvi-route\\"),
      __resolveWeak__: () => [require.resolveWeak(\\"Foo?shuvi-route\\")],
      children: [{id: \\"f571\\",
      path: \\"/a\\",
      __componentSourceWithAffix__: \\"Bar?shuvi-route\\",
      __componentSource__: \\"Bar\\",
      __import__: () => import(/* webpackChunkName: \\"page-f571\\" */\\"Bar?shuvi-route\\"),
      __resolveWeak__: () => [require.resolveWeak(\\"Bar?shuvi-route\\")],
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
      const routes = getPageRoutes(
        [
          {
            path: '/a',
            filepath: 'a',
            children: [
              {
                path: '/aa',
                filepath: 'aa'
              }
            ]
          },
          {
            path: '/b',
            filepath: '/b'
          }
        ],
        { pagesDir: '/test' }
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
