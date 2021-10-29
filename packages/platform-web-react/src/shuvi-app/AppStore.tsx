import React, { createContext, useMemo, useReducer } from 'react';
import { IAppState, IAppStore } from '@shuvi/platform-core';
import { useIsomorphicEffect } from '@shuvi/router-react';

export const AppStoreContext = createContext<IAppStore>(null as any);

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

export function AppStore({
  children = null,
  ErrorComp,
  store
}: {
  children: React.ReactNode;
  ErrorComp?: React.ComponentType<IPageError>;
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
      {checkError(errorState, ErrorComp) || children}
    </AppStoreContext.Provider>
  );
}
