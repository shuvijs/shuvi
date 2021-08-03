import { serializeApiRoutes, normalizeApiRoutes } from '../apiRoutes';

describe('serializeApiRoutes', () => {
  const routes = [
    {
      path: '/',
      handler: 'Foo'
    },
    {
      path: '/nested',
      handler: 'Foo',
      children: [
        {
          path: '/a',
          handler: 'Bar'
        }
      ]
    }
  ];
  test('should work', () => {
    expect(serializeApiRoutes(routes)).toMatchInlineSnapshot(`
      "[
      {
            path: \\"/api/\\",
            handler: require(\\"Foo\\").default,
          },
      {
            path: \\"/api/nested/a\\",
            handler: require(\\"Bar\\").default,
          },
      {
            path: \\"/api/nested\\",
            handler: require(\\"Foo\\").default,
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
            handler: 'a',
            children: [
              {
                path: '/aa',
                handler: 'a/aa'
              }
            ]
          },
          {
            path: '/b',
            handler: '/b'
          }
        ],
        { apisDir: '/test' }
      );

      expect(routes).toMatchObject([
        {
          path: '/a',
          handler: '/test/a',
          children: [
            {
              path: '/aa',
              handler: '/test/a/aa'
            }
          ]
        },
        {
          path: '/b',
          handler: '/b'
        }
      ]);
    });
  });
});
