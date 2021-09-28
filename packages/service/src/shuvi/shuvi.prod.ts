import { serveStatic } from '../lib/serveStatic';
import { IRequestHandlerWithNext } from '../server';
import { BUILD_CLIENT_DIR, PUBLIC_PATH } from '../constants';
import Base from './shuvi.base';
import { IIncomingMessage, NextHandleFunction } from '../types/runtime';

export default class ShuviProd extends Base {
  async init() {
    const api = this._api;

    // If user don't provide a custom asset public path, we need serve it
    if (api.config.publicPath === PUBLIC_PATH) {
      api.server.use(`${api.assetPublicPath}:path(.*)`, this._assetsMiddleware);
    }
    api.server.use(this._createServerMiddlewaresHandler);
    api.server.use(this.apiRoutesHandler);
    api.server.use(this._handlePageRequest);
  }

  protected getMode() {
    return 'production' as const;
  }

  private _createServerMiddlewaresHandler: IRequestHandlerWithNext = (
    req,
    res,
    next
  ) => {
    const middlewares = this._getServerMiddlewares();

    const task = this._runServerMiddlewares(
      middlewares
    ) as unknown as NextHandleFunction;
    task(req as unknown as IIncomingMessage, res, next);
  };

  private _assetsMiddleware: IRequestHandlerWithNext = async (
    req,
    res,
    next
  ) => {
    const api = this._api;
    let { path = '' } = req.params || {};
    if (Array.isArray(path)) path = path.join('/');
    const assetAbsPath = api.resolveBuildFile(BUILD_CLIENT_DIR, path);
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
}
