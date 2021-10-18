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
import { ErrorBoundary, onCatchError } from './ErrorBoundary';

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
      error = {
        errorCode: undefined,
        errorDesc: undefined
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
        const { getInitialProps = {} } = router.current.matches[0].route.component;
        clientErrorHandler =
          getInitialProps
            .__error || clientErrorHandler;
      }else{
        // no handler no matches
        clientErrorHandler.handler(ShuviErrorCode.PAGE_NOT_FOUND)
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
      error = clientErrorHandler;
    }

    if (redirector.redirected) {
      router.replace(redirector.state!.path);
    }

    const root = (
      <ErrorBoundary onError={onCatchError}>
        <HeadManagerContext.Provider value={headManager.updateHead}>
          <Router router={router} error={error} ErrorComp={ErrorPage}>
            <AppContainer appContext={appContext}>
              <TypedAppComponent {...appProps} />
            </AppContainer>
          </Router>
        </HeadManagerContext.Provider>
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
