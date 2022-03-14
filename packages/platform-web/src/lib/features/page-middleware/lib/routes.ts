import path from 'path';
import { IRouteRecord, rankRouteBranches } from '@shuvi/router';

export interface IMiddlewareRouteConfig {
  path: string;
  children?: IMiddlewareRouteConfig[];
  middlewares: string[];
}

type IMiddlewareRouteHandlerWithoutChildren = Omit<
  IMiddlewareRouteConfig,
  'children'
>;

function flattenMiddlewareRoutes(
  middlewareRoutes: IMiddlewareRouteConfig[],
  branches: IMiddlewareRouteHandlerWithoutChildren[] = [],
  parentPath = ''
): IMiddlewareRouteHandlerWithoutChildren[] {
  middlewareRoutes.forEach(route => {
    const { children, middlewares } = route;
    let tempPath = path.join(parentPath, route.path);

    if (children) {
      flattenMiddlewareRoutes(children, branches, tempPath);
    }
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
  let rankmiddlewareRoutes = tempMiddlewareRoutes.map(
    middlewareRoute =>
      [middlewareRoute.path, middlewareRoute] as [
        string,
        typeof middlewareRoute
      ]
  );
  rankmiddlewareRoutes = rankRouteBranches(rankmiddlewareRoutes);
  tempMiddlewareRoutes = rankmiddlewareRoutes.map(
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

export function pickMiddlewareAndPath(
  middlewareRoutes: IRouteRecord[]
): IMiddlewareRouteConfig[] {
  const res: IMiddlewareRouteConfig[] = [];
  for (let index = 0; index < middlewareRoutes.length; index++) {
    const { path, middlewares, children } = middlewareRoutes[
      index
    ] as IRouteRecord & { middlewares: any };
    const route = {
      path
    } as IMiddlewareRouteConfig;

    if (middlewares) {
      route.middlewares = middlewares;
    }

    if (children && children.length > 0) {
      route.children = pickMiddlewareAndPath(children);
    }
    res.push(route);
  }
  return res;
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

    if (middlewareRoute.children && middlewareRoute.children.length > 0) {
      middlewareRoute.children = normalizeMiddlewareRoutes(
        middlewareRoute.children,
        option
      );
    }
    res.push(middlewareRoute);
  }

  return res;
}

export function getRoutesContentFromRawRoutes(
  rawRoutes: IRouteRecord[],
  pagesDir: string
): string {
  const middlewareRoutes = pickMiddlewareAndPath(rawRoutes);
  const normalizedRoutes = normalizeMiddlewareRoutes(middlewareRoutes, {
    pagesDir
  });
  const serialized = serializeMiddlewareRoutes(normalizedRoutes);
  const content = `export default ${serialized}`;
  return content;
}
