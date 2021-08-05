import { IncomingMessage, ServerResponse } from 'http';
import { ParsedQuery, IParams } from '@shuvi/router';

export interface IRequest extends IncomingMessage {
  url: string;
  pathname: string;
  query: ParsedQuery;
  params: IParams;
}

export interface IResponse extends ServerResponse {}

export interface IApiRequest extends IRequest {
  cookies: { [key: string]: string };
  body: { [key: string]: any };
}

type Send<T> = (body: T) => void;

export type IApiResponse<T = any> = ServerResponse & {
  send: Send<T>;
  json: Send<T>;
  status: (statusCode: number) => IApiResponse<T>;
  redirect(url: string): IApiResponse<T>;
  redirect(status: number, url: string): IApiResponse<T>;
};

export type IApiRouteRequestHandler<T = any> = (
  req: IApiRequest,
  res: IApiResponse<T>
) => void | Promise<void>;

export interface IApiRouteConfig {
  path: string;
  apiRouteModule: {
    default: IApiRouteRequestHandler;
    config?: {
      [key: string]: any;
    };
  };
}
