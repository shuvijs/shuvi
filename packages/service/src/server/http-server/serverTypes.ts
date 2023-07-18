import { IncomingMessage, ServerResponse } from 'http';
import { IParams, ParsedQuery as IQuery } from '@shuvi/router';
import { Span } from '../../trace';

export interface IRequest extends IncomingMessage {
  url: string;
  pathname: string;
  query: IQuery;
  params: IParams;
  _requestId: string;
  _traces: {
    serverCreateAppTrace: Span;
    serverRequestTrace: Span;
  };
}

export interface IResponse extends ServerResponse {}

export type IRequestHandler<
  Req extends IRequest = IRequest,
  Res extends IResponse = IResponse
> = (req: Req, res: Res) => void;

export type INextFunc = (err?: any) => void;

export type IRequestHandlerWithNext<
  Req extends IRequest = IRequest,
  Res extends IResponse = IResponse
> = (req: Req, res: Res, next: INextFunc) => void;

export type IErrorHandler<
  Req extends IRequest = IRequest,
  Res extends IResponse = IResponse
> = (err: any, req: Req, res: Res) => void;

export type IErrorHandlerWithNext<
  Req extends IRequest = IRequest,
  Res extends IResponse = IResponse
> = (err: any, req: Req, res: Res, next: INextFunc) => void;

export type IAsyncRequestHandler<
  Req extends IRequest = IRequest,
  Res extends IResponse = IResponse
> = (req: IRequest, res: IResponse, next?: INextFunc) => Promise<any>;

export type IMiddlewareHandler<
  Req extends IRequest = any,
  Res extends IResponse = any
> =
  | IRequestHandler<Req, Res>
  | IRequestHandlerWithNext<Req, Res>
  | IAsyncRequestHandler<Req, Res>
  | IErrorHandler<Req, Res>
  | IErrorHandlerWithNext<Req, Res>;

export interface IServerMiddlewareItem {
  path: string;
  handler: IMiddlewareHandler;
}
