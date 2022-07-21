import { join, sep } from 'path';
import { RouteException } from '../route';

const toUnixPath = (filePath: string) => filePath.split(sep).join('/');

export const getFixturePath = (
  fixturePath: string,
  dirname: string = __dirname
) => {
  return join(dirname, 'fixtures', fixturePath);
};

export const normalizePath = (
  routes: any[],
  dir: string,
  key: string
): any[] => {
  dir = toUnixPath(dir);
  return routes.map(route => {
    if (route.children) {
      route.children = normalizePath(route.children, dir, key);
    }

    const value = route[key];
    return {
      ...route,
      [key]: Array.isArray(value)
        ? value.map(a => toUnixPath(a).replace(dir + '/', ''))
        : toUnixPath(value).replace(dir + '/', '')
    };
  });
};

export const normalizeWarnings = (warnings: RouteException[], dir: string) => {
  return warnings.map(warning => {
    return {
      ...warning,
      msg: toUnixPath(warning.msg).replace(dir + '/', '')
    };
  });
};
