import { IncomingMessage, ServerResponse } from 'http';
import { IShuviMode, IConfig, getApi, Api } from '../api';
import * as APIHooks from '../types/hooks';
import {
  IIncomingMessage,
  IServerAppResponse,
  IServerAppNext,
  IServerMiddlewareItem,
  IServerMiddlewareHandler
} from '../types/runtime';
import { matchPathname } from '@shuvi/router';
import { sendHTML } from '../lib/utils';
import { renderToHTML } from '../lib/renderToHTML';
import {
  apiRouteHandler,
  IApiRequestHandler,
  IRequest,
  IResponse
} from '../lib/apiRouteHandler';
import { INextFunc, IRequestHandlerWithNext } from '../server';

export interface IShuviConstructorOptions {
  cwd: string;
  config: IConfig;
  configFile?: string;
}
interface IApiModule {
  default: IApiRequestHandler;
  config?: {
    apiConfig?: {
      bodyParser?: { sizeLimit: number | string } | boolean;
    };
  };
}

export default abstract class Shuvi {
  protected _api!: Api;
  private _apiPromise: Promise<Api>;

  constructor({ cwd, config, configFile }: IShuviConstructorOptions) {
    this._apiPromise = getApi({
      cwd,
      config,
      configFile,
      mode: this.getMode()
    });

    this._handlePageRequest = this._handlePageRequest.bind(this);
    this.renderToHTML = this.renderToHTML.bind(this);
  }

  async prepare(): Promise<void> {
    await this._ensureApiInited();
    await this.init();
  }

  getRequestHandler() {
    return this._api.server.getRequestHandler();
  }

  async renderToHTML(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<string | null> {
    const { server } = this._api.resources.server;
    const { html, appContext } = await renderToHTML({
      req: req as IRequest,
      api: this._api,
      onRedirect(redirect) {
        res.writeHead(redirect.status ?? 302, { Location: redirect.path });
        res.end();
      }
    });

    // set 404 statusCode
    if (appContext.statusCode) {
      res.statusCode = appContext.statusCode;
    } else {
      res.statusCode = 200;
    }

    if (server.onViewDone) {
      server.onViewDone(req, res, { html, appContext });
    }

    return html;
  }

  protected apiRoutesHandler: IRequestHandlerWithNext = async (
    req,
    res,
    next
  ) => {
    const { apiRoutes } = this._api.resources.server;
    const { prefix, ...otherConfig } = this._api.config.apiConfig || {};
    if (!req.url.startsWith(prefix!)) {
      return next();
    }
    let tempApiModule;
    for (const { path, apiModule } of apiRoutes) {
      const match = matchPathname(path, req.pathname);
      if (match) {
        req.params = match.params;
        tempApiModule = apiModule;
        break;
      }
    }
    if (tempApiModule) {
      try {
        const { config: { apiConfig = {} } = {}, default: resolver } =
          tempApiModule as unknown as IApiModule;
        let overridesConfig = {
          ...otherConfig,
          ...apiConfig
        };

        await apiRouteHandler(req, res, resolver, overridesConfig);
      } catch (error) {
        next(error);
      }
    } else {
      next();
    }
  };

  async close() {
    await this._api.destory();
  }

  async listen(port: number, hostname: string = 'localhost'): Promise<void> {
    await this._ensureApiInited();
    this._api.emitEvent<APIHooks.IEventServerListen>('server:listen', {
      port,
      hostname
    });
    await Promise.all([
      this._api.server.listen(port, hostname),
      this.prepare()
    ]);
  }

  protected abstract getMode(): IShuviMode;

  protected abstract init(): Promise<void> | void;

  protected _handleErrorSetStatusCode(
    req: IRequest,
    res: IResponse,
    statusCode: number = 404,
    errorMessage: string = ''
  ) {
    res.statusCode = statusCode;
    res.end(errorMessage);
    return;
  }

  protected async _handlePageRequest(
    req: IRequest,
    res: IResponse,
    next: INextFunc
  ) {
    try {
      const renderToHTML = await this._api.callHook<APIHooks.IHookRenderToHTML>(
        {
          name: 'renderToHTML',
          initialValue: this.renderToHTML
        }
      );
      const html = await renderToHTML(req, res);
      if (html) {
        // send the response
        sendHTML(req, res, html);
      }
    } catch (error) {
      next(error);
    }
  }

  private async _ensureApiInited() {
    if (this._api) {
      return;
    }

    this._api = await this._apiPromise;
  }

  protected _getServerMiddlewares() {
    return this._api.getServerMiddlewares();
  }

  protected _runServerMiddlewares(
    middlewares: IServerMiddlewareItem[]
  ): IServerMiddlewareHandler {
    return async (
      req: IIncomingMessage,
      res: IServerAppResponse,
      next: IServerAppNext
    ) => {
      let i = 0;

      const runNext = () => runMiddleware(middlewares[++i]);

      const runMiddleware = async (middleware: any) => {
        if (i === middlewares.length) {
          return;
        }
        const matchedPath =
          req.pathname && matchPathname(middleware.path, req.pathname);

        if (!matchedPath) {
          await runNext();
          return;
        }
        req.params = matchedPath.params;
        await middleware.handler(req, res, runNext);
      };

      await runMiddleware(middlewares[i]);
    };
  }
}
