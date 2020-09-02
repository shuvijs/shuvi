import { IRouteMatch, IRouteRecord } from './types';

export function getRedirectFromRoutes<Route extends IRouteRecord>(
  appRoutes: IRouteMatch<Route>[]
): string | null {
  return appRoutes.reduceRight((redirectPath, { route: { redirect } }) => {
    if (!redirectPath && redirect) {
      return redirect;
    }
    return redirectPath;
  }, null as string | null);
}
