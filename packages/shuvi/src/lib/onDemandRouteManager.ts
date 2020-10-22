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

  getServerMiddleware(): Runtime.IKoaMiddleware {
    return async (ctx, next) => {
      const pathname = (ctx.req as Runtime.IIncomingMessage).parsedUrl
        .pathname!;
      if (!pathname.startsWith(this._api.assetPublicPath)) {
        return await next();
      }
      if (!this.devMiddleware) {
        return await next();
      }

      const chunkName = pathname.replace(this._api.assetPublicPath, '');
      const chunkInitiatorModule = this._api.resources.clientManifest
        .chunkRequest[chunkName];

      if (!chunkInitiatorModule) {
        return await next();
      }

      const task = ModuleReplacePlugin.restoreModule(chunkInitiatorModule);
      if (task) {
        this.devMiddleware.invalidate();
        try {
          await task;
          ctx.status = 200;
          await next();
        } catch (error) {
          ctx.throw(500, error);
        }
      } else {
        ctx.status = 200;
        await next();
      }
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
