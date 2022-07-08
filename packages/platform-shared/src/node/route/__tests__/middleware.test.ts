import { getFixturePath, normalizeWarnings, normalizePath } from './utils';
import { getMiddlewareRoutes } from '../route';

const getFixtureMiddlewareRoutes = async (dirname: string) => {
  const dir = getFixturePath(dirname);
  const { routes, warnings, errors } = await getMiddlewareRoutes(dir);

  return {
    routes: normalizePath(routes, dir, 'middlewares'),
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
          path: '/a/*',
          middlewares: ['a/middleware.js']
        },
        {
          path: '/b/b1/*',
          middlewares: ['b/b1/middleware.js']
        },
        {
          path: '/b/b2/*',
          middlewares: ['b/b2/middleware.js']
        },
        {
          path: '/b/*',
          middlewares: ['b/middleware.js']
        },
        {
          path: '/*',
          middlewares: ['middleware.js']
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
