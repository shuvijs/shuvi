import React, { createContext, useMemo, useReducer, useRef } from 'react';
import { ErrorStore, IPageError } from '@shuvi/router';
import { useIsomorphicEffect } from './utils';

const ErrorContext = createContext<ErrorStore>(null as any);

export { ErrorContext };

function checkError(
  errorState: IPageError,
  ErrorComp?: React.ComponentType<IPageError>
) {
  if (errorState.errorCode !== undefined) {
    return ErrorComp && <ErrorComp {...errorState} />;
  }
  return null;
}

export function ErrorContainer({
  children = null,
  ErrorComp,
  store
}: {
  children: React.ReactNode;
  ErrorComp?: React.ComponentType<IPageError>;
  store: ErrorStore;
}) {
  const isRendered = useRef(true);
  const forceupdate = useReducer(s => s * -1, 1)[1];
  useIsomorphicEffect(() => {
    isRendered.current = true;
    store.subscribe(() => {
      if (isRendered.current) forceupdate();
    });
    return () => {
      isRendered.current = false;
    };
  }, [store]);
  const errorStore = useMemo(() => store, [store]);

  return (
    <ErrorContext.Provider value={errorStore}>
      {checkError(store.getState(), ErrorComp) || children}
    </ErrorContext.Provider>
  );
}
