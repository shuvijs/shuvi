import { Runtime } from '@shuvi/types';
import { getDevMiddleware } from '../lib/devMiddleware';
import { OnDemandRouteManager } from '../lib/onDemandRouteManager';
import { acceptsHtml } from '../lib/utils';
import { serveStatic } from '../lib/serveStatic';
import Base, { IShuviConstructorOptions } from './shuvi.base';
import { throwServerRenderError } from '../lib/throw';

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

    // keep the order
    api.server.use(this._onDemandRouteMgr.getServerMiddleware());
    devMiddleware.apply();
    api.server.use(
      `${api.assetPublicPath}:path(.*)`,
      this._publicDirMiddleware
    );

    this._useServerMiddlewaresHandler()

    api.server.use(this._pageMiddleware);
  }

  protected getMode() {
    return 'development' as const;
  }

  private _publicDirMiddleware: Runtime.IServerMiddlewareHandler = async (
    req: Runtime.IIncomingMessage,
    res: Runtime.IServerAppResponse,
    next: Runtime.IServerAppNext
  ) => {
    const api = this._api;
    let { path = '' } = req.params || {};
    if (Array.isArray(path)) path = path.join('/');
    const assetAbsPath = api.resolvePublicFile(path);
    try {
      await serveStatic(req, res, assetAbsPath);
    } catch (err) {
      if (err.code === 'ENOENT' || err.statusCode === 404 || err.statusCode === 412) {
        return this._handleError(req, res, err.statusCode);
      }else {
        throw err;
      }
    }
  };

  private _pageMiddleware: Runtime.IServerMiddlewareHandler = async (
    req: Runtime.IIncomingMessage,
    res: Runtime.IServerAppResponse,
    next: Runtime.IServerAppNext
  ) => {
    const accept = req.getHeader('accept');
    if (req.method !== 'GET') {
      return next();
    } else if (!accept || typeof accept !== 'string') {
      return next();
    } else if (accept.indexOf('application/json') === 0) {
      return next();
    } else if (
      !acceptsHtml(accept, { htmlAcceptHeaders: ['text/html'] })
    ) {
      return next();
    }

    await this._onDemandRouteMgr.ensureRoutes(
      req.parsedUrl.pathname || '/'
    );

    try {
      await this._handlePageRequest(req, res, next);
    } catch (error) {
      throwServerRenderError(next, error);
    }

    return next();
  };
}
