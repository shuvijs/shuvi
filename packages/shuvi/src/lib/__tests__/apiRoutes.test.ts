import { serializeApiRoutes, normalizeApiRoutes } from '../apiRoutes';

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
      const routes = normalizeApiRoutes(
        [
          {
            path: '/a',
            apiModule: 'a',
            children: [
              {
                path: '/aa',
                apiModule: 'a/aa'
              }
            ]
          },
          {
            path: '/b',
            apiModule: '/b'
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
