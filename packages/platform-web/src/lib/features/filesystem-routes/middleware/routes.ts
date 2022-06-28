import { rankRouteBranches } from '@shuvi/router';
import { IMiddlewareRouteConfig } from '@shuvi/platform-shared/lib/node';
import { getNormalizedAbsolutePath } from '@shuvi/utils/lib/file';

export { IMiddlewareRouteConfig };

export function normalizeMiddlewareRoutes(
  middlewareRoutes: IMiddlewareRouteConfig[],
  option: { baseDir: string }
): IMiddlewareRouteConfig[] {
  const res: IMiddlewareRouteConfig[] = [];
  for (let index = 0; index < middlewareRoutes.length; index++) {
    const middlewareRoute = { ...middlewareRoutes[index] };
    if (middlewareRoute.middlewares) {
      middlewareRoute.middlewares = middlewareRoute.middlewares.map(
        middleware => getNormalizedAbsolutePath(middleware, option.baseDir)
      );
    }

    res.push(middlewareRoute);
  }

  return res;
}

export function serializeMiddlewareRoutes(
  middlewareRoutes: IMiddlewareRouteConfig[]
): string {
  let rankMiddlewareRoutes = middlewareRoutes.map(
    middlewareRoute =>
      [middlewareRoute.path, middlewareRoute] as [
        string,
        typeof middlewareRoute
      ]
  );
  rankMiddlewareRoutes = rankRouteBranches(rankMiddlewareRoutes);
  middlewareRoutes = rankMiddlewareRoutes.map(
    middlewareRoute => middlewareRoute[1]
  );
  let res = '';
  for (let index = 0; index < middlewareRoutes.length; index++) {
    const { middlewares, path } = middlewareRoutes[index];
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

export function generateRoutesContent(
  rawRoutes: IMiddlewareRouteConfig[],
  baseDir: string
): string {
  const serialized = serializeMiddlewareRoutes(
    normalizeMiddlewareRoutes(rawRoutes, { baseDir })
  );
  return `export default ${serialized}`;
}
