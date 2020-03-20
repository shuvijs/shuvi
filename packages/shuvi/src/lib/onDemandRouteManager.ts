import { Runtime, Hooks } from "@shuvi/types";
import ModuleReplacePlugin from "@shuvi/toolpack/lib/webpack/plugins/module-replace-plugin";
import { DevMiddleware } from "./devMiddleware";
import { runtime } from "../runtime";
import { Api } from "../api/api";

import RouteConfig = Runtime.IRouteConfig;

function traverse(routes: RouteConfig[], cb: (route: RouteConfig) => void) {
  for (let index = 0; index < routes.length; index++) {
    const route = routes[index];
    if (route.routes && route.routes.length > 0) {
      traverse(route.routes, cb);
    }
    cb(route);
  }
}

export class OnDemandRouteManager {
  private _activedRouteIds = new Set<string>();
  private _routesMap = new Map<string, { componentFile: string }>();
  private _routes: RouteConfig[] = [];
  public devMiddleware: DevMiddleware | null = null;

  constructor(api: Api) {
    api.tap<Hooks.IAppRoutes>("app:routes", {
      name: "OnDemandRouteManager",
      fn: (routes: RouteConfig[]) => {
        this._routes = routes;
        this._onRoutesChange(routes);
        this._replaceComponentFile(routes);
        return routes;
      }
    });
  }

  async ensureRoutes(pathname: string): Promise<void> {
    const matchRouteIds = runtime
      .matchRoutes(this._routes, pathname)
      .map(m => m.route.id);
    return this._activateRoutes(matchRouteIds);
  }

  async activateRoute(routeId: string): Promise<void> {
    return this._activateRoutes([routeId]);
  }

  private async _activateRoutes(routeIds: string[]): Promise<void> {
    if (!this.devMiddleware) {
      return;
    }

    const toActivate: string[] = [];
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
      if (!savedRoute) return;

      ModuleReplacePlugin.restoreModule(
        `${savedRoute.componentFile}?__shuvi-route`
      );
      this._activedRouteIds.add(id);
    });
    this.devMiddleware.invalidate();
    await this.devMiddleware.waitUntilValid();
  }

  private _replaceComponentFile(routes: RouteConfig[]) {
    traverse(routes, route => {
      const savedRoute = this._routesMap.get(route.id);
      if (!savedRoute) return;

      route.componentFile = `${savedRoute.componentFile}?__shuvi-route`;
    });

    return routes;
  }

  private _onRoutesChange(newRoutes: RouteConfig[]) {
    const added = new Set<string>();
    const deleted = new Set<string>();

    const newRouteMap = new Map<string, RouteConfig>();
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
      } else {
        deleted.add(id);
      }
    }

    deleted.forEach(id => {
      this._activedRouteIds.delete(id);
      this._routesMap.delete(id);
    });

    added.forEach(id =>
      this._routesMap.set(id, {
        componentFile: newRouteMap.get(id)!.componentFile
      })
    );
  }
}
