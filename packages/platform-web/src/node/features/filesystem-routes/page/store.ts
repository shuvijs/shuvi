import { IPageRouteConfigWithId } from '@shuvi/platform-shared/shared';

let routes: IPageRouteConfigWithId[] = [];

export const setRoutes = (newRoutes: IPageRouteConfigWithId[]) => {
  routes = newRoutes;
};

export const getRoutes = () => routes;
