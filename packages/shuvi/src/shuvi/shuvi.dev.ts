import { IEventBundlerDone } from '@shuvi/types';
import { getProjectInfo } from '@shuvi/toolpack/lib/utils/typeScript';
import { IIncomingMessage, IServerResponse, INextFunction } from '../server';
import { getDevMiddleware } from '../lib/devMiddleware';
import { OnDemandRouteManager } from '../lib/onDemandRouteManager';
import { acceptsHtml } from '../lib/utils';
import { serveStatic } from '../lib/serveStatic';
import {
  DEV_PAGE_STATIC_REGEXP,
  WEBPACK_CONFIG_CLIENT,
  WEBPACK_CONFIG_SERVER,
} from '../constants';
import Base, { IShuviConstructorOptions } from './shuvi.base';

export default class ShuviDev extends Base {
  private _onDemandRouteMgr: OnDemandRouteManager;

  constructor(options: IShuviConstructorOptions) {
    super(options);
    this._onDemandRouteMgr = new OnDemandRouteManager(this._api);
  }

  async init() {
    const api = this._api;

    // prepare app
    await api.buildApp();

    // prepare server
    const devMiddleware = await getDevMiddleware({
      api,
    });
    this._onDemandRouteMgr.devMiddleware = devMiddleware;

    const { useTypeScript } = getProjectInfo(api.paths.rootDir);
    devMiddleware.watchCompiler(WEBPACK_CONFIG_CLIENT, {
      useTypeScript,
      log: console.log.bind(console),
    });
    devMiddleware.watchCompiler(WEBPACK_CONFIG_SERVER, {
      useTypeScript: false,
      log: console.log.bind(console),
    });

    // keep the order
    api.server.use(this._onDemandRouteMiddleware.bind(this));
    devMiddleware.apply();
    api.server.use(api.assetPublicPath, this._plubicDirMiddleware.bind(this));
    api.server.use(this._pageMiddleware.bind(this));

    await devMiddleware.waitUntilValid();
  }

  async listen(port: number, hostname: string = 'localhost'): Promise<void> {
    const status = {
      [WEBPACK_CONFIG_CLIENT]: false,
      [WEBPACK_CONFIG_SERVER]: false,
    };
    this._api.on<IEventBundlerDone>('bundler:done', ({ first, name }) => {
      status[name] = true;
      if (
        first &&
        status[WEBPACK_CONFIG_CLIENT] &&
        status[WEBPACK_CONFIG_SERVER]
      ) {
        const localUrl = `http://${
          hostname === '0.0.0.0' ? 'localhost' : hostname
        }:${port}`;
        console.log(`Ready on ${localUrl}`);
      }
    });

    console.log('Starting the development server...');

    return super.listen(port, hostname);
  }

  protected getMode() {
    return 'development' as const;
  }

  private async _onDemandRouteMiddleware(
    req: IIncomingMessage,
    res: IServerResponse,
    next: INextFunction
  ) {
    const match = req.url!.match(DEV_PAGE_STATIC_REGEXP);
    if (!match) {
      return next();
    }

    const routeId = match[1];
    await this._onDemandRouteMgr.activateRoute(routeId);
    next();
  }

  private async _plubicDirMiddleware(
    req: IIncomingMessage,
    res: IServerResponse
  ) {
    const api = this._api;
    const asestAbsPath = api.resolvePublicFile(req.url!);
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

  private async _pageMiddleware(
    req: IIncomingMessage,
    res: IServerResponse,
    next: INextFunction
  ) {
    const headers = req.headers;
    if (req.method !== 'GET') {
      return next();
    } else if (!headers || typeof headers.accept !== 'string') {
      return next();
    } else if (headers.accept.indexOf('application/json') === 0) {
      return next();
    } else if (
      !acceptsHtml(headers.accept, { htmlAcceptHeaders: ['text/html'] })
    ) {
      return next();
    }

    await this._onDemandRouteMgr.ensureRoutes(req.parsedUrl.pathname || '/');

    let err: Error | undefined;
    try {
      await this._handlePageRequest(req, res);
    } catch (error) {
      console.error('render fail', error);
      err = error;
    }

    next(err);
  }
}
