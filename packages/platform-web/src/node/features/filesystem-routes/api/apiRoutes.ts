import { IApiRouteConfig } from '@shuvi/platform-shared/node';
import { normalizePath } from '@shuvi/utils/file';

export { IApiRouteConfig };

export function serializeApiRoutes(apiRoutes: IApiRouteConfig[]): string {
  let res = '';
  for (let index = 0; index < apiRoutes.length; index++) {
    const { api, path } = apiRoutes[index];
    let strRoute = `\n{
      path: "${path}",
      ${api ? `api: require("${api}"),` : ''}
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
    if (apiRoute.api) {
      apiRoute.api = normalizePath(apiRoute.api, option.apisDir);
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
