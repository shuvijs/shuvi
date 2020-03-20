interface IRouteBase {
  id: string;
  path?: string | string[];
  exact?: boolean;
  componentFile: string;
  [x: string]: any;
}

export interface IRouteConfig extends IRouteBase {
  routes?: IRouteConfig[];
  component?: string;
}

export interface IRoute extends IRouteBase {
  routes?: IRoute[];
  component?: any;
}
