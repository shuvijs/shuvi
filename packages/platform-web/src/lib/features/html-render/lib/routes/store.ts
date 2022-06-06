import { IRouteConfig } from '@shuvi/service';

let routes: IRouteConfig[] = [];

export const setRoutes = (newRoutes: IRouteConfig[]) => {
  routes = newRoutes;
};

export const getRoutes = () => routes;
