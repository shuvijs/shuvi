import {
  ParsedQuery,
  IParams,
  IRouter,
  IRoute,
  IRouteRecord
} from '@shuvi/router';

export type IURLQuery = ParsedQuery;
export type IURLParams = IParams;

export { IRouter, IRoute };

export type IRouteData = {
  routeProps?: { [x: string]: any };
};

export interface IPageRouteRecord extends IRouteRecord {
  id: string;
  component?: any;
  children?: IPageRouteRecord[];
  path: string;
  fullPath?: string;
  __componentSource__?: never;
  __componentSourceWithAffix__?: never;
  __import__?: never;
  __resolveWeak__?: never;
  [x: string]: any;
}

export interface IRawPageRouteRecord extends IRouteRecord {
  id: string;
  component?: any;
  children?: IRawPageRouteRecord[];
  path: string;
  fullPath: string;
  __componentSource__: string;
  __componentSourceWithAffix__: string;
  __import__: () => Promise<any>;
  __resolveWeak__: () => any;
  [x: string]: any;
}
