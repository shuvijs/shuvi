import { renderRoutes } from '../utils/__tests__/utils';
import { normalizeRoutes, INormalizeRoutesContext } from '../utils/router';
import { Runtime } from '@shuvi/service';

export const renderWithRoutes = (
  {
    routes = [],
    appContext = {}
  }: {
    routes?: Runtime.IAppRouteConfig[];
    appContext?: INormalizeRoutesContext;
  } = {},
  { route = '/' }: { route?: string } = {}
) => {
  return renderRoutes(normalizeRoutes(routes, appContext), {
    route
  });
};
