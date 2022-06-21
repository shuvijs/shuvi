import { getFixturePath, normalizeWarnings } from './utils';
import { getMiddlewareRoutes } from '../route';

const normalizePath = (routes: any[], dir: string): any[] => {
  return routes.map(route => {
    if (route.children) {
      route.children = normalizePath(route.children, dir);
    }

    if (route.middlewares) {
      route.middlewares = route.middlewares.map((middleware: string) =>
        middleware.replace(dir + '/', '')
      );
    }
    return route;
  });
};

const getFixtureMiddlewareRoutes = async (dirname: string) => {
  const dir = getFixturePath(dirname);
  const { routes, warnings, errors } = await getMiddlewareRoutes(dir);

  return {
    routes: normalizePath(routes, dir),
    warnings: normalizeWarnings(warnings, dir),
    errors: normalizeWarnings(errors, dir)
  };
};

describe('middleware routes test', () => {
  it('should ', async () => {
    await getFixtureMiddlewareRoutes('middlewares');
  });
});
