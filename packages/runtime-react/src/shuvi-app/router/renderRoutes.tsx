/// <reference lib="dom" />

import React from 'react';
import { Routes, Route } from '@shuvi/router-react';
import { Runtime } from '@shuvi/types';
import { IRouteProps } from '../loadRouteComponent';

type Data = Record<string, any>;

interface IRenderRouteOptions {
  initialProps?: Data;
  appContext?: Data;
}

function renderRoutes(
  routes: Runtime.IRoute[],
  { initialProps = {}, appContext = {} }: IRenderRouteOptions = {}
) {
  return routes && routes.length ? (
    <Routes>
      {renderRoutesChildrens(routes, { initialProps, appContext })}
    </Routes>
  ) : null;
}

function renderRoutesChildrens(
  routes: Runtime.IRoute[] = [],
  { initialProps = {}, appContext = {} }: IRenderRouteOptions = {}
) {
  return routes.map((route: Runtime.IRoute, i) => {
    let element: React.ReactElement | null = null;
    let { component: Component } = route;
    if (Component) {
      const TypedComponent = Component as React.ComponentType<IRouteProps>;
      element = (
        <TypedComponent
          __appContext={appContext}
          __initialProps={initialProps[route.id]}
        />
      );
    }

    if (route.name === '404') {
      appContext.statusCode = 404;
    }

    return (
      <Route
        key={route.id || i}
        path={
          route.path.startsWith('/') ? route.path.replace('/', '') : route.path
        }
        caseSensitive={false} // TODO: read from config
        {...(element && { element })}
      >
        {route.children
          ? renderRoutesChildrens(route.children, {
              initialProps,
              appContext
            })
          : null}
      </Route>
    );
  });
}

export default renderRoutes;
