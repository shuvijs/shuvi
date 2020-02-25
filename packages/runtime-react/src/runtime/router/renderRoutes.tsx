/// <reference lib="dom" />

import React from "react";
import { Switch, Route } from "react-router-dom";
import { RouteConfig } from "@shuvi/core";

type Data = Record<string, any>;

function renderRoutes(
  routes?: RouteConfig[],
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
          render={props => {
            const childRoutes = renderRoutes(route.routes, initialProps, {
              location: props.location
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
