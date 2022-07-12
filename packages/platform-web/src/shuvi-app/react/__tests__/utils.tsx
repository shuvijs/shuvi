import * as React from 'react';
import { IRouteRecord, MemoryRouter, RouterView } from '@shuvi/router-react';
import { render, ReactTestRenderer } from 'shuvi-test-utils/reactTestRender';
import { IPageRouteRecord } from '@shuvi/platform-shared/shared';

const renderRoutes = (
  routes: IRouteRecord[],
  { route = '/' }: { route?: string } = {}
): ReactTestRenderer => {
  const Wrapper: React.FC = () => (
    <MemoryRouter initialEntries={[route]} routes={routes}>
      <RouterView />
    </MemoryRouter>
  );
  const result = render(<Wrapper />);
  return {
    ...result
  };
};

export const renderWithRoutes = (
  {
    routes = []
  }: {
    routes?: IPageRouteRecord[];
  } = {},
  { route = '/' }: { route?: string } = {}
) => {
  return renderRoutes(routes, {
    route
  });
};
