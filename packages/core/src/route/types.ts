export interface IRouteBase {
  path?: string;
  exact?: boolean;
  componentFile: string;
  [x: string]: any;
}

export interface IRouteConfig extends IRouteBase {
  routes?: IRouteConfig[];
  component?: string;
}

export interface IRoute extends IRouteBase {
  id: string;
  routes?: IRoute[];
  component?: any;
}
