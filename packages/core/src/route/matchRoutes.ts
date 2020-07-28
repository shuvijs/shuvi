import {
  matchRoutes as matcher,
  PartialLocation,
  IRouteObject,
  IRouteMatch
} from '@shuvi/router';

export function matchRoutes<
  Element = any,
  RouteObject extends IRouteObject<Element> = IRouteObject<Element>
>(
  routes: RouteObject[],
  location: string | PartialLocation,
  basename = ''
): IRouteMatch<RouteObject>[] {
  return (
    (matcher(routes, location, basename) as IRouteMatch<RouteObject>[]) || []
  );
}
