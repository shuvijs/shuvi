import path from 'path';
import { IRouteRecord } from '@shuvi/platform-core';
import {
  getRoutes as getFileSystemsRoutes,
  watchRoutes as watchFileSystemsRoutes
} from './file-system-route';
import {
  IUserRouteConfig,
  IMiddlewareRouteConfig,
  IApiRouteConfig
} from '../server';

export interface RouteOptions {
  pagesDir: string;
  apisDir: string;
}

export interface ServerRoutes {
  middlewareRoutes: IMiddlewareRouteConfig[];
  pageRoutes: IUserRouteConfig[];
  apiRoutes: IApiRouteConfig[];
}

function flattenRoutes(
  routes: IRouteRecord[]
): Omit<IRouteRecord, 'children'>[] {
  const res: Omit<IRouteRecord, 'children'>[] = [];
  const _flatten = (
    routes: IRouteRecord[],
    parentPath: string,
    col: Omit<IRouteRecord, 'children'>[]
  ) => {
    for (let index = 0; index < routes.length; index++) {
      const route = routes[index];
      const curPath = path.join(parentPath, route.path);
      if (route.children) {
        _flatten(route.children, curPath, col);
      }
      col.push({
        ...route,
        path: curPath
      });
    }
  };
  _flatten(routes, '/', res);
  return res;
}

function tranformRoutes<T extends { children?: T[] }>(
  routes: IRouteRecord[],
  transform: (route: IRouteRecord) => T
): T[] {
  const res: T[] = [];
  for (let index = 0; index < routes.length; index++) {
    const route = routes[index];
    const transformedRoute = transform(route);

    if (route.children && route.children.length > 0) {
      transformedRoute.children = tranformRoutes<T>(route.children, transform);
    }
    res.push(transformedRoute);
  }
  return res;
}

export function getPageRoutes(routes: IRouteRecord[]): IUserRouteConfig[] {
  const res: IUserRouteConfig[] = [];
  for (let index = 0; index < routes.length; index++) {
    const { path, filepath, children } = routes[index];
    const route = {
      path
    } as IUserRouteConfig;

    if (filepath) {
      route.component = filepath;
    }

    if (children && children.length > 0) {
      route.children = getPageRoutes(children);
    }
    res.push(route);
  }
  return res;
}

export function getMiddlewareRoutes(
  middlewareRoutes: IRouteRecord[]
): IMiddlewareRouteConfig[] {
  const res: IMiddlewareRouteConfig[] = [];

  const _getMiddlewareRoutes = (
    routes: IRouteRecord[],
    parentPath: string,
    col: IMiddlewareRouteConfig[]
  ) => {
    for (let index = 0; index < routes.length; index++) {
      const {
        path: routePath,
        middlewares,
        children
      } = routes[index] as IRouteRecord & {
        middlewares: any;
      };
      const currentPath = path.join(parentPath, routePath);

      if (children && children.length > 0) {
        _getMiddlewareRoutes(children, currentPath, col);
      }

      if (middlewares) {
        res.push({
          path: currentPath,
          middlewares
        });
      }
    }
  };

  _getMiddlewareRoutes(middlewareRoutes, '/', res);

  return res;
}

function createServerRoutes(
  tempPageRoutes: IRouteRecord[],
  tempApiRoutes: IRouteRecord[]
): ServerRoutes {
  const pageRoutes = getPageRoutes(tempPageRoutes);
  const middlewareRoutes = (
    flattenRoutes(tempPageRoutes) as (IRouteRecord & {
      middlewares: any;
    })[]
  )
    .filter(item => item.middlewares)
    .map(({ path, middlewares }) => {
      return {
        path,
        middlewares
      };
    });
  const apiRoutes = flattenRoutes(tempApiRoutes).map(({ path, filepath }) => {
    return {
      path,
      apiModule: filepath
    };
  });

  return {
    pageRoutes,
    middlewareRoutes,
    apiRoutes
  };
}

export async function getServerRoutes(
  options: RouteOptions
): Promise<ServerRoutes> {
  const tempPageRoutes = await getFileSystemsRoutes({
    dir: options.pagesDir,
    ignoreLayout: false
  });
  const tempApiRoutes = await getFileSystemsRoutes({
    dir: options.apisDir,
    ignoreLayout: true
  });
  return createServerRoutes(tempPageRoutes, tempApiRoutes);
}

export function watchServerRoutes(
  options: RouteOptions,
  cb: (routes: Partial<ServerRoutes>) => void
) {
  watchFileSystemsRoutes(
    {
      dir: options.pagesDir,
      ignoreLayout: false
    },
    routes => {
      const res = createServerRoutes(routes, []);
      cb({
        pageRoutes: res.pageRoutes,
        middlewareRoutes: res.middlewareRoutes
      });
    }
  );
  watchFileSystemsRoutes(
    {
      dir: options.apisDir,
      ignoreLayout: true
    },
    routes => {
      const res = createServerRoutes(routes, []);
      cb({
        apiRoutes: res.apiRoutes
      });
    }
  );
}
