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

export function getPageRoutes(
  routes: IRouteRecord[],
  options: { pagesDir: string }
): IUserRouteConfig[] {
  const res: IUserRouteConfig[] = [];
  for (let index = 0; index < routes.length; index++) {
    const { path: routePath, filepath, children } = routes[index];
    const route = {
      path: routePath
    } as IUserRouteConfig;

    if (filepath) {
      const absPath = path.isAbsolute(filepath)
        ? filepath
        : path.resolve(options.pagesDir, filepath);
      route.component = absPath.replace(/\\/g, '/');
    }

    if (children && children.length > 0) {
      route.children = getPageRoutes(children, options);
    }

    res.push(route);
  }
  return res;
}

export function getMiddlewareRoutes(
  routes: IRouteRecord[],
  { pagesDir }: { pagesDir: string }
): IMiddlewareRouteConfig[] {
  const middlewareRoutes = flattenRoutes(routes) as (IRouteRecord & {
    middlewares: string[];
  })[];
  const res: IMiddlewareRouteConfig[] = [];

  for (let index = 0; index < middlewareRoutes.length; index++) {
    const route = middlewareRoutes[index];
    const middlewares = route.middlewares.map(middleware => {
      const absPath = path.isAbsolute(middleware)
        ? middleware
        : path.resolve(pagesDir, middleware);

      middleware = absPath.replace(/\\/g, '/');
      return middleware;
    });

    res.push({
      path: route.path,
      middlewares
    });
  }

  return res;
}

export function getApiRoutes(
  routes: IRouteRecord[],
  { apisDir }: { apisDir: string }
): IApiRouteConfig[] {
  return flattenRoutes(routes).map(route => {
    const absPath = path.isAbsolute(route.filepath)
      ? route.filepath
      : path.resolve(apisDir, route.filepath);

    const apiModule = absPath.replace(/\\/g, '/');

    return {
      path: route.path,
      apiModule
    };
  });
}

function createServerRoutes(
  tempPageRoutes: IRouteRecord[],
  tempApiRoutes: IRouteRecord[],
  options: RouteOptions
): ServerRoutes {
  const pageRoutes = getPageRoutes(tempPageRoutes, {
    pagesDir: options.pagesDir
  });
  const middlewareRoutes = getMiddlewareRoutes(tempPageRoutes, {
    pagesDir: options.pagesDir
  });
  const apiRoutes = getApiRoutes(tempApiRoutes, { apisDir: options.apisDir });

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
  return createServerRoutes(tempPageRoutes, tempApiRoutes, options);
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
      const res = createServerRoutes(routes, [], options);
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
      const res = createServerRoutes(routes, [], options);
      cb({
        apiRoutes: res.apiRoutes
      });
    }
  );
}
