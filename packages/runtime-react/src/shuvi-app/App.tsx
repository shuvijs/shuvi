import React, { useContext } from 'react';
import renderRoutes from './router/renderRoutes';
import { AppContext } from './AppContainer';

function App() {
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

export default React.memo(App);
