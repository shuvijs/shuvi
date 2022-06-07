import {
  IRouteData,
  IAppRouteConfig,
  IAppRouteConfigWithPrivateProps
} from '@shuvi/platform-shared/esm/runtime';
import { loadRouteComponent } from './loadRouteComponent';
import { normalizeRoutes, INormalizeRoutesContext } from './utils/router';

export default function getRoutes(
  routes: IAppRouteConfigWithPrivateProps[],
  appContext: INormalizeRoutesContext = {},
  routeData?: IRouteData
): IAppRouteConfig[] {
  const getRoutesWithRequire = (
    routes: IAppRouteConfigWithPrivateProps[]
  ): IAppRouteConfig[] =>
    routes.map(x => {
      const originalRoute: IAppRouteConfigWithPrivateProps = { ...x };
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
  return normalizeRoutes(routesWithRequire, appContext, routeData);
}
