import { parse as parseUrl } from "url";
import { Connect } from "./connect";
import {
  IConnect,
  IIncomingMessage,
  IServerResponse,
  IRequestHandle,
  INextFunction,
  IHTTPRequestHandler
} from "./types";

export class Server {
  private _connect: IConnect;

  constructor() {
    this._connect = Connect();

    this._connect.use(
      (req: IIncomingMessage, _res: IServerResponse, next: INextFunction) => {
        req.parsedUrl = parseUrl(req.url || "", true);
        next();
      }
    );
  }

  use(handle: IRequestHandle): void {
    this._connect.use(handle);
  }

  getRequestHandler(): IHTTPRequestHandler {
    return this._connect;
  }
}
