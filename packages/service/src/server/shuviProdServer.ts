import { ShuviServer } from './shuviServer';
import { getAssetMiddleware } from './middlewares/getAssetMiddleware';
import { setupAppConfigMiddleware } from './middlewares/setupAppConfigMiddleware';
export class ShuviProdServer extends ShuviServer {
  async init() {
    const { _serverContext: context } = this;
    this._server.use(getAssetMiddleware(context));
    this._server.use(setupAppConfigMiddleware(context));
    await this._initMiddlewares();
  }
}
