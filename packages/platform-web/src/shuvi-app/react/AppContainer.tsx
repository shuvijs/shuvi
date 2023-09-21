import * as React from 'react';
import { useCurrentRoute, useRouter } from '@shuvi/router-react';
import { errorModel, errorModelName } from '@shuvi/platform-shared/shared';
import { Application } from '../../shared';
import { AppProvider } from './ApplicationContext';
import ErrorPage from './ErrorPage';
import { ErrorBoundary } from './ErrorBoundary';
import { Provider, useSharedModel } from './store';
import { clientRenderTrace } from '../entry/client/trace';
import { CLIENT_RENDER } from '@shuvi/shared/constants/trace';

const { SHUVI_NAVIGATION_TRIGGERED, SHUVI_NAVIGATION_DONE, SHUVI_PAGE_READY } =
  CLIENT_RENDER.events;

function ErrorGuard({ children = null }: React.PropsWithChildren<{}>) {
  const errorState = useSharedModel(errorModelName, errorModel);
  const { error, hasError } = errorState;
  console.error('---------errr', error);
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
    clientRenderTrace.traceChild(SHUVI_PAGE_READY.name).stop();
    router.beforeEach((to, from, next) => {
      const fromPath = `${from.pathname}${from.search}`;
      const toPath = `${to.pathname}${to.search}`;
      const navigationId = uuid();
      const traceAttrs = {
        [SHUVI_NAVIGATION_DONE.attrs.from.name]: fromPath,
        [SHUVI_NAVIGATION_DONE.attrs.to.name]: toPath,
        [SHUVI_NAVIGATION_DONE.attrs.navigationId.name]: navigationId
      };
      clientRenderTrace
        .traceChild(SHUVI_NAVIGATION_TRIGGERED.name, traceAttrs)
        .stop();
      navigationTrace.current = clientRenderTrace.traceChild(
        SHUVI_NAVIGATION_DONE.name
      );
      navigationTrace.current.setAttributes(traceAttrs);
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
