import * as path from 'path';
import { rankRouteBranches } from '@shuvi/router';
import { IApiRouteConfig } from '@shuvi/platform-shared/lib/node';

export { IApiRouteConfig };

export function serializeApiRoutes(apiRoutes: IApiRouteConfig[]): string {
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
      ${handler ? `handler: require("${handler}"),` : ''}
    },`;
    res += strRoute;
  }
  return `[${res}]`;
}

export function normalizeApiRoutes(
  apiRoutes: IApiRouteConfig[],
  option: { apisDir: string }
): IApiRouteConfig[] {
  const res: IApiRouteConfig[] = [];
  for (let index = 0; index < apiRoutes.length; index++) {
    const apiRoute = { ...apiRoutes[index] };
    if (apiRoute.handler) {
      const absPath = path.isAbsolute(apiRoute.handler)
        ? apiRoute.handler
        : path.resolve(option.apisDir, apiRoute.handler);

      apiRoute.handler = absPath.replace(/\\/g, '/');
    }

    res.push(apiRoute);
  }

  return res;
}

export const generateRoutesContent = (
  apiRoutes: IApiRouteConfig[],
  apisDir: string
): string => {
  const normalizedRoutes = normalizeApiRoutes(apiRoutes, { apisDir });
  const serialized = serializeApiRoutes(normalizedRoutes);
  return `export default ${serialized}`;
};
