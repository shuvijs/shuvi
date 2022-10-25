import {
  ShuviRequest,
  ShuviResponse,
  ShuviRequestHandler
} from '@shuvi/service';

export interface IApiReq {
  body?: { [key: string]: any };
}

export type IApiRequest = ShuviRequest & IApiReq;

export type Send<T> = (body: T) => void;

export type IApiRes<T = any> = {
  send: Send<T>;
  json: Send<T>;
  status: (statusCode: number) => IApiRes<T>;
  redirect(url: string): IApiRes<T>;
  redirect(status: number, url: string): IApiRes<T>;
};

export type IApiResponse<T = any> = ShuviResponse & IApiRes<T>;

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
  default: ShuviRequestHandler;
}

export type IApiRoutes = {
  path: string;
  api: IApiHandler;
}[];

export type IMiddlewareRoutes = {
  path: string;
  middleware: IMiddlewareConfig;
}[];
