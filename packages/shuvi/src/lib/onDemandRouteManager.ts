import ModuleReplacePlugin from '@shuvi/toolpack/lib/webpack/plugins/module-replace-plugin';
import { Runtime } from '@shuvi/types';
import { DevMiddleware } from './devMiddleware';
import { ROUTE_RESOURCE_QUERYSTRING } from '../constants';
import { Api } from '../api/api';
import { matchRoutes } from '@shuvi/core/lib/app/app-modules/matchRoutes';

export class OnDemandRouteManager {
  public devMiddleware: DevMiddleware | null = null;
  public _api: Api;

  constructor(api: Api) {
    this._api = api;
  }

  getServerMiddleware(): Runtime.IServerMiddlewareHandler {
    return async (
      req: Runtime.IIncomingMessage,
      res: Runtime.IServerAppResponse,
      next: Runtime.IServerAppNext
    ) => {
      const pathname = req.parsedUrl.pathname!;
      if (!pathname.startsWith(this._api.assetPublicPath)) {
        return next();
      }
      if (!this.devMiddleware) {
        return next();
      }

      const chunkName = pathname.replace(this._api.assetPublicPath, '');
      const chunkInitiatorModule = this._api.clientManifest.chunkRequest[
        chunkName
      ];

      if (!chunkInitiatorModule) {
        return next();
      }

      const task = ModuleReplacePlugin.restoreModule(chunkInitiatorModule);
      if (task) {
        await this.devMiddleware.invalidate();
        await task;
      }
      next();
    };
  }

  async ensureRoutes(pathname: string): Promise<void> {
    const matchedRoutes = matchRoutes(this._api.getRoutes(), pathname);

    const modulesToActivate = matchedRoutes
      .map(({ route: { component } }) =>
        component ? `${component}?${ROUTE_RESOURCE_QUERYSTRING}` : ''
      )
      .filter(Boolean);

    return this._activateModules(modulesToActivate);
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
