import React, { createContext, useMemo } from 'react';

export interface IAppContext {
  appContext: { [x: string]: any };
}

const AppContext = createContext<IAppContext>(null as any);

export { AppContext };

export default function AppContainer({
  children,
  appContext,
  ...appProps
}: IAppContext & {
  children: React.ReactElement;
}) {
  const appCtx: IAppContext = useMemo(() => ({ appContext }), [appContext]);
  return (
    <AppContext.Provider value={appCtx}>
      {React.cloneElement(children, {
        ...children.props,
        ...appProps
      })}
    </AppContext.Provider>
  );
}
