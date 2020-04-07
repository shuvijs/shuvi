import http from "http";
import { IConfig } from "@shuvi/types";
import {
  IHTTPRequestHandler,
  IIncomingMessage,
  IServerResponse,
  IServiceMode
} from "@shuvi/core";
import { Api } from "../api";
import { Renderer, isRedirect } from "../renderer";

export interface IShuviConstructorOptions {
  config: IConfig;
}

export default abstract class Shuvi {
  protected _api: Api;
  private _renderer: Renderer;
  private _server: http.Server | null = null;

  constructor({ config }: IShuviConstructorOptions) {
    this._api = new Api({
      mode: this.getServiceMode(),
      config
    });
    this._renderer = new Renderer({ api: this._api });
  }

  async ready(): Promise<void> {
    await this.init();
  }

  getRequestHandler(): IHTTPRequestHandler {
    return this._api.server.getRequestHandler();
  }

  close() {
    if (this._server) {
      this._server.close();
    }
  }

  async listen(port: number, hostname?: string): Promise<void> {
    if (this._server) {
      return;
    }

    const srv = (this._server = http.createServer(this.getRequestHandler()));
    await new Promise((resolve, reject) => {
      // This code catches EADDRINUSE error if the port is already in use
      srv.on("error", reject);
      srv.on("listening", async () => {
        await this.ready();
        resolve();
      });
      srv.listen(port, hostname);
    });
  }

  protected abstract getServiceMode(): IServiceMode;

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
      parsedUrl: req.parsedUrl
    });

    if (isRedirect(result)) {
      res.writeHead(result.status ?? 302, { Location: result.path });
      res.end();
      return;
    }

    res.end(result);
  }
}
