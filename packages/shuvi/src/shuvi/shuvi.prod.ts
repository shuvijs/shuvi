import { Runtime } from '@shuvi/types';
import { serveStatic } from '../lib/serveStatic';
import { BUILD_CLIENT_DIR, PUBLIC_PATH } from '../constants';
import Base from './shuvi.base';

export default class ShuviProd extends Base {
  async init() {
    const api = this._api;
    // If user don't provide a custom asset public path, we need serve it
    if (api.config.publicPath === PUBLIC_PATH) {
      api.server.use(api.assetPublicPath, this._assetsMiddleware);
    }
    api.server.use(this._handlePageRequest);
  }

  protected getMode() {
    return 'production' as const;
  }

  private _assetsMiddleware: Runtime.IKoaHandler = async ctx => {
    const api = this._api;
    const assetAbsPath = api.resolveBuildFile(
      BUILD_CLIENT_DIR,
      ctx.request.url.replace(api.assetPublicPath, '')
    );
    try {
      await serveStatic(ctx, assetAbsPath);
    } catch (err) {
      if (err.code === 'ENOENT' || err.statusCode === 404) {
        this._handle404(ctx);
      } else if (err.statusCode === 412) {
        ctx.status = 412;
        ctx.body = '';
        return;
      } else {
        throw err;
      }
    }
  };
}
