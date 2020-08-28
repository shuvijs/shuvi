import React, { useContext } from 'react';
import { Runtime } from '@shuvi/types';
import { AppContext } from '../AppContainer';
import { IRouteProps } from '../loadRouteComponent';
import { IRouteMatch } from '@shuvi/router';

type Data = Record<string, any>;

interface IRenderRouteOptions {
  routeProps?: Data;
  appContext?: Data;
}

type IAppRouteWithElement = Runtime.IAppRouteConfig & { element?: any };

function RouteComponent({
  route,
  overrideContext
}: {
  route: Runtime.IAppRouteConfig;
  overrideContext?: IRenderRouteOptions;
}) {
  const appContextValue = useContext(AppContext);
  const { routeProps = {}, appContext = {} } =
    overrideContext || appContextValue || {};

  const { component: Component, id } = route;
  const TypedComponent = Component as React.ComponentType<IRouteProps>;
  return (
    <TypedComponent __appContext={appContext} __initialProps={routeProps[id]} />
  );
}

export function normalizeRoutes(
  routes: Runtime.IAppRouteConfig[] | undefined,
  options?: IRenderRouteOptions
): IAppRouteWithElement[] {
  if (!routes) {
    return [] as IAppRouteWithElement[];
  }

  return routes.map((route: Runtime.IAppRouteConfig) => {
    const res: IAppRouteWithElement = {
      ...route
    };
    if (route.component) {
      res.element = <RouteComponent route={route} overrideContext={options} />;
    }
    res.children = normalizeRoutes(route.children, options);
    return res;
  });
}

export function getRedirectFromRoutes(
  appRoutes: IRouteMatch<IAppRouteWithElement>[]
): string | null {
  return appRoutes.reduceRight((redirectPath, { route: { redirect } }) => {
    if (!redirectPath && redirect) {
      return redirect;
    }
    return redirectPath;
  }, null as string | null);
}
