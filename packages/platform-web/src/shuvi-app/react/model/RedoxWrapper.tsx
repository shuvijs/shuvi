import * as React from 'react';
import { RedoxRoot } from '@shuvi/redox-react';
import type { RedoxStore } from '@shuvi/redox';

export const RedoxWrapper = (App: any, appContext: { store: RedoxStore }) => {
  function RedoxAppWrapper() {
    return (
      <RedoxRoot store={appContext.store}>
        <App />
      </RedoxRoot>
    );
  }

  RedoxAppWrapper.displayName = 'RedoxAppWrapper';

  return RedoxAppWrapper;
};
