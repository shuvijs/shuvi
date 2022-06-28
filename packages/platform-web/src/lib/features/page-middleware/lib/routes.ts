import { rankRouteBranches } from '@shuvi/router';

export interface IMiddlewareRouteConfig {
  path: string;
  middlewares: string[];
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

export function getRoutesContentFromRawRoutes(
  rawRoutes: IMiddlewareRouteConfig[]
): string {
  const serialized = serializeMiddlewareRoutes(rawRoutes);
  return `export default ${serialized}`;
}
