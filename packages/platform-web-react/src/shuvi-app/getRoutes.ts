import { Runtime } from '@shuvi/service';
import { loadRouteComponent } from './loadRouteComponent';
import { normalizeRoutes, INormalizeRoutesContext } from './utils/router';

export default function getRoutes(
  routes: Runtime.IAppRouteConfigWithPrivateProps[],
  appContext: INormalizeRoutesContext = {}
): Runtime.IAppRouteConfig[] {
  const getRoutesWithRequire = (
    routes: Runtime.IAppRouteConfigWithPrivateProps[]
  ): Runtime.IAppRouteConfig[] =>
    routes.map(x => {
      const originalRoute: Runtime.IAppRouteConfigWithPrivateProps = { ...x };
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
  return normalizeRoutes(routesWithRequire, appContext);
}
