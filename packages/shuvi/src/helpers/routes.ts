import { RouteConfig } from "@shuvi/types/core";

export function normalizeRoutes(routes: RouteConfig[]): RouteConfig[] {
  return routes.map(route => {
    const res = {
      ...route
    };
    if (res.routes) {
      res.routes = normalizeRoutes(res.routes);
    }

    return res;
  });
}
