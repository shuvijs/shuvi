import React, { createContext, useMemo, useReducer, useRef } from 'react';
import { IPageError, IAppStore } from '@shuvi/platform-core';
import { useIsomorphicEffect } from '@shuvi/router-react';

export const AppStoreContext = createContext<IAppStore>(null as any);

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
  const isRendered = useRef(true);
  const forceupdate = useReducer(s => s * -1, 1)[1];
  useIsomorphicEffect(() => {
    isRendered.current = true;
    const unsubscribe = store.subscribe(() => {
      if (isRendered.current) forceupdate();
    });
    return () => {
      unsubscribe && unsubscribe();
      isRendered.current = false;
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
