import { join, relative } from 'path';
import fs from 'fs';
import { watch } from '@shuvi/utils/lib/fileWatcher';
import { recursiveReadDir } from '@shuvi/utils/lib/recursiveReaddir';
import { IRouteRecord } from '@shuvi/platform-core';
import parseDynamicPath from './parseDynamicPath';

export type SubscribeFn = (v: IRouteRecord[]) => void;

const jsExtensions = ['js', 'jsx', 'ts', 'tsx'];

const RouteFileRegExp = new RegExp(`\\.(?:${jsExtensions.join('|')})$`);

const MIDDLEWAREFILE = '_middleware.js';
function isLayout(filepath: string) {
  return filepath.endsWith('/_layout');
}

interface IFilesObject {
  [file: string]: IFilesObject;
}

/**
 * This method transform files into a nested hash object of each file level.`
 * Example ['/a/1', '/a/2', '/b/1'] will become
 * { a: { 1: {}, 2: {} }, b: { 1: {} } }
 * */
const transformFilesObject = (
  files: string[],
  ignoreLayout: boolean
): IFilesObject => {
  return files.reduce((acc, file) => {
    file
      .split('/')
      .filter(Boolean)
      .forEach((route, index, arr) => {
        let objToTraverse = acc;

        if (
          index === 0 &&
          !ignoreLayout &&
          normalizeFilePath(route) === '/_layout'
        ) {
          console.warn(
            'Top level _layout is not supported and will be ignored.'
          );
        } else {
          for (let i = 0; i < index; i++) {
            objToTraverse = objToTraverse[arr[i]];
          }

          if (objToTraverse && objToTraverse[route]) {
            objToTraverse[route] = {
              ...objToTraverse[route]
            };
          } else {
            objToTraverse[route] = {};
          }
        }
      });
    return acc;
  }, {} as IFilesObject);
};

function normalizeFilePath(filepath: string) {
  const res = filepath
    // Remove the file extension from the end
    .replace(/\.\w+$/, '')
    // Convert to unix path
    .replace(/\\/g, '/');

  return res.charAt(0) !== '/' ? '/' + res : res;
}

function normalizeRoutePath(rawPath: string) {
  // /xxxx/index -> /xxxx/
  let routePath = rawPath.replace(/\/index$/, '/');

  // remove the last slash
  // e.g. /abc/ -> /abc
  if (routePath !== '/' && routePath.slice(-1) === '/') {
    routePath = routePath.slice(0, -1);
  }

  routePath = parseDynamicPath(routePath);

  return routePath;
}

function filterRouteFile(name: string) {
  if (name.charAt(0) === '.') return false;

  return RouteFileRegExp.test(name);
}

export interface RouteOptions {
  dir: string;
  ignoreLayout: boolean;
}

function createRoutes(
  files: string[],
  { dir, ignoreLayout }: RouteOptions
): IRouteRecord[] {
  const transformedFiles = transformFilesObject(files, ignoreLayout);

  const generateRoute = (
    fileToTransform: IFilesObject,
    pageDirectory: string,
    ignoreLayout: boolean,
    middlewareArr: string[]
  ) => {
    const routes: IRouteRecord[] = [];
    const hasMiddleware = !!fileToTransform[MIDDLEWAREFILE];
    if (hasMiddleware) {
      delete fileToTransform[MIDDLEWAREFILE];
      const middlewarePath = join(pageDirectory, MIDDLEWAREFILE);
      middlewareArr.push(middlewarePath);
    }
    Object.entries(fileToTransform).forEach(
      ([fileName, nestedRoute], _, arr) => {
        let route: IRouteRecord;
        let routePath = normalizeRoutePath(normalizeFilePath(fileName));
        const isDirectory = Object.values(nestedRoute).length > 0;
        route = {
          path: routePath,
          middlewares: middlewareArr
        } as IRouteRecord;

        // if a directory have _layout, treat it as its own source
        if (isDirectory) {
          if (!ignoreLayout) {
            const layoutFile = Object.keys(nestedRoute).find(route =>
              isLayout(normalizeRoutePath(normalizeFilePath(route)))
            );
            if (layoutFile) {
              route.filepath = join(pageDirectory, fileName, layoutFile);
              // delete _layout
              delete nestedRoute[layoutFile];
            }
          }
          route.children = generateRoute(
            nestedRoute,
            join(pageDirectory, fileName),
            ignoreLayout,
            middlewareArr.slice()
          ); // inner directory
        } else {
          route.filepath = join(pageDirectory, fileName);
        }
        routes.push(route);
      }
    );
    return routes;
  };

  return generateRoute(transformedFiles, dir, ignoreLayout, []);
}

export async function getRoutes(
  options: RouteOptions
): Promise<IRouteRecord[]> {
  if (!fs.existsSync(options.dir)) {
    return [];
  }

  const files = await recursiveReadDir(options.dir, {
    filter: filterRouteFile
  });

  return createRoutes(files, options);
}

export function watchRoutes(
  options: RouteOptions,
  cb: (routes: IRouteRecord[]) => void
) {
  return watch(
    { directories: [options.dir] },
    ({ changes, removals, getAllFiles }) => {
      const files: string[] = [];
      const rawFiles = getAllFiles();
      for (let index = 0; index < rawFiles.length; index++) {
        const absPath = rawFiles[index];
        const relativePath = relative(options.dir, absPath);
        if (filterRouteFile(relativePath)) {
          files.push(relativePath);
        }
      }
      cb(createRoutes(files, options));
    }
  );
}
