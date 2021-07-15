import { IncomingMessage, ServerResponse } from 'http';
import { ParsedQuery, IParams } from '@shuvi/router';

export type { IncomingMessage, ServerResponse };

export interface IRequest extends IncomingMessage {
  url: string;
  pathname: string;
  query: ParsedQuery;
  params: IParams;
}
export interface IResponse extends ServerResponse {}

export type INextFunc = (err?: any) => void;

export type IRequestHandler = (req: IRequest, res: IResponse) => void;

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

export type IMiddlewareHandler =
  | IRequestHandler
  | IRequestHandlerWithNext
  | IErrorHandler
  | IErrorHandlerWithNext;
