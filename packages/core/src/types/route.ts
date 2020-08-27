export interface IUserRouteConfig {
  children?: IUserRouteConfig[];
  name?: string;
  component?: string;
  redirect?: string;
  path: string;
}

export interface IAppRouteConfig {
  id: string;
  component?: any;
  children?: IAppRouteConfig[];
  redirect?: string;
  path: string;
  [x: string]: any;
}
