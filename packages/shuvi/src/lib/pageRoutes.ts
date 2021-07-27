import { createHash } from 'crypto';
import path from 'path';
import { IUserRouteConfig } from '@shuvi/core';
import { IRouteRecord } from '@shuvi/router';

export type Templates<T extends {}> = {
  [K in keyof T]?: (v: T[K], route: T & { id: string }) => string;
};

type RouteKeysWithoutChildren = keyof Omit<IUserRouteConfig, 'children'>;

function genRouteId(filepath: string) {
  return createHash('md4').update(filepath).digest('hex').substr(0, 4);
}

function serializeRoutesImpl(
  routes: IUserRouteConfig[],
  templates: Templates<any> = {},
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
      strRoute += `children: ${serializeRoutesImpl(
        childRoutes,
        templates,
        fullpath
      )},\n`;
    }

    res += `{${strRoute}},\n`;
  }

  return `[${res}]`;
}

export function serializeRoutes<T extends IUserRouteConfig = IUserRouteConfig>(
  routes: T[],
  templates: Templates<T> = {}
): string {
  return serializeRoutesImpl(routes, templates, '');
}

export function renameSourceToComponent(
  routes: IRouteRecord[]
): IUserRouteConfig[] {
  const res: IUserRouteConfig[] = [];
  for (let index = 0; index < routes.length; index++) {
    const { path, source, children } = routes[index];
    const route = {
      path
    } as IUserRouteConfig;

    if (source) {
      route.component = source;
    }

    if (children && children.length > 0) {
      route.children = renameSourceToComponent(children);
    }
    res.push(route);
  }
  return (res as unknown) as IUserRouteConfig[];
}

export function normalizeRoutes(
  routes: IUserRouteConfig[],
  option: { componentDir: string }
): IUserRouteConfig[] {
  const res: IUserRouteConfig[] = [];
  for (let index = 0; index < routes.length; index++) {
    const route = { ...routes[index] };
    if (route.component) {
      const absPath = path.isAbsolute(route.component)
        ? route.component
        : path.resolve(option.componentDir, route.component);

      route.component = absPath.replace(/\\/g, '/');
    }

    if (route.children && route.children.length > 0) {
      route.children = normalizeRoutes(route.children, option);
    }
    res.push(route);
  }

  return res;
}
