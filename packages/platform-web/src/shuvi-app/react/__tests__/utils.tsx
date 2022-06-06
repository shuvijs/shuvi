import { renderRoutes } from '../utils/__tests__/utils';
import { normalizeRoutes } from '../utils/router';
import { IRouteData, IAppRouteConfig } from '@shuvi/platform-shared/esm/runtime';

export const renderWithRoutes = (
  {
    routes = [],
    routeData = {}
  }: {
    routes?: IAppRouteConfig[];
    routeData?: IRouteData;
  } = {},
  { route = '/' }: { route?: string } = {}
) => {
  return renderRoutes(normalizeRoutes(routes, {}, routeData), {
    route
  });
};
