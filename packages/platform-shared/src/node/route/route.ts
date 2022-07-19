import { basename, extname, join, dirname, relative } from 'path';
import { isDirectory } from '@shuvi/utils/lib/file';
import {
  IUserRouteConfig,
  IApiRouteConfig,
  IMiddlewareRouteConfig
} from '@shuvi/service';
import {
  getAllowFilesAndDirs,
  hasAllowFiles,
  isIgnore,
  normalize,
  sortRoutes,
  SupportFileType
} from './helpers';

export type IPageRouteConfig = IUserRouteConfig;

export type { IApiRouteConfig, IMiddlewareRouteConfig };

interface RawFileRoute {
  kind: 'file';
  type: SupportFileType;
  name: string;
  segment: string;
  filepath: string;
}

export interface RawDirRoute {
  kind: 'dir';
  filepath: string;
  segment: string;
  parentSegment: string;
  children: (RawFileRoute | RawDirRoute)[];
}

export type RawRoute = RawFileRoute | RawDirRoute;

export interface RouteException {
  type: SupportFileType | 'dir';
  msg: string;
}

export interface RouteResult<T> {
  warnings: RouteException[];
  errors: RouteException[];
  routes: T[];
}

export type RawRoutes = RouteResult<RawRoute>;
export type PageRoutes = RouteResult<IPageRouteConfig>;
export type ApiRoutes = RouteResult<IApiRouteConfig>;
export type MiddlewareRoutes = RouteResult<IMiddlewareRouteConfig>;
export type RouteConfigType =
  | IPageRouteConfig
  | IApiRouteConfig
  | IMiddlewareRouteConfig;

export const getRawRoutesFromDir = async (
  dirname: string,
  ignoreRouteFiles?: string[]
): Promise<RawRoutes> => {
  const rootDirname = dirname;
  if (!(await isDirectory(rootDirname))) {
    return {
      routes: [],
      warnings: [],
      errors: []
    };
  }

  const warnings: RouteException[] = [];
  const errors: RouteException[] = [];
  const _getRawRoutesFromDir = async (
    dirname: string,
    rawRoutes: RawRoute[],
    segment: string
  ) => {
    const files = await getAllowFilesAndDirs(dirname);
    const onlyHasDir = !hasAllowFiles(files);

    if (!files.length) {
      warnings.push({
        type: 'dir',
        msg: `${dirname} is empty dir!`
      });
    }

    for (const file of files) {
      const filepath = join(dirname, file);
      const relativePath = relative(rootDirname, filepath);

      if (Array.isArray(ignoreRouteFiles) && ignoreRouteFiles?.length) {
        const needIgnore = isIgnore(ignoreRouteFiles, relativePath);

        if (needIgnore) {
          continue;
        }
      }

      const isDir = await isDirectory(filepath);

      if (isDir) {
        if (onlyHasDir) {
          // only indent segment,routes was in same level.
          await _getRawRoutesFromDir(filepath, rawRoutes, `${segment}/${file}`);
          continue;
        }

        const rawRoute: RawDirRoute = {
          kind: 'dir',
          filepath,
          segment: normalize(file).replace(/^\//, ''),
          parentSegment: normalize(segment).replace(/^\//, ''),
          children: []
        };

        await _getRawRoutesFromDir(filepath, rawRoute.children, file);
        rawRoutes.push(rawRoute);

        continue;
      }

      const ext = extname(file);
      const type = basename(file, ext) as SupportFileType;
      rawRoutes.push({
        kind: 'file',
        name: file,
        segment: normalize(segment),
        filepath,
        type
      });
    }
    return rawRoutes;
  };
  let routes = await _getRawRoutesFromDir(dirname, [], '');

  // if (Array.isArray(ignoreRouteFiles) && ignoreRouteFiles.length) {
  //   routes = ignoreRoutes(dirname, ignoreRouteFiles, routes);
  // }

  return {
    routes,
    warnings,
    errors
  };
};

export const getPageRoutes = async (
  dirname: string,
  ignoredRouteFiles?: string[]
): Promise<PageRoutes> => {
  const {
    routes: rawRoutes,
    warnings,
    errors
  } = await getRawRoutesFromDir(dirname, ignoredRouteFiles);

  const _getPageRoutes = (
    rawRoutes: RawRoute[],
    routes: IPageRouteConfig[],
    segment = ''
  ) => {
    const layoutRoute = rawRoutes.some(
      route => route.kind === 'file' && route.type === 'layout'
    );
    const route = {} as IPageRouteConfig;

    if (layoutRoute) {
      route.children = [];
    }

    for (const rawRoute of rawRoutes) {
      if (rawRoute.kind === 'dir') {
        const workRoutes = layoutRoute ? route.children! : routes;
        const preSegment = layoutRoute
          ? ''
          : `${segment}${rawRoute.parentSegment}/`;
        _getPageRoutes(rawRoute.children, workRoutes, preSegment);
      } else if (rawRoute.type === 'page' || rawRoute.type === 'layout') {
        if (rawRoute.type === 'page' && layoutRoute) {
          route.children!.push({
            path: '',
            component: rawRoute.filepath
          });
        } else {
          let prefix = segment;
          let suffix = rawRoute.segment;

          route.component = rawRoute.filepath;
          route.path = `${prefix}${suffix}`;

          routes.push({
            ...route
          });
        }
      }
    }

    return routes;
  };

  let routes = sortRoutes(_getPageRoutes(rawRoutes, []));

  routes.forEach(route => {
    if (!route.path.startsWith('/')) {
      route.path = `/${route.path}`;
    }
  });

  return {
    routes,
    warnings,
    errors
  };
};

export const getApiRoutes = async (
  dir: string,
  ignoredRouteFiles?: string[]
): Promise<ApiRoutes> => {
  const getConflictWaring = (
    rawRoute: RawRoute,
    conflictRawRoute: RawRoute
  ) => {
    return `Find both ${basename(conflictRawRoute.filepath)} and ${basename(
      rawRoute.filepath
    )} in "${dirname(rawRoute.filepath)}"!, only "${basename(
      conflictRawRoute.filepath
    )}" is used.`;
  };

  const {
    routes: rawRoutes,
    warnings,
    errors
  } = await getRawRoutesFromDir(dir, ignoredRouteFiles);

  const _getApiRoutes = (
    rawRoutes: RawRoute[],
    routes: IApiRouteConfig[],
    prefix: string = ''
  ) => {
    const page = rawRoutes.find(
      route => route.kind === 'file' && route.type === 'page'
    );
    const layout = rawRoutes.find(
      route => route.kind === 'file' && route.type === 'layout'
    );
    const allowedRoutes = rawRoutes.filter(
      route => route.kind === 'dir' || route.type === 'api'
    );

    for (let rawRoute of allowedRoutes) {
      prefix = prefix === '/' ? '' : prefix;

      if (rawRoute.kind === 'dir') {
        _getApiRoutes(
          rawRoute.children,
          routes,
          prefix + '/' + rawRoute.parentSegment
        );
        continue;
      }
      if (rawRoute.type === 'api') {
        if (layout) {
          warnings.push({
            type: 'api',
            msg: getConflictWaring(rawRoute, layout)
          });
          continue;
        }

        if (page) {
          warnings.push({
            type: 'api',
            msg: getConflictWaring(rawRoute, page)
          });
          continue;
        }

        let path = prefix + '/' + rawRoute.segment;
        if (path === '//') {
          path = '/';
        }

        routes.push({
          path,
          api: rawRoute.filepath
        });
      }
    }
    return routes;
  };

  const routes = sortRoutes(_getApiRoutes(rawRoutes, [], ''));

  const filterException = (e: RouteException) => e.type === 'api';

  return {
    routes,
    warnings: warnings.filter(filterException),
    errors: errors.filter(filterException)
  };
};

export const getMiddlewareRoutes = async (
  dirname: string,
  ignoredRouteFiles?: string[]
): Promise<MiddlewareRoutes> => {
  const {
    routes: rawRoutes,
    warnings,
    errors
  } = await getRawRoutesFromDir(dirname, ignoredRouteFiles);

  const _getMiddlewareRoutes = (
    rawRoutes: RawRoute[],
    routes: IMiddlewareRouteConfig[],
    segment: string
  ) => {
    segment = segment === '/' ? '' : segment;

    for (const rawRoute of rawRoutes) {
      if (rawRoute.kind === 'dir') {
        _getMiddlewareRoutes(
          rawRoute.children,
          routes,
          segment + '/' + rawRoute.parentSegment
        );
        continue;
      }

      if (rawRoute.type === 'middleware') {
        let path = segment + '/' + rawRoute.segment;
        let catchAllOp = '/*';

        if (path === '//') {
          path = '/';
        }

        if (path === '/') {
          catchAllOp = catchAllOp.slice(1);
        }

        routes.push({
          path: path + catchAllOp,
          middleware: rawRoute.filepath
        });
      }
    }

    return routes;
  };

  let routes = sortRoutes(_getMiddlewareRoutes(rawRoutes, [], ''));

  routes.forEach(route => {
    if (!route.path.startsWith('/')) {
      route.path = `/${route.path}`;
    }
  });

  const exceptionFilter = (e: RouteException) => e.type === 'middleware';

  return {
    routes,
    warnings: warnings.filter(exceptionFilter),
    errors: errors.filter(exceptionFilter)
  };
};
