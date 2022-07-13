import { rankRouteBranches } from '@shuvi/router';
import { IMiddlewareRouteConfig } from '@shuvi/platform-shared/node';
import { normalizePath } from '@shuvi/utils/lib/file';

export { IMiddlewareRouteConfig };

export function normalizeMiddlewareRoutes(
  middlewareRoutes: IMiddlewareRouteConfig[],
  option: { baseDir: string }
): IMiddlewareRouteConfig[] {
  const res: IMiddlewareRouteConfig[] = [];
  for (let index = 0; index < middlewareRoutes.length; index++) {
    const middlewareRoute = { ...middlewareRoutes[index] };
    if (middlewareRoute.middleware) {
      middlewareRoute.middleware = normalizePath(
        middlewareRoute.middleware,
        option.baseDir
      );
    }

    res.push(middlewareRoute);
  }

  return res;
}

export function serializeMiddlewareRoutes(
  middlewareRoutes: IMiddlewareRouteConfig[],
  { sort }: { sort: boolean }
): string {
  let rankMiddlewareRoutes = middlewareRoutes.map(
    middlewareRoute =>
      [middlewareRoute.path, middlewareRoute] as [
        string,
        typeof middlewareRoute
      ]
  );
  if (sort) {
    rankMiddlewareRoutes = rankRouteBranches(rankMiddlewareRoutes);
  }
  middlewareRoutes = rankMiddlewareRoutes.map(
    middlewareRoute => middlewareRoute[1]
  );
  let res = '';
  for (let index = 0; index < middlewareRoutes.length; index++) {
    const { middleware, path } = middlewareRoutes[index];
    let strRoute = `\n{
      path: "${path}",
      ${middleware ? `middleware: require("${middleware}"),` : ''}
    },`;
    res += strRoute;
  }
  return `[${res}]`;
}

export function generateRoutesContent(
  rawRoutes: IMiddlewareRouteConfig[],
  {
    baseDir,
    sort = false
  }: {
    baseDir: string;
    sort: boolean;
  }
): string {
  const serialized = serializeMiddlewareRoutes(
    normalizeMiddlewareRoutes(rawRoutes, { baseDir }),
    { sort }
  );
  return `export default ${serialized}`;
}
