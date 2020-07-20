/// <reference lib="dom" />

import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Runtime } from '@shuvi/types';
import { IRouteProps } from '../loadRouteComponent';

type Data = Record<string, any>;

function renderRoutes(
  routes: Runtime.IRoute[],
  {
    initialProps = {},
    switchProps = {},
    appContext = {}
  }: {
    initialProps?: Data;
    switchProps?: Data;
    appContext?: Data;
  } = {}
) {
  return routes && routes.length ? (
    <Switch {...switchProps}>
      {routes.map((route, i) => (
        <Route
          key={route.key || i}
          path={route.path}
          exact={route.exact}
          strict={route.strict}
          sensitive={route.sensitive}
          render={props => {
            const childRoutes = route.routes
              ? renderRoutes(route.routes, {
                  initialProps,
                  switchProps: {
                    location: props.location
                  }
                })
              : null;
            let { component: Component } = route;
            if (Component) {
              const TypedComponent = Component as React.ComponentType<
                IRouteProps
              >;
              return (
                <TypedComponent
                  __appContext={appContext}
                  __initialProps={initialProps[route.id]}
                  {...props}
                >
                  {childRoutes}
                </TypedComponent>
              );
            }

            return childRoutes;
          }}
        />
      ))}
    </Switch>
  ) : null;
}

export default renderRoutes;
