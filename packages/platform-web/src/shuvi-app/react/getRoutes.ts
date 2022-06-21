import {
  IPageRouteRecord,
  IRawPageRouteRecord
} from '@shuvi/platform-shared/esm/runtime';
import { loadRouteComponent } from './loadRouteComponent';
import { normalizeRoutes } from './utils/router';

export default function getRoutes(
  routes: IRawPageRouteRecord[]
): IPageRouteRecord[] {
  const getRoutesWithRequire = (
    routes: IRawPageRouteRecord[]
  ): IPageRouteRecord[] =>
    routes.map(x => {
      const originalRoute: IRawPageRouteRecord = { ...x };
      const {
        __componentSource__,
        __componentSourceWithAffix__,
        __import__,
        __resolveWeak__,
        children,
        ...rest
      } = originalRoute;
      const route = { ...rest };
      if (children) {
        route.children = getRoutesWithRequire(children);
      }
      if (__componentSourceWithAffix__ && __import__) {
        route.component = loadRouteComponent(__import__, {
          webpack: __resolveWeak__,
          modules: [__componentSourceWithAffix__]
        });
      }
      return route;
    });
  const routesWithRequire = getRoutesWithRequire(routes || []);
  return normalizeRoutes(routesWithRequire);
}
