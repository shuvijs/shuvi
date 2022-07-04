import { ParsedQuery, IParams, IRouteRecord } from '@shuvi/router';

export { IRouter, IRoute, IRouteMatch } from '@shuvi/router';

export type IURLQuery = ParsedQuery;
export type IURLParams = IParams;

export interface IPageRouteRecord extends IRouteRecord {
  id: string;
  component?: any;
  children?: IPageRouteRecord[];
  path: string;
  fullPath?: string;
  __componentSource__?: never;
  __componentSourceWithAffix__?: string;
  __import__?: never;
  __resolveWeak__?: () => any;
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
