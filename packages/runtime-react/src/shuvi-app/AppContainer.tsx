import React, { createContext, useMemo } from 'react';
import { IRouteProps } from './types';

export interface IAppContext {
  routeProps: IRouteProps;
  appContext: { [x: string]: any };
}

const AppContext = createContext<IAppContext>(null as any);

export { AppContext };

export default function AppContainer({
  children,
  routeProps,
  appContext,
  ...appProps
}: IAppContext & {
  children: React.ReactElement;
}) {
  const appCtx: IAppContext = useMemo(() => ({ routeProps, appContext }), [
    routeProps,
    appContext
  ]);
  return (
    <AppContext.Provider value={appCtx}>
      {React.cloneElement(children, {
        ...children.props,
        ...appProps
      })}
    </AppContext.Provider>
  );
}
