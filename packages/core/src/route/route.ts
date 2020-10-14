import fs from 'fs';
import nodePath from 'path';
import eventEmitter from '@shuvi/utils/lib/eventEmitter';
import { watch } from '@shuvi/utils/lib/fileWatcher';
import { recursiveReadDir } from '@shuvi/utils/lib/recursiveReaddir';
import { join, relative } from 'path';
import { IUserRouteConfig } from '../types';

export type SubscribeFn = (v: IUserRouteConfig[]) => void;
type GetRoutesOptions = { suffix?: string };

const jsExtensions = ['js', 'jsx', 'ts', 'tsx'];

const RouteFileRegExp = new RegExp(`\\.(?:${jsExtensions.join('|')})$`);

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
const transformFilesObject = (files: string[]): IFilesObject => {
  return files.reduce((acc, file) => {
    file
      .split('/')
      .filter(Boolean)
      .forEach((route, index, arr) => {
        let objToTraverse = acc;

        if (index === 0 && normalizeFilePath(route) === '/_layout') {
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

  // /index -> /
  if (routePath === '/index') {
    routePath = '/';
  }

  return routePath;
}

function filterRouteFile(name: string) {
  if (name.charAt(0) === '.') return false;

  return RouteFileRegExp.test(name);
}

export class Route {
  private _pagesDir: string;
  private _unwatch: any;
  private _event = eventEmitter();
  private _options: GetRoutesOptions;

  constructor(pagesDir: string, options: GetRoutesOptions) {
    this._pagesDir = pagesDir;
    this._options = options;
  }

  async getRoutes(): Promise<IUserRouteConfig[]> {
    const { suffix } = this._options;

    let files = await recursiveReadDir(this._pagesDir, {
      filter: filterRouteFile
    });

    // Note: remove the file with `suffix` to prevent exposing
    if (suffix) {
      files = files.filter(f => !f.includes(`.${suffix}.`));
    }

    return this._getRoutes(files);
  }

  subscribe(listener: SubscribeFn) {
    this._event.on('change', listener);
    if (!this._unwatch) {
      this._unwatch = this._createWatcher();
    }
  }

  private _getRoutes(files: string[]): IUserRouteConfig[] {
    const transformedFiles = transformFilesObject(files);

    const generateRoute = (
      fileToTransform: IFilesObject,
      pageDirectory: string
    ) => {
      const routes: IUserRouteConfig[] = [];
      Object.entries(fileToTransform).forEach(
        ([fileName, nestedRoute], _, arr) => {
          let route: IUserRouteConfig;
          let routePath = normalizeRoutePath(normalizeFilePath(fileName));
          {
            const isDirectory = Object.values(nestedRoute).length > 0;

            route = {
              path: routePath
            } as IUserRouteConfig;

            // if a directory have _layout, treat it as its own component
            if (isDirectory) {
              const layoutFile = Object.keys(nestedRoute).find(route =>
                isLayout(normalizeRoutePath(normalizeFilePath(route)))
              );
              if (layoutFile) {
                route.component = join(pageDirectory, fileName, layoutFile);
                // delete _layout
                delete nestedRoute[layoutFile];
              }
              route.children = generateRoute(
                nestedRoute,
                join(pageDirectory, fileName)
              ); // inner directory
            } else {
              route.component = this._resolveWithSuffixFirst(
                join(pageDirectory, fileName)
              );
            }
            routes.push(route);
          }
        }
      );
      return routes;
    };

    return generateRoute(transformedFiles, this._pagesDir);
  }

  private async _createWatcher() {
    // watcher won't trigger the initial event
    // so we fire the initial event manually.
    const initialRoutes = await this.getRoutes();
    this._event.emit('change', initialRoutes);

    return watch(
      { directories: [this._pagesDir] },
      ({ changes, removals, getAllFiles }) => {
        const files: string[] = [];
        const rawFiles = getAllFiles();
        for (let index = 0; index < rawFiles.length; index++) {
          const absPath = rawFiles[index];
          const relativePath = relative(this._pagesDir, absPath);
          if (filterRouteFile(relativePath)) {
            files.push(relativePath);
          }
        }
        this._event.emit('change', this._getRoutes(files));
      }
    );
  }

  private _resolveWithSuffixFirst(path: string): string {
    const { suffix } = this._options;
    if (!suffix) return path;

    const { dir, name, ext } = nodePath.parse(path);
    const absolutePath = `${dir}/${name}.${suffix}${ext}`;
    if (fs.existsSync(absolutePath)) return absolutePath;

    return path;
  }
}
