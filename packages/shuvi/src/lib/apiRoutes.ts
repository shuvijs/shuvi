import path from 'path';
import { IApiRouteConfig } from '@shuvi/core';
import { IRouteRecord, rankRouteBranches } from '@shuvi/router';

type IApiRouteConfigWithoutChildren = Omit<IApiRouteConfig, 'children'>;

function flattenApiRoutes(
  routes: IApiRouteConfig[],
  branches: IApiRouteConfigWithoutChildren[] = [],
  parentPath = ''
): IApiRouteConfigWithoutChildren[] {
  routes.forEach(route => {
    const { children, handler } = route;
    let tempPath = path.join(parentPath, route.path);

    if (children) {
      flattenApiRoutes(children, branches, tempPath);
    }

    if (handler) {
      branches.push({
        path: tempPath,
        handler
      });
    }
  });
  return branches;
}

export function serializeApiRoutes(routes: IApiRouteConfig[]): string {
  let apiRoutes = flattenApiRoutes(routes);
  let rankApiRoutes = apiRoutes.map(
    apiRoute => [apiRoute.path, apiRoute] as [string, typeof apiRoute]
  );
  rankApiRoutes = rankRouteBranches(rankApiRoutes);
  apiRoutes = rankApiRoutes.map(apiRoute => apiRoute[1]);
  let res = '';
  for (let index = 0; index < apiRoutes.length; index++) {
    const { handler, path } = apiRoutes[index];
    let strRoute = `\n{
      path: "${path}",
      ${handler ? `handler: require("${handler}").default,` : ''}
    },`;
    res += strRoute;
  }
  return `[${res}]`;
}

export function renameFilepathToHandler(
  routes: IRouteRecord[]
): IApiRouteConfig[] {
  const res: IApiRouteConfig[] = [];
  for (let index = 0; index < routes.length; index++) {
    const { path, filepath, children } = routes[index];
    const route = {
      path
    } as IApiRouteConfig;

    if (filepath) {
      route.handler = filepath;
    }

    if (children && children.length > 0) {
      route.children = renameFilepathToHandler(children);
    }
    res.push(route);
  }
  return res;
}

export function normalizeApiRoutes(
  routes: IApiRouteConfig[],
  option: { apisDir: string }
): IApiRouteConfig[] {
  const res: IApiRouteConfig[] = [];
  for (let index = 0; index < routes.length; index++) {
    const route = { ...routes[index] };
    if (route.handler) {
      const absPath = path.isAbsolute(route.handler)
        ? route.handler
        : path.resolve(option.apisDir, route.handler);

      route.handler = absPath.replace(/\\/g, '/');
    }

    if (route.children && route.children.length > 0) {
      route.children = normalizeApiRoutes(route.children, option);
    }
    res.push(route);
  }

  return res;
}
