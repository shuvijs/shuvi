import { renderRoutes } from '../utils/__tests__/utils';
import { normalizeRoutes } from '../utils/router';
import { Runtime } from '@shuvi/types';

export const renderWithRoutes = (
  {
    routes = [],
    routeProps = {},
    appContext = {}
  }: {
    routes?: Runtime.IAppRouteConfig[];
    routeProps?: Record<string, any>;
    appContext?: Record<string, any>;
  } = {},
  { route = '/' }: { route?: string } = {}
) => {
  return renderRoutes(
    normalizeRoutes(routes, {
      routeProps,
      appContext
    }),
    {
      route
    }
  );
};
