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
        routes.push({
          path: prefix + '/' + rawRoute.segment,
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

type MiddlewareRecord = {
  middlewares?: string[];
  path: string;
  children?: MiddlewareRecord[];
};

export const getMiddlewareRoutes = async (dirname: string) => {
  const { rawRoutes, warnings, errors } = await getRawRoutesFromDir(dirname);
  const allowTypes = ['dir', 'page', 'layout'];
  //const rootMiddleware = rawRoutes.find(route => route.type === 'middleware');
  //const middlewares = rootMiddleware ? [rootMiddleware.filepath] : [];

  const _getMiddlewareRoutes = async (
    rawRoutes: RawRoute[],
    routes: MiddlewareRecord[],
    segment: string,
    parentMiddlewares: string[]
  ) => {
    const currentLevelMiddleware = rawRoutes.find(
      route => route.type === 'middleware'
    );

    const middlewares = currentLevelMiddleware
      ? [...parentMiddlewares, currentLevelMiddleware.filepath]
      : parentMiddlewares;
    const allowedRawRoutes = rawRoutes.filter(route =>
      allowTypes.includes(route.type)
    );
    const hasLayout = allowedRawRoutes.some(route => route.type === 'layout');

    const route = {} as MiddlewareRecord;

    if (hasLayout) {
      route.children = [];
    }

    for (const rawRoute of allowedRawRoutes) {
      if (rawRoute.type === 'page' && hasLayout) {
        route.children!.push({
          path: '',
          middlewares
        });
        continue;
      }

      if (rawRoute.type === 'layout' || rawRoute.type === 'page') {
        let prefix = segment;
        let suffix = rawRoute.segment;
        route.path = `${prefix}${suffix}`;
        routes.push({
          ...route,
          middlewares
        });
        continue;
      }

      if (rawRoute.type === 'dir') {
        const workRoutes = hasLayout ? route.children! : routes;
        const preSegment = hasLayout
          ? ''
          : `${segment}${rawRoute.parentSegment}/`;
        await _getMiddlewareRoutes(
          rawRoute.children,
          workRoutes,
          preSegment,
          middlewares
        );
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

  const exceptionFilter = (e: RouteException) => {
    return e.type === 'middleware';
  };

  return {
    routes,
    warnings: warnings.filter(exceptionFilter),
    errors: errors.filter(exceptionFilter)
  };
};

// export const getMiddlewareRoutes = async (dir: string) => {
//   type MiddlewareRecord = {
//     middlewares?: string[];
//     path: string;
//     children?: MiddlewareRecord[];
//   };
//   const allowTypes = ['dir', 'page', 'layout','middleware'];
//   const { rawRoutes, errors, warnings } = await getRawRoutesFromDir(dir);
//   const rootMiddleware = rawRoutes.find(route => route.type === 'middleware');
//   const middlewares = rootMiddleware ? [rootMiddleware.filepath] : [];
//   const _getMiddlewareRoutes = (
//     rawRoutes: RawRoute[],
//     routes: MiddlewareRecord[],
//     parentMiddlewares: string[]
//   ) => {
//     const currentLevelMiddleware = rawRoutes.find(
//       route => route.type === 'middleware'
//     );
//     const allowedRawRoutes = rawRoutes.filter(route => allowTypes.includes(route.type));
//     const middlewares = currentLevelMiddleware
//       ? [...parentMiddlewares, currentLevelMiddleware.filepath]
//       : parentMiddlewares;
//     const hasLayout = allowedRawRoutes.some(route => route.type === 'layout');
//
//     const route = {} as IRouteRecord;
//
//     if (hasLayout) {
//       route.children = [];
//     }
//
//     for (const rawRoute of allowedRawRoutes) {
//
//     }
//
//     return routes;
//   };
//
//   const routes = _getMiddlewareRoutes(rawRoutes, [], middlewares);
//   const filterException = (e: RouteException) => e.type === 'middleware';
//
//   return {
//     routes,
//     errors: errors.filter(filterException),
//     warnings: warnings.filter(filterException)
//   };
// };

// const routes = [
//   {
//     path: '/about',
//     middlewares: [
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js'
//     ],
//     filepath:
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/about.js'
//   },
//   {
//     path: '/default-head',
//     middlewares: [
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js'
//     ],
//     filepath:
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/default-head.js'
//   },
//   {
//     path: '/head',
//     middlewares: [
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js'
//     ],
//     filepath:
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/head.js'
//   },
//   {
//     path: '/hmr',
//     middlewares: [
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js'
//     ],
//     children: [
//       {
//         path: '/one',
//         middlewares: [
//           '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js'
//         ],
//         filepath:
//           '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/hmr/one.js'
//       },
//       {
//         path: '/two',
//         middlewares: [
//           '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js'
//         ],
//         filepath:
//           '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/hmr/two.js'
//       }
//     ]
//   },
//   {
//     path: '/',
//     middlewares: [
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js'
//     ],
//     filepath:
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/index.js'
//   },
//   {
//     path: '/lazy-compile',
//     middlewares: [
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js'
//     ],
//     filepath:
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/lazy-compile.js'
//   },
//   {
//     path: '/middleware',
//     middlewares: [
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js'
//     ],
//     children: [
//       {
//         path: '/:local',
//         middlewares: [
//           '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js'
//         ],
//         children: [
//           {
//             path: '/:name',
//             middlewares: [
//               '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js',
//               '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/_middleware.js'
//             ],
//             children: [
//               {
//                 path: '/',
//                 middlewares: [
//                   '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js',
//                   '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/_middleware.js',
//                   '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/[name]/_middleware.js'
//                 ],
//                 filepath:
//                   '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/[name]/index.js'
//               },
//               {
//                 path: '/name',
//                 middlewares: [
//                   '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js',
//                   '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/_middleware.js',
//                   '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/[name]/_middleware.js'
//                 ],
//                 filepath:
//                   '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/[name]/name.js'
//               }
//             ]
//           },
//           {
//             path: '/deep',
//             middlewares: [
//               '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js',
//               '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/_middleware.js'
//             ],
//             children: [
//               {
//                 path: '/:other*',
//                 middlewares: [
//                   '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js',
//                   '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/_middleware.js',
//                   '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/deep/_middleware.js'
//                 ],
//                 children: [
//                   {
//                     path: '/',
//                     middlewares: [
//                       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js',
//                       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/_middleware.js',
//                       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/deep/_middleware.js',
//                       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/deep/[[...other]]/_middleware.js'
//                     ],
//                     filepath:
//                       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/deep/[[...other]]/index.js'
//                   }
//                 ]
//               }
//             ]
//           },
//           {
//             path: '/',
//             middlewares: [
//               '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js',
//               '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/_middleware.js'
//             ],
//             filepath:
//               '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/index.js'
//           },
//           {
//             path: '/login',
//             middlewares: [
//               '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js',
//               '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/_middleware.js'
//             ],
//             filepath:
//               '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/middleware/[local]/login.js'
//           }
//         ]
//       }
//     ]
//   },
//   {
//     path: '/overwrite-default-head',
//     middlewares: [
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js'
//     ],
//     filepath:
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/overwrite-default-head.js'
//   },
//   {
//     path: '/process-env',
//     middlewares: [
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js'
//     ],
//     filepath:
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/process-env.js'
//   },
//   {
//     path: '/query',
//     middlewares: [
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js'
//     ],
//     filepath:
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/query.js'
//   },
//   {
//     path: '/redirect',
//     middlewares: [
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/_middleware.js'
//     ],
//     filepath:
//       '/Users/ives/workspace/shuvi-fork/shuvi/test/fixtures/basic/src/pages/redirect.js'
//   }
// ];
