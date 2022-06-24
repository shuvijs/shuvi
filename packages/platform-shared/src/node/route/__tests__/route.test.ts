import { getFixturePath, normalizePath, normalizeWarnings } from './utils';
import { getPageAndLayoutRoutes } from '../route';

const getFixturePageRoutes = async (dirname: string) => {
  const dir = getFixturePath(dirname);
  const { routes, warnings, errors } = await getPageAndLayoutRoutes(dir);

  return {
    routes: normalizePath(routes, dir),
    warnings: normalizeWarnings(warnings, dir),
    errors: normalizeWarnings(errors, dir)
  };
};

describe('filesystem routes', () => {
  it('should work when without-layout', async () => {
    const result = await getFixturePageRoutes('without-layout');
    expect(result).toMatchObject({
      routes: [
        {
          component: 'a/a1/page.js',
          path: '/a/a1'
        },
        {
          component: 'a/page.js',
          path: '/a'
        },
        {
          component: 'b/b1/b2/page.js',
          path: '/b/b1/b2'
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
            },
            {
              component: 'a1/a2/page.js',
              path: 'a1/a2'
            },
            {
              path: '',
              component: 'page.js'
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

    expect(result).toMatchObject({
      routes: [
        {
          children: [
            {
              component: 'a/[id]/page.js',
              path: 'a/:id'
            },
            {
              component: 'b/[[id]]/page.js',
              path: 'b/:id?'
            },
            {
              component: 'c/[...id]/page.js',
              path: 'c/:id+'
            },
            {
              component: 'd/[[...id]]/page.js',
              path: 'd/:id*'
            },
            {
              component: 'd/page.js',
              path: 'd'
            },
            {
              children: [
                {
                  component: 'e/[id]/page.js',
                  path: ':id'
                }
              ],
              component: 'e/layout.js',
              path: 'e'
            },
            {
              component: 'f/[pid]/[id]/page.js',
              path: 'f/:pid/:id'
            },
            {
              component: 'g/[pid]/[id]/page.js',
              path: 'g/:pid/:id'
            },
            {
              component: 'g/[pid]/page.js',
              path: 'g/:pid'
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

  it('show ignore empty page segment and has warnings case 1', async () => {
    const result = await getFixturePageRoutes('warning-empty-page-segments');
    expect(result).toMatchObject({
      errors: [],
      routes: [],
      warnings: [
        {
          msg: 'a is empty dir!',
          type: 'dir'
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
          msg: 'b is empty dir!'
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

  // it('should get correct result with page and middleware', async () => {
  //   const result = await getFixturePageRoutes('middlewares');
  //   expect(result).toMatchObject({
  //     routes: [
  //       { path: '/a', middlewarePath: 'a/middleware.js' },
  //       { path: '/a', pagePath: 'a/page.js' },
  //       { path: '/', middlewarePath: 'middleware.js' },
  //       { path: '/', pagePath: 'page.js' }
  //     ],
  //     errors: [],
  //     warnings: []
  //   });
  // });
  //
  // it('should ignore api when has api and page', async () => {
  //   const result = await getFixturePageRoutes('ignore-api');
  //   expect(result).toMatchObject({
  //     routes: [
  //       { path: '/a', pagePath: 'a/page.js' },
  //       { path: '/', pagePath: 'page.js' }
  //     ],
  //     errors: [],
  //     warnings: [
  //       'Find both api.js and page.js in "packages/platform-shared/src/node/route-layout/__tests__/fixtures/ignore-api/a"!, only "api.js" is used.',
  //       'Find both api.js and page.js in "packages/platform-shared/src/node/route-layout/__tests__/fixtures/ignore-api"!, only "api.js" is used.'
  //     ]
  //   });
  // });

  // it('should get correct api result', async () => {
  //   const result = await getApiRoutesForTest('api');
  //
  //   expect(result).toMatchObject([
  //     {
  //       path: '/',
  //       filepath: 'layout.js',
  //       children: [
  //         { path: 'api', filepath: 'api/api.js' },
  //         { path: 'api/users', filepath: 'api/users/api.js' }
  //       ]
  //     }
  //   ]);
  // });

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
