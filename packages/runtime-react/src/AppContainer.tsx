import React, { createContext } from "react";
import { IRouteProps } from "./types";

interface IAppContext {
  routeProps: IRouteProps;
}

// @ts-ignore
const AppContext = createContext<IAppContext>(null);

export { AppContext };

export default function AppContainer({
  children,
  ...appProps
}: IAppContext & {
  children: React.ReactNode;
}) {
  const appCtx = {
    appProps
  };

  return <AppContext.Provider value={appCtx}>{children}</AppContext.Provider>;
}
