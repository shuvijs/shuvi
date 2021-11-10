import React from 'react';
import ReactDOM from 'react-dom';
import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { Router } from '@shuvi/router-react';
import { createRedirector } from '@shuvi/router';
import { getErrorHandler, IAppComponent } from '@shuvi/platform-core';
import AppContainer from '../AppContainer';
import { HeadManager, HeadManagerContext } from '../head';
import Loadable from '../loadable';
import { IReactClientView } from '../types';
import ErrorPage from '../ErrorPage';
import { ErrorBoundary } from './ErrorBoundary';

const headManager = new HeadManager();

export class ReactClientView implements IReactClientView {
  private _isInitialRender: boolean = true;

  renderApp: IReactClientView['renderApp'] = async ({
    appContainer,
    AppComponent,
    appData,
    router,
    appContext,
    appStore
  }) => {
    const { _isInitialRender: isInitialRender } = this;
    let { ssr, appProps, dynamicIds } = appData;
    // For e2e test
    if ((window as any).__SHUVI) {
      (window as any).__SHUVI.router = router;
    } else {
      (window as any).__SHUVI = { router };
    }

    const redirector = createRedirector();

    const error = getErrorHandler(appStore);

    const TypedAppComponent =
      AppComponent as IAppComponent<React.ComponentType>;
    if (ssr) {
      await Loadable.preloadReady(dynamicIds);
    } else {
      await router.ready;
      const { pathname, query, params } = router.current;

      if (!router.current.matches) {
        // no handler no matches
        error.errorHandler(SHUVI_ERROR_CODE.PAGE_NOT_FOUND);
      }

      if (TypedAppComponent.getInitialProps) {
        appProps = await TypedAppComponent.getInitialProps({
          isServer: false,
          pathname,
          query,
          params,
          redirect: redirector.handler,
          error: error.errorHandler,
          appContext,
          async fetchInitialProps() {
            // do nothing
          }
        });
      }
    }

    if (redirector.redirected) {
      router.replace(redirector.state!.path);
    }

    const root = (
      <ErrorBoundary>
        <HeadManagerContext.Provider value={headManager.updateHead}>
          <Router router={router}>
            <AppContainer
              appContext={appContext}
              store={appStore}
              errorComp={ErrorPage}
            >
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
