import { join } from 'path';
import { RouteException } from '../route';

export const getFixturePath = (
  fixturePath: string,
  dirname: string = __dirname
) => {
  return join(dirname, 'fixtures', fixturePath);
};

export const normalizePath = (
  routes: any[],
  dir: string,
  key: 'component' | 'handler' | 'middlewares'
): any[] => {
  return routes.map(route => {
    if (route.children) {
      route.children = normalizePath(route.children, dir, key);
    }

    const value = route[key];
    return {
      ...route,
      [key]: Array.isArray(value)
        ? value.map(a => a.replace(dir + '/', ''))
        : value.replace(dir + '/', '')
    };
  });
};

export const normalizeWarnings = (warnings: RouteException[], dir: string) => {
  return warnings.map(warning => {
    return {
      ...warning,
      msg: warning.msg.replace(dir + '/', '')
    };
  });
};
