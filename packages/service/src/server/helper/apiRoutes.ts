import path from 'path';
import { IRouteRecord, rankRouteBranches } from '@shuvi/platform-core';

export interface IApiRouteConfig {
  path: string;
  children?: IApiRouteConfig[];
  apiModule: string;
}

type IApiRouteHandlerWithoutChildren = Omit<IApiRouteConfig, 'children'>;

function flattenApiRoutes(
  apiRoutes: IApiRouteConfig[],
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
    const { apiModule, path: routePath } = tempApiRoutes[index];
    const p = `${prefix}${routePath}`;
    let strRoute = `\n{
      path: "${p}",
      ${apiModule ? `apiModule: require("${apiModule}"),` : ''}
    },`;
    res += strRoute;
  }
  return `[${res}]`;
}

export function renameFilepathToModule(
  apiRoutes: IRouteRecord[]
): IApiRouteConfig[] {
  const res: IApiRouteConfig[] = [];
  for (let index = 0; index < apiRoutes.length; index++) {
    const { path, filepath, children } = apiRoutes[index];
    const route = {
      path
    } as IApiRouteConfig;

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
  apiRoutes: IApiRouteConfig[],
  option: { apisDir: string }
): IApiRouteConfig[] {
  const res: IApiRouteConfig[] = [];
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
