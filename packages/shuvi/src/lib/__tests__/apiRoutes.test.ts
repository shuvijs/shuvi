import { serializeApiRoutes, normalizeApiRoutes } from '../apiRoutes';

describe('serializeApiRoutes', () => {
  const routes = [
    {
      path: '/',
      apiRouteModule: 'Foo'
    },
    {
      path: '/nested',
      apiRouteModule: 'Foo',
      children: [
        {
          path: '/a',
          apiRouteModule: 'Bar'
        }
      ]
    }
  ];
  test('should work', () => {
    expect(serializeApiRoutes(routes)).toMatchInlineSnapshot(`
      "[
      {
            path: \\"/nested/a\\",
            apiRouteModule: require(\\"Bar\\"),
          },
      {
            path: \\"/\\",
            apiRouteModule: require(\\"Foo\\"),
          },
      {
            path: \\"/nested\\",
            apiRouteModule: require(\\"Foo\\"),
          },]"
    `);
  });
});

describe('normalizeApiRoutes', () => {
  describe('handler', () => {
    test('should convert relative path to absolute path', () => {
      const routes = normalizeApiRoutes(
        [
          {
            path: '/a',
            apiRouteModule: 'a',
            children: [
              {
                path: '/aa',
                apiRouteModule: 'a/aa'
              }
            ]
          },
          {
            path: '/b',
            apiRouteModule: '/b'
          }
        ],
        { apisDir: '/test' }
      );

      expect(routes).toMatchObject([
        {
          path: '/a',
          apiRouteModule: '/test/a',
          children: [
            {
              path: '/aa',
              apiRouteModule: '/test/a/aa'
            }
          ]
        },
        {
          path: '/b',
          apiRouteModule: '/b'
        }
      ]);
    });
  });
});
