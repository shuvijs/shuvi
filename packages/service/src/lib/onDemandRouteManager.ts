import { matchRoutes } from '@shuvi/platform-core';
import { ROUTE_RESOURCE_QUERYSTRING } from '@shuvi/shared/lib/constants';
import ModuleReplacePlugin from '@shuvi/toolpack/lib/webpack/plugins/module-replace-plugin';
import { IRequestHandlerWithNext } from '../server';
import { DevMiddleware } from './devMiddleware';
import { acceptsHtml } from './utils';
import { IServerPluginContext } from '../server/plugin';
// @ts-ignore
import { clientManifest } from '../resources';

export class OnDemandRouteManager {
  public devMiddleware: DevMiddleware | null = null;
  public _serverPluginContext: IServerPluginContext;

  constructor(serverPluginContext: IServerPluginContext) {
    this._serverPluginContext = serverPluginContext;
  }

  getServerMiddleware(): IRequestHandlerWithNext {
    return async (req, res, next) => {
      const pathname = req.pathname;
      if (!pathname.startsWith(this._serverPluginContext.assetPublicPath)) {
        return next();
      }
      if (!this.devMiddleware) {
        return next();
      }

      const chunkName = pathname.replace(
        this._serverPluginContext.assetPublicPath,
        ''
      );
      const chunkInitiatorModule = clientManifest.chunkRequest[chunkName];

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
    const matchedRoutes =
      matchRoutes(this._serverPluginContext.getRoutes(), pathname) || [];

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
