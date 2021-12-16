import React from 'react';
// import { Provider } from 'react-redux';
import { Provider } from '@modern-js-reduck/react'

export const withRedux = (App: any, appContext: any) => {
  const ReduxAppWrapper = (appProps: any) => {
    return (
      <Provider store={appContext.store}>
        <App {...appProps} />
      </Provider>
    );
  };

  ReduxAppWrapper.getInitialProps = App.getInitialProps;
  ReduxAppWrapper.displayName = 'ReduxAppWrapper';

  return ReduxAppWrapper;
};
