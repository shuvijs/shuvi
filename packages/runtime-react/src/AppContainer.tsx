import React, { createContext } from "react";
import { IAppProps } from "./types";

interface IAppContext {
  appProps: IAppProps;
}

// @ts-ignore
const AppContext = createContext<IAppContext>(null);

export { AppContext };

export default function AppContainer({
  children,
  ...appProps
}: IAppProps & {
  children: React.ReactNode;
}) {
  const appCtx = {
    appProps
  };

  return <AppContext.Provider value={appCtx}>{children}</AppContext.Provider>;
}
