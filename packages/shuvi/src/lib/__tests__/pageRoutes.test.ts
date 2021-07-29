import { serializePageRoutes, normalizePageRoutes } from '../pageRoutes';

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
      component: \\"Foo\\",
      },
      {id: \\"0c46\\",
      path: \\"/nested\\",
      component: \\"Foo\\",
      children: [{id: \\"f571\\",
      path: \\"/a\\",
      component: \\"Bar\\",
      },
      ],
      },
      ]"
    `);
  });

  test('should work with custom serialize fns', () => {
    expect(
      serializePageRoutes(routes, {
        component(comp) {
          return `() => import("${comp}")`;
        }
      })
    ).toMatchInlineSnapshot(`
      "[{id: \\"0042\\",
      path: \\"/\\",
      component: () => import(\\"Foo\\"),
      },
      {id: \\"0c46\\",
      path: \\"/nested\\",
      component: () => import(\\"Foo\\"),
      children: [{id: \\"f571\\",
      path: \\"/a\\",
      component: () => import(\\"Bar\\"),
      },
      ],
      },
      ]"
    `);
  });
});

describe('normalizePageRoutes', () => {
  describe('component', () => {
    test('should convert relative path to absolute path', () => {
      const routes = normalizePageRoutes(
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
