import path from 'path';
import { IRouteRecord, rankRouteBranches } from '@shuvi/router';

export interface IApiRouteModule {
  children?: IApiRouteModule[];
  apiRouteModule?: string;
  path: string;
}

type IApiRouteHandlerWithoutChildren = Omit<IApiRouteModule, 'children'>;

function flattenApiRoutes(
  routes: IApiRouteModule[],
  branches: IApiRouteHandlerWithoutChildren[] = [],
  parentPath = ''
): IApiRouteHandlerWithoutChildren[] {
  routes.forEach(route => {
    const { children, apiRouteModule } = route;
    let tempPath = path.join(parentPath, route.path);

    if (children) {
      flattenApiRoutes(children, branches, tempPath);
    }
    if (apiRouteModule) {
      branches.push({
        path: tempPath,
        apiRouteModule
      });
    }
  });
  return branches;
}

export function serializeApiRoutes(
  routes: IApiRouteModule[],
  parentPath = ''
): string {
  let apiRoutes = flattenApiRoutes(routes, [], path.resolve('/', parentPath));
  let rankApiRoutes = apiRoutes.map(
    apiRoute => [apiRoute.path, apiRoute] as [string, typeof apiRoute]
  );
  rankApiRoutes = rankRouteBranches(rankApiRoutes);
  apiRoutes = rankApiRoutes.map(apiRoute => apiRoute[1]);
  let res = '';
  for (let index = 0; index < apiRoutes.length; index++) {
    const { apiRouteModule, path } = apiRoutes[index];
    let strRoute = `\n{
      path: "${path}",
      ${apiRouteModule ? `apiRouteModule: require("${apiRouteModule}"),` : ''}
    },`;
    res += strRoute;
  }
  return `[${res}]`;
}

export function renameFilepathToModule(
  routes: IRouteRecord[]
): IApiRouteModule[] {
  const res: IApiRouteModule[] = [];
  for (let index = 0; index < routes.length; index++) {
    const { path, filepath, children } = routes[index];
    const route = {
      path
    } as IApiRouteModule;

    if (filepath) {
      route.apiRouteModule = filepath;
    }

    if (children && children.length > 0) {
      route.children = renameFilepathToModule(children);
    }
    res.push(route);
  }
  return res;
}

export function normalizeApiRoutes(
  routes: IApiRouteModule[],
  option: { apisDir: string }
): IApiRouteModule[] {
  const res: IApiRouteModule[] = [];
  for (let index = 0; index < routes.length; index++) {
    const route = { ...routes[index] };
    if (route.apiRouteModule) {
      const absPath = path.isAbsolute(route.apiRouteModule)
        ? route.apiRouteModule
        : path.resolve(option.apisDir, route.apiRouteModule);

      route.apiRouteModule = absPath.replace(/\\/g, '/');
    }

    if (route.children && route.children.length > 0) {
      route.children = normalizeApiRoutes(route.children, option);
    }
    res.push(route);
  }

  return res;
}
