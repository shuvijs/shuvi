import { renderRoutes } from '../utils/__tests__/utils';
import { normalizeRoutes } from '../utils/router';
import {
  IRouteData,
  IPageRouteRecord
} from '@shuvi/platform-shared/esm/runtime';

export const renderWithRoutes = (
  {
    routes = [],
    routeData = {}
  }: {
    routes?: IPageRouteRecord[];
    routeData?: IRouteData;
  } = {},
  { route = '/' }: { route?: string } = {}
) => {
  return renderRoutes(normalizeRoutes(routes, {}, routeData), {
    route,
    initialShouldHydrate: Boolean(routeData.routeProps)
  });
};
