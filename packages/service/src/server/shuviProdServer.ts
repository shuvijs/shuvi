import { ShuviServer } from './shuviServer';
import { IPluginContext } from './shuviServerTypes';
import { IRequestHandlerWithNext } from '../server/http-server';
import { serveStatic } from '../lib/serveStatic';
import { BUILD_DEFAULT_DIR, PUBLIC_PATH } from '../constants';
import { resolvePath } from './paths';

const getAssetMiddleware = (
  context: IPluginContext
): IRequestHandlerWithNext => {
  return async (req, res, next) => {
    let { path = '' } = req.params || {};
    if (Array.isArray(path)) path = path.join('/');
    const assetAbsPath = resolvePath(
      context.paths.buildDir,
      BUILD_DEFAULT_DIR,
      path
    );
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
  get mode() {
    return 'production' as const;
  }

  async init() {
    const context = this._getPluginContext();
    const assetsMiddleware = getAssetMiddleware(context);
    if (context.config.publicPath === PUBLIC_PATH) {
      this._server.use(`${context.assetPublicPath}:path(.*)`, assetsMiddleware);
    }
    await this._initMiddlewares();
  }
}
