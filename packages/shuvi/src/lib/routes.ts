import { createHash } from 'crypto';
import path from 'path';
import { IRouteBase, IRouteConfig } from '@shuvi/core';

export type Templates<T extends {}> = {
  [K in keyof T]?: (v: T[K], route: T & { id: string }) => string;
};

function genRouteId(filepath: string) {
  return createHash('md4').update(filepath).digest('hex').substr(0, 4);
}

function serializeRoutesImpl(
  routes: IRouteBase[],
  templates: Templates<any> = {},
  parentPath: string = ''
): string {
  let res = '';
  for (let index = 0; index < routes.length; index++) {
    const { routes: childRoutes, ...route } = routes[index];
    const fullpath = route.path ? parentPath + '/' + route.path : parentPath;
    const id = genRouteId(fullpath);

    let strRoute = `id: ${JSON.stringify(id)},\n`;
    const keys = Object.keys(route);
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      strRoute += `${key}: `;
      const customSerialize = templates[key];
      if (customSerialize) {
        strRoute += customSerialize(route[key], { ...route, id });
      } else {
        strRoute += JSON.stringify(route[key]);
      }
      strRoute += `,\n`;
    }

    if (childRoutes && childRoutes.length > 0) {
      strRoute += `routes: ${serializeRoutesImpl(
        childRoutes,
        templates,
        fullpath
      )},\n`;
    }

    res += `{${strRoute}},\n`;
  }

  return `[${res}]`;
}

export function serializeRoutes<T extends IRouteBase = IRouteBase>(
  routes: T[],
  templates: Templates<T> = {}
): string {
  return serializeRoutesImpl(routes, templates, '');
}

export function normalizeRoutes(
  routes: IRouteConfig[],
  option: { componentDir: string }
): IRouteConfig[] {
  const res: IRouteConfig[] = [];
  for (let index = 0; index < routes.length; index++) {
    const route = { ...routes[index] };
    const absPath = path.isAbsolute(route.component)
      ? route.component
      : path.resolve(option.componentDir, route.component);

    route.component = absPath.replace(/\\/g, '/');
    if (route.routes && route.routes.length > 0) {
      route.routes = normalizeRoutes(route.routes, option);
    }
    res.push(route);
  }

  return res;
}
