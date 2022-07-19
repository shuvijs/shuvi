import { getFixturePath, normalizeWarnings, normalizePath } from './utils';
import { getMiddlewareRoutes } from '../route';

export const getFixtureMiddlewareRoutes = async (
  dirname: string,
  ignoredRouteFiles?: string[]
) => {
  const dir = getFixturePath(dirname);
  const { routes, warnings, errors } = await getMiddlewareRoutes(
    dir,
    ignoredRouteFiles
  );

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
