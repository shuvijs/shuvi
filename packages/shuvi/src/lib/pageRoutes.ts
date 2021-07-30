import { createHash } from 'crypto';
import path from 'path';
import { Runtime } from '@shuvi/types';
import { ROUTE_RESOURCE_QUERYSTRING } from '../constants';
import { IRouteRecord } from '@shuvi/router';

export type Templates<T extends {}> = {
  [K in keyof T]?: (v: T[K], route: T & { id: string }) => string;
};

type RouteKeysWithoutChildren = keyof Omit<
  Runtime.IUserRouteConfig,
  'children'
>;

function genRouteId(filepath: string) {
  return createHash('md4').update(filepath).digest('hex').substr(0, 4);
}

export function serializePageRoutes(
  routes: Runtime.IUserRouteConfig[],
  parentPath: string = ''
): string {
  let res = '';
  for (let index = 0; index < routes.length; index++) {
    const { children: childRoutes, ...route } = routes[index];
    const fullpath = route.path ? parentPath + '/' + route.path : parentPath;
    const id = genRouteId(fullpath);
    let strRoute = `id: ${JSON.stringify(id)},\n`;
    const keys = Object.keys(route);
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index] as RouteKeysWithoutChildren;

      if (key === 'component') {
        const { component } = route;
        const componentSource = component;
        const componentSourceWithAffix = `${componentSource}?${ROUTE_RESOURCE_QUERYSTRING}`;
        strRoute += `__componentSourceWithAffix__: "${componentSourceWithAffix}",
__componentSource__: "${componentSource}",
__import__: () => import(/* webpackChunkName: "page-${id}" */"${componentSourceWithAffix}"),
__resolveWeak__: () => [require.resolveWeak("${componentSourceWithAffix}")]`.trim();
      } else {
        strRoute += `${key}: ${JSON.stringify(route[key])}`;
      }
      strRoute += `,\n`;
    }

    if (childRoutes && childRoutes.length > 0) {
      strRoute += `children: ${serializePageRoutes(childRoutes, fullpath)},\n`;
    }

    res += `{${strRoute}},\n`;
  }

  return `[${res}]`;
}

export function renameFilepathToComponent(
  routes: IRouteRecord[]
): Runtime.IUserRouteConfig[] {
  const res: Runtime.IUserRouteConfig[] = [];
  for (let index = 0; index < routes.length; index++) {
    const { path, filepath, children } = routes[index];
    const route = {
      path
    } as Runtime.IUserRouteConfig;

    if (filepath) {
      route.component = filepath;
    }

    if (children && children.length > 0) {
      route.children = renameFilepathToComponent(children);
    }
    res.push(route);
  }
  return res;
}

export function normalizePageRoutes(
  routes: Runtime.IUserRouteConfig[],
  option: { componentDir: string }
): Runtime.IUserRouteConfig[] {
  const res: Runtime.IUserRouteConfig[] = [];
  for (let index = 0; index < routes.length; index++) {
    const route = { ...routes[index] };
    if (route.component) {
      const absPath = path.isAbsolute(route.component)
        ? route.component
        : path.resolve(option.componentDir, route.component);

      route.component = absPath.replace(/\\/g, '/');
    }

    if (route.children && route.children.length > 0) {
      route.children = normalizePageRoutes(route.children, option);
    }
    res.push(route);
  }

  return res;
}
