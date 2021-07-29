import { IncomingMessage, ServerResponse } from 'http';
import { IShuviMode, APIHooks, Runtime } from '@shuvi/types';
import { matchPathname } from '@shuvi/router';
import { getApi, Api } from '../api';
import { sendHTML } from '../lib/utils';
import { renderToHTML } from '../lib/renderToHTML';
import {
  IRequest,
  IResponse,
  INextFunc,
  IRequestHandlerWithNext
} from '../server';
import { IConfig } from '../config';

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

  protected apiRoutesHandler: IRequestHandlerWithNext = async (
    req,
    res,
    next
  ) => {
    const { apiRoutes } = this._api.resources.server;
    let reqHandler;
    for (const { path, handler } of apiRoutes) {
      const match = matchPathname(path, req.pathname);
      if (match) {
        req.params = match.params;
        reqHandler = handler;
        break;
      }
    }
    if (reqHandler) {
      try {
        await reqHandler(req, res);
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
}
