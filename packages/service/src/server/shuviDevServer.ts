import { ShuviServer } from './shuviServer';
import { normalizeServerMiddleware } from './serverMiddleware';
import { IRequestHandlerWithNext } from '../server/http-server';
import { serveStatic } from '../lib/serveStatic';
import { getDevMiddleware } from '../lib/devMiddleware';
import { IServerPluginContext } from './plugin';
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

    const publicDirMiddleware = getPublicDirMiddleware(context);
    const devMiddleware = await getDevMiddleware(context);
    await devMiddleware.waitUntilValid();
    if (context.config.proxy) {
      applyHttpProxyMiddleware(server, context.config.proxy);
    }

    const { rootDir } = context.paths;
    const serverMiddlewaresBeforeDevMiddleware = (
      await context.serverPluginRunner.serverMiddlewareBeforeDevMiddleware(
        devMiddleware
      )
    )
      .flat()
      .map(m => normalizeServerMiddleware(m, { rootDir }));
    serverMiddlewaresBeforeDevMiddleware.forEach(({ path, handler }) => {
      server.use(path, handler);
    });

    // keep the order
    devMiddleware.apply(server);
    server.use(`${context.assetPublicPath}:path(.*)`, publicDirMiddleware);

    await this._initMiddlewares();
  }
}
