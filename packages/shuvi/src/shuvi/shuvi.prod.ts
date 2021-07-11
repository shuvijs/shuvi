import { Runtime } from '@shuvi/types';
import { serveStatic } from '../lib/serveStatic';
import { BUILD_CLIENT_DIR, PUBLIC_PATH } from '../constants';
import Base from './shuvi.base';

export default class ShuviProd extends Base {
  async init() {
    const api = this._api;

    // If user don't provide a custom asset public path, we need serve it
    if (api.config.publicPath === PUBLIC_PATH) {
      api.server.use(`${api.assetPublicPath}:path(.*)`, this._assetsMiddleware);
    }

    api.server.use(this._createServerMiddlewaresHandler);

    api.server.use(this._handlePageRequest);

    api.server.use(this.errorHandler);
  }

  protected getMode() {
    return 'production' as const;
  }

  private _createServerMiddlewaresHandler: Runtime.IServerMiddlewareHandler = async (
    req: Runtime.IIncomingMessage,
    res: Runtime.IServerAppResponse,
    next: Runtime.IServerAppNext
  ) => {
    const middlewares = this._getServerMiddlewares();

    const task = (this._runServerMiddlewares(
      middlewares
    ) as unknown) as Runtime.NextHandleFunction;

    try {
      await task(req, res, next);
    } catch (error) {
      next(error);
    }
    return next();
  };

  private _assetsMiddleware: Runtime.IServerMiddlewareHandler = async (
    req: Runtime.IIncomingMessage,
    res: Runtime.IServerAppResponse,
    next: Runtime.IServerAppNext
  ) => {
    const api = this._api;
    let { path = '' } = req.params || {};
    if (Array.isArray(path)) path = path.join('/');
    const assetAbsPath = api.resolveBuildFile(BUILD_CLIENT_DIR, path);
    try {
      await serveStatic(req, res, assetAbsPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        error.statusCode = 404;
      }
      next(error);
    }
  };
}
