import { ParsedQuery, IParams, IRouteRecord } from '@shuvi/router';
import {
  IRouter as IRouter_,
  IRoute,
  IRouteMatch,
  PathRecord
} from '@shuvi/router';

export { IRoute, IRouteMatch, PathRecord };

export type IURLQuery = ParsedQuery;
export type IURLParams = IParams;
export type IRouter = IRouter_<IPageRouteRecord>;

export interface IPageRouteRecord extends IRouteRecord {
  id: string;
  path: string;
  component?: any;
  children?: IPageRouteRecord[];
  __import__?: () => Promise<any>;
  __resolveWeak__?: () => string[];
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

export interface INormalizedPageRouteConfig extends IPageRouteConfig {
  id: string;
  children?: INormalizedPageRouteConfig[];
}

export interface IMiddlewareRouteConfig {
  path: string;
  middleware: string;
}

export interface IApiRouteConfig {
  path: string;
  api: string;
}
