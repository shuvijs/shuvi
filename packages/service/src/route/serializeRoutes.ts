import { createHash } from 'crypto';
import { joinPath } from '@shuvi/utils/lib/string';
import { rankRouteBranches } from '@shuvi/platform-core';
import { ROUTE_RESOURCE_QUERYSTRING } from '@shuvi/shared/lib/constants';
import {
  IUserRouteConfig,
  IApiRouteConfig,
  IMiddlewareRouteConfig
} from '../server';

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
export function serializePageRoutes(
  routes: IUserRouteConfig[],
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
        strRoute +=
          `__componentSourceWithAffix__: "${componentSourceWithAffix}",
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

export function serializeApiRoutes(
  apiRoutes: IApiRouteConfig[],
  prefix = ''
): string {
  const rankApiRoutes = rankRouteBranches(
    apiRoutes.map(
      apiRoute => [apiRoute.path, apiRoute] as [string, typeof apiRoute]
    )
  );
  const tempApiRoutes = rankApiRoutes.map(apiRoute => apiRoute[1]);
  let res = '';
  for (let index = 0; index < tempApiRoutes.length; index++) {
    const { apiModule, path } = tempApiRoutes[index];
    let strRoute = `\n{
      path: "${joinPath(prefix, path)}",
      ${apiModule ? `apiModule: require("${apiModule}"),` : ''}
    },`;
    res += strRoute;
  }
  return `[${res}]`;
}

export function serializeMiddlewareRoutes(
  middlewareRoutes: IMiddlewareRouteConfig[]
): string {
  const rankmiddlewareRoutes = rankRouteBranches(
    middlewareRoutes.map(
      middlewareRoute =>
        [middlewareRoute.path, middlewareRoute] as [
          string,
          typeof middlewareRoute
        ]
    )
  );
  const tempMiddlewareRoutes = rankmiddlewareRoutes.map(
    middlewareRoute => middlewareRoute[1]
  );
  let res = '';
  for (let index = 0; index < tempMiddlewareRoutes.length; index++) {
    const { middlewares, path } = tempMiddlewareRoutes[index];
    let strRoute = `\n{
      path: "${path}",
      ${
        middlewares
          ? `middlewares: [${middlewares
              .map(middleware => `require("${middleware}").middleware`)
              .join(',')}],`
          : ''
      }
    },`;
    res += strRoute;
  }
  return `[${res}]`;
}
