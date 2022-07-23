import { ShuviServer } from './shuviServer';
import { normalizeServerMiddleware } from './serverMiddleware';
import { Server } from '../server/http-server';
import {
  getDevMiddleware,
  DevMiddleware
} from './middlewares/dev/devMiddleware';
import { applyHttpProxyMiddleware } from './middlewares/httpProxyMiddleware';
import { getAssetMiddleware } from './middlewares/getAssetMiddleware';
import { DEV_HOT_MIDDLEWARE_PATH } from '@shuvi/shared/lib/constants';

export class ShuviDevServer extends ShuviServer {
  async init() {
    const { _serverContext: context, _server: server } = this;
    const publicDirMiddleware = getAssetMiddleware(context, true);
    const devMiddleware = await getDevMiddleware(context);
    await devMiddleware.waitUntilValid();
    const proxy = [];
    let proxyFromConfig = context.config.proxy;
    if (proxyFromConfig && typeof proxyFromConfig === 'object') {
      if (Array.isArray(proxyFromConfig)) {
        proxy.unshift(...proxyFromConfig);
      } else if (Object.keys(proxyFromConfig).length) {
        proxy.unshift(proxyFromConfig);
      }
    }
    if (proxy.length) {
      applyHttpProxyMiddleware(server, proxy);
    }

    const { rootDir } = context.paths;
    if (this._options.getMiddlewaresBeforeDevMiddlewares) {
      const serverMiddlewaresBeforeDevMiddleware = [
        this._options.getMiddlewaresBeforeDevMiddlewares(devMiddleware, context)
      ]
        .flat()
        .map(m => normalizeServerMiddleware(m, { rootDir }));
      serverMiddlewaresBeforeDevMiddleware.forEach(({ path, handler }) => {
        server.use(path, handler);
      });
    }

    // keep the order
    devMiddleware.apply(server);
    server.use(`${context.assetPublicPath}/:path(.*)`, publicDirMiddleware);

    await this._initMiddlewares();

    // setup upgrade listener eagerly when we can otherwise
    // it will be done on the first request via req.socket.server
    this._setupWebSocketHandler(server, devMiddleware);
  }

  private _setupWebSocketHandler = (
    server: Server,
    devMiddleware: DevMiddleware
  ) => {
    server.onUpgrade((req, socket, head) => {
      if (req.url?.startsWith(DEV_HOT_MIDDLEWARE_PATH)) {
        devMiddleware.onHMR(req, socket, head);
      }
    });
  };
}
