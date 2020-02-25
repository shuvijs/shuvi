import { RouteConfig } from "@shuvi/core";

export type SubscribeFn = (v: RouteConfig[]) => void;

export interface RouterService {
  getRoutes(): Promise<RouteConfig[]> | RouteConfig[];
  subscribe(listener: SubscribeFn): void;
}
