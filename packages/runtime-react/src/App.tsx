/// <reference path="../client-env.d.ts" />

import React, { useContext, useState } from 'react';
import routes from '@shuvi/app/core/routes';
import renderRoutes from './router/renderRoutes';
import { AppContext } from './AppContainer';

export default function App() {
  const [curRoutes, setRoutes] = useState(routes);
  const { routeProps } = useContext(AppContext);

  // @ts-ignore
  if (module.hot) {
    // @ts-ignore
    module.hot.accept('@shuvi/app/core/routes', () => {
      const routes = require('@shuvi/app/core/routes').default;
      setRoutes(routes);
    });
  }

  return <>{renderRoutes(curRoutes, routeProps)}</>;
}
