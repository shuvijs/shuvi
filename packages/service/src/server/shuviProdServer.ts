import { ShuviServer } from './shuviServer';
import { getAssetMiddleware } from './middlewares/getAssetMiddleware';
export class ShuviProdServer extends ShuviServer {
  async init() {
    const { _serverContext: context } = this;
    this._server.use(getAssetMiddleware(context));
    await this._initMiddlewares();
  }
}
