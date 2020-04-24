import { Runtime, IHookAppRoutes } from '@shuvi/types';
import ModuleReplacePlugin from '@shuvi/toolpack/lib/webpack/plugins/module-replace-plugin';
import { DevMiddleware } from './devMiddleware';
import { runtime } from '../runtime';
import {
  IIncomingMessage,
  IServerResponse,
  INextFunction,
  IRequestHandle
} from '../server';
import { ROUTE_RESOURCE_QUERYSTRING } from '../constants';
import { Api } from '../api/api';

import RouteConfig = Runtime.IRouteConfig;

export class OnDemandRouteManager {
  private _routes: RouteConfig[] = [];
  public devMiddleware: DevMiddleware | null = null;
  public _api: Api;

  constructor(api: Api) {
    this._api = api;
    api.tap<IHookAppRoutes>('app:routes', {
      name: 'OnDemandRouteManager',
      fn: (routes: RouteConfig[]) => {
        this._routes = routes;
        return routes;
      }
    });
  }

  getServerMiddleware(): IRequestHandle {
    return (
      req: IIncomingMessage,
      res: IServerResponse,
      next: INextFunction
    ) => {
      const pathname = req.parsedUrl.pathname!;
      if (!pathname.startsWith(this._api.assetPublicPath)) {
        return next();
      }
      if (!this.devMiddleware) {
        return next();
      }

      const chunkName = pathname.replace(this._api.assetPublicPath, '');
      const chunkInitiatorModule = this._api.resources.clientManifest
        .chunkRequest[chunkName];

      if (!chunkInitiatorModule) {
        return next();
      }

      const task = ModuleReplacePlugin.restoreModule(chunkInitiatorModule);
      if (task) {
        this.devMiddleware.invalidate();
        task.then(next, next);
      } else {
        next();
      }
    };
  }

  async ensureRoutes(pathname: string): Promise<void> {
    const routeModule = runtime
      .matchRoutes(this._routes, pathname)
      .map(m => `${m.route.component}?${ROUTE_RESOURCE_QUERYSTRING}`);
    return this._activateModules(routeModule);
  }

  private async _activateModules(modules: string[]): Promise<void> {
    if (!this.devMiddleware) {
      return;
    }

    const tasks = modules
      .map(m => ModuleReplacePlugin.restoreModule(m))
      .filter(Boolean);
    if (tasks.length) {
      this.devMiddleware.invalidate();
      await Promise.all(tasks);
    }
  }
}
