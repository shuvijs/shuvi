import { IRequest, IResponse } from '@shuvi/types';
import { ServerResponse } from 'http';

export type IRequestHandler = (req: IRequest, res: ServerResponse) => void;

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

export type IMiddlewareHandler =
  | IRequestHandler
  | IRequestHandlerWithNext
  | IErrorHandler
  | IErrorHandlerWithNext;
