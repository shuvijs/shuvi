import React, { createContext, useMemo, useReducer } from 'react';
import { IAppState, IAppStore } from '@shuvi/platform-core';
import { useIsomorphicEffect } from '@shuvi/router-react';

export interface IAppContext {
  appContext: { [x: string]: any };
}

const AppContext = createContext<IAppContext>(null as any);
const AppStoreContext = createContext<IAppStore>(null as any);

export { AppContext, AppStoreContext };

type IPageError = IAppState['error'];

function checkError(
  errorState: IPageError,
  ErrorComp?: React.ComponentType<IPageError>
) {
  if (errorState.errorCode !== undefined) {
    return ErrorComp && <ErrorComp {...errorState} />;
  }
  return null;
}

function AppStore({
  children = null,
  errorComp,
  store
}: {
  children: React.ReactNode;
  errorComp?: React.ComponentType<IPageError>;
  store: IAppStore;
}) {
  const forceupdate = useReducer(s => s * -1, 1)[1];
  useIsomorphicEffect(() => {
    const unsubscribe = store.subscribe(forceupdate);
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [store]);
  const appStore = useMemo(() => store, [store]);
  const { error: errorState } = store.getState();

  return (
    <AppStoreContext.Provider value={appStore}>
      {checkError(errorState, errorComp) || children}
    </AppStoreContext.Provider>
  );
}

export default function AppContainer({
  children,
  appContext,
  errorComp,
  store,
  ...appProps
}: IAppContext & {
  children: React.ReactElement;
  errorComp?: React.ComponentType<IPageError>;
  store: IAppStore;
}) {
  const appCtx: IAppContext = useMemo(() => ({ appContext }), [appContext]);
  return (
    <AppContext.Provider value={appCtx}>
      <AppStore store={store} errorComp={errorComp}>
        {React.cloneElement(children, {
          ...children.props,
          ...appProps
        })}
      </AppStore>
    </AppContext.Provider>
  );
}
