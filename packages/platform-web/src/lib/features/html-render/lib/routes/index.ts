import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { IUserRouteConfig, IRouteConfig } from '@shuvi/service';
import { ROUTE_RESOURCE_QUERYSTRING } from '@shuvi/shared/lib/constants';
import { getExports } from '@shuvi/service/lib/project/file-utils';
import { resolveFile } from '@shuvi/utils/lib/file';

export type Templates<T extends {}> = {
  [K in keyof T]?: (v: T[K], route: T & { id: string }) => string;
};

type RouteKeysWithoutChildren = keyof Omit<IUserRouteConfig, 'children'>;

function genRouteId(filepath: string) {
  return createHash('md4').update(filepath).digest('hex').substr(0, 4);
}

/**
 * returns JSON string of IAppRouteConfigWithPrivateProps
 */
export function serializeRoutes(
  routes: IRouteConfig[],
  parentPath: string = ''
): string {
  let res = '';
  for (let index = 0; index < routes.length; index++) {
    const { children: childRoutes, ...route } = routes[index];
    const fullpath = route.path ? parentPath + '/' + route.path : parentPath;
    const id = route.id;
    let strRoute = `id: ${JSON.stringify(id)},\n`;
    const keys = Object.keys(route);
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index] as RouteKeysWithoutChildren;

      if (key === 'component') {
        const { component } = route;
        const componentSource = component;
        const componentSourceWithAffix = `${componentSource}?${ROUTE_RESOURCE_QUERYSTRING}`;
        // `webpackExports` works with production and optimization.minimize, check compiled dist
        strRoute +=
          `__componentSourceWithAffix__: "${componentSourceWithAffix}",
__componentSource__: "${componentSource}",
__import__: () => import(
  /* webpackChunkName: "page-${id}" */
  /* webpackExports: "default" */
  "${componentSourceWithAffix}"),
__resolveWeak__: () => [require.resolveWeak("${componentSourceWithAffix}")]`.trim();
      } else {
        strRoute += `${key}: ${JSON.stringify(route[key])}`;
      }
      strRoute += `,\n`;
    }

    if (childRoutes && childRoutes.length > 0) {
      strRoute += `children: ${serializeRoutes(childRoutes, fullpath)},\n`;
    }

    res += `{${strRoute}},\n`;
  }

  return `[${res}]`;
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

export const ifComponentHasLoader = (component: string) => {
  const file = resolveFile(component);
  if (file) {
    const content = fs.readFileSync(file, 'utf-8');
    try {
      const exports = getExports(content);
      return exports.includes('loader');
    } catch {}
  }
  return false;
};

export const getNormalizedRoutes = (
  routes: (IUserRouteConfig | IRouteConfig)[],
  componentDir: string,
  parentPath: string = ''
): IRouteConfig[] => {
  const res: IRouteConfig[] = [];
  for (let index = 0; index < routes.length; index++) {
    const route = { ...routes[index] } as IRouteConfig;
    const pathWithSlash = /^\//.test(route.path) ? route.path : route.path;
    const fullpath = pathWithSlash ? parentPath + pathWithSlash : parentPath;
    route.id = genRouteId(fullpath);
    if (route.component) {
      const absPath = path.isAbsolute(route.component)
        ? route.component
        : path.resolve(componentDir, route.component);

      route.component = absPath.replace(/\\/g, '/');
    }

    if (route.children && route.children.length > 0) {
      route.children = getNormalizedRoutes(
        route.children,
        componentDir,
        fullpath
      );
    }
    res.push(route);
  }
  return res;
};

export const getRoutesContent = (
  routes: IRouteConfig[],
  componentDir: string
): string => {
  const serialized = serializeRoutes(routes);
  const routesContent = `import loaders from './loaders';\nexport default ${serialized}`;
  return routesContent;
};

export * from './store';
