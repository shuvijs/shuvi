import { Runtime } from "@shuvi/types";
import { matchRoutes as reactRouterMatchRoutes } from "react-router-config";

import IMatchedRoute = Runtime.IMatchedRoute;
import IRoute = Runtime.IRoute;

export function matchRoutes(
  routes: IRoute[],
  pathname: string
): IMatchedRoute[] {
  return (reactRouterMatchRoutes(routes, pathname) as any) as IMatchedRoute[];
}
