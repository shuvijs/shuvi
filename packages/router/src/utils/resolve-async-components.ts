import { IRouteMatch, NavigationGuardHook } from '../types';

export function resolveAsyncComponents(
  matched: IRouteMatch<any>[]
): NavigationGuardHook {
  return (to, from, next) => {
    let hasAsync = false;
    let pending = 0;

    const routesToFetch = matched
      .map(({ route }) => {
        return route?.component?.preload!;
      })
      .filter(Boolean);

    const resolve = () => {
      pending--;
      if (pending === 0) {
        next();
      }
    };

    routesToFetch.forEach(preload => {
      hasAsync = true;
      pending++;
      // TODO: check if a component is already resolved

      preload().then(resolve).catch(next);
    });

    if (!hasAsync) next();
  };
}
