import * as React from 'react';
import {
  IRouteData,
  IPageRouteRecord
} from '@shuvi/platform-shared/esm/runtime';
import { IRouteRecord, MemoryRouter, RouterView } from '@shuvi/router-react';
import { render, ReactTestRenderer } from 'shuvi-test-utils/reactTestRender';
import { normalizeRoutes } from '../utils/router';

export const renderRoutes = (
  routes: IRouteRecord[],
  { route = '/' }: { route?: string } = {}
): ReactTestRenderer => {
  const Wrapper: React.FC = () => (
    <MemoryRouter initialEntries={[route]} routes={routes}>
      <RouterView />
    </MemoryRouter>
  );
  return {
    ...render(<Wrapper />)
  };
};

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
  return renderRoutes(normalizeRoutes(routes), {
    route
  });
};
