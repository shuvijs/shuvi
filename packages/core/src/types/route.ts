import { IRouteBaseObject } from '@shuvi/router';

export interface IRouteConfig extends IRouteBaseObject {
  children?: IRouteConfig[];
  name?: string;
  component: string;
}

export interface IRoute extends IRouteBaseObject {
  id: string;
  component: any;
  children?: IRoute[];
}
