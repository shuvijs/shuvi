import ModuleReplacePlugin from '@shuvi/toolpack/lib/webpack/plugins/module-replace-plugin';
import { IRequestHandlerWithNext } from '../types/server';
import { DevMiddleware } from './devMiddleware';
import { ROUTE_RESOURCE_QUERYSTRING } from '../constants';
import { Api } from '../api/api';
import { matchRoutes } from '@shuvi/router';
import { acceptsHtml } from './utils';
export class OnDemandRouteManager {
  public devMiddleware: DevMiddleware | null = null;
  public _api: Api;

  constructor(api: Api) {
    this._api = api;
  }

  getServerMiddleware(): IRequestHandlerWithNext {
    return async (req, res, next) => {
      const pathname = req.pathname;
      if (!pathname.startsWith(this._api.assetPublicPath)) {
        return next();
      }
      if (!this.devMiddleware) {
        return next();
      }

      const chunkName = pathname.replace(this._api.assetPublicPath, '');
      const chunkInitiatorModule =
        this._api.clientManifest.chunkRequest[chunkName];

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

  ensureRoutesMiddleware(): IRequestHandlerWithNext {
    return async (req, res, next) => {
      const accept = req.headers['accept'];
      if (req.method !== 'GET') {
        return next();
      } else if (!accept) {
        return next();
      } else if (accept.indexOf('application/json') === 0) {
        return next();
      } else if (!acceptsHtml(accept, { htmlAcceptHeaders: ['text/html'] })) {
        return next();
      }

      let err = null;
      try {
        await this.ensureRoutes(req.pathname || '/');
      } catch (error) {
        err = error;
      }
      next(err);
    };
  }

  async ensureRoutes(pathname: string): Promise<void> {
    const matchedRoutes = matchRoutes(this._api.getRoutes(), pathname) || [];

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
