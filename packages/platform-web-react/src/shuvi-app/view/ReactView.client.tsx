import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from '@shuvi/router-react';
import { createRedirector, createError, ShuviErrorCode } from '@shuvi/router';
import { Runtime } from '@shuvi/service';
import AppContainer from '../AppContainer';
import { HeadManager, HeadManagerContext } from '../head';
import Loadable from '../loadable';
import { IReactClientView } from '../types';
import ErrorPage from '../ErrorPage';
import { ErrorBoundary, onCatchError } from '../ErrorBoundary';

const headManager = new HeadManager();

export class ReactClientView implements IReactClientView {
  private _isInitialRender: boolean = true;

  renderApp: IReactClientView['renderApp'] = async ({
    appContainer,
    AppComponent,
    appData,
    router,
    appContext
  }) => {
    const { _isInitialRender: isInitialRender } = this;
    let {
      ssr,
      appProps,
      dynamicIds,
      errorHandler = {
        hasCalled: false,
        errorCode: ShuviErrorCode.APP_ERROR,
        title: '',
        errorDesc: ''
      }
    } = appData;
    // For e2e test
    if ((window as any).__SHUVI) {
      (window as any).__SHUVI.router = router;
    } else {
      (window as any).__SHUVI = { router };
    }

    const redirector = createRedirector();
    const TypedAppComponent =
      AppComponent as Runtime.IAppComponent<React.ComponentType>;

    if (ssr) {
      await Loadable.preloadReady(dynamicIds);
    } else {
      await router.ready;
      const { pathname, query, params } = router.current;

      let clientErrorHandler = createError();

      if (router.current.matches && router.current.matches.length) {
        clientErrorHandler =
          router.current.matches[0].route.component.getInitialProps
            .__errorHandler;
      }

      if (TypedAppComponent.getInitialProps) {
        appProps = await TypedAppComponent.getInitialProps({
          isServer: false,
          pathname,
          query,
          params,
          redirect: redirector.handler,
          error: clientErrorHandler.handler,
          appContext,
          async fetchInitialProps() {
            // do nothing
          }
        });
      }
      errorHandler = clientErrorHandler;
    }

    if (redirector.redirected) {
      router.replace(redirector.state!.path);
    }

    const root = (
      <ErrorBoundary onError={onCatchError}>
        {errorHandler.hasCalled ? (
          <ErrorPage
            errorCode={errorHandler.errorCode}
            title={errorHandler.title}
            errorDesc={errorHandler.errorDesc}
          />
        ) : (
          <Router router={router}>
            <HeadManagerContext.Provider value={headManager.updateHead}>
              <AppContainer appContext={appContext}>
                <TypedAppComponent {...appProps} />
              </AppContainer>
            </HeadManagerContext.Provider>
          </Router>
        )}
      </ErrorBoundary>
    );
    if (ssr && isInitialRender) {
      ReactDOM.hydrate(root, appContainer);
      this._isInitialRender = false;
    } else {
      ReactDOM.render(root, appContainer);
    }
  };
}
