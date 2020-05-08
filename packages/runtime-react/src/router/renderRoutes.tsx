/// <reference lib="dom" />

import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Runtime } from '@shuvi/types';

type Data = Record<string, any>;

function renderRoutes(
  routes?: Runtime.IRoute[],
  initialProps: Data = {},
  switchProps: Data = {}
) {
  return routes ? (
    <Switch {...switchProps}>
      {routes.map((route, i) => (
        <Route
          key={route.key || i}
          path={route.path}
          exact={route.exact}
          strict={route.strict}
          sensitive={route.sensitive}
          render={(props) => {
            const childRoutes = renderRoutes(route.routes, initialProps, {
              location: props.location,
            });
            let { component: Component } = route;
            if (Component) {
              return (
                <Component __initialProps={initialProps[route.id]} {...props}>
                  {childRoutes}
                </Component>
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
