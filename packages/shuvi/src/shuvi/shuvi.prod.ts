import { Runtime } from '@shuvi/types';
import { serveStatic } from '../lib/serveStatic';
import { asyncMiddlewareWarp } from '../lib/utils';
import { BUILD_CLIENT_DIR, PUBLIC_PATH } from '../constants';
import Base from './shuvi.base';

export default class ShuviProd extends Base {
  async init() {
    const api = this._api;

    // If user don't provide a custom asset public path, we need serve it
    if (api.config.publicPath === PUBLIC_PATH) {
      api.server.use(
        `${api.assetPublicPath}:path(.*)`,
        asyncMiddlewareWarp(this._assetsMiddleware)
      );
    }

    api.server.use(asyncMiddlewareWarp(this._handlePageRequest));

    api.server.use(this.errorHandler);
  }

  protected getMode() {
    return 'production' as const;
  }

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
      throw error;
    }
  };
}
