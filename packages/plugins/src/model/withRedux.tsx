import React from 'react';
import { Provider } from '@shuvi/redox-react'

export const withRedux = (App: any, appContext: any) => {
  const ReduxAppWrapper = (appProps: any) => {
    return (
      <Provider store={appContext.store}>
        <App {...appProps} />
      </Provider>
    );
  };

  App?.getInitialProps &&
    (ReduxAppWrapper.getInitialProps = App.getInitialProps);
  ReduxAppWrapper.displayName = 'ReduxAppWrapper';

  return ReduxAppWrapper;
};
