import { basename, extname, join, dirname, sep } from 'path';
import { isDirectory } from '@shuvi/utils/lib/file';
import {
  IPageRouteConfig,
  IApiRouteConfig,
  IMiddlewareRouteConfig
} from '../../shared';
import {
  getAllowFilesAndDirs,
  hasAllowFiles,
  normalizeRoutePath,
  combineComponents,
  sortRoutes,
  SupportFileType
} from './helpers';
import { matchFile, getFileMatcherPatterns } from './matchSpec';

export type { IPageRouteConfig, IApiRouteConfig, IMiddlewareRouteConfig };

interface RawFileRoute {
  kind: 'file';
  type: SupportFileType;
  filepath: string;
  segment: string;
}

export interface RawDirRoute {
  kind: 'dir';
  filepath: string;
  segment: string;
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
  excludes?: string[]
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
  const routes: RawRoute[] = [];
  const patterns = getFileMatcherPatterns(rootDirname, excludes);
  const visitDirectory = async (
    dirname: string,
    routes: RawRoute[],
    parentDir: string
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
      let filepath = join(dirname, file);
      const isDir = await isDirectory(filepath);
      if (isDir) {
        // transform '/foo' to '/foo/' if `foo` is a dir,
        // this is required for matchFile to wrok properly
        filepath = join(filepath, sep);
      }

      if (!matchFile(filepath, patterns, false)) {
        continue;
      }

      const segment = parentDir === '' ? '/' : normalizeRoutePath(parentDir);
      if (isDir) {
        if (onlyHasDir) {
          // only indent segment,routes was in same level.
          await visitDirectory(filepath, routes, `${parentDir}/${file}`);
        } else {
          const route: RawDirRoute = {
            kind: 'dir',
            filepath,
            segment: segment,
            children: []
          };
          routes.push(route);
          await visitDirectory(filepath, route.children, file);
        }
      } else {
        const ext = extname(file);
        const type = basename(file, ext) as SupportFileType;
        routes.push({
          kind: 'file',
          segment: segment,
          filepath,
          type
        });
      }
    }
  };

  await visitDirectory(rootDirname, routes, '');

  return {
    routes,
    warnings,
    errors
  };
};

export const getPageRoutes = async (
  dir: string | RawRoutes,
  excludes?: string[]
): Promise<PageRoutes> => {
  let raw: RawRoutes;
  if (typeof dir === 'string') {
    raw = await getRawRoutesFromDir(dir, excludes);
  } else {
    raw = dir;
  }
  const { routes: rawRoutes, warnings, errors } = raw;

  const _getPageRoutes = (
    rawRoutes: RawRoute[],
    routes: IPageRouteConfig[],
    parentSegment = ''
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
        const nextSegment = layoutRoute
          ? ''
          : combineComponents(parentSegment, rawRoute.segment);
        _getPageRoutes(rawRoute.children, workRoutes, nextSegment);
      } else if (rawRoute.type === 'page' || rawRoute.type === 'layout') {
        if (rawRoute.type === 'page' && layoutRoute) {
          route.children!.push({
            path: '',
            component: rawRoute.filepath
          });
        } else {
          route.component = rawRoute.filepath;
          route.path = combineComponents(parentSegment, rawRoute.segment);
          routes.push({
            ...route
          });
        }
      }
    }

    return routes;
  };

  const routes = sortRoutes(_getPageRoutes(rawRoutes, []));

  return {
    routes,
    warnings,
    errors
  };
};

export const getApiRoutes = async (
  dir: string | RawRoutes,
  excludes?: string[]
): Promise<ApiRoutes> => {
  let raw: RawRoutes;
  if (typeof dir === 'string') {
    raw = await getRawRoutesFromDir(dir, excludes);
  } else {
    raw = dir;
  }
  const { routes: rawRoutes, warnings, errors } = raw;

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

  const _getApiRoutes = (
    rawRoutes: RawRoute[],
    routes: IApiRouteConfig[],
    parentSegment: string = ''
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
      const currentPath = combineComponents(parentSegment, rawRoute.segment);
      if (rawRoute.kind === 'dir') {
        _getApiRoutes(rawRoute.children, routes, currentPath);
      } else if (rawRoute.type === 'api') {
        if (layout) {
          warnings.push({
            type: 'api',
            msg: getConflictWaring(rawRoute, layout)
          });
        } else if (page) {
          warnings.push({
            type: 'api',
            msg: getConflictWaring(rawRoute, page)
          });
        } else {
          routes.push({
            path: currentPath,
            api: rawRoute.filepath
          });
        }
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
  dir: string | RawRoutes,
  excludes?: string[]
): Promise<MiddlewareRoutes> => {
  let raw: RawRoutes;
  if (typeof dir === 'string') {
    raw = await getRawRoutesFromDir(dir, excludes);
  } else {
    raw = dir;
  }
  const { routes: rawRoutes, warnings, errors } = raw;

  const _getMiddlewareRoutes = (
    rawRoutes: RawRoute[],
    routes: IMiddlewareRouteConfig[],
    parentSegment: string
  ) => {
    for (const rawRoute of rawRoutes) {
      const currentPath = combineComponents(parentSegment, rawRoute.segment);
      if (rawRoute.kind === 'dir') {
        _getMiddlewareRoutes(rawRoute.children, routes, currentPath);
      } else if (rawRoute.type === 'middleware') {
        routes.push({
          // catch all
          path: currentPath.endsWith('/')
            ? `${currentPath}*`
            : `${currentPath}/*`,
          middleware: rawRoute.filepath
        });
      }
    }

    return routes;
  };

  const routes = sortRoutes(_getMiddlewareRoutes(rawRoutes, [], ''));
  const exceptionFilter = (e: RouteException) => e.type === 'middleware';

  return {
    routes,
    warnings: warnings.filter(exceptionFilter),
    errors: errors.filter(exceptionFilter)
  };
};
