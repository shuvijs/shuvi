import { ShuviServer } from './shuviServer';
import { IRequestHandlerWithNext } from '../server/http-server';
import { isStaticFileExist, serveStatic } from './utils';
import { BUILD_DEFAULT_DIR, PUBLIC_PATH } from '../constants';
import { IServerPluginContext } from './plugin';

const getAssetMiddleware = (
  cliContext: IServerPluginContext
): IRequestHandlerWithNext => {
  return async (req, res, next) => {
    const path = req.pathname;
    const assetAbsPath = cliContext.resolveBuildFile(BUILD_DEFAULT_DIR, path);

    if (!isStaticFileExist(assetAbsPath)) next();

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
    await this._initMiddlewares();
  }
}
