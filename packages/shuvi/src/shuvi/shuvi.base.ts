import { IncomingMessage, ServerResponse } from 'http';
import { IShuviMode, APIHooks, Runtime } from '@shuvi/types';
import { getApi, Api } from '../api';
import { sendHTML } from '../lib/sendHtml';
import { renderToHTML } from '../lib/renderToHTML';
import { IConfig } from '../config';
import { throwServerRenderError } from '../lib/throw';
import { normalizeServerMiddleware } from '../api/serverMiddleware';
import { IServerMiddlewareModule } from '@shuvi/types/src/runtime';
import { matchPath } from '@shuvi/router/src';

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
  }

  async ready(): Promise<void> {
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

  protected _getServerMiddlewares() {
    const { extraServerMiddleware } = this._api;

    const {
      server: { serverMiddleware = [] }
    } = this._api.resources.server;

    const { rootDir } = this._api.paths;

    // plugin serverMiddleware => server.js middleware
    const normalizedServerMiddleware = [
      ...extraServerMiddleware,
      ...serverMiddleware
    ].map(middleware => normalizeServerMiddleware(middleware, { rootDir }));
    return normalizedServerMiddleware;
  }

  protected _handle404: Runtime.IServerAppHandler = ctx => {
    ctx.status = 404;
    ctx.body = '';
    return;
  };

  protected _handlePageRequest: Runtime.IServerAppHandler = async ctx => {
    try {
      const html = await this.renderToHTML(ctx.req, ctx.res);
      if (html) {
        sendHTML(ctx, html);
      }
    } catch (error) {
      throwServerRenderError(ctx, error);
    }
  };

  private async _ensureApiInited() {
    if (this._api) {
      return;
    }

    this._api = await this._apiPromise;
  }

  protected _createServerMiddlewaresHandler = (): Runtime.IServerAppMiddleware => {
    let middlewares: IServerMiddlewareModule[];

    return async (ctx, next) => {
      if (!middlewares) {
        middlewares = this._getServerMiddlewares();
      }

      let i = 0;

      const runMiddleware = async (middleware: IServerMiddlewareModule) => {
        if (i === middlewares.length) {
          await next();
          return;
        }
        const matchedPath = matchPath(middleware.path, ctx.request.url);
        if (!matchedPath) {
          await runMiddleware(middlewares[++i]);
          return;
        }
        ctx.params = matchedPath.params;

        await middleware.handler(ctx, () => runMiddleware(middlewares[++i]));
      };

      await runMiddleware(middlewares[i]);
    };
  };
}
