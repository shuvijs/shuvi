import { ParsedQuery, IParams, IRouteRecord } from '@shuvi/router';

export { IRouter, IRoute, IRouteMatch } from '@shuvi/router';

export type IURLQuery = ParsedQuery;
export type IURLParams = IParams;

export interface IPageRouteRecord extends IRouteRecord {
  id: string;
  path: string;
  component?: any;
  children?: IPageRouteRecord[];
  __componentSource__?: string;
  __componentRawRequest__?: string;
  [x: string]: any;
}

export interface IPlatformConfig {
  name: string;
  framework?: string;
  target?: string;
  [index: string]: any;
}

export type IRouterHistoryMode = 'browser' | 'hash' | 'memory';

export interface IPageRouteConfig {
  children?: IPageRouteConfig[];
  name?: string;
  component?: string;
  redirect?: string;
  path: string;
}

export interface IPageRouteConfigWithId extends IPageRouteConfig {
  id: string;
  children?: IPageRouteConfigWithId[];
}

export interface IMiddlewareRouteConfig {
  path: string;
  middleware: string;
}

export interface IApiRouteConfig {
  path: string;
  api: string;
}
