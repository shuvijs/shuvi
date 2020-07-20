import { renderWithRouter } from '../router/__tests__/utils';
import { createMemoryHistory, MemoryHistory } from '../router/history';
import renderRoutes from '../router/renderRoutes';
import { Runtime } from '@shuvi/types';

export const renderWithRoutes = (
  {
    routes = [],
    initialProps = {},
    appContext = {}
  }: {
    routes?: Runtime.IRoute[];
    initialProps?: Record<string, any>;
    appContext?: Record<string, any>;
  } = {},
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] })
  }: { route?: string; history?: MemoryHistory } = {}
) => {
  return renderWithRouter(
    renderRoutes(routes, {
      initialProps,
      appContext
    })!,
    {
      route,
      history
    }
  );
};
