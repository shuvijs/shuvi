import { renderWithRouter } from '../router/__tests__/utils';
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
  { route = '/' }: { route?: string } = {}
) => {
  return renderWithRouter(
    renderRoutes(routes, {
      initialProps,
      appContext
    })!,
    {
      route
    }
  );
};
