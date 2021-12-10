import { ICliContext } from '../api';
import { Server } from '../server';
import { IRequestHandlerWithNext, IServerPluginContext } from '..';
import { getDevMiddleware } from '../lib/devMiddleware';
import { OnDemandRouteManager } from '../lib/onDemandRouteManager';
import { serveStatic } from '../lib/serveStatic';
import { normalizeServerMiddleware } from '../api/serverMiddleware';
import { applyHttpProxyMiddleware } from '../lib/httpProxyMiddleware';
import { BUILD_DEFAULT_DIR, PUBLIC_PATH } from '../constants';

import {
  PluginManager,
  getManager,
  initServerPlugins,
  initServerModule
} from './serverHooks';

const getPublicDirMiddleware = (
  cliContext: IServerPluginContext
): IRequestHandlerWithNext => {
  return async (req, res, next) => {
    let { path = '' } = req.params || {};
    if (Array.isArray(path)) path = path.join('/');
    const assetAbsPath = cliContext.resolvePublicFile(path);
    let err = null;
    try {
      await serveStatic(req, res, assetAbsPath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        error.statusCode = 404;
      }
      err = error;
    }
    if (err) next(err);
  };
};

const getAssetMiddleware = (
  cliContext: IServerPluginContext
): IRequestHandlerWithNext => {
  return async (req, res, next) => {
    let { path = '' } = req.params || {};
    if (Array.isArray(path)) path = path.join('/');
    const assetAbsPath = cliContext.resolveBuildFile(BUILD_DEFAULT_DIR, path);
    let err = null;
    try {
      await serveStatic(req, res, assetAbsPath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        error.statusCode = 404;
      }
      err = error;
    }

    if (err) next(err);
  };
};

export class ShuviServer {
  private _server: Server;
  private _pluginManager: PluginManager;
  private _serverContext: IServerPluginContext;
  private _isDev: boolean;
  constructor(cliContext: ICliContext, isDev: boolean) {
    this._isDev = isDev;
    this._pluginManager = getManager();
    this._server = new Server();
    const serverPlugins = cliContext.serverPlugins;
    this._serverContext = initServerPlugins(
      this._pluginManager,
      serverPlugins,
      cliContext
    );
  }
  async init() {
    await this.initMiddlewares();
  }

  async initInternalMiddlewares() {
    const { _isDev: isDev, _serverContext: context, _server: server } = this;
    if (isDev) {
      const onDemandRouteMgr = new OnDemandRouteManager(context);
      const publicDirMiddleware = getPublicDirMiddleware(context);
      const devMiddleware = await getDevMiddleware(context);
      await devMiddleware.waitUntilValid();
      onDemandRouteMgr.devMiddleware = devMiddleware;
      if (context.config.proxy) {
        applyHttpProxyMiddleware(server, context.config.proxy);
      }
      // keep the order
      server.use(onDemandRouteMgr.getServerMiddleware());
      devMiddleware.apply(server);
      server.use(onDemandRouteMgr.ensureRoutesMiddleware());
      server.use(`${context.assetPublicPath}:path(.*)`, publicDirMiddleware);
    } else {
      const assetsMiddleware = getAssetMiddleware(context);
      if (context.config.publicPath === PUBLIC_PATH) {
        this._server.use(
          `${context.assetPublicPath}:path(.*)`,
          assetsMiddleware
        );
      }
    }
  }

  async initMiddlewares() {
    await this.initInternalMiddlewares();

    const {
      _serverContext: context,
      _server: server,
      _pluginManager: pluginManager
    } = this;

    // initServerModule: get server module and transform it into server plugin
    // This is a fixed logic because we must initiate all of the server plugin before runner runs.
    // todo: Or in another way. We could allow usePlugin after runner runs.
    initServerModule(pluginManager, context.resources?.server?.server);
    const { rootDir } = context.paths;
    const serverMiddlewares = (await pluginManager.runner.serverMiddleware())
      .flat()
      .map(m => normalizeServerMiddleware(m, { rootDir }))
      .sort((a, b) => a.order - b.order);
    const serverMiddlewaresLast = (
      await pluginManager.runner.serverMiddlewareLast()
    )
      .flat()
      .map(m => normalizeServerMiddleware(m, { rootDir }))
      .sort((a, b) => a.order - b.order);
    serverMiddlewares.forEach(({ path, handler }) => {
      server.use(path, handler);
    });
    serverMiddlewaresLast.forEach(({ path, handler }) => {
      server.use(path, handler);
    });
  }

  async listen(port: number, hostname?: string) {
    await this._server.listen(port, hostname);
    await this._pluginManager.runner.serverListen({ port, hostname });
  }

  async close() {
    await this._server.close();
  }
}

export const createShuviServer = async (
  cliContext: ICliContext,
  isDev: boolean = false
): Promise<ShuviServer> => {
  const app = new ShuviServer(cliContext, isDev);
  await app.init();
  return app;
};
