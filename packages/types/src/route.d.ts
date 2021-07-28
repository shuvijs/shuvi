import { IRouteRecord } from '@shuvi/router';
export interface IUserRouteConfig {
  children?: IUserRouteConfig[];
  name?: string;
  component?: string;
  redirect?: string;
  path: string;
  id?: string;
}

export interface IAppRouteConfig extends IRouteRecord {
  id: string;
  component?: any;
  children?: IAppRouteConfig[];
  path: string;
  __componentSource__?: string;
  __componentSourceWithAffix__?: string;
  __import__?: () => Promise<any>;
  __resolveWeak__?: () => any;
  [x: string]: any;
}
