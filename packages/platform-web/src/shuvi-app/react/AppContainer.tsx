import * as React from 'react';
import { errorModel, errorModelName } from '@shuvi/platform-shared/shared';
import { Application } from '../../shared';
import { AppProvider } from './ApplicationContext';
import ErrorPage from './ErrorPage';
import { ErrorBoundary } from './ErrorBoundary';
import { Provider, useSharedModel } from './store';

function ErrorGuard({ children = null }: React.PropsWithChildren<{}>) {
  const errorState = useSharedModel(errorModelName, errorModel);

  if (errorState.hasError) {
    return (
      <ErrorPage
        code={errorState.error?.code}
        message={errorState.error?.message}
      />
    );
  }

  return <>{children}</>;
}

export default function AppContainer({
  app,
  children
}: React.PropsWithChildren<{
  app: Application;
}>) {
  return (
    <AppProvider app={app}>
      <ErrorBoundary>
        <Provider store={app.store}>
          <ErrorGuard>{children}</ErrorGuard>
        </Provider>
      </ErrorBoundary>
    </AppProvider>
  );
}
