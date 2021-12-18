import { ShuviServer } from './shuviServer';
import { IPluginContext } from '../plugin';
import { ShuviServerOptions } from './shuviServerTypes';
import { IRequestHandlerWithNext } from '../server/http-server';
import { serveStatic } from './helper/serveStatic';
import { OnDemandRouteManager } from '../lib/onDemandRouteManager';
import { getDevMiddleware } from './middlewares/devMiddleware';
import { applyHttpProxyMiddleware } from './middlewares/httpProxyMiddleware';
import { resolvePath } from './paths';
import { buildSourceFiles } from '../lib/build';

const getPublicDirMiddleware = (
  context: IPluginContext
): IRequestHandlerWithNext => {
  return async (req, res, next) => {
    let { path = '' } = req.params || {};
    if (Array.isArray(path)) path = path.join('/');
    const assetAbsPath = resolvePath(context.paths.publicDir, path);
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

export class ShuviDevServer extends ShuviServer {
  constructor(options: ShuviServerOptions) {
    super(options);
  }

  get mode() {
    return 'development' as const;
  }

  async _init() {
    const { _server: server, _pluginManager: pluginManager } = this;

    await buildSourceFiles({
      rootDir: this._rootDir,
      config: this._config,
      runner: pluginManager.runner,
      watch: true
    });

    const pluginContext = this._getPluginContext();
    const onDemandRouteMgr = new OnDemandRouteManager(pluginContext);
    const publicDirMiddleware = getPublicDirMiddleware(pluginContext);
    const devMiddleware = await getDevMiddleware(pluginContext);
    await devMiddleware.waitUntilValid();
    onDemandRouteMgr.devMiddleware = devMiddleware;
    if (pluginContext.config.proxy) {
      applyHttpProxyMiddleware(server, pluginContext.config.proxy);
    }
    // keep the order
    server.use(onDemandRouteMgr.getServerMiddleware());
    devMiddleware.apply(server);
    server.use(onDemandRouteMgr.ensureRoutesMiddleware());
    server.use(
      `${pluginContext.assetPublicPath}:path(.*)`,
      publicDirMiddleware
    );
  }
}
