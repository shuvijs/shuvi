import { matchRoutes } from '@shuvi/router';
import { normalizeBase } from '@shuvi/router/lib/utils';
import resources from '@shuvi/service/lib/resources';
import {
  ShuviRequestHandler,
  IServerPluginContext,
  ShuviRequest
} from '@shuvi/service';
import { DevMiddleware } from '@shuvi/service/lib/server/middlewares/dev';
import ModuleReplacePlugin from '@shuvi/toolpack/lib/webpack/plugins/module-replace-plugin';
import AppConfigManager from '../setup-app-config/AppConfigManager';

function acceptsHtml(
  header: string,
  {
    htmlAcceptHeaders = ['text/html', '*/*']
  }: { htmlAcceptHeaders?: string[] } = {}
) {
  for (var i = 0; i < htmlAcceptHeaders.length; i++) {
    if (header.indexOf(htmlAcceptHeaders[i]) !== -1) {
      return true;
    }
  }
  return false;
}

export default class OnDemandRouteManager {
  public devMiddleware: DevMiddleware | null = null;
  private _serverPluginContext: IServerPluginContext;
  private _assetPathPrefix: string;

  constructor(serverPluginContext: IServerPluginContext) {
    this._serverPluginContext = serverPluginContext;
    const { assetPublicPath } = this._serverPluginContext;
    if (assetPublicPath.startsWith('http')) {
      const url = new URL(assetPublicPath);
      this._assetPathPrefix = url.pathname;
    } else {
      this._assetPathPrefix = assetPublicPath;
    }
  }

  getServerMiddleware(): ShuviRequestHandler {
    return async (req, res, next) => {
      const pathname = req.pathname;
      if (!pathname.startsWith(this._assetPathPrefix)) {
        return next();
      }
      if (!this.devMiddleware) {
        return next();
      }

      const chunkName = pathname.replace(this._assetPathPrefix, '');
      const chunkInitiatorModule =
        resources.clientManifest.chunkRequest[chunkName];

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

  ensureRoutesMiddleware(): ShuviRequestHandler {
    return async (req, _res, next) => {
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
        await this.ensureRoutes(req.pathname || '/', req);
      } catch (error) {
        err = error;
      }
      next(err);
    };
  }

  async ensureRoutes(pathname: string, req: ShuviRequest): Promise<void> {
    const { basename } = AppConfigManager.getAppConfig(req).router;
    const matchedRoutes =
      matchRoutes(
        resources.server.pageRoutes,
        pathname,
        normalizeBase(basename)
      ) || [];

    const modulesToActivate = matchedRoutes
      .map(({ route: { __componentRawRequest__ } }) => __componentRawRequest__)
      .filter(Boolean) as string[];

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
