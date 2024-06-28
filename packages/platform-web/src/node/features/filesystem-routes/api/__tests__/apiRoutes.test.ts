import { serializeApiRoutes, normalizeApiRoutes } from '../apiRoutes';

describe('serializeApiRoutes', () => {
  const routes = [
    {
      path: '/',
      api: 'Foo'
    },
    {
      path: '/nested',
      api: 'Foo'
    },
    {
      path: '/nested/a',
      api: 'Bar'
    }
  ];
  test('should work', () => {
    expect(serializeApiRoutes(routes)).toMatchInlineSnapshot(`
      "[
      {
            path: "/",
            api: require("Foo"),
          },
      {
            path: "/nested",
            api: require("Foo"),
          },
      {
            path: "/nested/a",
            api: require("Bar"),
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
            api: 'a'
          },
          {
            path: '/a/aa',
            api: 'a/aa'
          },
          {
            path: '/b',
            api: '/b'
          }
        ],
        { apisDir: '/test' }
      );

      expect(routes).toMatchObject([
        {
          path: '/a',
          api: '/test/a'
        },
        {
          path: '/a/aa',
          api: '/test/a/aa'
        },
        {
          path: '/b',
          api: '/b'
        }
      ]);
    });
  });
});
