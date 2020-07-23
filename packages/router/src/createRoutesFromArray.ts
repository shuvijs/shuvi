import { IPartialRouteObject, IRouteObject } from './types';

export function createRoutesFromArray<Element = any>(
  array: IPartialRouteObject[],
  defaultElement: Element
): IRouteObject[] {
  return array.map(partialRoute => {
    let route: IRouteObject<Element> = {
      path: partialRoute.path || '/',
      caseSensitive: partialRoute.caseSensitive === true,
      element: partialRoute.element || defaultElement
    };

    if (partialRoute.children) {
      route.children = createRoutesFromArray(
        partialRoute.children,
        defaultElement
      );
    }

    return route;
  });
}
