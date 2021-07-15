import { Runtime } from '@shuvi/types';
import { getDevMiddleware } from '../lib/devMiddleware';
import { OnDemandRouteManager } from '../lib/onDemandRouteManager';
import { acceptsHtml, asyncMiddlewareWarp } from '../lib/utils';
import { serveStatic } from '../lib/serveStatic';
import Base, { IShuviConstructorOptions } from './shuvi.base';
import { httpProxyMiddleware } from '../server';

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
      httpProxyMiddleware(api.server, api.config.proxy);
    }

    // keep the order
    api.server.use(
      asyncMiddlewareWarp(this._onDemandRouteMgr.getServerMiddleware())
    );
    devMiddleware.apply();
    api.server.use(
      `${api.assetPublicPath}:path(.*)`,
      asyncMiddlewareWarp(this._publicDirMiddleware)
    );

    api.server.use(asyncMiddlewareWarp(this._pageMiddleware));

  }

  protected getMode() {
    return 'development' as const;
  }

  private _publicDirMiddleware: Runtime.IServerAsyncMiddlewareHandler = async (
    req,
    res,
    next
  ) => {
    const api = this._api;
    let { path = '' } = req.params || {};
    if (Array.isArray(path)) path = path.join('/');
    const assetAbsPath = api.resolvePublicFile(path);
    try {
      await serveStatic(req, res, assetAbsPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        error.statusCode = 404;
      }
      throw error;
    }
  };

  private _pageMiddleware: Runtime.IServerAsyncMiddlewareHandler = async (
    req,
    res,
    next
  ) => {
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

    await this._onDemandRouteMgr.ensureRoutes(req.parsedUrl.pathname || '/');

    await this._handlePageRequest(req, res, next);

    return next();
  };
}
