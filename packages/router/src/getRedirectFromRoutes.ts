import { IRouteMatch, IRouteRecord } from './types';

export function getRedirectFromRoutes<Route extends IRouteRecord>(
  routes: IRouteMatch<Route>[]
): string | null {
  return routes.reduceRight((redirectPath, { route: { redirect } }) => {
    if (!redirectPath && redirect) {
      return redirect;
    }
    return redirectPath;
  }, null as string | null);
}
