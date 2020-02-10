import { join, posix } from "path";
import { RouteConfig } from "@shuvi/types/core";
import { watch } from "@shuvi/utils/lib/fileWatcher";
import eventEmitter from "@shuvi/utils/lib/eventEmitter";
import { recursiveReadDir } from "@shuvi/utils/lib/recursiveReaddir";
import { RouterService } from "./types/routeService";

const unixPath = posix;

type OnChangeListener = (v: RouteConfig[]) => void;

let uid = 0;

function uuid() {
  return `${++uid}`;
}

const jsExtensions = ["js", "jsx", "ts", "tsx"];

function isLayout(routePath: string) {
  return routePath.endsWith("_layout");
}

function getLayoutRoutePath(routePath: string) {
  return routePath
    .split("/")
    .slice(0, -1)
    .join("/");
}

function fileToRoutePath(filepath: string) {
  let routePath = filepath
    // Remove the file extension from the end
    .replace(/\.\w+$/, "")
    // Convert to unix path
    .replace(/\\/g, "/");

  // /xxxx/index -> /xxxx/
  routePath = routePath.replace(/\/index$/, "/");

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

export default class RouterServiceImpl implements RouterService {
  private _pagesDir: string;
  private _unwatch: any;
  private _event = eventEmitter();

  constructor(pagesDir: string) {
    this._pagesDir = pagesDir;
  }

  async getRoutes(): Promise<RouteConfig[]> {
    const files = await recursiveReadDir(this._pagesDir, {
      filter: new RegExp(`\\.(?:${jsExtensions.join("|")})$`)
    });
    return this._getRoutes(files);
  }

  onChange(listener: OnChangeListener) {
    this._event.on("change", listener);
    if (!this._unwatch) {
      this._unwatch = this._createWatcher();
    }
  }

  private _getRoutes(files: string[]): RouteConfig[] {
    const rootRoute: RouteConfig = {
      id: "",
      componentFile: "",
      routes: []
    };
    const routeMap = new Map<string, RouteConfig>();
    const routePaths: string[] = [];

    const findParentRoute = (routePath: string): RouteConfig => {
      let layoutRoute: RouteConfig | undefined;
      let layoutPath: string = routePath;
      do {
        layoutPath = getLayoutRoutePath(layoutPath);
        layoutRoute = routeMap.get(layoutPath);
      } while (layoutRoute && layoutPath);

      if (!layoutRoute) {
        throw new Error("fail to generate route, can't find parent route");
      }

      return layoutRoute!;
    };

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const routePath = fileToRoutePath(file);
      routePaths.push(routePath);
      if (isLayout(routePath)) {
        routeMap.set(routePath, {
          id: file,
          path: routePath.replace(/\/_layout$/, ""),
          exact: false,
          componentFile: join(this._pagesDir, file)
        });
      } else {
        routeMap.set(getLayoutRoutePath(routePath), rootRoute);
      }
    }

    for (let index = 0; index < routePaths.length; index++) {
      const file = files[index];
      const routePath = routePaths[index];
      const routeId = file;
      const route: RouteConfig = {
        id: routeId,
        path: routePath,
        exact: !isLayout(routePath),
        componentFile: join(this._pagesDir, file)
      };
      const layoutRoute = findParentRoute(routePath);
      layoutRoute.routes = layoutRoute.routes || [];
      layoutRoute.routes.push(route);
    }

    return rootRoute.routes as RouteConfig[];
    // return [
    //   {
    //     id: uuid(),
    //     path: "/",
    //     exact: true,
    //     componentFile:
    //       "/Users/lixi/Workspace/github/shuvi-test/src/pages/index.js"
    //   },
    //   {
    //     id: uuid(),
    //     path: "/users/:id",
    //     exact: true,
    //     componentFile:
    //       "/Users/lixi/Workspace/github/shuvi-test/src/pages/users.js"
    //   }
    // ];
  }

  private _createWatcher() {
    return watch({ directories: [] }, () => {
      this._event.emit("change", this._getRoutes([]));
    });
  }
}
