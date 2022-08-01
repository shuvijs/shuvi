import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http';
import { IParams, ParsedQuery as IQuery } from '@shuvi/router';

export interface IRequest extends IncomingMessage {
  url: string;
  pathname: string;
  query: IQuery;
  params: IParams;
  headers: IncomingHttpHeaders;
  [x: string]: any;
}

export interface IResponse extends ServerResponse {}

export type IRequestHandler = (req: IRequest, res: IResponse) => void;

export type INextFunc = (err?: any) => void;

export type IRequestHandlerWithNext = (
  req: IRequest,
  res: IResponse,
  next: INextFunc
) => void;

export type IErrorHandler = (err: any, req: IRequest, res: IResponse) => void;

export type IErrorHandlerWithNext = (
  err: any,
  req: IRequest,
  res: IResponse,
  next: INextFunc
) => void;

export type IAsyncRequestHandler = (
  req: IRequest,
  res: IResponse,
  next?: INextFunc
) => Promise<any>;

export type IMiddlewareHandler =
  | IRequestHandler
  | IRequestHandlerWithNext
  | IAsyncRequestHandler
  | IErrorHandler
  | IErrorHandlerWithNext;

export interface IServerMiddlewareItem {
  path: string;
  handler: IMiddlewareHandler;
}
