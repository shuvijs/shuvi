import * as path from 'path';
import { rankRouteBranches } from '@shuvi/router';

export interface IMiddlewareRouteConfig {
  path: string;
  middlewares: string[];
}

function flattenMiddlewareRoutes(
  middlewareRoutes: IMiddlewareRouteConfig[],
  branches: IMiddlewareRouteConfig[] = [],
  parentPath = ''
): IMiddlewareRouteConfig[] {
  middlewareRoutes.forEach(route => {
    const { middlewares } = route;
    let tempPath = path.join(parentPath, route.path);

    if (middlewares) {
      branches.push({
        path: tempPath,
        middlewares
      });
    }
  });
  return branches;
}

export function serializeMiddlewareRoutes(
  middlewareRoutes: IMiddlewareRouteConfig[],
  parentPath = ''
): string {
  let tempMiddlewareRoutes = flattenMiddlewareRoutes(
    middlewareRoutes,
    [],
    path.resolve('/', parentPath)
  );
  let rankMiddlewareRoutes = tempMiddlewareRoutes.map(
    middlewareRoute =>
      [middlewareRoute.path, middlewareRoute] as [
        string,
        typeof middlewareRoute
      ]
  );
  rankMiddlewareRoutes = rankRouteBranches(rankMiddlewareRoutes);
  tempMiddlewareRoutes = rankMiddlewareRoutes.map(
    middlewareRoute => middlewareRoute[1]
  );
  let res = '';
  for (let index = 0; index < tempMiddlewareRoutes.length; index++) {
    const { middlewares, path } = tempMiddlewareRoutes[index];
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

export function normalizeMiddlewareRoutes(
  middlewareRoutes: IMiddlewareRouteConfig[],
  option: { pagesDir: string }
): IMiddlewareRouteConfig[] {
  const res: IMiddlewareRouteConfig[] = [];
  for (let index = 0; index < middlewareRoutes.length; index++) {
    const middlewareRoute = { ...middlewareRoutes[index] };
    if (middlewareRoute.middlewares) {
      middlewareRoute.middlewares = middlewareRoute.middlewares.map(
        middleware => {
          const absPath = path.isAbsolute(middleware)
            ? middleware
            : path.resolve(option.pagesDir, middleware);

          middleware = absPath.replace(/\\/g, '/');
          return middleware;
        }
      );
    }

    res.push(middlewareRoute);
  }

  return res;
}

export function getRoutesContentFromRawRoutes(
  rawRoutes: IMiddlewareRouteConfig[],
  pagesDir: string
): string {
  const normalizedRoutes = normalizeMiddlewareRoutes(rawRoutes, {
    pagesDir
  });
  const serialized = serializeMiddlewareRoutes(normalizedRoutes);
  return `export default ${serialized}`;
}
