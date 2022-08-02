import { IPageRouteRecord } from '@shuvi/platform-shared/shared';
import { loadRouteComponent } from './loadRouteComponent';

export default function getRoutes(
  routes: IPageRouteRecord[]
): IPageRouteRecord[] {
  const getRoutesWithRequire = (
    routes: IPageRouteRecord[]
  ): IPageRouteRecord[] =>
    routes.map(x => {
      const originalRoute: IPageRouteRecord = { ...x };
      const {
        __componentRawRequest__,
        __import__,
        __resolveWeak__,
        children,
        ...rest
      } = originalRoute;
      const route = { ...rest };
      if (children) {
        route.children = getRoutesWithRequire(children);
      }
      if (__import__) {
        route.component = loadRouteComponent(__import__, {
          webpack: __resolveWeak__,
          ...(__componentRawRequest__ && {
            modules: [__componentRawRequest__]
          })
        });
      }
      return { __componentRawRequest__, __resolveWeak__, ...route };
    });
  const routesWithRequire = getRoutesWithRequire(routes || []);
  return routesWithRequire;
}
