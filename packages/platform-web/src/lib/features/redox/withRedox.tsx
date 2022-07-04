import * as React from 'react';
import { RedoxRoot } from '@shuvi/redox-react';
import type { IStoreManager } from '@shuvi/redox';

export const withRedox = (
  App: any,
  appContext: { storeManager: IStoreManager }
) => {
  function RedoxAppWrapper(appProps: any) {
    return (
      <RedoxRoot storeManager={appContext.storeManager}>
        <App {...appProps} />
      </RedoxRoot>
    );
  }

  RedoxAppWrapper.displayName = 'RedoxAppWrapper';

  return RedoxAppWrapper;
};
