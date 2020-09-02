import { IPartialRouteRecord, IRouteRecord } from './types';

export function createRoutesFromArray<
  T extends IPartialRouteRecord,
  U extends IRouteRecord
>(array: T[]): U[] {
  return array.map(partialRoute => {
    let route: U = {
      ...(partialRoute as any),
      caseSensitive: !!partialRoute.caseSensitive,
      path: partialRoute.path || '/'
    };

    if (partialRoute.element) {
      route.element = partialRoute.element;
    }

    if (partialRoute.children) {
      route.children = createRoutesFromArray(partialRoute.children);
    }

    return route;
  });
}
