import { join, relative, posix } from 'path';
import invariant from '@shuvi/utils/lib/invariant';
import { watch } from '@shuvi/utils/lib/fileWatcher';
import eventEmitter from '@shuvi/utils/lib/eventEmitter';
import { recursiveReadDir } from '@shuvi/utils/lib/recursiveReaddir';
import { IRouteConfig } from '../types';

export type SubscribeFn = (v: IRouteConfig[]) => void;

interface InternalRouteConfig extends IRouteConfig {
  routes?: InternalRouteConfig[];
  __meta: {
    isStaticRoute: boolean;
  };
}

const unixPath = posix;
const jsExtensions = ['js', 'jsx', 'ts', 'tsx'];

const RouteFileRegExp = new RegExp(`\\.(?:${jsExtensions.join('|')})$`);

function isLayout(filepath: string) {
  return filepath.endsWith('/_layout');
}

function isStaicRouter(filepath: string) {
  return unixPath.basename(filepath).charAt(0) !== '$';
}

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

function getRouteWeight(route: InternalRouteConfig): number {
  const meta = route.__meta;
  const weights: [string, string] = ['0', '0'];
  if (meta.isStaticRoute) {
    weights[0] = '1';
  } else if (route.caseSensitive) {
    weights[1] = '1';
  }

  return Number(weights.join(''));
}

function sortRoutes(routes: InternalRouteConfig[]): IRouteConfig[] {
  const res = routes
    .slice()
    .sort((a, b) => getRouteWeight(b) - getRouteWeight(a));
  let paramsRouteNum = 0;
  for (let index = 0; index < res.length; index++) {
    const route = res[index];
    if (!route.__meta.isStaticRoute) {
      paramsRouteNum += 1;
    }
    if (route.routes && route.routes.length > 0) {
      // @ts-ignore
      route.routes = sortRoutes(route.routes);
    }

    delete route.__meta;
  }

  invariant(
    paramsRouteNum <= 1,
    `We should not have multiple dynamic routes under a directory.`
  );

  return res;
}

export class Route {
  private _pagesDir: string;
  private _unwatch: any;
  private _event = eventEmitter();

  constructor(pagesDir: string) {
    this._pagesDir = pagesDir;
  }

  async getRoutes(): Promise<IRouteConfig[]> {
    const files = await recursiveReadDir(this._pagesDir, {
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

  private _getRoutes(files: string[]): IRouteConfig[] {
    const rootRoute = ({
      id: '',
      component: '',
      routes: []
    } as any) as InternalRouteConfig;
    const layouts = new Map<string, InternalRouteConfig>();
    const normalizedFiles: string[] = [];

    const getLayout = (filepath: string) => {
      let layout: InternalRouteConfig | undefined;
      while (filepath && filepath !== '/' && !layout) {
        filepath = filepath.replace(/\/_layout$/, '').replace(/\/[^/]+$/, '');
        layout = layouts.get(`${filepath}/_layout`);
      }
      return layout;
    };

    for (let index = 0; index < files.length; index++) {
      const rawfile = files[index];
      const file = normalizeFilePath(rawfile);
      normalizedFiles.push(file);

      if (file === '/_layout') {
        console.warn('Top level _layout is not supported and will be ignored.');
      } else if (isLayout(file)) {
        const layoutRoute: InternalRouteConfig = {
          path: normalizeRoutePath(file.replace(/\/_layout$/, '/')),
          caseSensitive: false,
          component: join(this._pagesDir, rawfile),
          __meta: {
            isStaticRoute: isStaicRouter(file)
          }
        };
        layouts.set(file, layoutRoute);
      }
    }

    for (let index = 0; index < normalizedFiles.length; index++) {
      const rawFile = files[index];
      const file = normalizedFiles[index];
      const routePath = normalizeRoutePath(file);
      let route: InternalRouteConfig | undefined;
      if (isLayout(file)) {
        route = layouts.get(file);
      } else {
        route = {
          path: routePath,
          caseSensitive: !isLayout(file),
          component: join(this._pagesDir, rawFile),
          __meta: {
            isStaticRoute: isStaicRouter(file)
          }
        };
      }

      if (!route) {
        continue;
      }

      const layout = getLayout(file);
      const parentRoute = layout || rootRoute;
      parentRoute.routes = parentRoute.routes || [];
      parentRoute.routes.push(route);
    }

    return sortRoutes(rootRoute.routes!);
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
}
