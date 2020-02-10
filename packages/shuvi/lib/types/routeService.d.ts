import { RouteConfig } from "@shuvi/types/core";
export interface RouterService {
    getRoutes(): Promise<RouteConfig[]> | RouteConfig[];
}
