import {
  IPageRouteRecord,
  IRawPageRouteRecord
} from '@shuvi/platform-shared/esm/shared';
import { loadRouteComponent } from './loadRouteComponent';

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
      return { __componentSourceWithAffix__, __resolveWeak__, ...route };
    });
  const routesWithRequire = getRoutesWithRequire(routes || []);
  return routesWithRequire;
}
