import { ShuviServer } from './shuviServer';
import { getAssetMiddleware } from './middlewares/getAssetMiddleware';
import { validateUrlMiddleware } from './middlewares/validateUrlMiddleware';
export class ShuviProdServer extends ShuviServer {
  async init() {
    const { _serverContext: context } = this;
    this._server.use(validateUrlMiddleware);
    this._server.use(getAssetMiddleware(context));
    await this._initMiddlewares();
  }
}
