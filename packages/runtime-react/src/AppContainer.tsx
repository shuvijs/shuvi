import React, { createContext, useMemo } from "react";
import { IRouteProps } from "./types";

export interface IAppContext {
  routeProps: IRouteProps;
}

// @ts-ignore
const AppContext = createContext<IAppContext>(null);

export { AppContext };

export default function AppContainer({
  children,
  routeProps,
  ...appProps
}: IAppContext & {
  children: React.ReactElement;
}) {
  const appCtx: IAppContext = useMemo(() => ({ routeProps }), [routeProps]);
  return (
    <AppContext.Provider value={appCtx}>
      {React.cloneElement(children, {
        ...children.props,
        ...appProps
      })}
    </AppContext.Provider>
  );
}
