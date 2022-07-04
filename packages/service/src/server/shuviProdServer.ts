import { ShuviServer } from './shuviServer';
import { IRequestHandlerWithNext } from '../server/http-server';
import { isStaticFileExist, serveStatic } from './utils';
import { BUILD_DEFAULT_DIR } from '../constants';
import { IServerPluginContext } from './plugin';

const getAssetMiddleware = (
  cliContext: IServerPluginContext
): IRequestHandlerWithNext => {
  return async (req, res, next) => {
    let { path = '' } = req.params || {};
    if (Array.isArray(path)) path = path.join('/');
    const assetAbsPath = cliContext.resolveBuildFile(BUILD_DEFAULT_DIR, path);

    if (!isStaticFileExist(assetAbsPath)) return next();

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
    if (context.assetPublicPath.startsWith('/')) {
      const assetsMiddleware = getAssetMiddleware(context);
      this._server.use(`${context.assetPublicPath}:path(.*)`, assetsMiddleware);
    }
    await this._initMiddlewares();
  }
}
