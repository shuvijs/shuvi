import { RouterService } from "@shuvi/core";

export function normalizeRoutes(
  routes: RouterService.RouteConfig[]
): RouterService.RouteConfig[] {
  return routes.map(route => {
    const res = {
      ...route
    };
    if (res.routes) {
      res.routes = normalizeRoutes(res.routes);
    }

    return res
  });
}
