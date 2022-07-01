import * as React from 'react';
import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { Router } from '@shuvi/router-react';
import { createRedirector } from '@shuvi/router';
import { getErrorHandler } from '@shuvi/platform-shared/esm/runtime';
import AppContainer from '../AppContainer';
import { HeadManager, HeadManagerContext } from '../head';
import Loadable from '../loadable';
import { IReactClientView } from '../types';
import ErrorPage from '../ErrorPage';
import { ErrorBoundary } from './ErrorBoundary';
import { renderAction } from './render-action';
import { getLoaderManager } from '../loader/loaderManager';

const headManager = new HeadManager();

export class ReactClientView implements IReactClientView {
  private _isInitialRender: boolean = true;

  renderApp: IReactClientView['renderApp'] = async ({
    appContainer,
    app,
    appData
  }) => {
    const { _isInitialRender: isInitialRender } = this;
    const {
      modelManager,
      router,
      appComponent: AppComponent,
      context: appContext
    } = app;
    let { ssr, appProps, dynamicIds } = appData;
    // For e2e test
    if ((window as any).__SHUVI) {
      (window as any).__SHUVI.router = router;
    } else {
      (window as any).__SHUVI = { router };
    }

    const redirector = createRedirector();

    const error = getErrorHandler(modelManager);

    const TypedAppComponent = AppComponent as React.ComponentType;

    if (ssr) {
      await Loadable.preloadReady(dynamicIds);
      await router.ready;
    } else {
      await router.ready;
      const { matches } = router.current;

      if (!matches.length) {
        // no handler no matches
        error.errorHandler(SHUVI_ERROR_CODE.PAGE_NOT_FOUND);
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
              modelManager={modelManager}
              errorComp={ErrorPage}
            >
              <TypedAppComponent {...appProps} />
            </AppContainer>
          </Router>
        </HeadManagerContext.Provider>
      </ErrorBoundary>
    );

    const loaderManager = getLoaderManager();

    const ssrCallback = () => {
      this._isInitialRender = false;
      loaderManager.shouldHydrate = false;
    };

    renderAction({
      ssr,
      isInitialRender,
      root,
      callback: ssrCallback,
      appContainer
    });
  };
}
