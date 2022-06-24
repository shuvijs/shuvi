import { join } from 'path';
import { IRouteRecord } from '@shuvi/router';
import { RouteException } from '../route';

export const getFixturePath = (
  fixturePath: string,
  dirname: string = __dirname
) => {
  return join(dirname, 'fixtures', fixturePath);
};

export const normalizePath = (
  routes: IRouteRecord[],
  dir: string,
  key: keyof IRouteRecord = 'component'
): IRouteRecord[] => {
  return routes.map(route => {
    if (route.children) {
      route.children = normalizePath(route.children, dir, key);
    }
    return {
      ...route,
      [key]: route[key].replace(dir + '/', '')
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
