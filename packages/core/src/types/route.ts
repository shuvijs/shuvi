export interface IUserRouteConfig {
  children?: IUserRouteConfig[];
  name?: string;
  component?: string;
  path: string;
}

export interface IAppRouteConfig {
  id: string;
  component?: any;
  children?: IAppRouteConfig[];
  path: string;
  [x: string]: any;
}
