import { serializeRoutes, normalizeRoutes } from '../pageRoutes';

describe('serializeRoutes', () => {
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
    expect(serializeRoutes(routes)).toMatchInlineSnapshot(`
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
        { componentDir: '/test' }
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
