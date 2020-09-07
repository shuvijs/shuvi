import { IRouteMatch, IRouteRecord, NavigationGuardHook } from '../types';

export function extractHooks(
  matched: IRouteMatch<any>[],
  method: keyof IRouteRecord, // can add more method later on,
  routeContext: Map<IRouteRecord, any>
): NavigationGuardHook[] {
  const guards: NavigationGuardHook[] = [];

  matched.forEach(({ route }) => {
    const guard = route[method];
    if (typeof guard === 'function') {
      guards.push((to, from, next) => {
        if (!routeContext.has(route)) {
          routeContext.set(route, {});
        }
        guard(to, from, next, routeContext.get(route));
      });
    }
  });

  return guards;
}
