import { ShuviServer } from './shuviServer';
import { getAssetMiddleware } from './middlewares/getAssetMiddleware';
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
