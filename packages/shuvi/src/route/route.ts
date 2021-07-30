import { join, relative } from 'path';
import fs from 'fs';
import eventEmitter from '@shuvi/utils/lib/eventEmitter';
import { watch } from '@shuvi/utils/lib/fileWatcher';
import { recursiveReadDir } from '@shuvi/utils/lib/recursiveReaddir';
import { IRouteRecord } from '@shuvi/router';

export type SubscribeFn = (v: IRouteRecord[]) => void;

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
  private _filesDir: string;
  private _unwatch: any;
  private _ignoreLayout: boolean = false;
  private _event = eventEmitter();

  constructor(filesDir: string, ignoreLayout: boolean) {
    this._filesDir = filesDir;
    this._ignoreLayout = ignoreLayout;
  }

  async getRoutes(): Promise<IRouteRecord[]> {
    if (!fs.existsSync(this._filesDir)) {
      return [];
    }
    const files = await recursiveReadDir(this._filesDir, {
      filter: filterRouteFile
    });
    return this._getRoutes(files);
  }

  subscribe(listener: SubscribeFn) {
    this._event.on('change', listener);
    if (!this._unwatch) {
      this._unwatch = this._createWatcher();
    }
  }

  private _getRoutes(files: string[]): IRouteRecord[] {
    const transformedFiles = transformFilesObject(files, this._ignoreLayout);

    const generateRoute = (
      fileToTransform: IFilesObject,
      pageDirectory: string,
      ignoreLayout: boolean
    ) => {
      const routes: IRouteRecord[] = [];
      Object.entries(fileToTransform).forEach(
        ([fileName, nestedRoute], _, arr) => {
          let route: IRouteRecord;
          let routePath = normalizeRoutePath(normalizeFilePath(fileName));
          {
            const isDirectory = Object.values(nestedRoute).length > 0;

            route = {
              path: routePath
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
                ignoreLayout
              ); // inner directory
            } else {
              route.filepath = join(pageDirectory, fileName);
            }
            routes.push(route);
          }
        }
      );
      return routes;
    };

    return generateRoute(transformedFiles, this._filesDir, this._ignoreLayout);
  }

  private async _createWatcher() {
    // watcher won't trigger the initial event
    // so we fire the initial event manually.
    const initialRoutes = await this.getRoutes();
    this._event.emit('change', initialRoutes);

    return watch(
      { directories: [this._filesDir] },
      ({ changes, removals, getAllFiles }) => {
        const files: string[] = [];
        const rawFiles = getAllFiles();
        for (let index = 0; index < rawFiles.length; index++) {
          const absPath = rawFiles[index];
          const relativePath = relative(this._filesDir, absPath);
          if (filterRouteFile(relativePath)) {
            files.push(relativePath);
          }
        }
        this._event.emit('change', this._getRoutes(files));
      }
    );
  }
}
