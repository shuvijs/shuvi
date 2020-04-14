/// <reference path="../client-env.d.ts" />

import React, { useContext } from 'react';
import routes from '@shuvi/app/core/routes';
import renderRoutes from './router/renderRoutes';
import { AppContext } from './AppContainer';

export default function App() {
  const { routeProps } = useContext(AppContext);
  return <>{renderRoutes(routes, routeProps)}</>;
}
