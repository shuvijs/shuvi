import { IncomingMessage, ServerResponse } from 'http';
import { IShuviMode, APIHooks, Runtime } from '@shuvi/types';
import { getApi, Api } from '../api';
import { sendHTML } from '../lib/sendHtml';
import { renderToHTML } from '../lib/renderToHTML';
import { IConfig } from '../config';
import { throwServerRenderError } from '../lib/throw';

export interface IShuviConstructorOptions {
  cwd: string;
  config: IConfig;
  configFile?: string;
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

  async ready(): Promise<void> {
    await this._ensureApiInited();
    await this.init();
  }

  getRequestHandler(): Runtime.IServerApp {
    return this._api.server.getRequestHandler();
  }

  async renderToHTML(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<string | null> {
    const { server } = this._api.resources.server;
    const { html, appContext } = await renderToHTML({
      req: req as Runtime.IRequest,
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

  async close() {
    await this._api.destory();
  }

  async listen(port: number, hostname: string = 'localhost'): Promise<void> {
    await this._ensureApiInited();
    this._api.emitEvent<APIHooks.IEventServerListen>('server:listen', {
      port,
      hostname
    });
    await Promise.all([this._api.server.listen(port, hostname), this.ready()]);
  }

  protected abstract getMode(): IShuviMode;

  protected abstract init(): Promise<void> | void;

  protected _handleError(
    req: Runtime.IIncomingMessage,
    res: Runtime.IServerAppResponse,
    statusCode: number = 404,
    errorMessage: string = ''
  ) {
    res.statusCode = statusCode;
    res.end(errorMessage);
    return;
  }

  protected async _handlePageRequest(req: Runtime.IIncomingMessage, res: Runtime.IServerAppResponse, next: Runtime.IServerAppNext) {
    try {
      const renderToHTML = await this._api.callHook<APIHooks.IHookRenderToHTML>(
        {
          name: 'renderToHTML',
          initialValue: this.renderToHTML
        }
      );
      const html = await renderToHTML(req, res);
      if (html) {
        sendHTML(req, res, html);
      }
    } catch (error) {
      throwServerRenderError(next, error);
    }
  }

  private async _ensureApiInited() {
    if (this._api) {
      return;
    }

    this._api = await this._apiPromise;
  }

  protected _useServerMiddlewaresHandler = () => {
    const middlewares = this._api.getServerMiddlewares();
    for(const { path, handler } of middlewares){
      this._api.server.use(path, handler);
    }
  };

  // protected _runServerMiddlewares(
  //   middlewares: Runtime.IServerMiddlewareItem[]
  // ): Runtime.IServerMiddlewareHandler {
  //   return async (ctx, next) => {
  //     let i = 0;
  //
  //     const runNext = () => runMiddleware(middlewares[++i]);
  //
  //     const runMiddleware = async (
  //       middleware: Runtime.IServerMiddlewareItem
  //     ) => {
  //       if (i === middlewares.length) {
  //         await next();
  //         return;
  //       }
  //       const matchedPath = matchPathname(middleware.path, ctx.request.path);
  //
  //       if (!matchedPath) {
  //         await runNext();
  //         return;
  //       }
  //       ctx.params = matchedPath.params;
  //
  //       await middleware.handler(ctx, runNext);
  //     };
  //
  //     await runMiddleware(middlewares[i]);
  //   };
  // }
}
