import { IURLParams, IURLQuery } from '@shuvi/platform-shared/shared';
import { IRequestHandlerWithNext } from '@shuvi/service';
import { IResponse, IRequest } from '@shuvi/service';

export interface IApiReq {
  pathname: string;
  query: IURLQuery;
  params: IURLParams;
  cookies: { [key: string]: string };
  body?: { [key: string]: any };
}

export type IApiRequest = IRequest & IApiReq;

export type Send<T> = (body: T) => void;

export type IApiRes<T = any> = {
  send: Send<T>;
  json: Send<T>;
  status: (statusCode: number) => IApiRes<T>;
  redirect(url: string): IApiRes<T>;
  redirect(status: number, url: string): IApiRes<T>;
};

export type IApiResponse<T = any> = IResponse & IApiRes<T>;

export type IApiRequestHandler<T = any> = (
  req: IApiRequest,
  res: IApiResponse<T>
) => void | Promise<void>;

export interface IApiConfig {
  api?: {
    bodyParser?:
      | {
          sizeLimit: number | string;
        }
      | boolean;
  };
}

export interface IApiHandler {
  default: IApiRequestHandler;
  config?: IApiConfig;
}

export interface IMiddlewareConfig {
  default: IRequestHandlerWithNext;
}

export type IApiRoutes = {
  path: string;
  api: IApiHandler;
}[];

export type IMiddlewareRoutes = {
  path: string;
  middleware: IMiddlewareConfig;
}[];
