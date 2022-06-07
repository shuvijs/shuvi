import * as React from 'react';
import { Provider } from '@shuvi/redox-react';
import type { IModelManager } from '@shuvi/redox';

export const withRedox = (
  App: any,
  appContext: { modelManager: IModelManager }
) => {
  const ReduxAppWrapper = (appProps: any) => {
    return (
      <Provider modelManager={appContext.modelManager}>
        <App {...appProps} />
      </Provider>
    );
  };

  App?.getInitialProps &&
    (ReduxAppWrapper.getInitialProps = App.getInitialProps);
  ReduxAppWrapper.displayName = 'ReduxAppWrapper';

  return ReduxAppWrapper;
};
