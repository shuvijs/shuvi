export interface IRouteBase {
  path?: string;
  exact?: boolean;
  routes?: IRouteBase[];
  [x: string]: any;
}

export interface IRouteConfig extends IRouteBase {
  routes?: IRouteConfig[];
  component: string;
}

export interface IRoute extends IRouteBase {
  id: string;
  component: any;
  routes?: IRoute[];
}
