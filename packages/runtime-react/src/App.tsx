/// <reference path="../client-env.d.ts" />

import React, { useContext } from 'react';
import renderRoutes from './router/renderRoutes';
import { AppContext } from './AppContainer';

export default function App() {
  const { routeProps, routes } = useContext(AppContext);
  return <>{renderRoutes(routes, routeProps)}</>;
}
