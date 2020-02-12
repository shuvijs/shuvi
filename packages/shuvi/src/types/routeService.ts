import { RouteConfig } from "@shuvi/types/core";

export type SubscribeFn = (v: RouteConfig[]) => void;

export interface RouterService {
  getRoutes(): Promise<RouteConfig[]> | RouteConfig[];
  subscribe(listener: SubscribeFn): void;
}
