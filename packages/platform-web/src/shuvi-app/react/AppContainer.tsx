import * as React from 'react';
import { IApplication, errorModel } from '@shuvi/platform-shared/shared';
import { AppProvider } from './applicationContext';
import ErrorPage from './ErrorPage';
import { ErrorBoundary } from './ErrorBoundary';
import { Provider, useSharedModel } from './store';

function ErrorGuard({ children = null }: React.PropsWithChildren<{}>) {
  const [errorState] = useSharedModel(errorModel);

  if (errorState.error !== undefined) {
    return (
      <ErrorPage
        code={errorState.error.code}
        message={errorState.error.message}
      />
    );
  }

  return <>{children}</>;
}

export default function AppContainer({
  app,
  children
}: React.PropsWithChildren<{
  app: IApplication;
}>) {
  return (
    <ErrorBoundary>
      <AppProvider app={app}>
        <Provider redoxStore={app.store}>
          <ErrorGuard>{children}</ErrorGuard>
        </Provider>
      </AppProvider>
    </ErrorBoundary>
  );
}
