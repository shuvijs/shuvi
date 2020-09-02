import { IRouteRecord } from '@shuvi/router';

export interface IUserRouteConfig {
  children?: IUserRouteConfig[];
  name?: string;
  component?: string;
  redirect?: string;
  path: string;
}

export interface IAppRouteConfig extends IRouteRecord {
  id: string;
  component?: any;
  children?: IAppRouteConfig[];
  path: string;
  [x: string]: any;
}
