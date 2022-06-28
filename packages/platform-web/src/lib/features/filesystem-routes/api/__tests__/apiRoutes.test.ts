import { serializeApiRoutes, normalizeApiRoutes } from '../apiRoutes';

describe('serializeApiRoutes', () => {
  const routes = [
    {
      path: '/',
      handler: 'Foo'
    },
    {
      path: '/nested',
      handler: 'Foo'
    },
    {
      path: '/nested/a',
      handler: 'Bar'
    }
  ];
  test('should work', () => {
    expect(serializeApiRoutes(routes)).toMatchInlineSnapshot(`
      "[
      {
            path: \\"/nested/a\\",
            handler: require(\\"Bar\\"),
          },
      {
            path: \\"/\\",
            handler: require(\\"Foo\\"),
          },
      {
            path: \\"/nested\\",
            handler: require(\\"Foo\\"),
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
            handler: 'a'
          },
          {
            path: '/a/aa',
            handler: 'a/aa'
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
          handler: '/test/a'
        },
        {
          path: '/a/aa',
          handler: '/test/a/aa'
        },
        {
          path: '/b',
          handler: '/b'
        }
      ]);
    });
  });
});
