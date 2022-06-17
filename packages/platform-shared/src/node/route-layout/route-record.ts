export interface RouteRecord {
  path: string;
}
export interface ApiRouteRecord extends RouteRecord {
  apiPath: string;
}

export interface MiddlewareRouteRecord extends RouteRecord {
  middlewarePath: string;
}
export interface PageRouteRecord extends RouteRecord {
  pagePath: string;
}
export interface LayoutRouteRecord extends PageRouteRecord {
  children: ConventionRouteRecord[];
}

export type ConventionRouteRecord =
  | ApiRouteRecord
  | MiddlewareRouteRecord
  | PageRouteRecord
  | LayoutRouteRecord;
