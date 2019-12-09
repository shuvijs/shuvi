export interface Route {
  path: string;
  component: string;
}

export type RouteConfig = Route[];

export interface RouterService {
  getRouteConfig(): Promise<RouteConfig> | RouteConfig;
}
