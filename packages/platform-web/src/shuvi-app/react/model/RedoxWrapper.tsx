import * as React from 'react';
import { RedoxRoot } from '@shuvi/redox-react';
import type { IStoreManager } from '@shuvi/redox';

export const RedoxWrapper = (
  App: any,
  appContext: { store: IStoreManager }
) => {
  function RedoxAppWrapper() {
    return (
      <RedoxRoot storeManager={appContext.store}>
        <App />
      </RedoxRoot>
    );
  }

  RedoxAppWrapper.displayName = 'RedoxAppWrapper';

  return RedoxAppWrapper;
};
