import { basename, extname, join, dirname } from 'path';
import {
  getAllowFilesAndDirs,
  hasAllowFiles,
  normalize,
  SupportFileType
} from './helpers';

import type { IRouteRecord } from '@shuvi/router';
import { isDirectory } from '@shuvi/utils/lib/file';

interface RawFileRoute {
  type: SupportFileType;
  segment: string;
  name: string;
  filepath: string;
}

interface RawDirRoute {
  type: 'dir';
  filepath: string;
  segment: string;
  parentSegment: string;
  children: (RawFileRoute | RawDirRoute)[];
}

type RawRoute = RawFileRoute | RawDirRoute;

export type RouteException = {
  type: SupportFileType | 'dir';
  msg: string;
};

export const getRawRoutesFromDir = async (dirname: string) => {
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
      const isDir = await isDirectory(filepath);

      if (isDir) {
        if (onlyHasDir) {
          // only indent segment,routes was in same level.
          await _getRawRoutesFromDir(filepath, rawRoutes, `${segment}/${file}`);
          continue;
        }

        const rawRoute: RawDirRoute = {
          type: 'dir',
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
        name: file,
        segment: normalize(segment),
        filepath,
        type
      });
    }
    return rawRoutes;
  };
  const rawRoutes = await _getRawRoutesFromDir(dirname, [], '');
  return {
    rawRoutes,
    warnings,
    errors
  };
};

export const getApiRoutes = async (dir: string) => {
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

  const { rawRoutes, warnings, errors } = await getRawRoutesFromDir(dir);
  const allowTypes = ['api', 'dir'];

  const _getApiRoutes = (
    rawRoutes: RawRoute[],
    routes: IRouteRecord[],
    prefix: string = ''
  ) => {
    const page = rawRoutes.find(route => route.type === 'page');
    const layout = rawRoutes.find(route => route.type === 'layout');
    const allowedRoutes = rawRoutes.filter(route =>
      allowTypes.includes(route.type)
    );

    for (let rawRoute of allowedRoutes) {
      prefix = prefix === '/' ? '' : prefix;

      if (rawRoute.type === 'dir') {
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
          filepath: rawRoute.filepath
        });
      }
    }
    return routes;
  };

  const routes = _getApiRoutes(rawRoutes, [], '');
  const filterException = (e: RouteException) => e.type === 'api';

  return {
    routes,
    warnings: warnings.filter(filterException),
    errors: errors.filter(filterException)
  };
};

export const getPageAndLayoutRoutes = async (dirname: string) => {
  const { rawRoutes, warnings, errors } = await getRawRoutesFromDir(dirname);
  const allowTypes = ['dir', 'page', 'layout'];

  const _getPageAndLayoutRoutes = async (
    rawRoutes: RawRoute[],
    routes: IRouteRecord[],
    segment = ''
  ) => {
    const allowedRawRoutes = rawRoutes.filter(route =>
      allowTypes.includes(route.type)
    );
    const hasLayout = allowedRawRoutes.some(route => route.type === 'layout');

    const route = {} as IRouteRecord;

    if (hasLayout) {
      route.children = [];
    }

    for (const rawRoute of allowedRawRoutes) {
      if (rawRoute.type === 'page' && hasLayout) {
        route.children!.push({
          path: '',
          component: rawRoute.filepath
        });
        continue;
      }

      if (rawRoute.type === 'layout' || rawRoute.type === 'page') {
        let prefix = segment;
        let suffix = rawRoute.segment;

        route.component = rawRoute.filepath;
        route.path = `${prefix}${suffix}`;

        routes.push({
          ...route
        });
        continue;
      }

      if (rawRoute.type === 'dir') {
        const workRoutes = hasLayout ? route.children! : routes;
        const preSegment = hasLayout
          ? ''
          : `${segment}${rawRoute.parentSegment}/`;
        await _getPageAndLayoutRoutes(
          rawRoute.children,
          workRoutes,
          preSegment
        );
      }
    }

    return routes;
  };

  const routes = await _getPageAndLayoutRoutes(rawRoutes, []);

  routes.forEach(route => {
    if (!route.path.startsWith('/')) {
      route.path = `/${route.path}`;
    }
  });

  return {
    routes,
    warnings: warnings.filter(warning => allowTypes.includes(warning.type)),
    errors: errors.filter(error => allowTypes.includes(error.type))
  };
};

export type MiddlewareRecord = {
  middlewares: string[];
  path: string;
  children?: MiddlewareRecord[];
};

export const getMiddlewareRoutes = async (dirname: string) => {
  const { rawRoutes, warnings, errors } = await getRawRoutesFromDir(dirname);

  const _getMiddlewareRoutes = async (
    rawRoutes: RawRoute[],
    routes: MiddlewareRecord[],
    segment: string,
    parentMiddlewares: string[]
  ) => {
    segment = segment === '/' ? '' : segment;

    const currentLevelMiddleware = rawRoutes.find(
      route => route.type === 'middleware'
    );

    const middlewares = currentLevelMiddleware
      ? [...parentMiddlewares, currentLevelMiddleware.filepath]
      : parentMiddlewares;

    const hasLayout = rawRoutes.some(route => route.type === 'layout');
    const hasPage = rawRoutes.some(route => route.type === 'page');

    for (const rawRoute of rawRoutes) {
      if (rawRoute.type === 'dir') {
        await _getMiddlewareRoutes(
          rawRoute.children,
          routes,
          //segment + '/' + (rawRoute.parentSegment || rawRoute.segment),
          segment + '/' + rawRoute.parentSegment,
          middlewares
        );
        continue;
      }

      const isPage = rawRoute.type === 'page';
      const isLayout = rawRoute.type === 'layout';
      const isMiddleware = rawRoute.type === 'middleware';
      const onlyHasPage = isPage && !hasLayout;
      const onlyHasMiddleware = isMiddleware && !hasLayout && !hasPage;

      if (isLayout || onlyHasPage || onlyHasMiddleware) {
        if (middlewares.length) {
          let path = segment + '/' + rawRoute.segment;
          if (path === '//') {
            path = '/';
          }
          routes.push({
            path,
            middlewares
          });
        }
      }
    }

    return routes;
  };

  const routes = await _getMiddlewareRoutes(rawRoutes, [], '', []);
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
