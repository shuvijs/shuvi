"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fileWatcher_1 = require("@shuvi/utils/lib/fileWatcher");
const eventEmitter_1 = __importDefault(require("@shuvi/utils/lib/eventEmitter"));
const recursiveReaddir_1 = require("@shuvi/utils/lib/recursiveReaddir");
const unixPath = path_1.posix;
let uid = 0;
function uuid() {
    return `${++uid}`;
}
const jsExtensions = ["js", "jsx", "ts", "tsx"];
function isLayout(routePath) {
    return routePath.endsWith("_layout");
}
function getLayoutRoutePath(routePath) {
    return routePath
        .split("/")
        .slice(0, -1)
        .join("/");
}
function fileToRoutePath(filepath) {
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
class RouterServiceImpl {
    constructor(pagesDir) {
        this._event = eventEmitter_1.default();
        this._pagesDir = pagesDir;
    }
    getRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield recursiveReaddir_1.recursiveReadDir(this._pagesDir, {
                filter: new RegExp(`\\.(?:${jsExtensions.join("|")})$`)
            });
            return this._getRoutes(files);
        });
    }
    onChange(listener) {
        this._event.on("change", listener);
        if (!this._unwatch) {
            this._unwatch = this._createWatcher();
        }
    }
    _getRoutes(files) {
        const rootRoute = {
            id: "",
            componentFile: "",
            routes: []
        };
        const routeMap = new Map();
        const routePaths = [];
        const findParentRoute = (routePath) => {
            let layoutRoute;
            let layoutPath = routePath;
            do {
                layoutPath = getLayoutRoutePath(layoutPath);
                layoutRoute = routeMap.get(layoutPath);
            } while (layoutRoute && layoutPath);
            if (!layoutRoute) {
                throw new Error("fail to generate route, can't find parent route");
            }
            return layoutRoute;
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
                    componentFile: path_1.join(this._pagesDir, file)
                });
            }
            else {
                routeMap.set(getLayoutRoutePath(routePath), rootRoute);
            }
        }
        for (let index = 0; index < routePaths.length; index++) {
            const file = files[index];
            const routePath = routePaths[index];
            const routeId = file;
            const route = {
                id: routeId,
                path: routePath,
                exact: !isLayout(routePath),
                componentFile: path_1.join(this._pagesDir, file)
            };
            const layoutRoute = findParentRoute(routePath);
            layoutRoute.routes = layoutRoute.routes || [];
            layoutRoute.routes.push(route);
        }
        return rootRoute.routes;
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
    _createWatcher() {
        return fileWatcher_1.watch({ directories: [] }, () => {
            this._event.emit("change", this._getRoutes([]));
        });
    }
}
exports.default = RouterServiceImpl;
