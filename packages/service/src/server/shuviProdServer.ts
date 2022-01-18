import { ShuviServer } from './shuviServer';
import { IRequestHandlerWithNext } from '../server/http-server';
import { serveStatic } from '../lib/serveStatic';
import { BUILD_DEFAULT_DIR, PUBLIC_PATH } from '../constants';
import { IServerPluginContext } from './plugin';

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

export class ShuviProdServer extends ShuviServer {
  async init() {
    const { _serverContext: context } = this;
    const assetsMiddleware = getAssetMiddleware(context);
    if (context.config.publicPath === PUBLIC_PATH) {
      this._server.use(`${context.assetPublicPath}:path(.*)`, assetsMiddleware);
    }
    this._initServerPlugins();
    await this._initMiddlewares();
  }
}
