import * as React from 'react';
import { IRouteRecord, MemoryRouter, RouterView } from '@shuvi/router-react';
import { render, ReactTestRenderer } from 'shuvi-test-utils/reactTestRender';
import { resetHydratedState } from '../router';

export const renderRoutes = (
  routes: IRouteRecord[],
  { route = '/' }: { route?: string } = {}
): ReactTestRenderer => {
  resetHydratedState();
  const Wrapper: React.FC = () => (
    <MemoryRouter initialEntries={[route]} routes={routes}>
      <RouterView />
    </MemoryRouter>
  );
  return {
    ...render(<Wrapper />)
  };
};
