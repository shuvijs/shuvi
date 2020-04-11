import { IIncomingMessage, IServerResponse } from '../server';
import { serveStatic } from '../lib/serveStatic';
import { BUILD_CLIENT_DIR, PUBLIC_PATH } from '../constants';
import Base from './shuvi.base';

export default class ShuviProd extends Base {
  async init() {
    const api = this._api;
    // If user don't provide a custom asset public path, we need serve it
    if (api.config.publicPath === PUBLIC_PATH) {
      api.server.use(api.assetPublicPath, this._assetsMiddleware.bind(this));
    }
    api.server.use(this._handlePageRequest.bind(this));
  }

  protected getMode() {
    return 'production' as const;
  }

  private async _assetsMiddleware(req: IIncomingMessage, res: IServerResponse) {
    const api = this._api;
    const asestAbsPath = api.resolveBuildFile(BUILD_CLIENT_DIR, req.url!);
    try {
      await serveStatic(req, res, asestAbsPath);
    } catch (err) {
      if (err.code === 'ENOENT' || err.statusCode === 404) {
        this._handle404(req, res);
      } else if (err.statusCode === 412) {
        res.statusCode = 412;
        return res.end();
      } else {
        throw err;
      }
    }
  }
}
