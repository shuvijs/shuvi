import * as React from 'react';
import { DouraRoot } from 'react-doura';
import type { Doura } from 'doura';

export const DouraWrapper = (App: any, appContext: { store: Doura }) => {
  function DouraAppWrapper() {
    return (
      <DouraRoot store={appContext.store}>
        <App />
      </DouraRoot>
    );
  }

  DouraAppWrapper.displayName = 'DouraAppWrapper';

  return DouraAppWrapper;
};
