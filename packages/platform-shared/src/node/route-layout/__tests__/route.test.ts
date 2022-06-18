import { getRoutesWithLayoutFromDir } from '../';
import { getFixturePath } from './utils';
import { withoutLayoutResult } from './fixtures/without-layout-result';
import { layoutResult } from './fixtures/layout-result';
import { dynamicPathResult } from './fixtures/dynamic-path-result';
import { ConventionRouteRecord, LayoutRouteRecord } from '../route-record';

const normalizePath = (basePath: string, routes: ConventionRouteRecord[]) => {
  return routes.map(route => {
    const keys = ['pagePath', 'middlewarePath', 'apiPath'] as const;
    const transformRoute: ConventionRouteRecord = {
      ...route
    };

    keys.forEach(key => {
      if (key in route) {
        transformRoute[key as keyof typeof transformRoute] = route[
          key as keyof typeof route
        ]!.replace(`${basePath}/`, '');
      }
    });

    if ('children' in route) {
      (transformRoute as LayoutRouteRecord).children = normalizePath(
        basePath,
        route.children
      );
    }
    return transformRoute;
  });
};

const getRoutes = async (pathname: string) => {
  const dir = getFixturePath(pathname);
  const { routes, errors, warnings } = await getRoutesWithLayoutFromDir(dir);
  return {
    routes: normalizePath(dir, routes),
    errors,
    warnings
  };
};

describe('filesystem routes', () => {
  it('should work', async () => {
    const result = await getRoutes('without-layout');
    expect(result).toMatchObject({
      routes: withoutLayoutResult,
      errors: [],
      warnings: []
    });
  });

  it('should handle layout', async () => {
    const result = await getRoutes('layout');
    console.log(result.routes);
    expect(result).toMatchObject({
      routes: layoutResult,
      errors: [],
      warnings: []
    });
  });

  it('should handle dynamic path', async () => {
    const result = await getRoutes('dynamic-path');
    expect(result).toMatchObject({
      routes: dynamicPathResult,
      errors: [],
      warnings: []
    });
  });

  it('show ignore empty page segment and has warnings case 1', async () => {
    const result = await getRoutes('warning-empty-page-segments');
    expect(result).toMatchObject({
      errors: [],
      routes: [],
      warnings: [
        'packages/platform-shared/src/node/route-layout/__tests__/fixtures/warning-empty-page-segments/a ' +
          'is empty dir!'
      ]
    });
  });

  it('should ignore empty page segment and has warnings case 2', async () => {
    const result = await getRoutes('warning-empty-page-segment');
    expect(result).toMatchObject({
      routes: [
        {
          path: '/a',
          pagePath: 'a/page.js'
        }
      ],
      errors: [],
      warnings: [
        'packages/platform-shared/src/node/route-layout/__tests__/fixtures/warning-empty-page-segment/b is empty dir!'
      ]
    });
  });

  it('should ignore useless page.js and has warnings', async () => {
    const result = await getRoutes('two-level-page');
    expect(result).toMatchObject({
      routes: [
        {
          path: '/a',
          pagePath: 'a/page.js'
        },
        {
          path: '/',
          pagePath: 'page.js'
        }
      ],
      warnings: []
    });
  });

  it('should get right filepath when has same filename', async () => {
    const result = await getRoutes('ext-priority');
    expect(result).toMatchObject({
      routes: [
        { path: '/a', pagePath: 'a/page.jsx' },
        { path: '/b', pagePath: 'b/page.ts' },
        { path: '/c', pagePath: 'c/page.tsx' }
      ],
      errors: [],
      warnings: []
    });
  });

  it('should get correct result with mixed page and layout', async () => {
    const result = await getRoutes('mixed-layout-page');

    expect(result).toMatchObject({
      routes: [
        {
          path: '/a',
          pagePath: 'a/layout.js',
          children: [
            {
              path: '',
              pagePath: 'a/page.js'
            }
          ]
        },
        {
          path: '/',
          pagePath: 'page.js'
        }
      ],
      errors: [],
      warnings: []
    });
  });
});
