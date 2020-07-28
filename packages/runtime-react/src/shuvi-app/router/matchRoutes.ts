import { Runtime } from '@shuvi/types';
import { matchRoutes as reactRouterMatchRoutes } from 'react-router-config';

import IMatchedRoute = Runtime.IMatchedRoute;
import IRouteBase = Runtime.IRouteBase;

export function matchRoutes(
  routes: IRouteBase[],
  pathname: string
): IMatchedRoute[] {
  return (reactRouterMatchRoutes(routes, pathname) as any) as IMatchedRoute[];
}
