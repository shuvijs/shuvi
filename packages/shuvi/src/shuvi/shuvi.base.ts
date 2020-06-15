import { IShuviMode, APIHooks } from '@shuvi/types';
import {
  IHTTPRequestHandler,
  IIncomingMessage,
  IServerResponse
} from '../server';
import { Api } from '../api';
import { IConfig } from '../config';
import { IRenderRequest } from '../renderer';
import { sendHTML } from '../lib/sendHtml';
import { renderToHTML } from '../lib/renderToHTML';

export interface IShuviConstructorOptions {
  config: IConfig;
}

export default abstract class Shuvi {
  protected _api: Api;

  constructor({ config }: IShuviConstructorOptions) {
    this._api = new Api({
      mode: this.getMode(),
      config
    });
  }

  async ready(): Promise<void> {
    await this.init();
  }

  getRequestHandler(): IHTTPRequestHandler {
    return this._api.server.getRequestHandler();
  }

  async close() {
    await this._api.destory();
  }

  async listen(port: number, hostname: string = 'localhost'): Promise<void> {
    this._api.emitEvent<APIHooks.IEventServerListen>('server:listen', {
      port,
      hostname
    });
    await Promise.all([this._api.server.listen(port, hostname), this.ready()]);
  }

  protected abstract getMode(): IShuviMode;

  protected abstract init(): Promise<void> | void;

  protected _handle404(req: IIncomingMessage, res: IServerResponse) {
    res.statusCode = 404;
    res.end();
  }

  protected async _handlePageRequest(
    req: IIncomingMessage,
    res: IServerResponse
  ): Promise<void> {
    req.url = req.url || '/';
    const renderRequest = req as IRenderRequest;

    const html = await renderToHTML({
      api: this._api,
      req: renderRequest,
      onRedirect(redirect) {
        res.writeHead(redirect.status ?? 302, { Location: redirect.path });
        res.end();
      }
    });

    if (html) {
      sendHTML(req, res, html);
    }
  }
}
