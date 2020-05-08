import { renderWithRouter } from '../router/__tests__/utils';
import { createMemoryHistory, MemoryHistory } from 'history';
import renderRoutes from '../router/renderRoutes';
import { Runtime } from '@shuvi/types';

export const renderWithRoutes = (
  {
    routes = [],
    initialProps = {},
  }: {
    routes?: Runtime.IRoute[];
    initialProps?: Record<string, any>;
  } = {},
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
  }: { route?: string; history?: MemoryHistory } = {}
) => {
  return renderWithRouter(renderRoutes(routes, initialProps)!, {
    route,
    history,
  });
};
