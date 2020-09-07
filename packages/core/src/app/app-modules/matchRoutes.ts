import {
  matchRoutes as matcher,
  PartialLocation,
  IRouteMatch,
  IRouteBaseObject
} from '@shuvi/router';

// matchRoutes can support any `routes` object
export function matchRoutes<T extends IRouteBaseObject>(
  routes: T[],
  location: string | PartialLocation,
  basename = ''
): IRouteMatch<T>[] {
  return matcher(routes, location, basename) || [];
}
