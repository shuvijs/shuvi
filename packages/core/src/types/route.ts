import { IRouteObject } from '@shuvi/router';

export interface IRouteBase extends IRouteObject {
  [x: string]: any;
}

export interface IRouteConfig extends IRouteBase {
  children?: IRouteConfig[];
  name?: string;
  component: string;
}

export interface IRoute extends IRouteBase {
  id: string;
  component: any;
  children?: IRoute[];
}
