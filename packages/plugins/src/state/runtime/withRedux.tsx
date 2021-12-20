import React from 'react';

export const withRedux = (App: any, appContext: any) => {
  const { Provider } = require('@shuvi/plugins/esm/state');
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
