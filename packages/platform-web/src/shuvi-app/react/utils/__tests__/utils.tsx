import * as React from 'react';
import { IRouteRecord, MemoryRouter, RouterView } from '@shuvi/router-react';
import { render, ReactTestRenderer } from 'shuvi-test-utils/reactTestRender';
import { getLoaderManager } from '../../loader/loaderManager';

/**
 * When simulating hydrating of ssr, `routeProps` is provided and `initialShouldHydrate` should be `true`
 */
export const renderRoutes = (
  routes: IRouteRecord[],
  {
    route = '/',
    initialShouldHydrate = true
  }: { route?: string; initialShouldHydrate?: boolean } = {}
): ReactTestRenderer => {
  const Wrapper: React.FC = () => (
    <MemoryRouter initialEntries={[route]} routes={routes}>
      <RouterView />
    </MemoryRouter>
  );
  const loaderManager = getLoaderManager();
  loaderManager.shouldHydrate = initialShouldHydrate;
  const result = render(<Wrapper />);
  loaderManager.shouldHydrate = false;
  return {
    ...result
  };
};
