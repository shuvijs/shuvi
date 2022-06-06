import { renderRoutes } from '../utils/__tests__/utils';
import { normalizeRoutes } from '../utils/router';
import { IAppData, IAppRouteConfig } from '@shuvi/platform-shared/esm/runtime';

export const renderWithRoutes = (
  {
    routes = [],
    appData = {}
  }: {
    routes?: IAppRouteConfig[];
    appData?: Partial<IAppData>;
  } = {},
  { route = '/' }: { route?: string } = {}
) => {
  return renderRoutes(normalizeRoutes(routes, {}, appData), {
    route
  });
};
