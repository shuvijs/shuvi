import { getFixturePath, normalizePath, normalizeWarnings } from './utils';
import { getPageRoutes } from '../route';

const getFixturePageRoutes = async (dirname: string) => {
  const dir = getFixturePath(dirname);
  const { routes, warnings, errors } = await getPageRoutes(dir);

  return {
    routes: normalizePath(routes, dir, 'component'),
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
