import { join, relative, posix } from "path";
import { createHash } from "crypto";
import invariant from "tiny-invariant";
import { RouteConfig } from "@shuvi/types/core";
import { watch } from "@shuvi/utils/lib/fileWatcher";
import eventEmitter from "@shuvi/utils/lib/eventEmitter";
import { recursiveReadDir } from "@shuvi/utils/lib/recursiveReaddir";
import { RouterService, SubscribeFn } from "./types/routeService";

function createId(filepath: string) {
  const id = createHash("md4")
    .update(filepath)
    .digest("hex")
    .substr(0, 4);

  return `page-${id}`;
}

interface InternalRouteConfig extends RouteConfig {
  routes?: InternalRouteConfig[];
  __meta: {
    isStaticRoute: boolean;
  };
}

const unixPath = posix;
const jsExtensions = ["js", "jsx", "ts", "tsx"];

const RouteRegExp = new RegExp(`\\.(?:${jsExtensions.join("|")})$`);

function isLayout(filepath: string) {
  return filepath.endsWith("_layout");
}

function isStaicRouter(filepath: string) {
  return unixPath.basename(filepath).charAt(0) !== "$";
}

function getLayoutFile(filepath: string) {
  return filepath.replace(/\/\w+$/, "/_layout");
}

function normalizeFilePath(filepath: string) {
  const res = filepath
    // Remove the file extension from the end
    .replace(/\.\w+$/, "")
    // Convert to unix path
    .replace(/\\/g, "/");

  return res.charAt(0) !== "/" ? "/" + res : res;
}

function normalizeRoutePath(rawPath: string) {
  // /xxxx/index -> /xxxx/
  let routePath = rawPath.replace(/\/index$/, "/");

  // remove the last slash
  // e.g. /abc/ -> /abc
  if (routePath !== "/" && routePath.slice(-1) === "/") {
    routePath = routePath.slice(0, -1);
  }

  // /index -> /
  if (routePath === "/index") {
    routePath = "/";
  }

  return routePath;
}

function filterRouteFile(name: string) {
  if (name.charAt(0) === ".") return false;

  return RouteRegExp.test(name);
}

function getRouteWeight(route: InternalRouteConfig): number {
  const meta = route.__meta;
  const weights: [string, string] = ["0", "0"];
  if (meta.isStaticRoute) {
    weights[0] = "1";
  } else if (route.exact) {
    weights[1] = "1";
  }

  return Number(weights.join(""));
}

function sortRoutes(routes: InternalRouteConfig[]): RouteConfig[] {
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

export default class RouterServiceImpl implements RouterService {
  private _pagesDir: string;
  private _unwatch: any;
  private _event = eventEmitter();

  constructor(pagesDir: string) {
    this._pagesDir = pagesDir;
  }

  async getRoutes(): Promise<RouteConfig[]> {
    const files = await recursiveReadDir(this._pagesDir, {
      filter: filterRouteFile
    });
    return this._getRoutes(files);
  }

  subscribe(listener: SubscribeFn) {
    this._event.on("change", listener);
    if (!this._unwatch) {
      this._unwatch = this._createWatcher();
    }
  }

  private _getRoutes(files: string[]): RouteConfig[] {
    const rootRoute = ({
      id: "",
      componentFile: "",
      routes: []
    } as any) as InternalRouteConfig;
    const routeMap = new Map<string, InternalRouteConfig>();
    const normalizedFiles: string[] = [];

    for (let index = 0; index < files.length; index++) {
      const rawfile = files[index];
      const file = normalizeFilePath(rawfile);
      normalizedFiles.push(file);
      if (isLayout(file)) {
        const layoutRoute: InternalRouteConfig = {
          id: createId(file),
          path: normalizeRoutePath(file.replace(/\/_layout$/, "/")),
          exact: false,
          componentFile: join(this._pagesDir, rawfile),
          __meta: {
            isStaticRoute: isStaicRouter(file)
          }
        };
        routeMap.set(file, layoutRoute);
      } else {
        routeMap.set(file, rootRoute);
      }
    }

    for (let index = 0; index < normalizedFiles.length; index++) {
      const rawFile = files[index];
      const file = normalizedFiles[index];
      const routePath = normalizeRoutePath(file);
      const route: InternalRouteConfig = {
        id: createId(file),
        path: routePath,
        exact: !isLayout(file),
        componentFile: join(this._pagesDir, rawFile),
        __meta: {
          isStaticRoute: isStaicRouter(file)
        }
      };
      const layoutFile = getLayoutFile(file);
      const parentRoute = routeMap.has(layoutFile)
        ? routeMap.get(layoutFile)!
        : rootRoute;
      parentRoute.routes = parentRoute.routes || [];
      parentRoute.routes.push(route);
    }

    return sortRoutes(rootRoute.routes!);
  }

  private _createWatcher() {
    return watch({ directories: [this._pagesDir] }, ({ getAllFiles }) => {
      const files: string[] = [];
      const rawFiles = getAllFiles();
      for (let index = 0; index < rawFiles.length; index++) {
        const absPath = rawFiles[index];
        const relativePath = relative(this._pagesDir, absPath);
        if (filterRouteFile(relativePath)) {
          files.push(relativePath);
        }
      }
      this._event.emit("change", this._getRoutes(files));
    });
  }
}
