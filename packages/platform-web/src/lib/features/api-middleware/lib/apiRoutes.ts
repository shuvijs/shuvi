import * as path from 'path';
import { rankRouteBranches, IRouteRecord } from '@shuvi/router';

export interface IApiRouteConfig {
  path: string;
  apiModule: string;
}

export function serializeApiRoutes(apiRoutes: IApiRouteConfig[]): string {
  let rankApiRoutes = apiRoutes.map(
    apiRoute => [apiRoute.path, apiRoute] as [string, typeof apiRoute]
  );
  rankApiRoutes = rankRouteBranches(rankApiRoutes);
  apiRoutes = rankApiRoutes.map(apiRoute => apiRoute[1]);
  let res = '';
  for (let index = 0; index < apiRoutes.length; index++) {
    const { apiModule, path } = apiRoutes[index];
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
): IApiRouteConfig[] {
  const res: IApiRouteConfig[] = [];
  for (let index = 0; index < apiRoutes.length; index++) {
    const { path, filepath } = apiRoutes[index];
    const route = {
      path
    } as IApiRouteConfig;

    if (filepath) {
      route.apiModule = filepath;
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

    res.push(apiRoute);
  }

  return res;
}

export const getRoutesContent = (
  apiRoutes: IApiRouteConfig[],
  apisDir: string
): string => {
  const normalizedRoutes = normalizeApiRoutes(apiRoutes, { apisDir });
  const serialized = serializeApiRoutes(normalizedRoutes);
  return `export default ${serialized}`;
};

export const getRoutesContentFromRawRoutes = (
  rawRoutes: IRouteRecord[],
  apisDir: string
): string => {
  return getRoutesContent(renameFilepathToModule(rawRoutes), apisDir);
};
