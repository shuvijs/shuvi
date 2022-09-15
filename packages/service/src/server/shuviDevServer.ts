import { DEV_HOT_MIDDLEWARE_PATH } from '@shuvi/shared/lib/constants';
import { Bunlder } from '../bundler';
import { Server } from '../server/http-server';
import { ShuviServer } from './shuviServer';
import { normalizeServerMiddleware } from './serverMiddleware';
import {
  getDevMiddleware,
  DevMiddleware
} from './middlewares/dev/devMiddleware';
import { applyHttpProxyMiddleware } from './middlewares/httpProxyMiddleware';
import { getAssetMiddleware } from './middlewares/getAssetMiddleware';
import { ShuviDevServerOptions, ShuviRequestHandler } from './shuviServerTypes';

export class ShuviDevServer extends ShuviServer {
  private _bundler: Bunlder;

  constructor(
    corePluginContext: any,
    { bundler, ...options }: ShuviDevServerOptions
  ) {
    super(corePluginContext, options);
    this._bundler = bundler;
  }

  async init() {
    const { _serverContext: context, _server: server } = this;
    const { rootDir } = context.paths;

    const devMiddleware = getDevMiddleware(this._bundler, context);

    let valid = false;
    // muse be the first middleware, to make sure the build is finisehd.
    server.use((async (_req, _resp, next) => {
      if (!valid) {
        await devMiddleware.waitUntilValid();
        valid = true;
      }
      next();
    }) as ShuviRequestHandler);

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

    if (context.config.proxy) {
      applyHttpProxyMiddleware(server, context.config.proxy);
    }
    // keep the order
    devMiddleware.apply(server);
    server.use(getAssetMiddleware(context, true));
    await this._initMiddlewares();

    // setup upgrade listener eagerly when we can otherwise
    // it will be done on the first request via req.socket.server
    this._setupWebSocketHandler(server, devMiddleware);
  }

  // todo: move into devMiddleware?
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
