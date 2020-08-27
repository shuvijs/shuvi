import { IRouteMatch, NavigationGuardHook } from '../types';

export function extractHooks(
  matched: IRouteMatch<any>[],
  method: 'beforeEnter' // can add more method later on
): NavigationGuardHook[] {
  const guards: NavigationGuardHook[] = [];

  matched.forEach(({ route: { [method]: guardToExtract } }) => {
    if (typeof guardToExtract === 'function') {
      guards.push(guardToExtract);
    }
  });

  return guards;
}
