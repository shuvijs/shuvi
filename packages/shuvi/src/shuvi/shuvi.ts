import { App } from "@shuvi/types";
import { parse as parseUrl, UrlWithParsedQuery } from "url";
import { Renderer } from "../renderer";
import {
  createServer,
  Server,
  RequestHandle,
  IncomingMessage,
  ServerResponse,
  NextFunction
} from "../server";

export interface EnhancedIncomingMessage extends IncomingMessage {
  parsedUrl: UrlWithParsedQuery;
}

export type HTTPRequestHandler = (
  req: IncomingMessage,
  res: ServerResponse
) => void;

export default abstract class Shuvi {
  protected _app: App;

  private _renderer: Renderer;
  private _serverApp: Server;

  constructor(app: App) {
    this._app = app;
    this._serverApp = createServer();
    this._renderer = new Renderer({ app });

    this._serverApp.use(
      (req: IncomingMessage, _res: ServerResponse, next: NextFunction) => {
        req.parsedUrl = parseUrl(req.url || "", true);
        next();
      }
    );
  }

  abstract ready(): void;

  getRequestHandler(): HTTPRequestHandler {
    return this._serverApp;
  }

  public handle404(req: IncomingMessage, res: ServerResponse) {
    res.statusCode = 404;
    res.end();
  }

  protected async _use(handle: RequestHandle): Promise<void> {
    this._serverApp.use(handle);
  }

  protected async _handlePageRequest(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const enhancedReq = req as EnhancedIncomingMessage;
    const html = await this._renderer.renderDocument({
      url: enhancedReq.url,
      parsedUrl: enhancedReq.parsedUrl
    });
    res.end(html);
  }
}
