import { getDevMiddleware } from '../lib/devMiddleware';
import { OnDemandRouteManager } from '../lib/onDemandRouteManager';
import { acceptsHtml } from '../lib/utils';
import { serveStatic } from '../lib/serveStatic';
import { applyHttpProxyMiddleware } from '../lib/httpProxyMiddleware';
import { IRequestHandlerWithNext } from '../server';
import Base, { IShuviConstructorOptions } from './shuvi.base';

export default class ShuviDev extends Base {
  private _onDemandRouteMgr!: OnDemandRouteManager;

  constructor(options: IShuviConstructorOptions) {
    super(options);
  }

  async init() {
    const api = this._api;
    this._onDemandRouteMgr = new OnDemandRouteManager(api);

    // prepare app
    await api.buildApp();

    // prepare server
    const devMiddleware = await getDevMiddleware({
      api
    });
    this._onDemandRouteMgr.devMiddleware = devMiddleware;

    await devMiddleware.waitUntilValid();

    if (api.config.proxy) {
      applyHttpProxyMiddleware(api.server, api.config.proxy);
    }

    // keep the order
    api.server.use(this._onDemandRouteMgr.getServerMiddleware());
    devMiddleware.apply();
    api.server.use(
      `${api.assetPublicPath}:path(.*)`,
      this._publicDirMiddleware
    );
    api.server.use(this.apiRoutesHandler);
    api.server.use(this._pageMiddleware);
  }

  protected getMode() {
    return 'development' as const;
  }

  private _publicDirMiddleware: IRequestHandlerWithNext = async (
    req,
    res,
    next
  ) => {
    const api = this._api;
    let { path = '' } = req.params || {};
    if (Array.isArray(path)) path = path.join('/');
    const assetAbsPath = api.resolvePublicFile(path);

    let err = null;
    try {
      await serveStatic(req, res, assetAbsPath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        error.statusCode = 404;
      }
      err = error;
    }
    next(err);
  };

  private _pageMiddleware: IRequestHandlerWithNext = async (req, res, next) => {
    const accept = req.headers['accept'];
    if (req.method !== 'GET') {
      return next();
    } else if (!accept) {
      return next();
    } else if (accept.indexOf('application/json') === 0) {
      return next();
    } else if (!acceptsHtml(accept, { htmlAcceptHeaders: ['text/html'] })) {
      return next();
    }

    let err = null;
    try {
      await this._onDemandRouteMgr.ensureRoutes(req.pathname || '/');
      await this._handlePageRequest(req, res, next);
    } catch (error) {
      err = error;
    }
    next(err);
  };
}
