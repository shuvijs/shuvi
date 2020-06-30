import http from 'http';
import { UrlWithParsedQuery } from 'url';
import { Server, NextFunction } from 'connect';

export interface IIncomingMessage extends http.IncomingMessage {
  url: string;
  parsedUrl: UrlWithParsedQuery;
  originalUrl?: http.IncomingMessage['url'];
  [x: string]: any;
}

export interface IServerResponse extends http.ServerResponse {}

export type ISimpleHandleFunction = (
  req: IIncomingMessage,
  res: IServerResponse
) => any;
export type INextHandleFunction = (
  req: IIncomingMessage,
  res: IServerResponse,
  next: INextFunction
) => any;
export type IErrorHandleFunction = (
  err: any,
  req: IIncomingMessage,
  res: IServerResponse,
  next: INextFunction
) => any;
export type IHandleFunction =
  | ISimpleHandleFunction
  | INextHandleFunction
  | IErrorHandleFunction;

export interface IConnect extends NodeJS.EventEmitter {
  (req: http.IncomingMessage, res: http.ServerResponse, next?: Function): void;

  route: string;

  use(fn: IHandleFunction): Server;
  use(route: string, fn: IHandleFunction): Server;

  listen(
    port: number,
    hostname?: string,
    backlog?: number,
    callback?: Function
  ): http.Server;
  listen(port: number, hostname?: string, callback?: Function): http.Server;
  listen(path: string, callback?: Function): http.Server;
  listen(handle: any, listeningListener?: Function): http.Server;
}

export type IRequestHandle =
  | ISimpleHandleFunction
  | INextHandleFunction
  | IErrorHandleFunction;

export type IHTTPRequestHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => void;

export type INextFunction = NextFunction;
