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
const module_replace_plugin_1 = __importDefault(require("@shuvi/toolpack/lib/webpack/plugins/module-replace-plugin"));
const runtime_1 = require("./runtime");
function traverse(routes, cb) {
    for (let index = 0; index < routes.length; index++) {
        const route = routes[index];
        if (route.routes && route.routes.length > 0) {
            traverse(route.routes, cb);
        }
        cb(route);
    }
}
// const routeLoader = "@shuvi/route-component-loader";
class LazyCompileManager {
    constructor({ app }) {
        this._activedRouteIds = new Set();
        this._routesMap = new Map();
        this._routes = [];
        this.devServer = null;
        this._app = app;
    }
    run(routeService) {
        routeService.subscribe(routes => {
            this._routes = routes;
            this._onRoutesChange(routes);
            this._app.setRoutesSource(runtime_1.runtime.generateRoutesSource(this._replaceComponentFile(routes)));
        });
    }
    ensureRoutes(pathname) {
        return __awaiter(this, void 0, void 0, function* () {
            const matchRouteIds = runtime_1.runtime
                .matchRoutes(this._routes, pathname)
                .map(m => m.route.id);
            return this._activateRoutes(matchRouteIds);
        });
    }
    activateRoute(routeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._activateRoutes([routeId]);
        });
    }
    _activateRoutes(routeIds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.devServer) {
                return;
            }
            const toActivate = [];
            for (let index = 0; index < routeIds.length; index++) {
                const id = routeIds[index];
                if (!this._activedRouteIds.has(id)) {
                    toActivate.push(id);
                }
            }
            if (toActivate.length <= 0) {
                return;
            }
            toActivate.forEach(id => {
                const savedRoute = this._routesMap.get(id);
                if (!savedRoute)
                    return;
                module_replace_plugin_1.default.restoreModule(`${savedRoute.componentFile}?__shuvi-route`);
                this._activedRouteIds.add(id);
            });
            this.devServer.invalidate();
            yield this.devServer.waitUntilValid();
        });
    }
    _replaceComponentFile(routes) {
        traverse(routes, route => {
            const savedRoute = this._routesMap.get(route.id);
            if (!savedRoute)
                return;
            route.componentFile = `${savedRoute.componentFile}?__shuvi-route`;
        });
        return routes;
    }
    _onRoutesChange(newRoutes) {
        const added = new Set();
        const deleted = new Set();
        const newRouteMap = new Map();
        traverse(newRoutes, route => {
            const oldRoute = this._routesMap.get(route.id);
            if (!oldRoute) {
                added.add(route.id);
            }
            newRouteMap.set(route.id, route);
        });
        for (const id of this._routesMap.keys()) {
            const newRoute = newRouteMap.get(id);
            if (newRoute) {
                this._routesMap.set(id, { componentFile: newRoute.componentFile });
            }
            else {
                deleted.add(id);
                this._routesMap.delete(id);
            }
        }
        added.forEach(id => this._routesMap.set(id, {
            componentFile: newRouteMap.get(id).componentFile
        }));
    }
}
exports.LazyCompileManager = LazyCompileManager;
