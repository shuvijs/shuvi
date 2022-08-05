import { getFixturePath, normalizeWarnings, normalizePath } from './utils';
import {
  getRawRoutesFromDir,
  getMiddlewareRoutes,
  getPageRoutes,
  getApiRoutes
} from '../route';

describe('route/raw-route', () => {
  const getRawRoutes = async (
    dirname: string,
    { exclude }: { exclude?: string[] } = {}
  ) => {
    const dir = getFixturePath(dirname);
    const { routes, warnings, errors } = await getRawRoutesFromDir(
      dir,
      exclude
    );

    return {
      routes: normalizePath(routes, dir, 'filepath'),
      warnings,
      errors
    };
  };

  const pick = (items: any[], key: string): any[] => {
    return items.map(item => {
      return {
        [key]: item[key],
        ...(item.children
          ? {
              children: pick(item.children, key)
            }
          : {})
      };
    });
  };

  it('should get raw routes from dir', async () => {
    const result = await getRawRoutes('exclude', {
      exclude: ['ignore-dir', 'ignore-file/**/api.js']
    });

    expect(pick(result.routes, 'filepath')).toMatchObject([
      {
        filepath: 'foo/',
        children: [
          {
            filepath: 'foo/page.js'
          }
        ]
      },
      {
        filepath: 'ignore-file/',
        children: [
          {
            filepath: 'ignore-file/nested/',
            children: [
              {
                filepath: 'ignore-file/nested/page.js'
              }
            ]
          },
          {
            filepath: 'ignore-file/page.js'
          }
        ]
      },
      {
        filepath: 'page.js'
      }
    ]);
  });
});

describe('route/page', () => {
  const getFixturePageRoutes = async (dirname: string) => {
    const dir = getFixturePath(dirname);
    const { routes, warnings, errors } = await getPageRoutes(dir);

    return {
      routes: normalizePath(routes, dir, 'component'),
      warnings: normalizeWarnings(warnings, dir),
      errors: normalizeWarnings(errors, dir)
    };
  };
  it('should work when without-layout', async () => {
    const result = await getFixturePageRoutes('without-layout');
    expect(result).toMatchObject({
      routes: [
        {
          component: 'b/b1/b2/page.js',
          path: '/b/b1/b2'
        },
        {
          component: 'a/a1/page.js',
          path: '/a/a1'
        },
        {
          component: 'a/page.js',
          path: '/a'
        },
        {
          component: 'b/page.js',
          path: '/b'
        }
      ],
      warnings: [],
      errors: []
    });
  });

  it('should handle layout', async () => {
    const result = await getFixturePageRoutes('layout');
    expect(result).toMatchObject({
      routes: [
        {
          children: [
            {
              path: '',
              component: 'page.js'
            },
            {
              component: 'a1/a2/page.js',
              path: 'a1/a2'
            },
            {
              children: [
                {
                  component: 'a/b/page.js',
                  path: 'b'
                },
                {
                  component: 'a/c/page.js',
                  path: 'c'
                },
                {
                  children: [
                    {
                      component: 'a/d/e/page.js',
                      path: 'e'
                    }
                  ],
                  component: 'a/d/layout.js',
                  path: 'd'
                }
              ],
              component: 'a/layout.js',
              path: 'a'
            }
          ],
          component: 'layout.js',
          path: '/'
        }
      ],
      warnings: [],
      errors: []
    });
  });

  it('should handle dynamic path', async () => {
    const result = await getFixturePageRoutes('dynamic-path');
    result.routes.forEach(route => console.log(route));

    expect(result).toMatchObject({
      routes: [
        {
          children: [
            {
              component: 'd/$pid/$id/page.js',
              path: 'd/:pid/:id'
            },
            {
              component: 'e/$pid/$/page.js',
              path: 'e/:pid/*'
            },
            {
              component: 'a/$id/page.js',
              path: 'a/:id'
            },
            {
              component: 'b/$id/page.js',
              path: 'b/:id'
            },
            {
              component: 'e/$pid/page.js',
              path: 'e/:pid'
            },
            {
              component: 'b/page.js',
              path: 'b'
            },
            {
              children: [
                {
                  component: 'c/$id/page.js',
                  path: ':id'
                }
              ],
              component: 'c/layout.js',
              path: 'c'
            }
          ],
          component: 'layout.js',
          path: '/'
        }
      ],
      warnings: [],
      errors: []
    });
  });

  it('should ignore empty page segment and has warnings case 1', async () => {
    const result = await getFixturePageRoutes('warning-empty-page-segments');
    expect(result).toMatchObject({
      errors: [],
      routes: [],
      warnings: [
        {
          type: 'dir',
          msg: 'a/ is empty dir!'
        }
      ]
    });
  });

  it('should ignore empty page segment and has warnings case 2', async () => {
    const result = await getFixturePageRoutes('warning-empty-page-segment');
    expect(result).toMatchObject({
      routes: [
        {
          path: '/a',
          component: 'a/page.js'
        }
      ],
      errors: [],
      warnings: [
        {
          type: 'dir',
          msg: 'b/ is empty dir!'
        }
      ]
    });
  });

  it('should get right filepath when has same filename', async () => {
    const result = await getFixturePageRoutes('ext-priority');
    expect(result).toMatchObject({
      routes: [
        { path: '/a', component: 'a/page.jsx' },
        { path: '/b', component: 'b/page.ts' },
        { path: '/c', component: 'c/page.tsx' }
      ],
      errors: [],
      warnings: []
    });
  });

  it('should get correct result with mixed page and layout', async () => {
    const result = await getFixturePageRoutes('mixed-layout-page');

    expect(result).toMatchObject({
      routes: [
        {
          path: '/a',
          component: 'a/layout.js',
          children: [
            {
              path: '',
              component: 'a/page.js'
            }
          ]
        },
        {
          path: '/',
          component: 'page.js'
        }
      ],
      errors: [],
      warnings: []
    });
  });
});

describe('route/api', () => {
  const getFixtureApiRoutes = async (dirname: string) => {
    const dir = getFixturePath(dirname);
    const { routes, warnings, errors } = await getApiRoutes(dir);

    return {
      routes: normalizePath(routes, dir, 'api'),
      warnings: normalizeWarnings(warnings, dir),
      errors: normalizeWarnings(errors, dir)
    };
  };
  it('should get correct api routes', async () => {
    const result = await getFixtureApiRoutes('api');

    expect(result).toMatchObject({
      routes: [
        {
          path: '/api/users/:id',
          api: 'api/users/$id/api.js'
        },
        {
          path: '/api/users',
          api: 'api/users/api.js'
        },
        {
          path: '/api',
          api: 'api/api.js'
        }
      ],
      warnings: [],
      errors: []
    });
  });

  it('should get warnings and dont generate apis when conflicted', async () => {
    const result = await getFixtureApiRoutes('api-conflict');
    expect(result).toMatchObject({
      routes: [],
      warnings: [
        {
          type: 'api',
          msg: 'Find both layout.js and api.js in "a"!, only "layout.js" is used.'
        },
        {
          type: 'api',
          msg: 'Find both layout.js and api.js in "b"!, only "layout.js" is used.'
        }
      ],
      errors: []
    });
  });
});

describe('route/middleware', () => {
  const getFixtureMiddlewareRoutes = async (dirname: string) => {
    const dir = getFixturePath(dirname);
    const { routes, warnings, errors } = await getMiddlewareRoutes(dir);

    return {
      routes: normalizePath(routes, dir, 'middleware'),
      warnings: normalizeWarnings(warnings, dir),
      errors: normalizeWarnings(errors, dir)
    };
  };

  describe('middleware routes test', () => {
    it('should get correct middlewares', async () => {
      const result = await getFixtureMiddlewareRoutes('middlewares');
      expect(result).toMatchObject({
        routes: [
          {
            path: '/b/b1/*',
            middleware: 'b/b1/middleware.js'
          },
          {
            path: '/b/b2/*',
            middleware: 'b/b2/middleware.js'
          },
          {
            path: '/a/*',
            middleware: 'a/middleware.js'
          },
          {
            path: '/b/*',
            middleware: 'b/middleware.js'
          },
          {
            path: '/*',
            middleware: 'middleware.js'
          }
        ],
        warnings: [],
        errors: []
      });
    });

    it('should get empty array when has not middleware', async () => {
      const result = await getFixtureMiddlewareRoutes('layout');
      expect(result).toMatchObject({
        errors: [],
        warnings: [],
        routes: []
      });
    });
  });
});
