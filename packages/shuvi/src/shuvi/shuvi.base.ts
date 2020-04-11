import { IConfig, IShuviMode } from '@shuvi/types';
import {
  IHTTPRequestHandler,
  IIncomingMessage,
  IServerResponse,
} from '../server';
import { Api } from '../api';
import { Renderer, isRedirect } from '../renderer';

export interface IShuviConstructorOptions {
  config: IConfig;
}

export default abstract class Shuvi {
  protected _api: Api;
  private _renderer: Renderer;

  constructor({ config }: IShuviConstructorOptions) {
    this._api = new Api({
      mode: this.getMode(),
      config,
    });
    this._renderer = new Renderer({ api: this._api });
  }

  getRequestHandler(): IHTTPRequestHandler {
    return this._api.server.getRequestHandler();
  }

  async close() {
    await this._api.destory();
  }

  async listen(port: number, hostname?: string): Promise<void> {
    await Promise.all([this._api.server.listen(port, hostname), this._ready()]);
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
    const result = await this._renderer.renderDocument({
      url: req.url,
      parsedUrl: req.parsedUrl,
    });

    if (isRedirect(result)) {
      res.writeHead(result.status ?? 302, { Location: result.path });
      res.end();
      return;
    }

    res.end(result);
  }

  private async _ready(): Promise<void> {
    await this.init();
  }
}
