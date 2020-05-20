import React, { createContext, useMemo } from "react";
import { IRouteProps, IRoute } from "./types";

export interface IAppContext {
  routes: IRoute[]
  routeProps: IRouteProps;
}

// @ts-ignore
const AppContext = createContext<IAppContext>(null);

export { AppContext };

export default function AppContainer({
  children,
  routeProps,
  routes,
  ...appProps
}: IAppContext & {
  children: React.ReactElement;
}) {
  const appCtx: IAppContext = useMemo(() => ({ routeProps, routes }), [routes, routeProps]);
  return (
    <AppContext.Provider value={appCtx}>
      {React.cloneElement(children, {
        ...children.props,
        ...appProps
      })}
    </AppContext.Provider>
  );
}
