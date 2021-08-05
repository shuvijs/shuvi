import path from 'path';
import { Runtime } from '@shuvi/types';
import { IRouteRecord, rankRouteBranches } from '@shuvi/router';

type IApiRouteHandlerWithoutChildren = Omit<
  Runtime.IApiRouteConfig,
  'children'
>;

function flattenApiRoutes(
  apiRoutes: Runtime.IApiRouteConfig[],
  branches: IApiRouteHandlerWithoutChildren[] = [],
  parentPath = ''
): IApiRouteHandlerWithoutChildren[] {
  apiRoutes.forEach(route => {
    const { children, apiModule } = route;
    let tempPath = path.join(parentPath, route.path);

    if (children) {
      flattenApiRoutes(children, branches, tempPath);
    }
    if (apiModule) {
      branches.push({
        path: tempPath,
        apiModule
      });
    }
  });
  return branches;
}

export function serializeApiRoutes(
  apiRoutes: Runtime.IApiRouteConfig[],
  parentPath = ''
): string {
  let tempApiRoutes = flattenApiRoutes(
    apiRoutes,
    [],
    path.resolve('/', parentPath)
  );
  let rankApiRoutes = tempApiRoutes.map(
    apiRoute => [apiRoute.path, apiRoute] as [string, typeof apiRoute]
  );
  rankApiRoutes = rankRouteBranches(rankApiRoutes);
  tempApiRoutes = rankApiRoutes.map(apiRoute => apiRoute[1]);
  let res = '';
  for (let index = 0; index < tempApiRoutes.length; index++) {
    const { apiModule, path } = tempApiRoutes[index];
    let strRoute = `\n{
      path: "${path}",
      ${apiModule ? `apiModule: require("${apiModule}"),` : ''}
    },`;
    res += strRoute;
  }
  return `[${res}]`;
}

export function renameFilepathToModule(
  apiRoutes: IRouteRecord[]
): Runtime.IApiRouteConfig[] {
  const res: Runtime.IApiRouteConfig[] = [];
  for (let index = 0; index < apiRoutes.length; index++) {
    const { path, filepath, children } = apiRoutes[index];
    const route = {
      path
    } as Runtime.IApiRouteConfig;

    if (filepath) {
      route.apiModule = filepath;
    }

    if (children && children.length > 0) {
      route.children = renameFilepathToModule(children);
    }
    res.push(route);
  }
  return res;
}

export function normalizeApiRoutes(
  apiRoutes: Runtime.IApiRouteConfig[],
  option: { apisDir: string }
): Runtime.IApiRouteConfig[] {
  const res: Runtime.IApiRouteConfig[] = [];
  for (let index = 0; index < apiRoutes.length; index++) {
    const apiRoute = { ...apiRoutes[index] };
    if (apiRoute.apiModule) {
      const absPath = path.isAbsolute(apiRoute.apiModule)
        ? apiRoute.apiModule
        : path.resolve(option.apisDir, apiRoute.apiModule);

      apiRoute.apiModule = absPath.replace(/\\/g, '/');
    }

    if (apiRoute.children && apiRoute.children.length > 0) {
      apiRoute.children = normalizeApiRoutes(apiRoute.children, option);
    }
    res.push(apiRoute);
  }

  return res;
}
