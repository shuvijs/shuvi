import http from "http";
import Connect from "connect";

export class IncomingMessage extends http.IncomingMessage {
  originalUrl?: http.IncomingMessage["url"];
  [x: string]: any;
}

export class ServerResponse extends http.ServerResponse {
  [x: string]: any;
}

export type SimpleHandleFunction = (
  req: IncomingMessage,
  res: ServerResponse
) => any;
export type NextHandleFunction = (
  req: IncomingMessage,
  res: ServerResponse,
  next: NextFunction
) => any;
export type ErrorHandleFunction = (
  err: any,
  req: IncomingMessage,
  res: ServerResponse,
  next: NextFunction
) => any;

export type Server = Connect.Server;

export type RequestHandle =
  | SimpleHandleFunction
  | NextHandleFunction
  | ErrorHandleFunction;

export type NextFunction = Connect.NextFunction;

export function createServer(): Server {
  return Connect();
}
