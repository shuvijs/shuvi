import { IPartialRouteRecord, IRouteRecord } from './types';

export function createRoutesFromArray<
  T extends IPartialRouteRecord,
  U extends IRouteRecord
>(
  array: T[],
  /**
   * allowEmptyPath: allow empty path for children
   * A pageBranch could be ended with a page route with empty path.
   */
  allowEmptyPath = false
): U[] {
  return array.map(partialRoute => {
    const defaultPath = allowEmptyPath ? '' : '/';
    let route: U = {
      ...(partialRoute as any),
      caseSensitive: !!partialRoute.caseSensitive,
      path: partialRoute.path || defaultPath
    };

    if (partialRoute.children) {
      route.children = createRoutesFromArray(partialRoute.children, true);
    }

    return route;
  });
}
