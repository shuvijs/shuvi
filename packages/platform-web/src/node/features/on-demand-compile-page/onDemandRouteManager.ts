import { matchRoutes } from '@shuvi/router';
import { clientManifest, server } from '@shuvi/service/lib/resources';
import { ACTIVATE_PAGE_PATH } from '@shuvi/shared/lib/constants';
import { IRequestHandlerWithNext, IServerPluginContext } from '@shuvi/service';
import { DevMiddleware } from '@shuvi/service/lib/server/middlewares/dev';
import ModuleReplacePlugin from '@shuvi/toolpack/lib/webpack/plugins/module-replace-plugin';

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

      if (!req.pathname.startsWith(ACTIVATE_PAGE_PATH)) {
        return next();
      }
      let err = null;
      try {
        await this.ensureRoutes(`${req.query['path']}` || '/');
        res.end();
      } catch (error) {
        err = error;
      }
      if (err) next(err);
    };
  }

  async ensureRoutes(pathname: string): Promise<void> {
    const matchedRoutes = matchRoutes(server.pageRoutes, pathname) || [];

    const modulesToActivate = matchedRoutes
      .map(
        ({ route: { __componentSourceWithAffix__ } }) =>
          __componentSourceWithAffix__
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
