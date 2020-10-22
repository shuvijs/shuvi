import { Runtime } from '@shuvi/types';
import { getDevMiddleware } from '../lib/devMiddleware';
import { OnDemandRouteManager } from '../lib/onDemandRouteManager';
import { acceptsHtml } from '../lib/utils';
import { serveStatic } from '../lib/serveStatic';
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

    // keep the order
    api.server.use(this._onDemandRouteMgr.getServerMiddleware());
    devMiddleware.apply();
    api.server.use(api.assetPublicPath, this._publicDirMiddleware);
    api.server.use(this._pageMiddleware);

    await devMiddleware.waitUntilValid();
  }

  protected getMode() {
    return 'development' as const;
  }

  private _publicDirMiddleware: Runtime.IKoaHandler = async ctx => {
    const api = this._api;
    const assetAbsPath = api.resolvePublicFile(
      ctx.request.url.replace(api.assetPublicPath, '')
    );
    try {
      await serveStatic(ctx, assetAbsPath);
    } catch (err) {
      if (err.code === 'ENOENT' || err.statusCode === 404) {
        this._handle404(ctx);
      } else if (err.statusCode === 412) {
        ctx.status = 412;
        ctx.body = '';
        return;
      } else {
        throw err;
      }
    }
  };

  private _pageMiddleware: Runtime.IKoaMiddleware = async (ctx, next) => {
    const headers = ctx.request.headers;
    if (ctx.request.method !== 'GET') {
      return await next();
    } else if (!headers || typeof headers.accept !== 'string') {
      return await next();
    } else if (headers.accept.indexOf('application/json') === 0) {
      return await next();
    } else if (
      !acceptsHtml(headers.accept, { htmlAcceptHeaders: ['text/html'] })
    ) {
      return await next();
    }

    await this._onDemandRouteMgr.ensureRoutes(
      (ctx.req as Runtime.IIncomingMessage).parsedUrl.pathname || '/'
    );

    let err: Error | undefined;
    try {
      await this._handlePageRequest(ctx);
    } catch (error) {
      console.error('render fail', error);
      err = error;
      // TODO
      ctx.app.emit('error', err, ctx);
    }

    await next();
  };
}
