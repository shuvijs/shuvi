import { INormalizedPageRouteConfig } from '@shuvi/platform-shared/shared';

let routes: INormalizedPageRouteConfig[] = [];

export const setRoutes = (newRoutes: INormalizedPageRouteConfig[]) => {
  routes = newRoutes;
};

export const getRoutes = () => routes;
