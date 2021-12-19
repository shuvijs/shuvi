import { ShuviServer } from './shuviServer';
import { IRequestHandlerWithNext } from '../server/http-server';
import { serveStatic } from '../lib/serveStatic';
import { getDevMiddleware } from '../lib/devMiddleware';
import { IServerPluginContext } from './plugin';
import { OnDemandRouteManager } from '../lib/onDemandRouteManager';
import { applyHttpProxyMiddleware } from './middlewares/httpProxyMiddleware';

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

export class ShuviDevServer extends ShuviServer {
  async init() {
    const { _serverContext: context, _server: server } = this;

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

    await this._initMiddlewares();
  }
}
