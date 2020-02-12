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
const crypto_1 = require("crypto");
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const fileWatcher_1 = require("@shuvi/utils/lib/fileWatcher");
const eventEmitter_1 = __importDefault(require("@shuvi/utils/lib/eventEmitter"));
const recursiveReaddir_1 = require("@shuvi/utils/lib/recursiveReaddir");
function createId(filepath) {
    const id = crypto_1.createHash("md4")
        .update(filepath)
        .digest("base64")
        .substr(0, 4);
    return `page-${id}`;
}
const unixPath = path_1.posix;
const jsExtensions = ["js", "jsx", "ts", "tsx"];
const RouteRegExp = new RegExp(`\\.(?:${jsExtensions.join("|")})$`);
function isLayout(filepath) {
    return filepath.endsWith("_layout");
}
function isStaicRouter(filepath) {
    return unixPath.basename(filepath).charAt(0) !== "$";
}
function getLayoutFile(filepath) {
    return filepath.replace(/\/\w+$/, "/_layout");
}
function normalizeFilePath(filepath) {
    const res = filepath
        // Remove the file extension from the end
        .replace(/\.\w+$/, "")
        // Convert to unix path
        .replace(/\\/g, "/");
    return res.charAt(0) !== "/" ? "/" + res : res;
}
function normalizeRoutePath(rawPath) {
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
function filterRouteFile(name) {
    if (name.charAt(0) === ".")
        return false;
    return RouteRegExp.test(name);
}
function getRouteWeight(route) {
    const meta = route.__meta;
    const weights = ["0", "0"];
    if (meta.isStaticRoute) {
        weights[0] = "1";
    }
    else if (route.exact) {
        weights[1] = "1";
    }
    return Number(weights.join(""));
}
function sortRoutes(routes) {
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
    tiny_invariant_1.default(paramsRouteNum <= 1, `We should not have multiple dynamic routes under a directory.`);
    return res;
}
class RouterServiceImpl {
    constructor(pagesDir) {
        this._event = eventEmitter_1.default();
        this._pagesDir = pagesDir;
    }
    getRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield recursiveReaddir_1.recursiveReadDir(this._pagesDir, {
                filter: filterRouteFile
            });
            return this._getRoutes(files);
        });
    }
    subscribe(listener) {
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
        const normalizedFiles = [];
        for (let index = 0; index < files.length; index++) {
            const rawfile = files[index];
            const file = normalizeFilePath(rawfile);
            normalizedFiles.push(file);
            if (isLayout(file)) {
                const layoutRoute = {
                    id: createId(file),
                    path: normalizeRoutePath(file.replace(/\/_layout$/, "/")),
                    exact: false,
                    componentFile: path_1.join(this._pagesDir, rawfile),
                    __meta: {
                        isStaticRoute: isStaicRouter(file)
                    }
                };
                routeMap.set(file, layoutRoute);
            }
            else {
                routeMap.set(file, rootRoute);
            }
        }
        for (let index = 0; index < normalizedFiles.length; index++) {
            const rawFile = files[index];
            const file = normalizedFiles[index];
            const routePath = normalizeRoutePath(file);
            const route = {
                id: createId(file),
                path: routePath,
                exact: !isLayout(file),
                componentFile: path_1.join(this._pagesDir, rawFile),
                __meta: {
                    isStaticRoute: isStaicRouter(file)
                }
            };
            const layoutFile = getLayoutFile(file);
            const parentRoute = routeMap.has(layoutFile)
                ? routeMap.get(layoutFile)
                : rootRoute;
            parentRoute.routes = parentRoute.routes || [];
            parentRoute.routes.push(route);
        }
        return sortRoutes(rootRoute.routes);
    }
    _createWatcher() {
        return fileWatcher_1.watch({ directories: [this._pagesDir] }, ({ getAllFiles }) => {
            const files = [];
            const rawFiles = getAllFiles();
            for (let index = 0; index < rawFiles.length; index++) {
                const absPath = rawFiles[index];
                const relativePath = path_1.relative(this._pagesDir, absPath);
                if (filterRouteFile(relativePath)) {
                    files.push(relativePath);
                }
            }
            this._event.emit("change", this._getRoutes(files));
        });
    }
}
exports.default = RouterServiceImpl;
