import { IPartialRouteRecord, IRouteRecord } from './types';

export function createRoutesFromArray<Element = any>(
  array: IPartialRouteRecord[]
): IRouteRecord[] {
  return array.map(partialRoute => {
    let route: IRouteRecord<Element> = {
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
