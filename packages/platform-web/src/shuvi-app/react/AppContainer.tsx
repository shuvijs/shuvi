import * as React from 'react';
import { IApplication, errorModel } from '@shuvi/platform-shared/esm/shared';
import { createContainer } from '@shuvi/redox-react';
import { AppProvider } from './applicationContext';
import ErrorPage from './ErrorPage';
import { ErrorBoundary } from './ErrorBoundary';

const { Provider, useSharedModel } = createContainer();

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
  children,
  app
}: {
  app: IApplication;
  children: React.ReactElement;
}) {
  return (
    <ErrorBoundary>
      <AppProvider app={app}>
        <Provider storeManager={app.storeManager}>
          <ErrorGuard>{children}</ErrorGuard>
        </Provider>
      </AppProvider>
    </ErrorBoundary>
  );
}
