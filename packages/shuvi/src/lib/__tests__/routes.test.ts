import { serializeRoutes, normalizeRoutes } from '../routes';

describe('serializeRoutes', () => {
  const routes = [
    {
      path: '/',
      exact: true,
      component: 'Foo',
    },
    {
      path: '/nested',
      exact: false,
      routes: [
        {
          path: '/a',
          component: 'Bar',
          exact: true,
        },
      ],
    },
  ];
  test('should work', () => {
    expect(serializeRoutes(routes)).toMatchInlineSnapshot(`
      "[{id: \\"0042\\",
      path: \\"/\\",
      exact: true,
      component: \\"Foo\\",
      },
      {id: \\"0c46\\",
      path: \\"/nested\\",
      exact: false,
      routes: [{id: \\"f571\\",
      path: \\"/a\\",
      component: \\"Bar\\",
      exact: true,
      },
      ],
      },
      ]"
    `);
  });

  test('should work with custom serialize fns', () => {
    expect(
      serializeRoutes(routes, {
        component(comp) {
          return `() => import("${comp}")`;
        },
      })
    ).toMatchInlineSnapshot(`
      "[{id: \\"0042\\",
      path: \\"/\\",
      exact: true,
      component: () => import(\\"Foo\\"),
      },
      {id: \\"0c46\\",
      path: \\"/nested\\",
      exact: false,
      routes: [{id: \\"f571\\",
      path: \\"/a\\",
      component: () => import(\\"Bar\\"),
      exact: true,
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
            component: 'a',
            routes: [
              {
                component: 'aa',
              },
            ],
          },
          {
            component: '/b',
          },
        ],
        { componentDir: '/test' }
      );

      expect(routes).toMatchObject([
        {
          component: '/test/a',
          routes: [
            {
              component: '/test/aa',
            },
          ],
        },
        {
          component: '/b',
        },
      ]);
    });
  });
});
