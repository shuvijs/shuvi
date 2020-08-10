export interface IRouteConfig {
  children?: IRouteConfig[];
  name?: string;
  component?: string;
  path: string;
}

export interface IRoute {
  id: string;
  component?: any;
  children?: IRoute[];
  path: string;
  [x: string]: any;
}
