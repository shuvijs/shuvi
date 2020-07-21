import React, { useContext } from 'react';
import renderRoutes from './router/renderRoutes';
import { AppContext } from './AppContainer';

export default function App() {
  const { routeProps, routes, appContext } = useContext(AppContext);
  return (
    <>
      {renderRoutes(routes, {
        appContext,
        initialProps: routeProps
      })}
    </>
  );
}
