import * as React from 'react';
import { errorModel, errorModelName } from '@shuvi/platform-shared/shared';
import { Application } from '../../shared';
import { AppProvider } from './ApplicationContext';
import ErrorPage from './ErrorPage';
import { ErrorBoundary } from './ErrorBoundary';
import { Provider, useSharedModel } from './store';
import { Trace } from './Trace';

function ErrorGuard({ children = null }: React.PropsWithChildren<{}>) {
  const errorState = useSharedModel(errorModelName, errorModel);
  const { error, hasError } = errorState;
  if (hasError) {
    return (
      <ErrorPage
        code={error?.code}
        message={error?.message}
        error={error?.error}
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
          <ErrorGuard>
            <Trace>{children}</Trace>
          </ErrorGuard>
        </Provider>
      </ErrorBoundary>
    </AppProvider>
  );
}
