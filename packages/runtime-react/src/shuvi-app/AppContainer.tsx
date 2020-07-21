import React, { createContext, useMemo } from 'react';
import { IRouteProps, IRoute } from './types';

export interface IAppContext {
  routes: IRoute[];
  routeProps: IRouteProps;
  appContext: { [x: string]: any };
}

const AppContext = createContext<IAppContext>(null as any);

export { AppContext };

export default function AppContainer({
  children,
  routeProps,
  routes,
  appContext,
  ...appProps
}: IAppContext & {
  children: React.ReactElement;
}) {
  const appCtx: IAppContext = useMemo(
    () => ({ routeProps, routes, appContext }),
    [routes, routeProps, appContext]
  );
  return (
    <AppContext.Provider value={appCtx}>
      {React.cloneElement(children, {
        ...children.props,
        ...appProps
      })}
    </AppContext.Provider>
  );
}
