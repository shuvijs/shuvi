import { ShuviServer } from './shuviServer';
import { normalizeServerMiddleware } from './serverMiddleware';
import { IRequestHandlerWithNext, Server } from '../server/http-server';
import { isStaticFileExist, serveStatic } from './utils';
import {
  getDevMiddleware,
  DevMiddleware
} from './middlewares/dev/devMiddleware';
import { IServerPluginContext } from './plugin';
import { applyHttpProxyMiddleware } from './middlewares/httpProxyMiddleware';
import { DEV_HOT_MIDDLEWARE_PATH } from '@shuvi/shared/lib/constants';

const getPublicDirMiddleware = (
  cliContext: IServerPluginContext
): IRequestHandlerWithNext => {
  return async (req, res, next) => {
    let { path = '' } = req.params || {};
    if (Array.isArray(path)) path = path.join('/');
    const assetAbsPath = cliContext.resolvePublicFile(path);
    if (!isStaticFileExist(assetAbsPath)) return next();

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
};

export class ShuviDevServer extends ShuviServer {
  private _addedUpgradeListener: boolean = false;
  private _devMiddleware: DevMiddleware | null = null;

  async init() {
    const { _serverContext: context, _server: server } = this;

    const publicDirMiddleware = getPublicDirMiddleware(context);
    this._devMiddleware = await getDevMiddleware(context);
    await this._devMiddleware.waitUntilValid();
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
        this._options.getMiddlewaresBeforeDevMiddlewares(
          this._devMiddleware,
          context
        )
      ]
        .flat()
        .map(m => normalizeServerMiddleware(m, { rootDir }));
      serverMiddlewaresBeforeDevMiddleware.forEach(({ path, handler }) => {
        server.use(path, handler);
      });
    }

    // keep the order
    this._devMiddleware.apply(server);
    server.use(`${context.assetPublicPath}/:path(.*)`, publicDirMiddleware);

    await this._initMiddlewares();

    // setup upgrade listener eagerly when we can otherwise
    // it will be done on the first request via req.socket.server
    this.setupWebSocketHandler(server);
  }

  setupWebSocketHandler = (server?: Server) => {
    if (!this._addedUpgradeListener) {
      this._addedUpgradeListener = true;

      if (!server) {
        // this is very unlikely to happen but show an error in case
        // it does somehow
        console.error(
          `Invalid IncomingMessage received, make sure http.createServer is being used to handle requests.`
        );
      } else {
        server.onUpgrade((req, socket, head) => {
          let assetPrefix = (
            this._serverContext.getAssetPublicUrl() || ''
          ).replace(/^\/+/, '');
          // assetPrefix can be a proxy server with a url locally
          // if so, it's needed to send these HMR requests with a rewritten url directly to /_next/webpack-hmr
          // otherwise account for a path-like prefix when listening to socket events
          if (assetPrefix.startsWith('http')) {
            assetPrefix = '';
          } else if (assetPrefix) {
            assetPrefix = `/${assetPrefix}`;
          }
          if (
            req.url?.startsWith(
              `${assetPrefix || ''}${DEV_HOT_MIDDLEWARE_PATH}`
            )
          ) {
            this._devMiddleware?.onHMR(req, socket, head);
          }
        });
      }
    }
  };
}
