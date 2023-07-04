import * as React from 'react';
import { useCurrentRoute, useRouter } from '@shuvi/router-react';
import { errorModel, errorModelName } from '@shuvi/platform-shared/shared';
import { Application } from '../../shared';
import { AppProvider } from './ApplicationContext';
import ErrorPage from './ErrorPage';
import { ErrorBoundary } from './ErrorBoundary';
import { Provider, useSharedModel } from './store';
import { clientRenderTrace } from '../entry/client/trace';

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

const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

function useTrace() {
  const router = useRouter();
  const route = useCurrentRoute();
  let navigationTrace = React.useRef<typeof clientRenderTrace>();
  React.useEffect(() => {
    clientRenderTrace.traceChild('SHUVI_PAGE_READY').stop();
    router.beforeEach((to, from, next) => {
      navigationTrace.current = clientRenderTrace.traceChild(
        'SHUVI_NAVIGATION_DONE'
      );
      const navigationTriggeredTrace = clientRenderTrace.traceChild(
        'SHUVI_NAVIGATION_TRIGGERED'
      );
      const fromPath = `${from.pathname}${from.search}`;
      const toPath = `${to.pathname}${to.search}`;
      const navigationId = uuid();
      navigationTrace.current.setAttribute('from', fromPath);
      navigationTrace.current.setAttribute('to', toPath);
      navigationTrace.current.setAttribute('navigationId', navigationId);
      navigationTriggeredTrace.setAttribute('from', fromPath);
      navigationTriggeredTrace.setAttribute('to', toPath);
      navigationTriggeredTrace.setAttribute('navigationId', navigationId);
      navigationTriggeredTrace.stop();
      next();
    });
  }, []);

  React.useEffect(() => {
    navigationTrace.current?.stop();
  }, [route]);
}

export default function AppContainer({
  app,
  children
}: React.PropsWithChildren<{
  app: Application;
}>) {
  useTrace();
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
